
var wsLocation = new WebSocket('ws://54.178.192.53:3500/');
 wsLocation.onerror = function(e){
 window.alert("サーバに接続できませんでした。");
 }
  
// WebSocketサーバ接続イベント
wsLocation.onopen = function() {
 if (navigator.geolocation) {
  // Geolocationに関する処理を記述
  setInterval("navigator.geolocation.getCurrentPosition(successCallback, errorCallback);" ,10000);
 } else {
  window.alert("本ブラウザではGeolocationが使えません");
 }
}

function successCallback(position) {
var sub = document.getElementById( 'sub' ).title;
  var geoObj = {
         sub : sub,
         lat : position.coords.latitude,
         lng : position.coords.longitude,
         hig : position.coords.altitude
  };
  wsLocation.send(JSON.stringify(geoObj));
	var now = new Date();

	var hour = now.getHours(); // 時
	var min = now.getMinutes(); // 分
	var sec = now.getSeconds(); // 秒

	// 数値が1桁の場合、頭に0を付けて2桁で表示する指定
	if(hour < 10) { hour = "0" + hour; }
	if(min < 10) { min = "0" + min; }
	if(sec < 10) { sec = "0" + sec; }

	// フォーマットを指定（不要な行を削除する）
	var watch = hour + ':' + min + ':' + sec; // パターン1

var item = $('<li/>').append(
    $('<div/>').append($('<small/>').addClass('meta chat-time').append(watch))
);
item.addClass('well well-small')
    .prepend('<button type="button" class="close" data-dismiss="alert">×</button>')
    .append($('<div/>').text(':位置情報を送信しました'));

$('#noticearea').prepend(item).hide().fadeIn(500);
 }

/***** 位置情報が取得できない場合 *****/
function errorCallback(error) {
 var err_msg = "";
 switch(error.code)
   {
                case 1:
                        err_msg = "位置情報の利用が許可されていません";
                        break;
                case 2:
                        err_msg = "デバイスの位置が判定できません";
                        break;
                case 3:
                        err_msg = "タイムアウトしました";
                        break;
    }
  window.alert(err_msg);
}

