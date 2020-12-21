
const validator = require('validator')

const { BadRequestError } = require('./errorHandle/userFacing')

const util = {

  validateUser: function (newUser) {
    const defaultValidate = util.validateFields(newUser)

    if (defaultValidate instanceof Error) {
      return defaultValidate
    }

    if (!validator.isLength(newUser.name, { min: 3, max: 30 })) {
      return (new BadRequestError('Name needs to be between 3-30 characters'))
    }

    if (!validator.isEmail(newUser.email)) {
      return (new BadRequestError('Email was not valid'))
    }

    if (!validator.isMobilePhone(newUser.number)) {
      return (new BadRequestError('Number was not valid'))
    }

    if (!validator.equals(newUser.password, newUser.passwordConfirm)) {
      return (new BadRequestError('Passwords do not match'))
    }

    if (!validator.isStrongPassword(newUser.password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
      returnScore: false
    })) {
      return (new BadRequestError('Password is not strong enough'))
    }

    return true
  },

  validateListing: function (newListing) {
    if (newListing.quantity === '' || newListing.quantity === undefined) {
      newListing.quantity = '1'
    }

    const defaultValidate = util.validateFields(newListing)

    if (defaultValidate instanceof Error) {
      return defaultValidate
    }

    if (!validator.isLength(newListing.title, { max: 50 })) {
      return (new BadRequestError('Title contains special characters'))
    }
    if (!validator.isInt(newListing.price, { allow_leading_zeroes: false })) {
      return (new BadRequestError('Price must be a number (no leading 0\'s'))
    }

    if (!validator.isInt(newListing.quantity, { allow_leading_zeroes: false })) {
      return (new BadRequestError('Quantity must be a number (no leading 0\'s'))
    }

    if (!validator.isInt(newListing.price, { max: 1000000 })) {
      return (new BadRequestError('Price exceeds limit'))
    }
    if (!validator.isInt(newListing.price, { min: 0 })) {
      return (new BadRequestError('Price cannot be negative'))
    }
    if (!validator.isAlphanumeric(newListing.material)) {
      return (new BadRequestError('Material contains special characters'))
    }

    if (!validator.matches(newListing.type, /[a-z]+-[a-z]+/i)) {
      return (new BadRequestError('Type is incorrectly formatted'))
    }

    const validBaseTypes = ['bar', 'tubing', 'beam', 'sheet', 'other']
    if (!validator.isIn(newListing.type.substr(0, newListing.type.indexOf('-')), validBaseTypes)) {
      return (new BadRequestError('Base type is not valid'))
    }

    if (!validator.isLength(newListing.description, { max: 500 })) {
      return (new BadRequestError('Description is too long'))
    }

    if (!validator.isLatLong(newListing.location)) {
      return (new BadRequestError('Location is incorrectly formatted'))
    }

    if (!validator.isDate(newListing.date)) {
      return (new BadRequestError('Date is incorrectly formatted'))
    }
    return true
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
