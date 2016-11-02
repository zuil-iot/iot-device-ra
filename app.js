var mqtt = require('mqtt');
var mongodb = require('mongodb');
var monk = require('monk');

var iotHost = 'iot.zulicreative.com';
 
var mongoURL = 'mongodb://iot-mongo:27017/iot';
var mqttURL = 'mqtt://iot-haproxy:1883';

// Monk
console.log("Starting Mongo: "+mongoURL);
var db = monk(mongoURL);
var iotDevices = db.get('iot-devices');

// MQTT
console.log("Starting MQTT"+mqttURL);
var mqttClient = mqtt.connect(mqttURL, {
  username: '123',
  password: '123',
  rejectUnauthorized: false
});

mqttClient.on('connect', function () {
	console.log("Connected to MQTT: "+mqttURL);
	mqttClient.subscribe('device/+/register');
});
mqttClient.on('error', function(err) {
	console.log("Error connecting to MQTT: "+mqttURL +"("+err+")");
});
 
mqttClient.on('message', function (topic, message) {
	var nodeID=topic.split("/")[1];
	var msg = {
		"NodeID"	: nodeID,
		"Topic"		: topic,
		"Message"	: message.toString()
	};
	console.log(msg);
	iotDevices.insert(msg,function(err,docs) {
		if (err) {
			console.log("Error inserting into DB: "+mongoURL +"("+err+")");
		}
	});
	var response = {"reg": true};
	mqttClient.publish('device/'+nodeID+'/config',JSON.stringify(response));
})



