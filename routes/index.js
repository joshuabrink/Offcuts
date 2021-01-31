const express = require('express')
const router = express.Router()
const { Listings } = require('../lib/mongoUtil')
const { District, Local, Countries, Cities } = require('../lib/geo')
const turf = require('@turf/helpers')
const jsonParser = require('body-parser').json()

router.get('/', (req, res, next) => {
  // res.send('working')
  Listings.findListings({}, 20).then(listings => {
    res.render('home', { title: 'Home', listings: listings, user: req.user })
  })
  // res.render('home', { title: 'Home' })
})

router.get('/account', (req, res, next) => {
  // res.send('working')
  Listings.findUsersListings(req.user._id + '').then(listings => {
    res.render('user', { title: 'Account', user: req.user, listings: listings })
  })
  // res.render('home', { title: 'Home' })
})

router.get('/about', (req, res) => {
  // res.send('working')
  res.render('about', { user: req.user })
})
// click event for search button
router.post('/search', (req, res, next) => {
  // do stuff

})

router.get('/geojson/cities', (req, res) => {
  // res.send('working')

  const data = Cities()

  res.send(data)
})

router.post('/geojson/countries', jsonParser, (req, res) => {
  // res.send('working')
  const points = turf.point(req.body)

  const data = District()

  res.send(data)
})

module.exports = router
