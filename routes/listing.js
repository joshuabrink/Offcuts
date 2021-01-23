
// LIBRARIES
const express = require('express')
const router = express.Router()
const multer = require('multer')
const sharp = require('sharp')
const validator = require('validator')
const { loggedIn } = require('../lib/auth')
const fs = require('fs')
// logger
const pino = require('pino')
// const expressPino = require('express-pino-logger')
const logger = pino({ level: process.env.LOG_LEVEL || 'info' })

// CUSTOM LIBRARIES
const { DatabaseError } = require('../lib/errorHandle/errors')
const { BadRequestError } = require('../lib/errorHandle/userFacing')
const { Listings } = require('../lib/mongoUtil')
const { validateListing, validateFilter } = require('../lib/validate')

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
    if (err) return (err)
    return true
  })
}

const getChangedImages = (dbImages, upImages) => {
  dbImages = dbImages.map(img => 'assets\\' + img)
  return dbImages.map(x => {
    if (!upImages.some(y => { return y === x })) {
      return { value: x, query: false }
    }
    return null
  })
    .concat(upImages.map(x => {
      if (!dbImages.some(y => { return y === x })) {
        return { value: x, query: true }
      }
      return null
    }))
    .filter(n => n)
}

// set storage of images
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

// ROUTES

const defaultRendor = (res, req, path = 'listings', listings) => {
  if (!listings) {
    return res.render(path, { user: req.user })
  }
  return res.render(path, { title: path, listings: listings, user: req.user })
}

router.get('/post', loggedIn, (req, res) => {
  // res.render('post', { title: 'post', user: req.user })
  return defaultRendor(res, req, 'post')
})

router.get('/boost', (req, res, next) => {
  // res.send('working')
  Listings.findUsersListings(req.user._id + '').then(listings => {
    res.render('boost', { title: 'Boost', user: req.user, listings: listings })
  })
  
})

router.get('/listings/', (req, res, next) => {
  Listings.findListings({}, 20).then(listings => {
    return defaultRendor(res, req, 'listings', listings)
  })
})

router.get('/listings/search/:query', (req, res, next) => {
  const { query } = req.params
  Listings.searchListings(query).then(titles => {
    res.send(titles)
  })
})

router.post('/listings/search/:query', (req, res, next) => {
  const { query } = req.params
  Listings.searchListings(query).then(titles => {
    res.send(titles)
  })
})

router.get('/listings/:material', validateFilter, (req, res) => {
  logger.info('first-level: ' + req.params.material)
  const { material } = req.params
  Listings.findListings({ material: material }).then(listings => {
    return defaultRendor(res, req, 'listings', listings)
  })
})

router.get('/listings/:material/:type', validateFilter, (req, res, next) => {
  logger.info('first-level: ' + req.params.material + ' second-level: ' + req.params.type)
  const { type, material } = req.params
  Listings.findListings({ type: type, material: material }).then(listings => {
    if (listings instanceof Error) return next(listings)
    return defaultRendor(res, req, 'listings', listings)
  })
})

router.get('/listings/:material/:type/:id', validateFilter, (req, res, next) => {
  logger.info('first-level: ' + req.params.material +
  '\n second-level: ' + req.params.type +
  '\n third-level: ' + req.params.id)
  const { id } = req.params

  Listings.findById(id).then(listing => {
    if (listing instanceof Error) return next(listing)
    return res.render('listing-view', { title: 'Listing', listing: listing })
  })
})

router.post('/newListing', loggedIn, upload, validateListing, (req, res, next) => {
  const fields = res.locals.listing

  const paths = []

  for (let i = 0; i < req.files.length; i++) {
    const path = req.files[i].path
    sharp(path)
      .resize(200, 200)
      .jpeg({ quality: 50 })
      .toFile(req.files[i].destination + '/thumb-' + req.files[i].originalname)
      .catch(err => {
        if (err) return next(err)
      })
    paths.push(path.substr(path.indexOf('\\')))
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

router.post('/updateListing', loggedIn, upload, validateListing, (req, res, next) => {
  const { listingID } = req.body

  const fields = res.locals.listing

  const paths = req.files.map(file => { return file.path })

  Listings.updateListing(listingID, { $set: fields }).then((listing) => {
    const changedImages = getChangedImages(listing.images, paths)

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
