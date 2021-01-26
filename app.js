(async () => {
  // const https = require('https')
  const express = require('express')
  const { UserFacingError } = require('./lib/errorHandle/errors')
  const { NotFoundError } = require('./lib/errorHandle/userFacing')

  const app = express()
  // const fs = require('fs')
  const bodyParser = require('body-parser')
  const mongo = require('./lib/mongoUtil')
  const passport = require('passport')
  const session = require('express-session')
  const cookieParser = require('cookie-parser')
  const flash = require('connect-flash')
  const path = require('path')

  // Logger
  const pino = require('pino')
  // const expressPino = require('express-pino-logger')

  const logger = pino({ level: process.env.LOG_LEVEL || 'info' })
  // logger.info('hi')
  // const expressLogger = expressPino({ logger })
  // app.use(expressLogger)

  // Session Security
  const helmet = require('helmet')
  app.use(helmet())

  // Databse initialization
  await mongo.init()

  app.use(function (req, res, next) {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self' https://nominatim.openstreetmap.org/; font-src 'self'; img-src 'self' 'unsafe-inline' blob: http://localhost:3000/ data: http://*.tile.openstreetmap.org/; script-src 'self' 'unsafe-inline' https://www.google-analytics.com https://www.googletagmanager.com https://google-analytics.com; style-src 'self' 'unsafe-inline'; frame-src 'self' https://www.google.com/"
    )
    next()
  })

  // app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true, limit: '5mb' }))

  // Passport Config
  require('./lib/passport')(passport)

  // Express Cookie
  app.use(cookieParser('secretString'))
  app.set('trust proxy', 1) // trust first proxy
  // Express session
  app.use(
    session({
      name: 'sessionID',
      secret: process.env.SECRET,
      resave: true,
      saveUninitialized: true
    })
  )

  // Flash
  app.use(flash())

  app.use(function (req, res, next) {
    res.locals.success_messages = req.flash('success_messages')
    res.locals.error_messages = req.flash('error_messages')
    next()
  })

  app.use(express.static(path.join(__dirname, 'assets')))

  // Passport middleware
  app.use(passport.initialize())
  app.use(passport.session())

  // EJS View Engine
  app.set('view engine', 'ejs')

  app.use('/', require('./routes/index.js'))
  app.use('/', require('./routes/user.js'))
  app.use('/', require('./routes/listing.js'))

  app.use(function (err, req, res, next) {
    logger.debug(err)
    if (err instanceof UserFacingError) {
      if (req.headers.env === 'test' && process.env.NODE_ENV === 'test') {
        return res.status(err.statusCode).json({ message: err.message, stack: err.stack })
      }
      if (err instanceof NotFoundError) {
        return res.redirect('/404')
      }
      req.flash('error_messages', err.message)
      return res.redirect('back')
    } else {
      // if (req.headers.env === 'test' && process.env.NODE_ENV === 'test') {
      //   return res.status(500).json({ message: err.message, stack: err.stack })
      // }
      return res.redirect('back')
      // return res.status(500).send({ message: err.message, stack: err.stack })
    }
  })

  // 404 Page

  app.get('*', (req, res) => {
    res.render('404', { title: '404' })
  })

  app.listen(3000)

  // https.createServer({
  //   key: fs.readFileSync('./keys/server.key'),
  //   cert: fs.readFileSync('./keys/server.cert')
  // }, app).listen(3001, () => {
  //   logger.info('Server started on port 3001')
  // })
})()
