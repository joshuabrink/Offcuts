
const express = require('express')
const router = express.Router()
const multer = require('multer')
const sharp = require('sharp')
const validator = require('validator')
const { loggedIn } = require('../lib/auth')
const fs = require('fs')

const { DatabaseError } = require('../lib/errorHandle/errors')
const { BadRequestError } = require('../lib/errorHandle/userFacing')
const { Listings } = require('../lib/mongoUtil')
const { validateListing } = require('../lib/validate')

// SET STORAGE
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = 'assets/uploads'
    cb(null, dest)
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname.toLowerCase().split(' ').join('-'))
  }
})

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (!validator.isMimeType(file.mimetype)) {
      cb(new BadRequestError('Mime type is incorrectly formated'))
    }
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
      cb(null, true)
    } else {
      cb(new BadRequestError('Only .png, .jpg and .jpeg format allowed!'))
    }
  }
}).array('images', 5)

router.get('/listings', (req, res, next) => {
  Listings.findListings({}).then(listings => {
    res.render('listings', { listings: listings })
  })
})

router.get('/getListing', (req, res, next) => {
  const { id } = req.query
  Listings.findById(id).then(listing => {
    if (listing instanceof Error) return next(listing)
    return res.render('listing-view', { title: 'Listing', listing: listing })
  })
})

router.post('/newListing', loggedIn, (req, res, next) => {
  upload(req, res, function (err) {
    if (err) return next(err)

    const { title, price, quantity, material, type, description, location, date } = req.body
    const userID = req.session.passport.user
    const fields = {
      title,
      price,
      quantity,
      material,
      type,
      description,
      location,
      date,
      userID
    }

    const valid = validateListing(fields)

    if (valid instanceof Error) {
      return next(valid)
    }

    const paths = []

    for (let i = 0; i < req.files.length; i++) {
      sharp(req.files[i].path)
        .resize(200, 200)
        .jpeg({ quality: 50 })
        .toFile(req.files[i].destination + '/thumb-' + req.files[i].originalname)
        .catch(err => {
          if (err) return next(err)
        })
      paths.push(req.files[i].path)
    }

    fields.images = paths

    Listings.addListing(fields).then(listing => {
      if (listing instanceof Error) {
        return next(listing)
      }

      if (req.headers.env === 'test' && process.env.NODE_ENV === 'test') {
        return res.status(200).json(listing)
      }

      req.flash('success_messages', 'Listing has been posted')
      return res.redirect('back')
    })
  })
})

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
    if (err) return (err)
    return true
  })
}

router.post('/updateListing', loggedIn, (req, res, next) => {
  upload(req, res, function (err) {
    if (err) return next(err)

    const { title, price, quantity, material, type, description, location, date, listingID } = req.body
    const fields = {
      title,
      price,
      quantity,
      material,
      type,
      description,
      location,
      date
    }

    const paths = req.files.map(file => { return file.path })

    Listings.updateListing(listingID, { $set: fields }).then((listing) => {
      const changedImages = listing.images.map(x => {
        if (!paths.some(y => { return y === x })) {
          return { value: x, query: false }
        }
        return null
      })
        .concat(paths.map(x => {
          if (!listing.images.some(y => { return y === x })) {
            return { value: x, query: true }
          }
          return null
        }))
        .filter(n => n)

      const remove = []
      const add = []

      for (let i = 0; i < changedImages.length; i++) {
        const value = changedImages[i].value
        if (changedImages[i].query) {
          add.push(value)
          sharp(value)
            .resize(200, 200)
            .jpeg({ quality: 50 })
            .toFile(req.files[i].destination + '/thumb-' + req.files[i].originalname).catch(err => {
              if (err) return next(err)
            })
        } else {
          remove.push(value)
        }
      }

      delImages(remove).then((val, err) => {
        if (err) return next(err)
        const pullQuery = { $pull: { images: { $in: remove } } }
        const pushQuery = { $push: { images: { $each: add } } }

        Listings.updateListing(listing._id, pullQuery).then(pullListing => {
          if (pullListing instanceof Error) return next(new DatabaseError('Error updating image paths'))
          Listings.updateListing(listing._id, pushQuery).then(pushListing => {
            if (pushListing instanceof Error) return next(new DatabaseError('Error updating image paths'))
            if (req.headers.env === 'test' && process.env.NODE_ENV === 'test') {
              return res.status(200).json(listing)
            }
            req.flash('success_messages', 'Your Listing was updated')
            return res.redirect('back')
          })
        })
      })
    })
  })
})

router.post('/deleteListing', loggedIn, (req, res, next) => {
  const { listingID } = req.body

  const userID = req.session.passport.user

  Listings.findById(listingID).then(foundListing => {
    if (foundListing instanceof Error) return next(new DatabaseError('Error finding Listing'))

    if (!foundListing) return next(new DatabaseError('Listing not found'))

    if (foundListing.userID !== userID) {
      return next(new BadRequestError('Incorrect authorization'))
    }

    Listings.deleteListing(listingID).then((listing) => {
      if (listing instanceof Error) return next(new DatabaseError('Error deleting Listing'))

      delImages(listing.images).then((val, err) => {
        if (err) return next(err)
        if (req.headers.env === 'test' && process.env.NODE_ENV === 'test') {
          return res.status(200).json(listing)
        }

        req.flash('success_messages', `Your Listing ${listing.title} was deleted`)
        return res.redirect('back')
      })
    })
  })
})

module.exports = router
