//mysql
var mysql = require('mysql');
exports.connection = mysql.createConnection({
        host: 'localhost',
        database: 'LOCATION',
        user: '', //ENTER YOUR ENVIROMENT
        password: '' //ENTER YOUR ENVIROMENT
});

//redis
var redis  = require('redis');
exports.redisClient = redis.createClient();

//send e-mail
var nodemailer = require("nodemailer");
exports.smtpTransport = nodemailer.createTransport("SMTP", {
    service: "", //ENTER YOUR ENVIROMENT SUCH AS "Gmail"...
    auth: {
        user: "", //ENTER YOUR ENVIROMENT
        pass: "" //ENTER YOUR ENVIROMENT
    }
});
