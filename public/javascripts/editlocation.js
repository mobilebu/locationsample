//初期表示

// google.maps.Geocoder()コンストラクタのインスタンスを生成
var geocoder = new google.maps.Geocoder();

//地図を表示する緯度経度を指定する
var latlng = new google.maps.LatLng(35.685001,139.751404);

// 地図表示に関するオプション
var mapOptions = {
	zoom: 15,
        center:latlng,
	mapTypeId: google.maps.MapTypeId.ROADMAP,
};
// 地図を表示させるインスタンスを生成
var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

var getMap = (function() {

  function codeAddress(address) {

    // google.maps.Geocoder()コンストラクタのインスタンスを生成
    var geocoder = new google.maps.Geocoder();

    // 地図表示に関するオプション
    var mapOptions = {
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
    };

    // 地図を表示させるインスタンスを生成
    var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

    // geocoder.geocode()メソッドを実行 
    geocoder.geocode( { 'address': address}, function(results, status) {

      // ジオコーディングが成功した場合
      if (status == google.maps.GeocoderStatus.OK) {

        // google.maps.Map()コンストラクタに定義されているsetCenter()メソッドで
        // 変換した緯度・経度情報を地図の中心に表示
        map.setCenter(results[0].geometry.location);

        // 地図上に目印となるマーカーを設定います。
        // google.maps.Marker()コンストラクタにマーカーを設置するMapオブジェクトと
        // 変換した緯度・経度情報を渡してインスタンスを生成
        // →マーカー詳細
        var marker = new google.maps.Marker({
          map: map,
          position: results[0].geometry.location
        });

      // ジオコーディングが成功しなかった場合
      } else {
        console.log('Geocode was not successful for the following reason: ' + status);
      }
    
    });

  }

  return {

    getAddress: function() {
     
      // ボタンに指定したid要素を取得
      var button = document.getElementById("button");

      // ボタンが押された時の処理
      button.onclick = function() {

        // フォームに入力された住所情報を取得
        var address = document.getElementById("address").value;
        // 取得した住所を引数に指定してcodeAddress()関数を実行
        codeAddress(address);

      }
      
    }

  };

})();
getMap.getAddress();
