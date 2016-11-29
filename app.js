var k_out = require('./kafka_producer');
var k_in = require('./kafka_consumer');
var mongodb = require('mongodb');
const monk = require('monk');
var reqCmd = "register";
var resCmd = "config";
var devicesCollectionName = "devices";
var streamCollectionName = "stream_data";

var topic_in_mqtt = 'from_mqtt';
var topic_in_sys = 'device_ra';
var topics_in = [topic_in_mqtt,topic_in_sys];
 
const mongoURL = 'mongodb://iot-mongo:27017/iot';
var reg = require('./reg');
var state = require('./state');
var set = require('./set');
var status = require('./status');
var stream = require('./stream');

//
// Monk
//
console.log("Starting Mongo: "+mongoURL);
const db = monk(mongoURL);
db.then(() => {
	console.log("\tConnected");
})
var devicesCollection = db.get(devicesCollectionName);
var streamCollection = db.get(streamCollectionName);


function process_message (topic,json) {
	// Extract message parts
	var deviceID = json.deviceID;
	var msg_type = json.msg_type;
	var data = json.data;
	if (! deviceID) { console.log("No DeviceID ", deviceID);return; }
	if (! msg_type) { console.log("No Message Type");return; }
	if (! data) { console.log("No Message Data");return; }
	// Ping
	if (topic == topic_in_mqtt && msg_type == "ping") { return; }
	// Incoming from device
	if (topic == topic_in_mqtt && msg_type == "register") { reg.from_device(devicesCollection,deviceID,data); }
	else if (topic == topic_in_mqtt && msg_type == "status") { status.from_device(devicesCollection,deviceID,data); }
	else if (topic == topic_in_mqtt && msg_type == "state") { state.from_device(devicesCollection,deviceID,data); }
	else if (topic == topic_in_mqtt && msg_type == "stream") { stream.from_device(streamCollection,deviceID,data); }
	// Outgoing to device
	else if (topic == topic_in_sys && msg_type == "registered") { reg.from_sys(devicesCollection,deviceID,data); }
	else if (topic == topic_in_sys && msg_type == "set") { set.from_sys(devicesCollection,deviceID,data); }
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


