const express = require('express')
const router = express.Router()
const { Listings } = require('../lib/mongoUtil')

router.get('/', (req, res, next) => {
  // res.send('working')
  Listings.findListings({}).then(listings => {
    res.render('home', { title: 'Home', listings: listings })
  })
  // res.render('home', { title: 'Home' })
})

router.get('/about', (req, res) => {
  // res.send('working')
  res.render('about')
})

module.exports = router
