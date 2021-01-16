// /* eslint-disable no-undef */
// const supertest = require('supertest')
// const expect = require('chai').expect

// const server = supertest.agent('http://localhost:3000')
// server.set('env', 'test')

// const EMAIL = '     joshuabrink1@gmail.com    '
// const NAME = 'Joshua  '
// const NUMBER = '082797643aa9  '
// const PASSWORD = '!123Password123*'

// function setErr (err, sentErr) {
//   if (!err || !sentErr) return new Error('Incorrect Error Format')
//   const sentObj = JSON.parse(sentErr.text)
//   err.message = sentObj.message
//   err.stack = sentObj.stack
// }

// describe('Register', function () {
//   it('Status 200 and body returned', function (done) {
//     server.post('/register')
//       .send({
//         name: NAME,
//         email: EMAIL,
//         number: NUMBER,
//         password: PASSWORD,
//         passwordConfirm: PASSWORD
//       })
//       .expect(200)
//       .end(function (err, res) {
//         if (err) setErr(err, res.error)
//         expect(res.body).to.be.a('object')

//         done(err)
//       })
//   })
// })
