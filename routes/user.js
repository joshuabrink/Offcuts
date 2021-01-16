/* eslint-disable no-undef */
// eslint-disable-next-line new-cap

// LIBRARIES
const express = require('express')
const router = express.Router()
const passport = require('passport')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const jsonParser = require('body-parser').json()

// CUSTOM LIBRARIES
const { DatabaseError } = require('../lib/errorHandle/errors')
const { BadRequestError, NotFoundError } = require('../lib/errorHandle/userFacing')
const { Users, Listings } = require('../lib/mongoUtil')
const { validateUser, validateFields } = require('../lib/validate')
const { loggedIn } = require('../lib/auth')

// HELPER FUNCTIONS
const thumbStr = (imagePath) => {
  return imagePath.substring(0, imagePath.lastIndexOf('\\') + 1) + 'thumb-' +
    imagePath.substring(imagePath.lastIndexOf('\\') + 1)
}
const delImages = async (imagePaths) => {
  const promises = []
  for (let i = 0; i < imagePaths.length; i++) {
    const imagePath = imagePaths[i]
    promises.push(new Promise((resolve, reject) => {
      fs.unlink(imagePath, err => {
        if (err) return reject(err)
        fs.unlink(thumbStr(imagePath), err => {
          if (err) return reject(err)

          resolve(imagePath)
        })
      })
    }))
  }
  Promise.all(promises).then((val, err) => {
    if (err) return err
    return true
  })
}

// ROUTES
router.post('/login', jsonParser, (req, res, next) => {
  passport.authenticate('local', function (err, user) {
    if (err) return next(err)

    if (!user) {
      return next(new NotFoundError('User not found'))
    }

    req.login(user, function (err) {
      if (err) {
        return next(err)
      }

      if (req.headers.env === 'test' && process.env.NODE_ENV === 'test') {
        return res.status(200).json(user)
      }

      req.flash('success_messages', 'Login Successful')
      return res.redirect('back')
    })
  })(req, res, next)
})

router.post('/updateUser', loggedIn, jsonParser, (req, res, next) => {
  const { name, email, number } = req.body

  const userFields = {
    name, email, number
  }

  const valid = validateFields(userFields)

  if (valid instanceof Error) {
    return next(valid)
  }

  if (!validator.isLength(userFields.name, { min: 3, max: 30 })) {
    return next(new BadRequestError('Name needs to be between 3-30 characters'))
  }
  if (!validator.isEmail(userFields.email)) {
    return next(new BadRequestError('Email was not valid'))
  }
  if (!validator.isMobilePhone(userFields.number)) {
    return next(new BadRequestError('Number was not valid'))
  }

  const id = req.session.passport.user

  Users.findUser({ email: email }).then((u) => {
    if (u) {
      return next(new BadRequestError('User with that email already exsists'))
    }
    Users.updateUser(id, { $set: userFields }).then((user) => {
      if (user instanceof Error) {
        return next(new DatabaseError('User not found'))
      }
      if (req.headers.env === 'test' && process.env.NODE_ENV === 'test') {
        return res.status(200).json(userFields)
      }

      req.flash('success_messages', 'Updated User')
      return res.redirect('back')
    })
  })
})

router.post('/updatePassword', loggedIn, jsonParser, (req, res, next) => {
  const { currentPassword, newPassword, newPasswordConfirm } = req.body

  const passSet = {
    currentPassword,
    newPassword,
    newPasswordConfirm
  }

  const valid = validateFields(passSet)

  if (valid instanceof Error) {
    return next(valid)
  }

  if (validator.equals(currentPassword, newPassword)) {
    return next(new BadRequestError('New password must not be old password'))
  }

  if (!validator.equals(newPassword, newPasswordConfirm)) {
    return next(new BadRequestError('Passwords do not match'))
  }

  const id = req.session.passport.user

  Users.findById(id).then((user) => {
    if (user instanceof Error) {
      return next(new DatabaseError('User not found'))
    }
    bcrypt.compare(passSet.currentPassword, user.password, (err, isMatch) => {
      if (err) return next(new BadRequestError('Password is incorrectly formatted'))
      if (!isMatch) {
        return next(new BadRequestError('Password was incorrect'))
      } else {
        bcrypt.genSalt(10, (err, salt) => {
          if (err) return next(err)
          bcrypt.hash(passSet.newPassword, salt, (err, hash) => {
            if (err) return next(err)
            passSet.newPassword = hash

            Users.updateUser(id, { $set: { password: passSet.newPassword } })
              .then((updatedUser) => {
                if (updatedUser instanceof Error) return next(new DatabaseError('Error Updating User'))

                if (req.headers.env === 'test' && process.env.NODE_ENV === 'test') {
                  updatedUser.password = passSet.newPassword
                  return res.status(200).json(updatedUser)
                }

                req.flash('success_messages', 'Changed Passwords')
                return res.redirect('back')
              })
          })
        })
      }
    })
  })
})

router.post('/register', jsonParser, validateUser, (req, res, next) => {
  const newUser = res.locals.user

  delete newUser.passwordConfirm

  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err)
    bcrypt.hash(newUser.password, salt, async (err, hash) => {
      if (err) return next(err)
      newUser.password = hash

      Users.findUser({ email: newUser.email }).then((foundUser) => {
        if (foundUser) {
          return next(new DatabaseError('User already exsists'))
        } else if (foundUser instanceof Error) {
          return next(new DatabaseError('Error searching user'))
        } else {
          Users.addUser(newUser).then((addedUser) => {
            if (addedUser instanceof Error) {
              return next(new DatabaseError('Error adding user'))
            } else {
              if (req.headers.env === 'test' && process.env.NODE_ENV === 'test') {
                return res.status(200).json(addedUser)
              }
              req.flash('success_messages', 'Register Successful')
              return res.redirect('back')
            }
          })
        }
      })
    })
  })
})

router.post('/deleteAccount', loggedIn, (req, res, next) => {
  const id = req.session.passport.user
  Users.deleteUser(id).then((user) => {
    if (user instanceof Error) return next(new DatabaseError('Error deleting user'))

    Listings.findListings({ userID: id }).then(async (listings) => {
      if (listings instanceof Error) return next(new DatabaseError('Error getting Listings'))
      const deletePromises = []

      for (let i = 0; i < listings.length; i++) {
        const listing = listings[i]
        deletePromises.push(new Promise((resolve, reject) => {
          Listings.deleteListing(listing._id).then(async (deletedListing) => {
            if (deletedListing instanceof Error) return reject(next(new DatabaseError('Error deleting Listings')))
            await delImages(listing.images).then((val, err) => {
              if (err) reject(err)
              resolve(deletedListing)
            })
          })
        }))
      }

      Promise.all(deletePromises).then((val, err) => {
        if (err) return next(err)
        if (req.headers.env === 'test' && process.env.NODE_ENV === 'test') {
          return res.status(200).json(user)
        }
        req.flash('success_messages', `Your Account ${user.email} was deleted`)
        return res.redirect('back')
      })
    })
  })
})

router.get('/logout', loggedIn, (req, res) => {
  req.logout()

  req.flash('success_messages', 'You have Logged Out')
  return res.redirect('back')
})

module.exports = router
