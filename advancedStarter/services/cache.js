const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');
const keys = require('../config/keys');

const client = redis.createClient(keys.redisUrl);
client.hget = util.promisify(client.hget);
const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function(options = {}) {
    // the idea is to cache only specific data and not everything as maintaining a redis datastore is very expensice in production.

    // so we create a function that we can manually apply to each individual query if we want to cache the query and its result

    // this function is built on the constructor prototype so we share the 'this' which represents a Query instance 
    // here we create a new property on the instance that will tell us if we want to use the cache or not.
    this.useCache = true;

    this.hashKey = JSON.stringify(options.key || '');
    return this;
    // we return 'this' so cache is chainable with other function that could apply on the query
}

mongoose.Query.prototype.exec = async function() {
    // Redis is an 'in-memory' datastore with super quick access

    // the whole idea with redis is to make sure we have a key that is unique and consistent
    // a key with the userId only is clearly not enough
    // a combination of the query and the collection however is an excellent candidate for unique and consistent

    //the below if condition is to toggle when using redis
    if (!this.useCache) {
        return exec.apply(this, arguments)
    }

    // Below we create a unique key
    // we use Object.assign() to create a new object
    // modifying directly getQuery will modify the actual query which is about to be processed
    const key = JSON.stringify(
        Object.assign({}, this.getQuery(), {
            collection: this.mongooseCollection.name
        })
    );

    const cacheValue = await client.hget(this.hashKey, key);
    if (cacheValue) {
        const doc = JSON.parse(cacheValue);
        return Array.isArray(doc)
            ? doc.map(d => new this.model(d))
            : new this.model(doc) 
        //from redis, we obtain a string that we need to convert to JSON
        //the Query.exec function is supposed to return a mongoose document type object to which various methods are attached so we need to turn JSON object into a mongoose document
        //'this' refers to the mongoose object calling the exec property method and new this.model is an instance of the class of 'this'
    }

    const result = await exec.apply(this, arguments);
    // result is oftype mongoose document - it is not JSON type

    client.hset(this.hashKey, key, JSON.stringify(result), 'EX', 10);
    return result;
}

module.exports = {
    clearHash(hashKey) {
        client.del(JSON.stringify(hashKey));
    }
}