const fs = require('fs')
const path = require('path')

module.exports = {
  Countries: () => {
    const data = fs.readFileSync(path.join(__dirname, '/data/', 'countries.json'))
    return data
  },
  Local: () => {
    const data = fs.readFileSync(path.join(__dirname, '/data/', 'local.json'))
    return data
  },
  District: () => {
    const data = fs.readFileSync(path.join(__dirname, '/data/', 'district.json'))
    return data
  },
  SAOutline: () => {
    const data = fs.readFileSync(path.join(__dirname, '/data/', 'sa.out.geo.json'))
    return data
  },
  Cities: () => {
    const data = fs.readFileSync(path.join(__dirname, '/data/', 'cities.json'))
    return data
  }
}
