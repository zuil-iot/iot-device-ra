var c_kafka = require('kafka-node');
var consumer;
var ready_cb;
var message_cb;
var topics;

var options = {
	host: 'zookeeper:2181',
	zk : undefined,   // put client zk settings if you need them (see Client)
	batch: undefined, // put client batch settings if you need them (see Client)
	ssl: false, // optional (defaults to false) or tls options hash
	groupId: 'default',
	sessionTimeout: 15000,
	// An array of partition assignment protocols ordered by preference.
	// 'roundrobin' or 'range' string for built ins (see below to pass in custom assignment protocol) 
	protocol: ['roundrobin'],

	// Offsets to use for new groups other options could be 'earliest' or 'none' (none will emit an error if no offsets were saved)
	// equivalent to Java client's auto.offset.reset
	fromOffset: 'latest', // default

	migrateHLC: false,    // for details please see Migration section below
	migrateRolling: false,
	encoding: 'utf8'
};

function on_message(msg) {
	var topic = msg.topic;
	var msg_str = msg.value.toString();
	console.log('Kafka Rcvd: topic = ',topic,' payload = ',msg_str);
	var json = JSON.parse(msg_str);
	if (message_cb) { message_cb(topic,json) }
}

function set_on_ready(cb) {
	console.log("Consumer Ready Callback Registered");
	ready_cb=cb;
}
function set_on_message(cb) {
	console.log("Consumer Message Callback Registered");
	message_cb=cb;
}
function set_topics(t) {
	topics = t;
}
function set_group(g) {
	options.groupId = g;
}


function start () {
	console.log("Starting Consumer: ",topics);
	consumer = new c_kafka.ConsumerGroup(options, topics);
	if (message_cb) { consumer.on('message',on_message) };
	if (ready_cb) { ready_cb(); }
}

module.exports.start = start;
module.exports.set_on_ready = set_on_ready;
module.exports.set_on_message = set_on_message;
module.exports.set_topics = set_topics;
module.exports.set_group = set_group;
