var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var location = require('./function');

//mysql
var mysql = require('mysql');
var connection = mysql.createConnection({
        host: 'localhost',
        database: 'LOCATION',
        user: 'root',
        password: ''
});


function exacOndemandRule (item_id){
 var select_rule_Sql = "select X(local_center) AS lat ,Y(local_center) AS lng, local_distance, schedule_from, schedule_to from push_item where push_item_id = ? and CURTIME() between schedule_from and schedule_to and ondemand_flag = 1;";
 var getRuleQuery = connection.query(select_rule_Sql,[item_id]);

 getRuleQuery
  .on('error', function(err){
   console("DBERROR:",err);
 })

  .on('result',function(rows){
  console.log("---DB SELECT RULE ITEM:[", item_id, "]---");
  console.log("RULE_LAT      :",rows.lat);
  console.log("RULE_LNG      :",rows.lng);
  console.log("RULE_TIME_FROM:",rows.schedule_from);
  console.log("RULE_TIME_TO  :",rows.schedule_to);
  console.log("-------------------------------");
   var select_member_Sql = "select sub ,email ,location from member_list where location IS NOT NULL;"
   var getMemberQuery = connection.query(select_member_Sql);

   getMemberQuery
    .on('error', function(err){
    console("DBERROR:",err);
    })

    .on('result',function(member_rows){
     console.log("---DB SELECT MEMBER LIST ---");
     console.log("SUB       :",member_rows.sub);
     console.log("EMAIL     :",member_rows.email);
     console.log("LOCATION  :",member_rows.location);
     console.log("-------------------------------");

     var userLocation = {
      lat: JSON.parse(member_rows.location).lat,
      lng: JSON.parse(member_rows.location).lng
     };
 
     console.log("---CHECK USER LOCATION---");
     var distance = getDistance(rows,userLocation)
     console.log("DISTANCE:",distance);
     if (distance < rows.local_distance) {
      console.log("-------------------------------");
      // トランスポートオブジェクトでメールを送信
      console.log("---SEND MAIL SITUATION---");
      var mailOptions = {
       from: "Location Sample Test Accoount <mobilebu2014@gmail.com>", // sender address
       to: member_rows.email,// list of receivers
       subject: "Location Sample Test Message", // Subject line
       text: "どうですかーーー！！！", // plaintext body
       html: "<h2>赤坂配信（埋め込み）</h2><p>登録地点: AKASAKA K-TOWER (35.677709,139.734901)（埋め込み）</p><p>距離指定: 100m（以内（埋め込み））</p><p></p><p>上記ロケーションにいる方に便利なインフォメーションの配信です！</p>"
      }
      smtpTransport.sendMail(mailOptions, function (error, response) {
       if (error) {
        console.log(error);
       }else {
        console.log("Message sent: " + response.message);
        console.log("-------------------------------");
       }
      });
     }else{
      console.log("USER IS OUT OF RULE AREA");
      console.log("-------------------------------");
     }
   });
 });
};

//node_mailer
var nodemailer = require("nodemailer");
var smtpTransport = nodemailer.createTransport("SMTP", {
    service: "Gmail",
    auth: {
        user: "nttdmobilebu2014@gmail.com",
        pass: "sekimizukazunori"
    }
});

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


exports.exacOndemandRule = exacOndemandRule;
