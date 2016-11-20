var k_out = require('./kafka_producer');
var k_in = require('./kafka_consumer');
var mongodb = require('mongodb');
const monk = require('monk');
var reqCmd = "register";
var resCmd = "config";
var collectionName = "devices";

var topic_in_mqtt = 'from_mqtt';
var topic_in_sys = 'device_ra';
var topics_in = [topic_in_mqtt,topic_in_sys];
 
const mongoURL = 'mongodb://iot-mongo:27017/iot';
var reg = require('./reg');
var state = require('./state');

//
// Monk
//
console.log("Starting Mongo: "+mongoURL);
const db = monk(mongoURL);
db.then(() => {
	console.log("\tConnected");
})
var collection = db.get(collectionName);


function process_message (topic,json) {
	// Extract message parts
	var deviceID = json.deviceID;
	var msg_type = json.msg_type;
	var data = json.data;
	if (! deviceID) { console.log("No DeviceID ", deviceID);return; }
	if (! msg_type) { console.log("No Message Type");return; }
	if (! data) { console.log("No Message Data");return; }
	if (topic == topic_in_mqtt && msg_type == "register") { reg.from_device(collection,deviceID,data); }
	if (topic == topic_in_mqtt && msg_type == "state") { state.from_device(collection,deviceID,data); }
	if (topic == topic_in_sys && msg_type == "registered") { reg.from_sys(collection,deviceID,data); }
	else { console.log("Unknown message topic/type: ",topic,'/',msg_type); }
} 

function go () {
	console.log("App running");
}

// Setup
k_out.set_on_ready(k_in.start);
k_in.set_on_message(process_message);
k_in.set_on_ready(go);
k_in.set_topics(topics_in);
k_in.set_group('iot-dev-ra');
// Go
k_out.start();


