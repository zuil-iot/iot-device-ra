var k_out = require('./kafka_producer');
var topic_out = 'to_mqtt';

var initialDeviceRecord = {
	"alias"		: "",
	"online"	: false,
	"org"		: {},
	"req_state"	: {
		"pins"		: {
			"D0": {
				"val": false
			},
			"D1": {
				"val": true
			},
			"D2": {
				"val": false
			},
			"D3": {
				"val": false
			}
		}
	},
	"cur_state"	: {},
	"config"	: {
		"registered"	: false,
		"pins"		: {
			"D0": {
				"type": "gpio",
				"mode": "out",
				"index": 0,
				"alias": "Blue",
				"alias_index": "blue"
			},
			"D1": {
				"type": "gpio",
				"mode": "out",
				"index": 1,
				"alias": "Green",
				"alias_index": "green"
			},
			"D2": {
				"type": "gpio",
				"mode": "out",
				"index": 2,
				"alias": "Yellow",
				"alias_index": "yellow"
			},
			"D3": {
				"type": "gpio",
				"mode": "out",
				"index": 3,
				"alias": "Red",
				"alias_index": "red"
			},
			"D4": {
				"type": "gpio",
				"mode": "in",
				"index": 4,
				"alias": "Button",
				"alias_index": "button",
				"alert": "both",
				"stream" : 120
			},
			"A0": {
				"type": "adc",
				"mode": "in",
				"index": 0,
				"alias": "Light Meter",
				"alias_index": "light_meter",
				"invert": true,
				"send_delta": 2,
				"stream" : 600
			}
		},
	}
};

function send_config(device) {
	var k_msg = {
		deviceID: device.deviceID,
		msg_type: 'config',
		data: {
			config: device.config,
			req_state: device.req_state
		}
	}
	console.log("Message sent");
	k_out.send(topic_out,k_msg);
}

function _reg(collection,deviceID,data,create) {
	console.log("Incoming registration");
	// Check if this device already exists
	console.log("Does it exist?");
	var dbQuery = {
		"deviceID"	: deviceID
	};
	collection.findOne(dbQuery)
		.then((doc) => {
			if (doc == null) {
				// Not found, so add it
				console.log("No");
				if (create) {
					var newDoc = JSON.parse(JSON.stringify(initialDeviceRecord));
					newDoc.deviceID = deviceID;
					newDoc.alias = deviceID;
					collection.insert(newDoc)
						.then((docs) => {
							console.log("Inserted");
						}).catch((err) => {
							console.log("Error with insert <"+err+">");
						});
				}
			} else {
				// Found so check for registered
				console.log("Yes");
				console.log("Registered = "+doc.config.registered);
				if (doc.config.registered) {
					send_config(doc);
				}
			}
		}).catch((err) => {
			console.log("Error with findOne <"+err+">");
		});
}

function from_device(collection,deviceID,data) {
	_reg(collection,deviceID,data,true);
}
function from_sys(collection,deviceID,data) {
	_reg(collection,deviceID,data,false);
}

module.exports.from_device = from_device;
module.exports.from_sys = from_sys;

