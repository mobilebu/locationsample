var config = require('./config');
var mysql = require('mysql');

function handleDisconnect(connection) {
  connection.on('error', function (error) {
    if (!error.fatal) return;
    if (error.code !== 'PROTOCOL_CONNECTION_LOST') throw err;

    console.error('> Re-connecting lost MySQL connection: ' + error.stack);

    // NOTE: This assignment is to a variable from an outer scope; this is extremely important
    // If this said `client =` it wouldn't do what you want. The assignment here is implicitly changed
    // to `global.mysqlClient =` in node.
    connection = mysql.createConnection(connection.config);
    handleDisconnect(connection);
    connection.connect();
  });
};

function locationCheck(userLocation){
 if (userLocation.before.lat === userLocation.after.lat){
  if (userLocation.before.lng === userLocation.after.lng) {
   return "NoChange";
  }else{
   return "Change";
  }
 }else{
  return "Change";
 }
}

var rad = function(x) {
  return x * Math.PI / 180;
};

var getDistance = function(p1, p2) {
  var R = 6371000; // Earth’s mean radius in meter
  var dLat = rad(p2.lat - p1.lat);
  var dLong = rad(p2.lng - p1.lng);
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(p1.lat)) * Math.cos(rad(p2.lat)) *
    Math.sin(dLong / 2) * Math.sin(dLong / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d; // returns the distance in meter
};

exports.rad = rad;
exports.getDistance = getDistance;
exports.locationCheck = locationCheck;
exports.handleDisconnect = handleDisconnect;

