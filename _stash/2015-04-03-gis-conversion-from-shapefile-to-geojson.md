---
layout   : single
title    : "GIS - Shapefile を GeoJSON に変換！"
published: true
date     : 2015-04-03 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- GIS
- 地図
---
こんにちは。

地理情報データの業界標準である Shapefile を GeoJSON 形式に変換する方法についての記録です。

<!--more-->

### 0. 前提条件

* Linux Mint 17.1(64bit) での作業を想定。
* 今回、Shapefile は国土交通省・国土数値情報を使用する。（参照「[QGIS(Quantum GIS) - 国土交通省・国土数値情報からの地図表示！]({{site.baseurl}}/2014/07/26/qgis-display-mlit-ksj/ "QGIS - 国土交通省・国土数値情報からの地図表示！")」）
* ポリゴン（地物）を都道府県単位で融合済み。（参照「[QGIS(QuantumGIS) - 国土数値情報・ポリゴンの融合！]({{site.baseurl}}/2014/07/28/qgis-fusion-of-polygons/ "QGIS - 国土数値情報・ポリゴンの融合！")」）
* 全都道府県分の Shapefile を１つ（ファイル名： "japan.shp"）に統合済み。（参照「[GDAL/OGR - 国土数値情報の複数 Shapefile を結合！]({{site.baseurl}}/2014/07/30/gdal-ogr-merge-shapefiles/ "GDAL/OGR - 国土数値情報の複数 Shapefile を結合！")」）
* 変換には GDAL/OGR ライブラリの `ogr2ogr` コマンドを使用する。（インストール済みであること。 QGIS がインストールされていればインストールされている）
  （使用する `ogr2ogr` のバージョンは "1.11.1" を想定）
* 元々国土交通省・国土数値情報には以下の属性情報が含まれていたが、
  - `N03_001` ... 都道府県名
  - `N03_002` ... 支庁・振興局名
  - `N03_003` ... 郡・政令市名
  - `N03_004` ... 市区町村名
  - `N03_007` ... 行政区域コード  
* 今回、都道府県単位で地物融合した際に以下の属性に変更している。
  - `PREF_CODE` ... 都道府県コード
  - `PREF_NAME` ... 都道府県名

### 1. GeoJSON について

GeoJSON を簡単に説明すると以下のとおり。

* JSON(JavaScript Object Notation) を用いて様々な空間データ（地理情報）構造をエンコードするためのフォーマット。
* サポートされている非空間属性は、ポイント（住所や座標）、ライン（道路や境界線）、 ポリゴン（国や地域等）等。

### 2. GeoJSON への変換

GUI ツール QGIS で別名保存時にデータ形式 "GeoJSON" を指定する方法もあるが、今回は以下のように `ogr2ogr` コマンドを使用する。  
（"shp" ファイルの他に "shx" ファイルも必要であることに留意。また、文字エンコードにも注意）

``` text
$ ogr2ogr -lco "ENCODING=UTF-8" -f geoJSON japan.geojson japan.shp
```

78MB ほどあった Shapefile から 175MB ほどの GeoJSON ファイルが生成された。

### 3. GeoJSON ファイルの内容確認

生成された GeoJSON ファイルの内容を確認してみる。（以下は可読性高めるため整形している）

File: `japan.geojson`

{% highlight text linenos %}
{
  "type": "FeatureCollection",

  "features": [
    {
      "type": "Feature",
      "properties": {
        "PREF_CODE": "01",
        "PREF_NAME": "北海道"
      },
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [
          [
            [
              [ 142.222578, 42.422366 ],
              [ 142.222599, 42.422462 ],
                      :
              ===< 途中省略 >===
                      :
            ]
          ]
        ]
      }
    }
            :
    ===< 途中省略 >===
            :
  ]
}
{% endhighlight %}

### 参考サイト

* [GeoJSON](http://geojson.org/ "GeoJSON")

---

実は GeoJSON データより TopoJSON データを使用したい事案があり、今回はその準備作業でした。

以上。

