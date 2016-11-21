function from_device(collection,deviceID,data) {
	console.log("Incoming online/offline");
	collection.findOneAndUpdate({deviceID: deviceID}, {$set: {online: data.online}})
		.then((doc) => {
			console.log("State updated with findOneAndUpdate");
		}).catch((err) => {
			console.log("Error with findOneAndUpdate <"+err+">");
		});
}

module.exports.from_device = from_device;

