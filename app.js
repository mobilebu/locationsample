var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var config = require('./config');

//OIDC
var session = require('express-session');
var passport = require('passport');
var OpenidConnectStrategy = require('passport-openidconnect').Strategy;
var GoogleOpenidConnectStrategy = require('passport-openidconnect-google').Strategy;
var YahooOpenidConnectStrategy = require('passport-openidconnect-yahoo').Strategy;

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//OIDC
app.use(session({ secret: 'mobilebutest', key: 'mobilebutestkey',})) //cookieParserよりあとに書いてね
app.use(passport.initialize());
app.use(passport.session());

app.use('/', routes);
app.use('/users', users);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

passport.use(new GoogleOpenidConnectStrategy({
        authorizationURL: "https://accounts.google.com/o/oauth2/auth",
        tokenURL: "https://accounts.google.com/o/oauth2/token",
        userInfoURL: "https://www.googleapis.com/oauth2/v1/userinfo",
        clientID: "", //ENTER YOUR ENVIROMENT
        clientSecret: "", //ENTER YOUR ENVIROMENT
        callbackURL: "", //ENTER YOUR ENVIROMENT
        scope: ["https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile" ]
        },
        function(accessToken, refreshToken, profile, done){
         process.nextTick(function(){
         done(null ,profile);
         console.log("PROFILEID:",profile._json.id);
         console.log("PROFILENAME:",profile._json.name);
	 console.log("PROFILEEMAIL:",profile._json.email);
	 var selectSql = 'SELECT * FROM member_list WHERE sub = ?;';
 	var getQuery = config.connection.query(selectSql,[profile._json.id]);
	 var insertFlg = 1;

	 getQuery
	  .on('error', function(err){
	   console.log('ERR:',err);
	  })
	
	  .on('result',function(rows){
	   console.log("(rows)");
	   insertFlg = 0;
	  })
	
	  .on('end',function(){
	   console.log('GET_END');
	   if (insertFlg =="1"){
	    var insertSql = 'INSERT INTO member_list(sub,name,email) VALUES (?,?,?);';
	    var insertQuery = config.connection.query(insertSql,[profile._json.id,profile._json.name,profile._json.email]);
    	    insertQuery
     .on('error', function(err){
      console.log('ERR:',err);
     })
     .on('result',function(result){
       console.log('RLT:',result);
     })
     .on('end',function(){
      console.log('INSERT_END');
     });
   }else{
    console.log("INSERT_FLG_OFF");
   }
   console.log('DB_END');
  });
        });
 }));

passport.use(new YahooOpenidConnectStrategy({
        authorizationURL: "https://auth.login.yahoo.co.jp/yconnect/v1/authorization",
        tokenURL: "https://auth.login.yahoo.co.jp/yconnect/v1/token",
        userInfoURL: "https://userinfo.yahooapis.jp/yconnect/v1/attribute",
        clientID: "", //ENTER YOUR ENVIROMENT
        clientSecret: "", //ENTER YOUR ENVIROMENT
        callbackURL: "", //ENTER YOUR ENVIROMENT
        scope: ["profile email"]
        },
        function(accessToken, refreshToken, profile, done){
         process.nextTick(function(){
         done(null ,profile);
         console.log("PROFILE",profile);
         console.log("PROFILEID:",profile._json.id);
         console.log("PROFILENAME:",profile._json.name);
         console.log("PROFILEEMAIL:",profile._json.email);
         var selectSql = 'SELECT * FROM member_list WHERE sub = ?;';
        var getQuery = config.connection.query(selectSql,[profile._json.id]);
         var insertFlg = 1;

         getQuery
          .on('error', function(err){
           console.log('ERR:',err);
          })

          .on('result',function(rows){
           console.log("(rows)");
           insertFlg = 0;
          })

          .on('end',function(){
           console.log('GET_END');
           if (insertFlg =="1"){
            var insertSql = 'INSERT INTO member_list(sub,name,email) VALUES (?,?,?);';
            var insertQuery = config.connection.query(insertSql,[profile._json.user_id,profile._json.name,profile._json.email]);
            insertQuery
     .on('error', function(err){
      console.log('ERR:',err);
     })
     .on('result',function(result){
       console.log('RLT:',result);
     })
     .on('end',function(){
      console.log('INSERT_END');
     });
   }else{
    console.log("INSERT_FLG_OFF");
   }
   console.log('DB_END');
  });
        });
 }));


//OIDC　ユーザ情報を格納するpassportのシリアライズとデシリアライズ
passport.serializeUser(function(user, done){
done(null, user);
});
 
passport.deserializeUser(function(obj, done){
done(null, obj);
});

module.exports = app;
