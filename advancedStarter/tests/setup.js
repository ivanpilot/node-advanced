//this file is a setup file so at start, we will want jest to look at this file to load what is necessary and then run our tests.

// however, by default, jest doesn't automatically look for this file so we need to force it to do so. and that is done inside the package.json file with "jest": {"setupTestFrameworkScriptFile": "./tests/setup.js"}

require('../models/User');
//just by requiring the file, this file will be automatically executed
const mongoose = require('mongoose');
const keys = require('../config/keys');

mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI, { useMongoClient: true });