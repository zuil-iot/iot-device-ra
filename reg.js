var k_out = require('./kafka_producer');
var topic_out = 'to_mqtt';

var initialDeviceRecord = {
	"registered"	: false,
	"alias"		: "",
	"online"	: false,
	"org"		: {},
	"req_state"	: {},
	"cur_state"	: {},
	"config"	: {},
};

function send_config(device) {
	var k_msg = {
		deviceID: device.deviceID,
		msg_type: 'config',
		data: {
			registered: device.registered,
			config: device.config,
			req_state: device.req_state
		}
	}
	console.log("Message sent");
	k_out.send(topic_out,k_msg);
}

function _reg(typesCollection,devicesCollection,deviceID,data,create) {
	console.log("Incoming registration");
	// Check if this device already exists
	console.log("Does it exist?");
	var dbQuery = {
		"deviceID"	: deviceID
	};
	devicesCollection.findOne(dbQuery)
		.then((doc) => {
			if (doc == null) {
				// Not found, so add it
				console.log("No");
				if (create) {
					var newDoc = JSON.parse(JSON.stringify(initialDeviceRecord));
					newDoc.deviceID = deviceID;
					newDoc.alias = deviceID;
					newDoc.sw_version = data.sw_version;
					devicesCollection.insert(newDoc)
						.then((docs) => {
							console.log("Inserted");
						}).catch((err) => {
							console.log("Error with insert <"+err+">");
						});
				}
			} else {
				// Found
				// Check for registered
				console.log("Yes");
				console.log("Registered = "+doc.registered);
				if (doc.registered) {
					send_config(doc);
				} else if (typesCollection) { // This is an unregister event from the sys
					console.log("Unregistering");
					var typeID = doc.typeID;
					console.log("TypeID: ",typeID);
					typesCollection.findOne({typeID: typeID})
						.then((typeDoc) => {
							// Set all pins to initial state
							console.log("Type found");
							doc.req_state = typeDoc.req_state;
							send_config(doc);
						}).catch((err) => {
							console.log("Error with findOne <"+err+">");
						});
				}
			}
		}).catch((err) => {
			console.log("Error with findOne <"+err+">");
		});
}

function from_device(devicesCollection,deviceID,data) {
	_reg(null,devicesCollection,deviceID,data,true);
}
function from_sys(typesCollection,devicesCollection,deviceID,data) {
	_reg(typesCollection,devicesCollection,deviceID,data,false);
}

module.exports.from_device = from_device;
module.exports.from_sys = from_sys;
