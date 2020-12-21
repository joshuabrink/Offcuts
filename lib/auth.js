
const { BadRequestError } = require('./errorHandle/userFacing')
module.exports = {
  loggedIn (req, res, next) {
    if (!req.isAuthenticated()) return next(new BadRequestError('Not Logged in'))
    return next()
  }
}
