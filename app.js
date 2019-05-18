const MongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser');
const express = require('express');
const assert = require('assert');
const path = require('path');
const app = express();
var url = require("url");
var config = require('./config.js');

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
	extended: true
})); 

app.use(express.static(path.join(__dirname, 'views')));
app.set('port', (process.env.PORT || 5000));

var db_url;

if (process.env.MONGODB_URI) db_url = process.env.MONGODB_URI;
else db_url = config.db.localhost + ':' + config.db.port;

var dbName = 'gltfmodel';

const client = new MongoClient(db_url, { useNewUrlParser: true });
client.connect(function(err) {
	assert.equal(null, err);
	console.log("Connected successfully to server");
});

app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname, 'views/index.html'));
});

app.post('/saveScene', function(req, res) {
	if(req.body.username == null){
		return res.status(400).send({
			message: 'Provide a username!'
		});
	}

	const db = client.db(dbName);

	var filter = {
		"username": req.body.username
	};

	db.collection("scenes").replaceOne(filter, req.body, { upsert: true }, function(err, res){
		if(err) throw err;
	});

	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end("Scene saved for username: " + req.body.username + " Thanks.");
});

app.get('/retrieveScene', function(req, res) {
	const db = client.db(dbName);

	var filter = {
		"username": req.query.username
	};

	res.setHeader('Content-Type', 'application/json');
	var resultJSON = {};

	db.collection("scenes").findOne(filter, function(err, result){
		if(err) throw err;
		res.setHeader('Content-Type', 'application/json');
		res.send(JSON.stringify(result));
	});
});

var server = app.listen(app.get('port'), function(){
	console.log('Server listening on port ' + app.get('port'));
});
