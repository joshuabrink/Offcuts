const ObjectID = require('mongodb').ObjectID
// const imageDecode = require('../lib/imageUpload');

class District {
  constructor (db) {
    this.collection = db.collection('districts')

    // this.collection.createIndex({
    //   title: 'text',
    //   location: 'text',
    //   material: 'text'
    // })
  }

  async findById (id) {
    const objId = new ObjectID(id)
    return await this.collection.findOne({ _id: objId }).then((foundDistrict, err) => {
      if (err) return err
      return foundDistrict
    })
  }

  async findDistricts (filter, limit = 0) {
    return await this.collection.find(filter).limit(limit).toArray().then((districts, err) => {
      if (err) return err
      return districts
    })
  }

  async searchDistricts (query) {
    return await this.collection.aggregate(
      [{
        $search: {
          index: 'auto',
          autocomplete: {
            query: query,
            path: 'title'
          }
        }
      }]).limit(5).toArray().then((districts, err) => {
      if (err) return err
      return districts
    })
  }
}

module.exports = District
