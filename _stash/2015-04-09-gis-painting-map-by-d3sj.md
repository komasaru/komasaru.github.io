---
layout   : single
title    : "GIS - D3.js で地図描画！"
published: true
date     : 2015-04-09 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- GIS
- 地図
---
こんにちは。

Web ページ上に画像を使用せずに JavaScript で地図を描画する方法につての記録です。

使用するツールは [D3.js - Data-Driven Documents](http://d3js.org/ "D3.js - Data-Driven Documents") という Web ブラウザ上で動的にコンテンツを描画するための JavaScript ライブラリです。

<!--more-->

### 0. 前提条件

* 地図データは国土交通省・国土数値情報を使用する。
* Shapefile を TopoJSON 形式に変換済みであること。（過去記事参照）  
  - [GIS - Shapefile を GeoJSON に変換！]({{site.baseurl}}/2015/04/03/gis-conversion-from-shapefile-to-geojson "GIS - Shapefile を GeoJSON に変換！")
  - [GIS - GeoJSON を TopoJSON に変換！]({{site.baseurl}}/2015/04/06/gis-conversion-from-geojson-to-topojson "GIS - GeoJSON を TopoJSON に変換！")
* 以下はベタな HTML & JavaScript による基本的な作成例。（当方、実際は Ruby on Rails に実装している）

### 1. 地図表示用ページの HTML 作成

File: `d3_map.html`

{% highlight html linenos %}
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="utf-8">
    <title>日本地図（都道府県別） - D3.js</title>
    <script src="http://d3js.org/d3.v3.min.js"></script>
    <script src="http://d3js.org/topojson.v0.min.js"></script>
  </head>
  <body>
    <h1>D3.js による日本地図（都道府県別）</h1>
    <div id="map"></div>
    <script src="d3_map.js"></script>
  </body>
</html>
{% endhighlight %}

`http://d3js.org/d3.v3.min.js`, `http://d3js.org/topojson.v0.min.js` の部分は、ダウンロードした JS ファイルを指定してもよい。  
また、`d3_map.js` の部分は、別ファイルを読み込む形でなく直接ここにスクリプトを記載してもよい。

### 2. 地図表示用 JavaScript ファイルの作成

File: `d3_map.js`

{% highlight js linenos %}
// SVG サイズ設定
var width = 800, height = 800;

// SVG 要素追加
var svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height);

// JSON データ読み込み
d3.json("japan.topojson", function(json) {
    var japan = topojson.object(json, json.objects.japan).geometries;

    // 投影法設定
    var projection = d3.geo.mercator()
        .center([138, 34])
        .scale(1200)
        .translate([width / 2, height / 2]);

    // 緯度・経度 => パス変換
    var path = d3.geo.path()
        .projection(projection);

    // 地図描画
    svg.selectAll("path")
{% endhighlight %}

### 3. 確認

HTTP サーバを起動して確認してみる。  
以下は、当方 Ruby on Rails 製ページに実装したもの。（ファイルの置き場所を Rails のディレクトリ構成に合わせたり、View テンプレート内での JS ファイル取り込みに `javascript_include_tag` を使用したり、 "config/initializer/assets.rb" に追記したり、と）

* [mk-mode SITE: 日本地図 (by D3.js)](http://www.mk-mode.com/rails/d3_map "mk-mode SITE: 日本地図 （by D3.js）")  
  （テスト用ページのため、予告なく削除する（リンク切れになる）かもしれない）

### 参考サイト

* [D3.js - Data-Driven Documents](http://d3js.org/ "D3.js - Data-Driven Documents")
* [D3.js と TopoJSON で地図を作る](http://ja.d3js.node.ws/blocks/mike/map/ "D3.js と TopoJSON で地図を作る")

---

PNG や JPEG 等の画像を使用しないので軽いです。

D3.js についてもう少し勉強して、いずれはもっと凝ったものを作ってみたいです。

以上。

