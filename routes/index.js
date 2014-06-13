var express = require('express');
var passport = require('passport');
var router = express.Router();
var ondemand = require('../ondemand');

//LocationApp
var mysql = require('mysql');
var connection = mysql.createConnection({
 host: process.env.DB_HOST || 'localhost',
 user: process.env.DB_USER || 'root',
 password: process.env.DB_PASS || '',
 database: process.env.DB_NAME || 'LOCATION'
});
//redis
var redis  = require('redis');
var redisClient = redis.createClient();

/* GET home page. */
router.get('/', function(req, res) {
  if (req.session.passport.user) {
   console.log("LOGIN:",req.session);
   res.render('index', { 
    dName: req.session.passport.user.displayName,
    sub: req.session.passport.user.id
   });
  }else{
  console.log("NO_USER:",req.session);
   res.render('index', {
    dName: null
   });
  }
});

router.get('/geo', function(req, res) {

  if (req.session.passport.user) {
    console.log("GEO:",req.session.passport.user);
    console.log("GEO_DNAME:",req.session.passport.user.displayName);
    console.log("GEO_ID:",req.session.passport.user.id);
    res.render('geo', { 
    dName: req.session.passport.user.displayName,
    sub: req.session.passport.user.id
   });
  }else{
   res.render('index', {
    dName: null
   });
  }
});

router.get('/android', function(req, res){
  res.send();
});
router.post('/android', function(req, res){
  console.log("BODY:",req.body); 
  res.send();
});

//LocationApp RuleList
router.get('/rule',function(req, res){
 if (req.session.passport.user) {
  console.log("RuleLIST:",req.session.passport);
  var rule_dbData = [];
  var ondemand_dbData = [];
  var selectSql = "select * from push_item;";
  var getQuery = connection.query(selectSql);

  getQuery
   .on('error', function(err){
   })

   .on('result',function(rows){
    if (rows.ondemand_flag == "1"){
     ondemand_dbData.push(rows);
    }else{
     rule_dbData.push(rows);
    }
   })

   .on('end',function(){
    res.render('rule',{
     rule: rule_dbData,
     ondemand: ondemand_dbData,
     dName: req.session.passport.user.displayName,
     sub: req.session.passport.user.id
    });
  });
 }else{
  res.render('index',{
   dName: null
  });
 }
});

//LocationApp RuleEdit
router.get('/rule_edit',function(req, res){
 if (req.session.passport.user) {
  console.log("RuleEDIT:",req.session.passport);
  var dbData = [];
  var selectSql = "select * from member_list;";
  var getQuery = connection.query(selectSql);

  getQuery
   .on('error', function(err){
   })

   .on('result',function(rows){
   dbData.push(rows);
   })

   .on('end',function(){
    res.render('rule_edit',{
     user: dbData,
     dName: req.session.passport.user.displayName,
     sub: req.session.passport.user.id
    });
  });
 }else{
  res.render('index',{
   dName: null
  });
 }
});

//LocationApp exacOndemand
router.get('/exac_ondemand',function(req, res){
 if (req.session.passport.user) {
  console.log("卍卍卍ONDEMAND PUSH卍卍卍");
  ondemand.exacOndemandRule(req.query.item_id);
  res.redirect('/rule');
 }else{
  res.render('index',{
   dName: null
  });
 }
});

//LocationApp MySetting
router.get('/setting',function(req, res){
 if (req.session.passport.user) {
  console.log("SETTING:",req.session.passport);
  var dbData = [];
  var selectSql = "select * from member_list where sub = ?;";
  var getQuery = connection.query(selectSql,[req.session.passport.user.id]);

  getQuery
   .on('error', function(err){
   })

   .on('result',function(rows){
   dbData.push(rows);
   })

   .on('end',function(){
    res.render('setting',{
     mySettings: dbData,
     dName: req.session.passport.user.displayName,
     sub: req.session.passport.user.id
    });
  });
 }else{
  res.render('index',{
   dName: null
  });
 }
});


//for google-openidconnect
router.get('/login_google', passport.authenticate('openidconnectgoogle', {
failureRedirect: '/'
}), function(req, res) {
console.log("OIDC_FOR_GOOGLE:");
});

router.get('/auth/google/callback', passport.authenticate('openidconnectgoogle',
{
failureRedirect: '/'
}), function(req, res) {
req.session.passport = req.session.passport;
req.session.passport.user.id = req.session.passport.user._json.id;
console.log("GOOGLE_CALL_BACK:",req.session.passport.user);
res.redirect('/');
});


//for yahoo
router.get('/login_yahoo', passport.authenticate('openidconnectyahoo', {
failureRedirect: '/'
}), function(req, res) {
console.log("OIDC_FOR_YAHOO:");
});
 
 
router.get('/auth/yahoo/callback', passport.authenticate('openidconnectyahoo', {
failureRedirect: '/'
}), function(req, res) {
console.log("YAHOO_CALL_BACK:",req.session.passport.user);
req.session.passport = req.session.passport;
console.log("LOGIN:",req.session.passport.user);
res.redirect('/');
});

//LocationApp MemberList
router.get('/list',function(req, res){
 if (req.session.passport.user) {
  console.log("LIST:",req.session.passport);
  var dbData = [];
  var selectSql = "select * from member_list;";
  var getQuery = connection.query(selectSql);

  getQuery
   .on('error', function(err){
   })

   .on('result',function(rows){
   dbData.push(rows);
   })

   .on('end',function(){
    res.render('list',{ 
     user: dbData,
     dName: req.session.passport.user.displayName,
     sub: req.session.passport.user.id
    });
  });
 }else{
  res.render('index',{
   dName: null
  });
 }
});

//LocationApp MemberLocation
router.get('/memberlocation',function(req, res){
 if (req.session.passport.user) {
  console.log("MEMBER_LOCATION:",req.session.passport);
  var redisData = [];
  var lat = [];
  var lng = [];
  redisClient.sort(req.query.sub,"ALPHA","DESC", function (err, replies) {
   if (replies){
    replies.forEach(function (reply,i){
     console.log(" REPLY",reply);
     redisData.push((reply).slice(26));
     lat.push(JSON.parse((reply).slice(26)).lat);
     lng.push(JSON.parse((reply).slice(26)).lng);
    });
    console.log("REDISDATA",redisData);
    res.render('location',{
     dName: req.session.passport.user.displayName,
     geodata: redisData,
     lat: lat,
     lng: lng,
     err: null
    });
   }else if(replies = null){
    console.log("REDIS:0");
    res.render('location',{
     err: "位置情報が登録されていません"
    });
   }else if (err) {
    console.log("REDIS_ERR:",err);
    res.render('location',{
     err: err
    });
   }
  });
 }else{
  res.render('index',{
   dName: null
  });
 }
});

router.get('/logout', function(req, res) {
 req.logout();
 req.session.destroy();
 console.log("LOGOUT")
 res.redirect('/');
});

module.exports = router;
