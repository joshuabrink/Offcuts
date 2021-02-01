const express = require('express')
const router = express.Router()
const { Listings, Districts, Munics, Cities } = require('../lib/mongoUtil')
// const { District, Local, Countries, Cities } = require('../lib/geo')
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

const provMap = {
  Gauteng: 'GT',
  'Eastern Cape': 'EC',
  'Western Cape': 'WC',
  'KwaZulu-Natal': 'KZN',
  Limpopo: 'LIM',
  Mpumalanga: 'MP',
  'Northern Cape': 'NC'
}

router.get('/getDistricts/:province', (req, res) => {
  let { province } = req.params
  province = provMap[province]
  Districts.findDistricts({ PROVINCE: province }).then(municipalities => {
    res.send(municipalities)
  })
})

router.get('/getMunicipalities/:district', (req, res) => {
  const { district } = req.params
  Munics.findMunics({ DISTRICT: district }).then(districts => {
    res.send(districts)
  })
})

router.get('/getCities/:municipality', (req, res) => {
  const { municipality } = req.params
  Cities.findCities({ MN_MDB_C: municipality }).then(cities => {
    res.send(cities)
  })
})

// router.get('/geojson/cities', (req, res) => {
//   // res.send('working')

//   const data = Cities()

//   res.send(data)
// })

// router.post('/geojson/countries', jsonParser, (req, res) => {
//   // res.send('working')
//   const points = turf.point(req.body)

//   const data = District()

//   res.send(data)
// })

module.exports = router
