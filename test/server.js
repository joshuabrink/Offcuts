var expect  = require("chai").expect;
var supertest = require('supertest')

describe("Server Request", function() {

  describe("Home Page", function() {
    let server = supertest.agent('http://localhost:5000')

    var url = "http://localhost:1337";
    it("returns status 200", function(done) {

      server.get('/').expect('Content-type', /text/).expect(200).end(function(err,res) {
        done()
      })
  
    });

  });


});