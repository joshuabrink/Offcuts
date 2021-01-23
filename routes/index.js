const express = require('express')
const router = express.Router()
const { Listings } = require('../lib/mongoUtil')
const { District, Local, Countries } = require('../lib/geo')
const turf = require('@turf/helpers')
const jsonParser = require('body-parser').json()

router.get('/', (req, res, next) => {
  // res.send('working')
  Listings.findListings({}, 20).then(listings => {
    res.render('home', { title: 'Home', listings: listings })
  })
  // res.render('home', { title: 'Home' })
})

router.get('/about', (req, res) => {
  // res.send('working')
  res.render('about')
})

router.get('/geojson/countries', (req, res) => {
  // res.send('working')

  const data = Local()

  res.send(data)
})

router.post('/geojson/countries', jsonParser, (req, res) => {
  // res.send('working')
  const points = turf.point(req.body)

  const data = District()

  res.send(data)
})

module.exports = router
