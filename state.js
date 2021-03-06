function from_device(collection,deviceID,data) {
	console.log("Incoming state");
	collection.findOneAndUpdate({deviceID: deviceID}, {$set: {cur_state: data.cur_state, online: true}})
		.then((doc) => {
			console.log("State updated with findOneAndUpdate");
		}).catch((err) => {
			console.log("Error with findOneAndUpdate <"+err+">");
		});
}

module.exports.from_device = from_device;

