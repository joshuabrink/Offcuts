const ObjectID = require('mongodb').ObjectID
// const imageDecode = require('../lib/imageUpload');

class Listing {
  constructor (db) {
    this.collection = db.collection('listings')

    // this.collection.createIndex({
    //   title: 'text',
    //   location: 'text',
    //   material: 'text'
    // })
  }

  async addListing (listing) {
    return await this.collection.insertOne(listing).then((listing, err) => {
      if (err) return err
      return listing.ops[0]
    })
  }

  async updateListing (id, update) {
    const objId = new ObjectID(id)
    return await this.collection.findOneAndUpdate({ _id: objId }, update).then((upListing, err) => {
      if (err) return err
      return upListing.value
    })
  }

  async findListing (listing) {
    return await this.collection.findOne(listing).then((foundListing, err) => {
      if (err) return err
      return foundListing
    })
  }

  async findById (id) {
    const objId = new ObjectID(id)
    return await this.collection.findOne({ _id: objId }).then((foundListing, err) => {
      if (err) return err
      return foundListing
    })
  }

  async findUsersListings (id) {
    const objId = new ObjectID(id)
    return await this.collection.find({ userID: objId }).toArray().then((listings) => {
      return listings
    })
  }

  async findListings (filter) {
    return await this.collection.find(filter).toArray().then((listings, err) => {
      if (err) return err
      return listings
    })
  }

  async deleteListing (id) {
    const objId = new ObjectID(id)
    return await this.collection.findOneAndDelete({ _id: objId }).then((delListing, err) => {
      if (err) return err
      return delListing.value
    })
  }
}

module.exports = Listing
