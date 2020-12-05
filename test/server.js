var expect  = require("chai").expect;
var supertest = require('supertest')

describe("Server Request", function() {

  describe("Home Page", function() {
  
    var server = supertest.agent('http://localhost:5000')
    it("returns status 200", function(done) {

      server.get('/')
      .expect('Content-type', /text/)
      .expect(200)
      .end(function(err,res) {
        if(err) {
          done(err)
        } else {
          done()
        }
       
      })
  
    });

  });

  describe("About Page", function() {
  

    it("returns status 200", function(done) {
      var server = supertest.agent('http://localhost:5000')
      server.get('/about')
      .expect('Content-type', /html/)
      .expect(200)
      .end(function(err,res) {
        if(err) {
          done(err)
        } else {
          done()
        }
       
      })
  
    });

  });



});