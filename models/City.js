const ObjectID = require('mongodb').ObjectID
// const imageDecode = require('../lib/imageUpload');

class City {
  constructor (db) {
    this.collection = db.collection('cities')

    // this.collection.createIndex({
    //   title: 'text',
    //   location: 'text',
    //   material: 'text'
    // })
  }

  async findById (id) {
    const objId = new ObjectID(id)
    return await this.collection.findOne({ _id: objId }).then((foundCity, err) => {
      if (err) return err
      return foundCity
    })
  }

  async findCities (filter, limit = 0, sort = 0) {
    return await this.collection.find(filter).limit(limit).sort({ city: 1 }).toArray().then((cities, err) => {
      if (err) return err
      return cities
    })
  }

  async searchCities (query) {
    return await this.collection.aggregate(
      [{
        $search: {
          index: 'auto',
          autocomplete: {
            query: query,
            path: 'title'
          }
        }
      }]).limit(5).toArray().then((cities, err) => {
      if (err) return err
      return cities
    })
  }
}

module.exports = City
