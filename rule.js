var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var location = require('./function');
var config = require("./config");

function exacLocationRule (item_id,sub){
 var selectSql = "select X(local_center) AS lat ,Y(local_center) AS lng, local_distance, schedule_from, schedule_to from push_item where push_item_id = ? and CURTIME() between schedule_from and schedule_to and ondemand_flag != 1;";
 var getQuery = config.connection.query(selectSql,[item_id]);

  getQuery
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
   //RULE定義から、有効時間内かどうかの判定を行う
   var now = new Date();
   console.log("---CHECK SCHEDULE OF RULE---");
   console.log("NOW TOIME IS:",now);
    console.log("-------------------------------");
    //redisから最新の2レコードを取得して、ユーザの移動判定を行う
    var redisData = [];
    var redisLat = [];
    var redisLng = [];
    config.redisClient.sort(sub,"ALPHA","DESC","LIMIT", "0", "2", function (err, replies) {
    if (replies){
     console.log("---REDIS SELECT USER IS:[", sub, "]---");
     replies.forEach(function (reply,i){
      console.log(" REPLY[",i,"]",reply);
      redisData.push((reply).slice(26));
      redisLat.push(JSON.parse((reply).slice(26)).lat);
      redisLng.push(JSON.parse((reply).slice(26)).lng);
     });
     console.log("-------------------------------");
     var before = {
      lat: redisLat[1],
      lng: redisLng[1]
     };
 
     var after = {
      lat: redisLat[0],
      lng: redisLng[0]
     };
 
     var userLocation = {
      before: before,
      after: after
     };
     console.log("---CHECK USER LOCATION---");
     console.log("USER_BEFORE_GEO:",before);
     console.log("USER_AFTER _GEO:",after);
 
     console.log("USER_LAT:",after.lat);
     console.log("USER_LNG:",after.lng);
     console.log("-------------------------------");
     if(location.locationCheck(userLocation) == "Change") {

      //Rule定義を参照し、登録位置とユーザの位置の距離を取得する
      var distance = getDistance(rows,after)
      console.log("DISTANCE:",distance);
      if (distance < rows.local_distance) {
       // トランスポートオブジェクトでメールを送信
       console.log("---SEND MAIL SITUATION---");
       config.smtpTransport.sendMail(mailOptions, function (error, response) {
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
     }else{
      console.log("USER LOCATION IS NOT CHANGE");
      console.log("-------------------------------");
     }
    }else if(replies = null){
     console.log("REDIS:0");
    }else if (err) {
     console.log("REDIS_ERR:",err);
    }
   });
 });
};

var mailOptions = {
    from: "Location Sample Test Accoount <mobilebu2014@gmail.com>", // sender address
    to: "tanakahdy@nttdata.co.jp",// list of receivers
    subject: "Location Sample Test Message", // Subject line
    text: "どうですかーーー！！！", // plaintext body
    html: "<h2>赤坂チェック（埋め込み）</h2><p>登録地点: AKASAKA K-TOWER (35.677709,139.734901)（埋め込み）</p><p>距離指定: 100m（以内（埋め込み））</p><p></p><p>上記ロケーションにKazunori Sekimizu（埋め込み）が立ち入りました</p>"
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


exports.exacLocationRule = exacLocationRule;
