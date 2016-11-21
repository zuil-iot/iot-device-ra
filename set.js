var k_out = require('./kafka_producer');
var topic_out = 'to_mqtt';

function from_sys(collection,deviceID,data) {
	var dbQuery = {
		"deviceID"	: deviceID
	};
	collection.findOne(dbQuery)
		.then((doc) => {
			if (doc) {
				send_write(doc);
			}
		}).catch((err) => {
			console.log("Error with findOne <"+err+">");
		});
}

function send_write(device) {
	var k_msg = {
		deviceID: device.deviceID,
		msg_type: 'write',
		data: {
			req_state: device.req_state
		}
	}
	console.log("Message sent");
	k_out.send(topic_out,k_msg);
}

module.exports.from_sys = from_sys;

