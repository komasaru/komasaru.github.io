---
layout   : single
title    : "Google Maps JavaScript API V3 ＋ ２点間距離計算！"
published: true
date     : 2013-07-12 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Google
- JavaScript
---

ホームページ上で "Google Maps API V3" を使って動くアプリを作成してみました。

任意の２点の緯度・経度から距離を計算するアプリです。  
２点の緯度・経度は直接入力する他、Google マップ上に配置したマーカーからも取得できるようにしました。  
（緯度・経度を直接入力した場合は、地図上のマーカーも追随するようにしています）

以下、作業記録です。

<!--more-->

#### 0. 前提条件

- Google Maps API の API キーを取得済みであること。  
  （過去記事参照 -> 「[Google Maps JavaScript API V3 - APIキー取得！]({{site.baseurl}}/2013/07/10/google-get-api-key "Google Maps JavaScript API V3 - APIキー取得！")」）
- 多少の HTML, JavaScript の知識があること。
- 作成する JavaScript は別ファイル（ファイル名："google_maps.js"）にする。
- フレームワークは考慮しない（単純な HTML）。
- JavaScript の紹介を主に紹介する。

#### 1. HTML ファイル編集

作成したいページの HTML ファイルの `<head>` タグ内等（別にどこでも大丈夫）に以下のようなコードを追加する。

``` html 
<script type="text/javascript"
  src="http://maps.googleapis.com/maps/api/js?key=＜APIキー＞&sensor=false">
</script>
<script type="text/javascript" src="google_maps.js"></script>
```

また、同じ HTML ファイルに２点の緯度・経度入力部分、計算結果表示部分、Google マップ表示部分も追加する。  
人それぞれ書き方があると思うので、ここではこの部分は紹介しない。  
ただ、JavaScript 内で使用する `id` 属性は以下のようにした。

- 位置１・緯度：`lat-1`
- 位置１・経度：`lng-1`
- 位置２・緯度：`lat-2`
- 位置２・経度：`lng-2`
- 計算結果表示：`dist`
- Google Maps 表示： `map`

#### 2. JavaScript ファイル作成

今回は以下のように JavaScript ファイルを作成した。概要は、

- 地図上のマーカーをドラッグ（移動）すると、緯度・経度を取得する。
- 緯度・経度入力欄の値を変更すると、地図上のマーカーも移動する。
- ２点のマーカーを線で結ぶ。
- 位置（緯度・経度）変更時、２点間の距離を計算する。
- 使用する測地系は「GRS80（世界測地系＝日本測地系2000）」をデフォルトにしている。
  「ベッセル楕円体（旧日本測地系）」や「WGS84(GPS)」を使用したければ、コメント解除で有効にする。
- 緯度・経度の入力は「度」単位で行う。
  「度・分・秒」は「度 ＋ 分/60 ＋ 秒/3600」で「度」に変換して入力すること。

File: `google_maps.js`

{% highlight javascript linenos %}
// ページ読み込み完了時に実行する関数
function init() {
  // 初期値位置定数
  const LAT_1 =  35.472222;  // 島根県庁・緯度
  const LNG_1 = 133.050556;  // 島根県庁・経度
  const LAT_2 =  35.468056;  // 松江市役所・緯度
  const LNG_2 = 133.048611;  // 松江市役所・経度

  // 初期位置表示
  document.getElementById('lat-1').value = LAT_1;
  document.getElementById('lng-1').value = LNG_1;
  document.getElementById('lat-2').value = LAT_2;
  document.getElementById('lng-2').value = LNG_2;

  // 初期位置設定
  var lat_lng_1 = new google.maps.LatLng(LAT_1, LNG_1);
  var lat_lng_2 = new google.maps.LatLng(LAT_2, LNG_2);

  // オプション設定
  var opts = {
    zoom: 15,
    center: lat_lng_1,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  // マップ表示
  map = new google.maps.Map(document.getElementById("map"), opts);

  // ドラッグできるマーカーを表示
  marker_1 = new google.maps.Marker({
    position: lat_lng_1,
    title: "位置１",
    draggable: true
  });
  marker_2 = new google.maps.Marker({
    position: lat_lng_2,
    title: "位置２",
    draggable: true
  });
  marker_1.setMap(map);
  marker_2.setMap(map);

  // ２点を結ぶ線を表示
  polyline(lat_lng_1, lat_lng_2);

  // 距離計算
  var d = calc_distance(LAT_1, LNG_1, LAT_2, LNG_2);

  // 計算結果表示
  document.getElementById('dist').innerHTML = d;

  // マーカーのドロップ（ドラッグ終了）時のイベント
  // [位置１]
  google.maps.event.addListener(marker_1, 'dragend', function(ev){
    // 緯度・経度取得
    var lat_1 = ev.latLng.lat();
    var lng_1 = ev.latLng.lng();
    var lat_2 = document.getElementById('lat-2').value;
    var lng_2 = document.getElementById('lng-2').value;
    document.getElementById('lat-1').value = Math.round(lat_1 * 1000000) / 1000000;
    document.getElementById('lng-1').value = Math.round(lng_1 * 1000000) / 1000000;
    // ２点を結ぶ線を表示
    line.setMap(null);
    polyline(
      new google.maps.LatLng(lat_1, lng_1),
      new google.maps.LatLng(lat_2, lng_2)
    );
    // ２点間の距離計算
    var d = calc_distance(lat_1, lng_1, lat_2, lng_2);
    document.getElementById('dist').innerHTML = d;
  });
  // [位置２]
  google.maps.event.addListener(marker_2, 'dragend', function(ev){
    // 緯度・経度取得
    var lat_1 = document.getElementById('lat-1').value;
    var lng_1 = document.getElementById('lng-1').value;
    var lat_2 = ev.latLng.lat();
    var lng_2 = ev.latLng.lng();
    document.getElementById('lat-2').value = Math.round(lat_2 * 1000000) / 1000000;
    document.getElementById('lng-2').value = Math.round(lng_2 * 1000000) / 1000000;
    // ２点を結ぶ線を表示
    line.setMap(null);
    polyline(
      new google.maps.LatLng(lat_1, lng_1),
      new google.maps.LatLng(lat_2, lng_2)
    );
    // ２点間の距離計算
    var d = calc_distance(lat_1, lng_1, lat_2, lng_2);
    document.getElementById('dist').innerHTML = d;
  });
}

// 距離計算関数
function calc_distance(lat_1, lng_1, lat_2, lng_2) {
  // 測地系定数
  // GRS80 ( 世界測地系 ) <- 現在の日本での標準
  const RX = 6378137.000000  // 赤道半径
  const RY = 6356752.314140  // 極半径
  // ベッセル楕円体 ( 旧日本測地系 ) <- 以前の日本での標準
  //const RX = 6377397.155000  // 赤道半径
  //const RY = 6356079.000000  // 極半径
  // WGS84 ( GPS ) <- Google はこの測地系
  //const RX = 6378137.000000  // 赤道半径
  //const RY = 6356752.314245  // 極半径

  // 2点の経度の差を計算 ( ラジアン )
  var a_x = lng_1 * Math.PI / 180 - lng_2 * Math.PI / 180;

  // 2点の緯度の差を計算 ( ラジアン )
  var a_y = lat_1 * Math.PI / 180 - lat_2 * Math.PI / 180;

  // 2点の緯度の平均を計算
  var p = (lat_1 * Math.PI / 180 + lat_2 * Math.PI / 180) / 2;

  // 離心率を計算
  var e = Math.sqrt((RX * RX - RY * RY) / (RX * RX));

  // 子午線・卯酉線曲率半径の分母Wを計算
  var w = Math.sqrt(1 - e * e * Math.sin(p) * Math.sin(p));

  // 子午線曲率半径を計算
  var m = RX * (1 - e * e) / (w * w * w);

  // 卯酉線曲率半径を計算
  var n = RX / w;

  // 距離を計算
  var d  = Math.pow(a_y * m, 2) + Math.pow(a_x * n * Math.cos(p), 2);
  d = Math.round(Math.sqrt(d)) / 1000;

  return d;
}

// マーカー移動
function remark() {
  // 緯度経度取得
  var lat_1 = document.getElementById('lat-1').value;
  var lng_1 = document.getElementById('lng-1').value;
  var lat_2 = document.getElementById('lat-2').value;
  var lng_2 = document.getElementById('lng-2').value;

  // 南西位置・北東位置
  var lat_sw, lng_sw, lat_ne, lng_ne;
  if (lat_1 <= lat_2) {
    lat_sw = lat_1;
    lat_ne = lat_2;
  } else {
    lat_sw = lat_2;
    lat_ne = lat_1;
  }
  if (lng_1 <= lng_2) {
    lng_sw = lng_1;
    lng_ne = lng_2;
  } else {
    lng_sw = lng_2;
    lng_ne = lng_1;
  }

  // 矩形設定
  var ll_sw = new google.maps.LatLng(lat_sw, lng_sw);
  var ll_ne = new google.maps.LatLng(lat_ne, lng_ne);
  var bounds = new google.maps.LatLngBounds(ll_sw, ll_ne);

  // マップ移動表示
  map.fitBounds(bounds);

  // マーカー移動
  marker_1.setPosition(new google.maps.LatLng(lat_1, lng_1));
  marker_2.setPosition(new google.maps.LatLng(lat_2, lng_2));

  // ２点を結ぶ線を表示
  line.setMap(null);
  polyline(
    new google.maps.LatLng(lat_1, lng_1),
    new google.maps.LatLng(lat_2, lng_2)
  );

  // 距離計算
  var d = calc_distance(lat_1, lng_1, lat_2, lng_2);

  // 計算結果表示
  document.getElementById('dist').innerHTML = d;
}

// ２点を結ぶ線を表示
function polyline(lat_lng_1, lat_lng_2) {
  line = new google.maps.Polyline({
    path: [lat_lng_1, lat_lng_2],
    strokeColor: "#00FF00",
    strokeOpacity: .7,
    strokeWeight: 5
  });
  line.setMap(map);
}

// ONLOADイベントにセット
window.onload = init();
{% endhighlight %}

- [Gist - JavaScript file to calc distance between two spots with Google Maps API V3.](https://gist.github.com/komasaru/5924548 "JavaScript file to calc distance between two spots with Google Maps API V3.")

#### 3. 動作確認

実際にブラウザ表示して、動作を確認してみる。  
以下は当方の完成時のもの。

![GOOGLE_MAPS_DIST]({{site.baseurl}}/images/2013/07/12/GOOGLE_MAPS_DIST.png "GOOGLE_MAPS_DIST")

実際のページは「[こちら](http://www.mk-mode.com/rails/distance "mk-mode SITE : ２点距離計算")」で確認できる。（ただし、その後 jQuery に移行しているので、スクリプトの記述内容は若干異なる）

#### 4. その他

日本の国土地理院や多くの各種地図業者等は「世界測地系（日本測地系2000）」を採用しているが、Google マップは "WGS84(GPS) "を採用している。  
今回紹介した JavaScript 内で使用している初期位置の位置情報（緯度・経度）は、国土地理院登録のものである。  
Google の持っている位置情報と、国土地理院等が持っている位置情報が若干異なるので、多少の誤差は感じられるかもしれない。（大きな誤差は無いが）

#### 参考サイト

- [Google Maps入門(Google Maps JavaScript API V3)](http://www.ajaxtower.jp/googlemaps/ "Google Maps入門(Google Maps JavaScript API V3)")
- [逆引きGoogle Maps APIリファレンス ver 3](http://www.openspc2.org/reibun/Google/Maps/API/ver3/ "逆引きGoogle Maps APIリファレンス ver 3")
- [当ブログ過去記事（Ruby - 地球上の2点間の距離をほぼ正確に計算！）](http://www.mk-mode.com/octopress/2011/10/28/28002050/ "Ruby - 地球上の2点間の距離をほぼ正確に計算！")

---

地図を使ったアプリ作成もおもしろいですね。

Google API には色々と用意されているので、時間があれば色々と試してみたいとも考えている次第です。

以上。

