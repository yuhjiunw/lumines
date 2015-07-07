var express = require('express');
var app = express();

// Database
var MongoClient = require('mongodb');
var assert = require('assert')
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://b97901028:testtest123@ds047672.mongolab.com:47672/lumines';
//

var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

app.use(express.static('public'));

// use jade as template engine
app.set('views', './views');
app.set('view engine', 'jade');

// app.get('/', function (req, res) {
//   res.send('Hello World!');
// });

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Listening on " + port);
});

app.get('/list', function (req, res) {
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    getDataFromDB(db, function(results) {
      console.log(results);
      res.render('list', {data : results});
      db.close();
    });
  });
});

var data_in_db;

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

app.get('/drop_table', function(req, res) {
  console.log("/drop_table");
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    db.dropDatabase();
    db.close();
    return res.redirect("/");
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

var getDataFromDB = function(db, callback) {
  var cursor =db.collection('lumines_scores').find();
  cursor.toArray(function(err, doc) {
    assert.equal(err, null);
    callback(doc);
  });
};
