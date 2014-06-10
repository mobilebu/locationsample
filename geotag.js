var rule = require('./rule');

// 8888番ポートでクライアントの接続を待ち受ける
var ws = require('websocket.io');
var server = ws.listen(3500, function () {
  console.log('\033[96m Server running at 54.178.192.53:3500 \033[39m');
});

//mysql
var mysql = require('mysql');
var connection = mysql.createConnection({
        host: 'localhost',
        database: 'LOCATION',
        user: 'root',
        password: ''
});

//redis
var redis  = require('redis');
var redisClient = redis.createClient();

//errorハンドラ
server.on('uncaughtException', function (err) {
  console.log(d.getDate() + " " + d.getHours() + ":" + d.getMinutes() + err);
});

server.on('connection', function(socket) {
 socket.on('message', function(data) {
  console.log("DATA:",data);
  var data = JSON.parse(data);
  var geo = {
   lat: data.lat,
   lng: data.lng,
   hig: data.hig
  };
  var d = new Date();
  data.time = d.getFullYear()  + "-" + ( '0' + (d.getMonth() + 1)).slice( -2 ) + "-" + ( '0' + d.getDate() ).slice( -2 ) + " " + ( '0' + d.getHours() ).slice( -2 ) + ":" +( '0' + d.getMinutes() ).slice( -2 ) + ":" +( '0' + d.getSeconds() ).slice( -2 );

  //redisにデータ格納
  redisClient.sadd(data.sub,data.time + ":" + ('00' + d.getMilliseconds()).slice( -3 ) + " | " + JSON.stringify(geo))

  //mysqlにデータ格納
  var updateSql = "UPDATE member_list set location = ?, geo_flag = 1 where sub = ?;"
  var updateQuery = connection.query(updateSql,[JSON.stringify(geo),data.sub]);
  updateQuery
    .on('error', function(err){
   console.log('UPDATE_ERR:',err);
  })
    .on('end',function(){
   console.log('UPDATE_END');
  });

  var selectSql = "select push_item_id from push_item;"
  var getQuery = connection.query(selectSql);
  getQuery
   .on('error', function(err){
   })

   .on('result',function(rows){
   console.log("卍卍卍卍CALL RULE PUSH卍卍卍卍")
   rule.getRulePoint(rows.push_item_id,data.sub);
  });
 });
});
