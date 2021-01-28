
const validator = require('validator')
const ObjectID = require('mongodb').ObjectID
const MATERIALS = ['stainless', 'tool', 'alloy', 'carbon', 'other']
const TYPES = ['bar', 'tubing', 'beam', 'sheet', 'mesh', 'other']

const { BadRequestError, NotFoundError } = require('./errorHandle/userFacing')

const util = {

  validateFilter: function (req, res, next) {
    const { material, type, id } = req.params
    if (material) {
      if (!validator.isIn(material, MATERIALS)) {
        return next(new NotFoundError('Incorrect material'))
      }
      if (type) {
        if (!validator.isIn(type.substr(0, type.indexOf('-')), TYPES)) {
          return next(new NotFoundError('Incorrect type'))
        }
        if (id) {
          if (!ObjectID.isValid(id)) return next(new NotFoundError('Incorrect ID type'))
        }
      }
    }
    return next()
  },

  validateUser: function (req, res, next) {
    const { name, email, number, password, passwordConfirm, surname } = req.body
    const date = new Date(Date.now()).toISOString();
    var validated = 'false';
    const newUser = {
      name,
      email,
      number,
      password,
      passwordConfirm,
      surname,
      date,
      validated
    }
    // GLOBAL variable
    res.locals.user = newUser

    const defaultValidate = util.validateFields(newUser)

    if (defaultValidate instanceof Error) {
      return next(defaultValidate)
    }

    if (!validator.isLength(newUser.name, { min: 2, max: 30 })) {
      return next(new BadRequestError('Name needs to be between 2-30 characters'))
    }
    if (!validator.isLength(newUser.surname, { min: 2, max: 30 })) {
      return next(new BadRequestError('Surame needs to be between 2-30 characters'))
    }

    if (!validator.isEmail(newUser.email)) {
      return next(new BadRequestError('Email was not valid'))
    }

    if (!validator.isMobilePhone(newUser.number)) {
      return next(new BadRequestError('Number was not valid'))
    }

    if (!validator.equals(newUser.password, newUser.passwordConfirm)) {
      return next(new BadRequestError('Passwords do not match'))
    }

    if (!validator.isStrongPassword(newUser.password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
      returnScore: false
    })) {
      return next(new BadRequestError('Password is not strong enough'))
    }

    return next()
  },

  validateListing: function (req, res, next) {
    const { title, price, quantity, material, type, description, location, date } = req.body
    const userID = req.session.passport.user
    const newListing = {
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

    res.locals.listing = newListing

    if (newListing.quantity === '' || newListing.quantity === undefined) {
      newListing.quantity = '1'
    }

    const defaultValidate = util.validateFields(newListing)

    if (defaultValidate instanceof Error) {
      return next(defaultValidate)
    }

    if (!validator.isLength(newListing.title, { max: 50 })) {
      return next(new BadRequestError('Title contains special characters'))
    }
    if (!validator.isInt(newListing.price, { allow_leading_zeroes: false })) {
      return next(new BadRequestError('Price must be a number (no leading 0\'s'))
    }

    if (!validator.isInt(newListing.quantity, { allow_leading_zeroes: false })) {
      return next(new BadRequestError('Quantity must be a number (no leading 0\'s'))
    }

    if (!validator.isInt(newListing.price, { max: 1000000 })) {
      return next(new BadRequestError('Price exceeds limit'))
    }
    if (!validator.isInt(newListing.price, { min: 0 })) {
      return next(new BadRequestError('Price cannot be negative'))
    }
    if (!validator.isAlphanumeric(newListing.material)) {
      return next(new BadRequestError('Material contains special characters'))
    }

    // if (!validator.matches(newListing.type, /[a-z]+-[a-z]+/i)) {
    //   return next(new BadRequestError('Type is incorrectly formatted'))
    // }

    if (!validator.isIn(newListing.type.substr(0, newListing.type.indexOf('-')), TYPES)) {
      return next(new BadRequestError('Base type is not valid'))
    }

    if (!validator.isLength(newListing.description, { max: 500 })) {
      return next(new BadRequestError('Description is too long'))
    }

    if (!validator.isLatLong(newListing.location)) {
      return next(new BadRequestError('Location is incorrectly formatted'))
    }

    if (!validator.isDate(newListing.date)) {
      return next(new BadRequestError('Date is incorrectly formatted'))
    }
    return next()
  },

  validateFields: function (obj) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      if (obj[key] === undefined || obj[key] === '') {
        return (new BadRequestError('Empty fields in form'))
      }
      obj[key] = validator.escape(obj[key])
      obj[key] = validator.trim(obj[key])
    }
    // Object.keys(obj).forEach(function (key) {
    //   if (obj[key] === undefined || obj[key] == '') {
    //     return(new BadRequestError('Empty fields in form'))
    //   }
    //   obj[key] = validator.escape(obj[key])
    //   obj[key] = validator.trim(obj[key])

    // });
    return true
  }

}

module.exports = util
