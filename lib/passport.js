const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')
const { BadRequestError } = require('../lib/errorHandle/userFacing')
const { validateFields } = require('./validate')

// Load User model

const { Users } = require('./mongoUtil')

module.exports = function (passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      const fields = {
        email,
        password
      }

      const valid = validateFields(fields)

      if (valid instanceof Error) {
        return done(valid, false)
      }

      // Match user
      Users.findUser({ email: fields.email }).then(user => {
        if (!user) {
          return done(new BadRequestError('Password or Email was incorrect'), false)
        }

        // Match password
        bcrypt.compare(fields.password, user.password, (err, isMatch) => {
          if (err) return done(new BadRequestError('Password is incorrectly formatted'), false)
          if (!isMatch) {
            return done(new BadRequestError('Password or Email was incorrect'), false)
          } else {
            return done(null, user)
          }
        })
      })
    })
  )

  passport.serializeUser(function (user, done) {
    done(null, user._id)
  })

  passport.deserializeUser(async function (id, done) {
    Users.findById(id).then(function (user, err) {
      done(err, user)
    })
  })
}
