const ObjectID = require('mongodb').ObjectID

class User {
  constructor (db) {
    this.collection = db.collection('users')
  }

  async addUser (user) {
    return await this.collection.insertOne(user).then((user, err) => {
      if (err) return err
      return user.ops[0]
    })
  }

  async updateUser (id, update) {
    const objId = new ObjectID(id)
    return await this.collection.findOneAndUpdate({ _id: objId }, update).then((upUser, err) => {
      if (err) return err
      return upUser.value
    })
  }

  async findUser (user) {
    return await this.collection.findOne(user).then((foundUser, err) => {
      if (err) return err
      return foundUser
    })
  }

  async findById (id) {
    const objId = new ObjectID(id)
    return await this.collection.findOne({ _id: objId }).then((foundUser, err) => {
      if (err) return err
      return foundUser
    })
  }

  async deleteUser (id) {
    const objId = new ObjectID(id)
    return await this.collection.findOneAndDelete({ _id: objId }).then((delUser, err) => {
      if (err) return err
      return delUser.value
    })
  }
}
module.exports = User
