/* eslint-disable no-undef */

// const { MongoClient } = require('mongodb')
const { assert } = require('chai')
const mongo = require('../lib/mongoUtil')
require('dotenv').config()

let user = null

describe('Database Tests:', function () {
  describe('Initial Connection', function () {
    it('Connected to Database', async function () {
      const con = await mongo.init()
      assert.ok(con)
    })
  })

  describe('Add User', function () {
    it('User Added', async function () {
      user = await mongo.Users.addUser({
        name: 'Joshua Brink',
        email: 'joshuabrink11@gmail.com',
        number: '0827976439'
      })
      assert.ok(user)
    })
  })

  describe('Read User', function () {
    it('User Read', async function () {
      const foundUser = await mongo.Users.findUser(user)
      assert.ok(foundUser)
    })
  })

  describe('Update User', function () {
    it('User Updated', async function () {
      const updatedUser = await mongo.Users.updateUser(user._id, { $set: { name: 'Nathan Brink' } })
      assert.ok(updatedUser)
    })
  })

  describe('Delete User', function () {
    it('User Deleted', async function () {
      const deletedUser = await mongo.Users.deleteUser(user._id)
      assert.ok(deletedUser)
      mongo.close()
    })
  })
})
