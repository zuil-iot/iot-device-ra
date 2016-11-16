var k_out = require('./kafka_producer');
var k_in = require('./kafka_consumer');
var mongodb = require('mongodb');
const monk = require('monk');
var reqCmd = "register";
var resCmd = "config";
var collectionName = "devices";

var topics_in = ['from_mqtt_register'];
var topic_out = 'to_mqtt';
 
const mongoURL = 'mongodb://iot-mongo:27017/iot';

//
// Monk
//
console.log("Starting Mongo: "+mongoURL);
const db = monk(mongoURL);
db.then(() => {
	console.log("\tConnected");
})
var collection = db.get(collectionName);


function send_config(deviceID,cfg) {
	var k_msg = {
		deviceID: deviceID,
		msg_type: 'config',
		data: cfg
	}
	console.log("Message sent");
	k_out.send(topic_out,k_msg);
}

function process_message (topic,json) {
	// Extract message parts
	var deviceID = json.deviceID;
	var msg_type = json.msg_type;
	var data = json.data;
	if (! deviceID) { console.log("No DeviceID ", deviceID);return; }
	if (! msg_type) { console.log("No Message Type");return; }
	if (! data) { console.log("No Message Data");return; }
	// Setup database quesry
	var dbQuery = {
		"deviceID"	: deviceID
	};
	var dbPayload = {
		"deviceID"	: deviceID,
		"registered"	: false
	};
	// Check if this device already exists
	console.log("Does it exist?");
	collection.findOne(dbQuery)
		.then((doc) => {
			if (doc == null) {
				// Not found, so add it
				console.log("No");
				collection.insert(dbPayload)
					.then((docs) => {
						console.log("Inserted");
					}).catch((err) => {
						console.log("Error with insert <"+err+">");
					});
			} else {
				// Found so check for registered
				console.log("Yes");
				console.log("Registered = "+doc.registered);
				if (doc.registered) {
					send_config(deviceID,doc.config);
				}
			}
		}).catch((err) => {
			console.log("Error with findOne <"+err+">");
		});
}

function go () {
	console.log("App running");
}

// Setup
k_out.set_on_ready(k_in.start);
k_in.set_on_message(process_message);
k_in.set_on_ready(go);
k_in.set_topics(topics_in);
// Go
k_out.start();


