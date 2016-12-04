var k_out = require('./kafka_producer');
var topic_out = 'to_mqtt';

var initialDeviceRecord = {
	"registered"		: false,
	"alias"			: "",
	"online"		: false,
	"org"			: {},
	"req_state"		: {},
	"cur_state"		: {},
	"display_config"	: {},
	"device_config"		: {}
};

function send_config_to_device(device) {
	var k_msg = {
		deviceID: device.deviceID,
		msg_type: 'config',
		data: {
			registered: device.registered,
			config: device.device_config,
			req_state: device.req_state
		}
	}
	console.log("Message sent");
	k_out.send(topic_out,k_msg);
}

function create_device_entry(devicesCollection,req_data) {
	var newDeviceDoc = JSON.parse(JSON.stringify(initialDeviceRecord));
	newDeviceDoc.deviceID = req_data.deviceID;
	newDeviceDoc.alias = req_data.deviceID;
	newDeviceDoc.sw_version = req_data.sw_version;
	devicesCollection.insert(newDeviceDoc)
		.then((docs) => {
			console.log("Inserted");
		}).catch((err) => {
			console.log("Error with insert <"+err+">");
		});
}

function unregister(devicesCollection,typesCollection,deviceDoc) {
	console.log("Unregistering");
	var typeID = deviceDoc.typeID;
	console.log("TypeID: ",typeID);
	typesCollection.findOne({typeID: typeID})
		.then((typeDoc) => {
			// Set all pins to initial state
			console.log("Type found");
			deviceDoc.req_state = typeDoc.req_state;
			send_config_to_device(deviceDoc);
		}).catch((err) => {
			console.log("Ungregister: Error with findOne <"+err+">");
		});
}

function update_device_info(devicesCollection,req_data) {
	var dbQuery = {
		"deviceID"	: req_data.deviceID
	};
	var updateItem = { $set: {
		sw_version: req_data.sw_version
	} }
	console.log("DB Query: ",dbQuery);
	console.log("Update Item: ",JSON.stringify(updateItem));
	devicesCollection.findOneAndUpdate(dbQuery,updateItem)
		.then((deviceDoc) => {
			console.log("Device info updated");
		}).catch((err) => {
			console.log("Update Device Info: Error with findOneAndUpdate <"+err+">");
		});
}

function _reg(typesCollection,devicesCollection,deviceID,req_data,create) {
	console.log("Incoming registration");
	// Check if this device already exists
	console.log("Does it exist?");
	var dbQuery = {
		"deviceID"	: deviceID
	};
	console.log("DB Query: ",dbQuery);
	devicesCollection.findOne(dbQuery)
		.then((deviceDoc) => {
			if (deviceDoc == null) {
				// Not found, so add it
				console.log("No");
				if (create) {
					create_device_entry(devicesCollection,req_data);
				} else {
					console.log("Registration requested from sys for non-existant device:",deviceID);
				}
			} else {
				// Found
				// Check for registered
				console.log("Yes");
				console.log("Registered = "+deviceDoc.registered);
				if (deviceDoc.registered) {
					send_config_to_device(deviceDoc);
				} else if (typesCollection) { // This is an unregister event from the sys
					unregister(devicesCollection,typesCollection,deviceDoc);
				}
				update_device_info(devicesCollection,req_data);
			}
		}).catch((err) => {
			console.log("Register Event: Error with findOne <"+err+">");
		});
}

function from_device(devicesCollection,deviceID,req_data) {
	_reg(null,devicesCollection,deviceID,req_data,true);
}
function from_sys(typesCollection,devicesCollection,deviceID,req_data) {
	_reg(typesCollection,devicesCollection,deviceID,req_data,false);
}

module.exports.from_device = from_device;
module.exports.from_sys = from_sys;
