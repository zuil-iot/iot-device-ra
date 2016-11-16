var zookeeper = 'zookeeper:2181';
var p_kafka = require('kafka-node');
var producer;
var ready_cb;



function send(topic,msg) {
	var json = JSON.stringify(msg);
	var payloads= [
		{ topic: topic, messages: json }
	];
	producer.send(payloads, function (err, data) {
		console.log("Kafka Send: topic = ",topic," payload = ",json);
	});
}

function set_on_ready(cb) {
	ready_cb = cb;
}

function start() {
	client = new p_kafka.Client(zookeeper),
	producer = new p_kafka.HighLevelProducer(client),
	producer.on('ready', function () {
		console.log("Kafka Producer Ready");
		if (ready_cb) { ready_cb(); }
//		send('topic','Hi Mom!');
	});
}

module.exports.start = start;
module.exports.send = send;
module.exports.set_on_ready = set_on_ready;
