function from_sys(typesCollection,devicesCollection,deviceID,data) {
	console.log("Type Change");
	var typeID = data.typeID;
	typesCollection.findOne({typeID: typeID})
		.then((typeDoc) => {
			console.log("Type updated with findOneAndUpdate");
			devicesCollection.findOneAndUpdate({deviceID: deviceID},
				{$set: {
					       req_state: typeDoc.req_state,
					       display_config: typeDoc.display_config,
					       device_config: typeDoc.device_config
				       }})
				.then((doc) => {
					console.log("Device type intialized with findOneAndUpdate");
				}).catch((err) => {
					console.log("Error with findOneAndUpdate <"+err+">");
				});
		}).catch((err) => {
			console.log("Error with findOne <"+err+">");
		});

}

module.exports.from_sys = from_sys;

