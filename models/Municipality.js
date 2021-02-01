const ObjectID = require('mongodb').ObjectID
// const imageDecode = require('../lib/imageUpload');

class Munic {
  constructor (db) {
    this.collection = db.collection('municipalities')

    // this.collection.createIndex({
    //   title: 'text',
    //   location: 'text',
    //   material: 'text'
    // })
  }

  async findById (id) {
    const objId = new ObjectID(id)
    return await this.collection.findOne({ _id: objId }).then((foundMunic, err) => {
      if (err) return err
      return foundMunic
    })
  }

  async findMunics (filter, limit = 0) {
    return await this.collection.find(filter).limit(limit).toArray().then((munics, err) => {
      if (err) return err
      return munics
    })
  }

  async searchMunics (query) {
    return await this.collection.aggregate(
      [{
        $search: {
          index: 'auto',
          autocomplete: {
            query: query,
            path: 'title'
          }
        }
      }]).limit(5).toArray().then((munics, err) => {
      if (err) return err
      return munics
    })
  }
}

module.exports = Munic
