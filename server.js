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

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Listening on " + port);
});

app.get('/', function(req, res) {
  console.log("/");
  res.render('index', {data : null});
});

app.get('/test', function(req, res) {
  res.render('test');
});

app.get('/replay/:id', function(req, res) {
  var id = req.params["id"];
  var string = encodeURIComponent(id);
  res.render('index', {data : req.params["replay_id"]});
});

app.get('/get_replay/:id', function(req, res) {
  var id = req.params["id"];
  console.log("replay_id = " + id);
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log("!!");
    getOneDataFromDB(db, id, function(result) {
      console.log(result);
      res.json(result);
      db.close();
    });
  });
});

app.get('/list', function (req, res) {
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    getDataFromDB(db, function(results) {
      res.render('list', {data : results});
      db.close();
    });
  });
});

var data_in_db;

app.post('/save', function(req, res) {
	var json_data = getJsonDataFromRequest(req);
  json_data.score-=[]; // string to int, if int then nothing hapen
	MongoClient.connect(url, function(err, db) {
	  assert.equal(null, err);
	  insertDocument(db, json_data, function(docsInserted) {
      console.log("save doc into " + docsInserted);
      res.json({"id":docsInserted})
	    db.close();
	  });
	});
});

app.get('/drop_table', function(req, res) {
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    db.dropDatabase();
    db.close();
    return res.redirect("/");
  });
});

var getJsonDataFromRequest = function(req) {
	//console.log(req.body);
	return req.body;
}

var insertDocument = function(db, data, callback) {
  var db_client = db.collection('lumines_scores');
  db_client.insertOne(
   	data // json object
   	, function(err, result) {
    assert.equal(err, null);
    callback(result);
  });
};

var getDataFromDB = function(db, callback) {
  var cursor =db.collection('lumines_scores').find().sort( { score: -1 } );
  cursor.toArray(function(err, doc) {
    assert.equal(err, null);
    callback(doc.slice(0, 10));
  });
};

var getOneDataFromDB = function(db, id, callback) {
  var ObjectId = require('mongodb').ObjectID;
  console.log("getOneDataFromDB");
  var cursor =db.collection('lumines_scores').find(
  {
    "_id": new ObjectId(id)
  });
  cursor.toArray(function(err, doc) {
    assert.equal(err, null);
    callback(doc);
  });
}
