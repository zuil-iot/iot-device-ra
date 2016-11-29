function from_device(collection,deviceID,data) {
	console.log("Incoming stream from: ",deviceID);
	console.log(JSON.stringify(data));
	var data_points = data.stream.pins;
	var sysDate=new Date().toISOString();
	if (data_points) {
		for (var i=0, len = data_points.length ; i< len; i++) {
			dp = data_points[i];
			var isoDate=sysDate;

			console.log("Pin: ",dp.pin,"Val: ",dp.val,"Time: ",isoDate);

			var newDoc = {
				deviceID: deviceID,
				pin: dp.pin,
				val: dp.val,
				timestamp: isoDate
			}
			collection.insert(newDoc)
				.then((doc) => {
					console.log("Stream datapoint inserted");
				}).catch((err) => {
					console.log("Error with stream insert <"+err+">");
				});
			
		}
	}
}

module.exports.from_device = from_device;

