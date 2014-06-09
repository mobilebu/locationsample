var lat = new Array();
var lng = new Array();
var num = document.getElementById( 'num' ).title;

// ■地図初期化し表示
for (var i=0; i<num; i++){
 lat.push(document.getElementById( 'lat' +i ).title);
 lng.push(document.getElementById( 'lng' +i ).title);
}
//■地図を表示する緯度経度を指定する
var latlng = new google.maps.LatLng(lat[0],lng[0]);
var myOptions={

//■ズームレベルの指定0～17
zoom:11,

//■地図の中心を指定（上記で設定の緯度経度laglng)
center:latlng,

//■地図のタイプ設定
//　ROADMAP:デフォルト、SATELLITE:写真タイル、HYBRID:写真タイルと主要な機能、TERRAIN:物理的な起伏を示すタ>イル
mapTypeId: google.maps.MapTypeId.ROADMAP

};//地図プロパティここまで

//■<div id="map_canvas">と結びつけて、その領域に地図を描く
var map=new google.maps.Map(document.getElementById("map_canvas"),myOptions);
//■マーカー
var marker= new Array();
var latlngArray = new Array();
for (var i=0; i<num; i++){
 latlngArray[i] = new google.maps.LatLng(lat[i],lng[i]);
 marker[i] = new google.maps.Marker({
         position: latlngArray[i],
         title: "Position" + i
 });
 marker[i].setMap(map);
}

