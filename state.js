function _reg(collection,deviceID,data,create) {
	console.log("Incoming state");
	collection.findOneAndUpdate({deviceID: deviceID}, {$set: {cur_state: data.cur_state}})
		.then((doc) => {
			console.log("State updated with findOneAndUpdate");
		}).catch((err) => {
			console.log("Error with findOneAndUpdate <"+err+">");
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

