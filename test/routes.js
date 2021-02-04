/* eslint-disable no-undef */

const expect = require('chai').expect
const bcrypt = require('bcryptjs')
const supertest = require('supertest')

const server = supertest.agent('http://localhost:3000')
server.set('env', 'test')

const EMAIL = '     johnsmith@gmail.co    '
const NAME = 'john  '
const SURNAME = 'smith'
const NUMBER = '0827976439  '
let PASSWORD = '!123Password123*'
const UPPASSWORD = '!123Password123*!'
const UPNAME = 'johnny'
const UPEMAIL = 'john@jjohn.com'
const UPNUMBER = '0827976444'
const FILES = ['./test/images/alloy-tube.jpg', './test/images/ss-alloy-tube-500x500.jpg', './test/images/stainlesstube.jpg']

function setErr (err, sentErr) {
  if (!err || !sentErr) return new Error('Incorrect Error Format')
  const sentObj = JSON.parse(sentErr.text)
  err.message = sentObj.message
  err.stack = sentObj.stack
}

describe('Server Request', function () {
  describe('Home Page', function () {
    it('returns status 200', function (done) {
      server.get('/')
        .end(function (err, res) {
          if (err) setErr(err, res.error)
          expect(res.status).to.equal(200)

          done(err)
        })
    })
  })

  describe('About Page', function () {
    it('returns status 200', function (done) {
      server.get('/about')
        .end(function (err, res) {
          expect(res.status).to.equal(200)
          done(err)
        })
    })
  })

  describe('Register', function () {
    it('Status 200 and body returned', function (done) {
      server.post('/register')
        .send({
          name: NAME,
          surname: SURNAME,
          email: EMAIL,
          number: NUMBER,
          password: PASSWORD,
          passwordConfirm: PASSWORD
        })
        .expect(200)
        .end(function (err, res) {
          if (err) setErr(err, res.error)
          expect(res.body).to.be.a('object')

          done(err)
        })
    })
  })

  describe('Login', function () {
    it('Status 200 and body returned', function (done) {
      server.post('/login')
        .send({
          email: EMAIL,
          password: PASSWORD
        })
        .expect(200)
        .end(function (err, res) {
          if (err) setErr(err, res.error)
          expect(res.body).to.be.a('object')

          done(err)
        })
    })
  })

  describe('Update Password', function () {
    it('Status 200 and body returned', function (done) {
      server.post('/updatePassword')
        .send({
          currentPassword: PASSWORD,
          newPassword: UPPASSWORD,
          newPasswordConfirm: UPPASSWORD
        })
        .expect(200)
        .end(function (err, res) {
          if (err) setErr(err, res.error)
          expect(res.body).to.be.a('object')
          PASSWORD = UPPASSWORD
          if (res.body.password) {
            bcrypt.compare(PASSWORD, res.body.password, (compareErr, isMatch) => {
              if (compareErr) done(compareErr)
              if (!isMatch) {
                err = new Error('Password does not match updated password')
              }
              done(err)
            })
          } else {
            done(err)
          }
        })
    })
  })

  describe('Update User', function () {
    it('Status 200 and body returned', function (done) {
      server.post('/updateUser')
        .send({
          name: UPNAME,
          email: UPEMAIL,
          number: UPNUMBER
        })
        .expect(200)
        .end(function (err, res) {
          if (err) setErr(err, res.error)
          expect(res.body).to.be.a('object')
          if (res.body.name !== UPNAME || res.body.email !== UPEMAIL || res.body.number !== UPNUMBER) {
            err = new Error('User was not updated correctly')
          }
          done(err)
        })
    })
  })

  let listingID = null

  describe('Add Listing', function () {
    it('Status 200 and body returned', function (done) {
      const request = server.post('/newListing')
        .field('title', 'Stainless Steel')
        .field('price', '1000')
        .field('quantity', '2')
        .field('material', 'stainless')
        .field('description', '300x2000 tubing')
        .field('location', '24,24')
        .field('date', '2002-07-15')
        .field('type', 'bar-flat')

      FILES.forEach(file => {
        request.attach('images', file)
      })
      request
        .expect(200)
        .end(function (err, res) {
          if (err) setErr(err, res.error)
          expect(res.body).to.be.a('object')

          listingID = res.body._id

          done(err)
        })
    })
  })

  describe('Update Listing', function () {
    it('Status 200 and body returned', function (done) {
      const request = server.post('/updateListing')
        .field('title', 'Stainless')
        .field('price', '1')
        .field('quantity', '2')
        .field('material', 'stainless')
        .field('description', '300x2000 tubing')
        .field('location', '24,24')
        .field('date', '2002-07-15')
        .field('type', 'bar-square')
        .field('listingID', listingID)
      FILES.pop()
      FILES.push('./test/images/stainless-steel-sheet.jpg')
      FILES.push('./test/images/stainless1.jpg')
      // FILES.push('./test/images/stainless2.jpg')
      // FILES.push('./test/images/stainless3.jpg')
      FILES.forEach(file => {
        request.attach('images', file)
      })
      request
        .expect(200)
        .end(function (err, res) {
          if (err) setErr(err, res.error)
          expect(res.body).to.be.a('object')

          done(err)
        })
    })
  })

  describe('Delete Listing', function () {
    it('Status 200 and body returned', function (done) {
      server.delete('/deleteListing/' + listingID)
        .expect(200)
        .end(function (err, res) {
          if (err) setErr(err, res.error)
          expect(res.body).to.be.a('object')
          done(err)
        })
    })
  })

  describe('Logout', function () {
    it('returns status 302 (redirect)', function (done) {
      server.get('/logout')
        .expect(302)
        .end(function (err, res) {
          if (err) setErr(err, res.error)

          done(err)
        })
    })
  })

  describe('Delete Account', function () {
    it('Status 200 and body returned', function (done) {
      server.post('/login')
        .send({
          email: UPEMAIL,
          password: PASSWORD
        })
        .end(function (err, res) {
          if (err) setErr(err, res.error)
          server.post('/deleteAccount')
            .expect(200)
            .end(function (err, res) {
              if (err) setErr(err, res.error)
              expect(res.body).to.be.a('object')
              done(err)
            })
        })
    })
  })
})
