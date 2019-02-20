const { clearHash } = require('../services/cache');

module.exports = async (req, res, next) => {
    // usually middleware is run before the route handler is hit but in this case we want to use it only after as the middleware here is to clean the redis cache, we only want to do it if the controller is done working
    //let's use a trick of calling next first
    await next();
    clearHash(req.user.id);
}