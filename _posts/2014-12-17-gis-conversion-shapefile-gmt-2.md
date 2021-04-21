---
layout   : single
title    : "GIS - Shapefile を GMT フォーマットに変換（by ogr2ogr コマンド）！"
published: true
date     : 2014-12-17 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- GIS
- 地図
- GMT
---

前回、 QGIS を使って Shapefile を GMT 用ファイルに変換する方法を紹介しました。

今回は `ogr2ogr` コマンドを使って変換する方法についてです。（こちらが楽です）

（当方、 GIS についてそれほど精通しているわけでもありません。ご承知おきください）

<!--more-->

### 0. 前提条件

- Linux Mint 17(64bit) で作業することを想定。
- `ogr2ogr` を使用するには GDAL/OGR ライブラリがインストール済みであること。  
  （QGIS が正常にインストールできてればインストールされてるはず）

### 1. GMT フォーマットへの変換

以下のように、出力フォーマット、出力ファイル名、入力ファイル名を指定して実行するだけ。

``` text
$ ogr2ogr -f "GMT" out_file in_file.shp
```

（出力ファイル名は拡張子を指定しても自動で "gmt" になる）

### 2. 出力ファイルの確認

出力されたファイルの中身を確認してみる。

File: `out_file.gmt`

{% highlight text linenos %}
# @VGMT1.0 @GPOLYGON
# @R122.93366527/153.986892896/24.045616418/45.5568333319                 
# @Jp"+proj=longlat +ellps=GRS80 +no_defs "
# @Jw"GEOGCS[\"JGD2000\",DATUM[\"Japanese_Geodetic_Datum_2000\",SPHEROID[\"GRS_1980\",6378137,298.257222101]],PRIMEM[\"Greenwich\",0],UNIT[\"Degree\",0.017453292519943295]]"
# @NN03_001|N03_002|N03_003|N03_004|N03_007
# @Tstring|string|string|string|string
# FEATURE_DATA
>
# @D静岡県||周智郡|森町|22461
# @P
138.009963 34.975617
138.009822 34.975479
138.009996 34.97488
138.009974 34.973859
138.010245 34.973526

         :
====< 以下省略 >====
         :
{% endhighlight %}

ヘッダ部分の情報が QGIS で変換した場合とは若干異なるようだが、その他は同じように出力されているようだ。（文字コードも適切に扱われているようだ）

### 3. 地図の描画

前回「[GIS - Shapefile を GMT フォーマットに変換！]({{site.baseurl}}/2014/12/15/gis-conversion-shapefile-gmt "GIS - Shapefile を GMT フォーマットに変換！")」で紹介した方法で描画してみて、同様に地図が描画されるはずである。

ちなみに、今回 `ogr2ogr` コマンドで変換した GMT ファイルを使用した場合は、[前回の記事内]({{site.baseurl}}/2014/12/15/gis-conversion-shapefile-gmt "GIS - Shapefile を GMT フォーマットに変換！")で紹介した不具合は発生しなかった。  
QGIS で変換した際に出力されるヘッダ情報に何かしらの影響を及ぼすものがあるのかも知れません。（詳細は不明）

---

今後 Shapefile を GMT 用に変換する際は、 QGIS を使用せず `ogr2ogr` コマンドを使用することとします。

以上。

