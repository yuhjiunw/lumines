var express = require('express');
var app = express();

// Database
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert')
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/test';
//

var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

app.use(express.static('public'));

// app.get('/', function (req, res) {
//   res.send('Hello World!');
// });

var server = app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});

app.post('/save', function(req, res) {
	console.log("/save");
	var json_data = getJsonDataFromRequest(req);
	MongoClient.connect(url, function(err, db) {
	  assert.equal(null, err);
	  insertDocument(db, json_data, function() {
	      db.close();
	  });
	});
});

var getJsonDataFromRequest = function(req) {
	console.log(req.body);
	return req.body;
}

var insertDocument = function(db, data, callback) {

  var db_client = db.collection('lumines_scores');
  db_client.insertOne(
   	data // json object
   	, function(err, result) {
    assert.equal(err, null);
    console.log("Inserted a document into the restaurants collection.");
    callback(result);
  });
};
