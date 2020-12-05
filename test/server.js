var expect  = require("chai").expect;
var request = require("request");

describe("Server Request", function() {

  describe("Home Page", function() {

    var url = "http://localhost:1337";
    it("returns status 200", function(done) {
      request(url, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        done();
      });
    });

  });


});