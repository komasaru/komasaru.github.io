---
layout   : single
title    : "GIS - Shapefile を GMT フォーマットに変換！"
published: true
date     : 2014-12-15 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- GIS
- 地図
- GMT
---

GMT(The Generic Mapping Tools) という地図等を描画するソフトには日本地図の行政区域データが存在しないので、別途 Shapefile を GMT 用の形式に変換して使用する必要があります。

以下、変換作業についての記録です。

（当方、 GIS についてそれほど精通しているわけでもありません。ご承知おきください）

<!--more-->

### 0. 前提条件

- Linux Mint 17(64bit) で QGIS 2.6.1 を使用して作業することを想定。
- GMT 5.1.1 で動作確認。（導入は「[GMT - 5.1 系をソースからインストール！]({{site.baseurl}}/2014/12/13/gis-newest-gmt-installation-by-src/ "GMT - 5.1 系をソースからインストール！")」参照）
- 使用する Shapefile は[国土数値情報](http://w3land.mlit.go.jp/ksj/index.html "国土数値情報ダウンロードサービス")（行政区域データ）。  
  + ただし、全都道府県分のファイルを１つに結合済みである。（[当ブログ過去記事](http://www.google.co.jp/cse?cx=partner-pub-7320193476057758%3A6328726109&ie=UTF-8&q=GIS&siteurl=www.mk-mode.com%2Foctopress%2F&ref=&ss=5208j8962916j13#gsc.tab=0&gsc.q=GIS&gsc.page=1 "mk-mode BLOG")等を参照）
  + さらに、扱いやすくするために、区市町村単位で地物を融合したり、ジオメトリの簡素化の処理を施している。

### 1. GMT フォーマットへの変換

まず、QGIS で変換元となる Shapefile を開く。（「ベクタレイヤの追加」で）

![SHAPEFILE_CONVERT_GMT_1]({{site.baseurl}}/images/2014/12/15/SHAPEFILE_CONVERT_GMT_1.png "SHAPEFILE_CONVERT_GMT_1")

次に、レイヤ名右クリックで「名前を付けて保存」を選択する。

![SHAPEFILE_CONVERT_GMT_2]({{site.baseurl}}/images/2014/12/15/SHAPEFILE_CONVERT_GMT_2.png "SHAPEFILE_CONVERT_GMT_2")

そして、以下のように設定して保存する。

* 形式：Generic Mapping Tools [GMT]
* 名前を付けて保存：適当なファイル名（拡張子は `txt` 等でも問題ないようだが、慣例的な `gmt` とするのが良いだろう）
* その他はそのまま。

![SHAPEFILE_CONVERT_GMT_3]({{site.baseurl}}/images/2014/12/15/SHAPEFILE_CONVERT_GMT_3.png "SHAPEFILE_CONVERT_GMT_3")

元の Shapefile よりサイズのやや大きい GMT ファイルが作成された。

### 2. GMT ファイルの内容確認

保存された GMT ファイルを確認してみる。  
経度と緯度の羅列であることが分かる。（今回のファイルの場合、行数が 9,815,200 ほど）
（ちなみに、GMT では `>` と `>` で囲まれた部分が１つのポリゴンになる）

![SHAPEFILE_CONVERT_GMT_4]({{site.baseurl}}/images/2014/12/15/SHAPEFILE_CONVERT_GMT_4.png "SHAPEFILE_CONVERT_GMT_4")

### 3. GMT での地図描画

実際に GMT で描画してみる。（出力ファイル名は "JAPAN_CITY.ps" （".ps" は PostScript ファイルの意）とした）

``` text
$ gmtset PS_MEDIA = Custom_18cx20c
$ pscoast -P -JM15c -R126/149/25/46 -Di -Wthinnest,black -Gwheat -S200/255/255 -Bg5a10f5::WSen -X2 -Y1.5 -K > JAPAN_CITY.ps
$ psxy /path/to/gmt_data.gmt -JM15c -R126/149/25/46 -L -Wthinnest,black -G153/255/153 -O >> JAPAN_CITY.ps
```

１行目の `gmtset` コマンドでは、各種初期設定を行っている。

* `PAPER_MEDIA` で出力する用紙のサイズを指定。  
  上記の場合は、縦20cm,横18cm ということ。  
  `a4` のようにも指定可能。 eps ファイルを出力したい場合は `a4+` のように `+` を付与する。
* デフォルトに戻すには、 `gmtdefaults -D > .gmtdefaults4` とする。

２行目の `pscoast` コマンドでは、大陸の描画を行っている。（GMT の持っている地図データ使用）

* `-P` は、ポートレート（縦長）に指定するオプション。
* `-J` は、地図の種類と大きさを指定するオプションで、 `-JM15c` はメルカトル図法で15cm四方の図。  
  １度単位でサイズを指定したい場合は、 `-Jm1c` のように小文字の `m` を使用する。  
  縦横異なる比率で指定したい場合は、 `-Jm2cx1.8c` 等のように指定する。
* `-R` は、描画領域を指定するオプションで、 `-R西端/東端/南端/北端` で指定。
* `-D` は、地図データの分解能を指定するオプションで、 `-Di` は中程度の分解能。
* `-W` は、海岸線を描画するオプションで、 `-Wthinnest,black` は極細(0.25p)の黒線。（様々な指定方法あり）
* `-G` は、陸域の塗りつぶし色を指定するオプションで、 `-Gwheat` は小麦色。
* `-S` は、海域の塗りつぶし色を指定するオプションで、 `-S200/255/255` は白色がやや青みがかった色。
* `-B` は、枠線を描画するオプションで、 `g5` は5度間隔で経緯度線、 `a10` は10度間隔でラベル、 `f5` は5度間隔で枠線塗り分け、`WSen` は西側・南側のみティックマークを表示。
* `-X` は、x 軸方向へ移動（単位:cm）するオプションで、 `-X2` は縦軸の目盛の値のために 2cm 移動。
* `-Y` は、y 軸方向へ移動（単位:cm）するオプションで、 `-Y1.5` は横軸の目盛の値のために 1.5cm 移動。
* `-K` は、このコマンドにより作成された PostScript 画像に、あとで追加で描画するためのオプション。
* `>` は、Linux のリダイレクションで、指定したファイルに出力する。

３行目の `psxy` コマンドでは、日本地図（行政区域データ）の描画を行っている。

* `-J` は、地図の種類と大きさを指定するオプションで、 `-JM15c` はメルカトル図法で15cm四方の図。  
  １度単位でサイズを指定したい場合は、 `-Jm1c` のように小文字の `m` を使用する。  
  縦横異なる比率で指定したい場合は、 `-Jm2cx1.8c` 等のように指定する。
* `-R` は、描画領域を指定するオプションで、 `-R西端/東端/南端/北端` で指定。
* `-L` は、多角形を明示的に閉じるオプション。
* `-M` は、入力データが複数セグメントをもつ場合のオプション。
* `-W` は、線分やシンボル外形の線種を指定するオプションで、 `-Wthinnest,black` は極細(0.25p)の黒線。（様々な指定方法あり）
* `-G` は、塗りつぶしのオプションで、 `-G153/255/153` は RGB の薄い緑色。（グレースケールでの指定も可）
* `-O` は、既存の PostScript 画像に、追加で描画するためのオプション。
* `>>` は、Linux のリダイレクション（追記用）で、指定したファイルに追加出力する。

大陸部分が不要なら `pscoast` コマンドをスキップし、 `psxy` コマンドの `-O` オプションを除去後 `>` でリダイレクションすればよい。

その他、各種オプションについては `[pscoast|psxy] --help` で確認可。

### 4. 描画された地図の確認

作成されたファイル "JAPAN_CITY.ps" を開いてみると、綺麗に地図が描画されているはずである。（以下は Web 公開の都合上 JPEG ファイルに変換した画像）

![JAPAN_CITY]({{site.baseurl}}/images/2014/12/15/JAPAN_CITY.jpg "JAPAN_CITY")

（地図データ出典：国土交通省・国土数値情報（行政区域データ））

### 5. その他

地図は描画されたが、 `psxy` コマンド実行時に以下のようなエラーメッセージが出力された。  
言わんとすることは分かるが、対処方法が（今のところ）見つからない。  
地図の見た目に問題は見受けられないので、現時点では「保留」扱いとしておく。

``` text
psxy: Bad OGR/GMT: Cannot have @<92> after FEATURE_DATA
psxy: Bad OGR/GMT: @D record has more items than declared by @N
```

* `FEATURE_DATA` の後に `@\` は置けない？
  - そんなデータはないのに。
* `@D` レコードの項目が `@N` で宣言された項目数より多い？
  - そんなレコードはないのに。

### 参考サイト

1. [Wiki - GMT - GMT - The Generic Mapping Tools](http://gmt.soest.hawaii.edu/ "Wiki - GMT - GMT - The Generic Mapping Tools")
2. [GMTなど/行政界データ - OKUBO S. Personal Page](http://taratara.symphonic-net.com/okubos/index.php?GMT%E3%81%AA%E3%81%A9%2F%E8%A1%8C%E6%94%BF%E7%95%8C%E3%83%87%E3%83%BC%E3%82%BF "GMTなど/行政界データ - OKUBO S. Personal Page")

---

統計解析向けプログラミン言語 R で maptools ライブラリを使用して地図を描画する場合とはまた異なった感覚が必要ですが、 GMT も使い慣れると面白そうです。

以上。

