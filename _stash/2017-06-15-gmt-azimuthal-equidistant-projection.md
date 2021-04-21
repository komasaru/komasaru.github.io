---
layout   : single
title: 'GIS - GMT で正距方位図法！'
published: true
date     : 2017-06-15 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- GIS
- GMT
- 地図
---

[GMT](http://gmt.soest.hawaii.edu/projects/gmt "GMT - The Generic Mapping Tools")(The Generic Mapping Tools) で、正距方位図法(Azimuthal Equidistant Projection)で描画する方法についての記録です。（「正距方位図法」は、中心からの距離と方位が正しく表され、地球全体を描画した場合は真円となる投影法です）

<!--more-->

### 0. 前提条件

* LMDE2 (Linux Mint Debian Edition 2; 64bit) での作業を想定。
* GMT 5.1.1 での作業を想定。

### 1. bash スクリプトの作成

以下、2種類の地図を描画するスクリプト。（説明は後述）

1. 指定した中心地点から90度の範囲を全て描画。
2. 描画範囲を指定して描画。

File: `gmt_aep.sh`

{% highlight bash linenos %}
#! /bin/bash
#
FNAME_1="imgs/JAPAN_AEP_1.ps"
FNAME_2="imgs/JAPAN_AEP_2.ps"
DPI=100
LAT=35.468056
LON=133.048611
TITLE="Azimuthal Equidistant Projection"

# GMT 設定
gmtset PS_MEDIA = Custom_20cx22c

# 正距方位図法-1
pscoast -P -JE$LON/$LAT/18 -R-180/180/-90/90 -Dl -Wthinnest,black -Gwheat -S200/255/255 -Bg10:."$TITLE": -X1 -Y1 -K > $FNAME_1
echo $LON $LAT | psxy -JE -R -S+18c -Wthin,red -O >> $FNAME_1
ps2raster $FNAME_1 -Tg -Qt -Qg -E$DPI

# 正距方位図法-2
pscoast -P -JE$LON/$LAT/17 -R120/20/-90/20r -Dl -Wthinnest,black -Gwheat -S200/255/255 -Bg10a30:."$TITLE": -X1.5 -Y1.5 -K > $FNAME_2
echo $LON $LAT | psxy -JE -R -S+34c -Wthin,red -O >> $FNAME_2
ps2raster $FNAME_2 -Tg -Qt -Qg -E$DPI
{% endhighlight %}

* [Gist - Bash script to draw maps with Azimuthal Equidistant Projection.](https://gist.github.com/komasaru/e755bcadb0da302db38fb188e38927a7 "Gist - Bash script to draw maps with Azimuthal Equidistant Projection.")

以下、説明。

* 各種定数
  + `FNAME_1` 保存ファイル名（正距方位図法-1用）
  + `FNAME_2` 保存ファイル名（正距方位図法-2用）
  + `DPI` 解像度
  + `LAT` 中心地点の緯度（例は松江市役所の緯度）
  + `LON` 中心地点の経度（例は松江市役所の経度）
  + `TITLE` 地図のタイトル※未設定のため、日本語非対応
* `gmtset` GMT 設定
  + `PS_MEDIA = Custom_20cx22c` 用紙サイズを「20cm x 22cm のカスタム設定」に設定
* `pscoast` 海岸線等の描画（正距方位図法-1）
  + `-P` 用紙を「ポートレート」に設定
  + `-JE$LON/$LAT/18c` 地図投影法を「正距方位図法」に設定し、経度、緯度を `$LON`, `$LAT` の値、幅を「18cm」に設定
  + `-R-180/180/-90/90` 描画対象範囲を「西経180度〜東経180度、南緯90度〜北緯90度」に設定
  + `-Dl` 使用する海岸線データを LOW に設定
  + `-Wthinnest,black` 海岸線の太さを「極細」、色を「黒」に設定
  + `-Gwheat` 陸域の色を「小麦色」に設定
  + `-S200/255/255` 海域の色を水色に設定
  + `-Bg10:."$TITLE":` 経／緯線の描画間隔を「10度」、タイトルを $TITLE の値に設定
  + `-X1 -Y1` 左、下からのオフセット値を「1cm」、「1cm」に設定
  + `-K` 更に追記可能となるよう設定（当 `pscoast` コマンドで描画終了なら不要）
  + `> $FNAME_1` 出力ファイルを指定
* `pscoast` 海岸線等の描画（正距方位図法-2）※正距方位図法-1と異なる部分のみ
  + `-R120/20/-90/20r` 描画範囲左下の経度を「東経120度」、緯度を「北緯20度」、右上の経度を「西経90度」、緯度を「北緯20度」に設定
  + `-Bg10a30:."$TITLE":` 経／緯線の描画間隔を「10度」、ラベルの出力間隔を「30度」、タイトルを $TITLE の値に設定
  + `-X1.5 -Y1.5` 左、下からのオフセット値を「1.5cm」、「1.5cm」に設定
* プロットデータの作成
  + `echo $LON $LAT |` 経度、緯度の情報を出力して次のコマンドにパイプ
* `psxy` 線等のプロット
  + `-JE` 地図投影法を「正距方位図法」に設定
  + `-R` 描画対象範囲を設定（値なし）
  + `-S+18c` ＋記号を中心から上下左右「18cm」の大きさで設定
  + `-Wthin,red` 描画記号の太さを「細」に、色を「赤」に設定
  + `-O` 既存ファイル（`-K` で作成された画像ファイル）に追記するよう設定
  + `>> $FNAME_1` 追記する出力ファイルを指定（正距方位図法-2用は `>> $FILE_2`）
* `ps2raster` PS ファイルを別の画像ファイルに変換
  + 第１引数は、変換する PostScript ファイル
  + `-Tg` PNG 形式に変換する設定
  + `-Qt` アンチエイリアスをテキストに対して設定
  + `-Qg` アンチエイリアスをグラフィックスに対して設定
  + `-E$DPI` 解像度を `$DPI` の値に設定

### 2. bash スクリプトの実行

``` text
$ ./gmt_aep.sh
```

### 3. 画像の確認

![JAPAN_AEP_1]({{site.baseurl}}/images/2017/06/15/JAPAN_AEP_1.png "JAPAN_AEP_1")
![JAPAN_AEP_2]({{site.baseurl}}/images/2017/06/15/JAPAN_AEP_2.png "JAPAN_AEP_2")

---

`psxy` コマンドの `-Sc` オプションでは半径を「センチ／インチ／ドット」でしか指定できないため、正距方位図法の中心を円の中心として半径 X km の円を描画しようとする場合は少々考える必要がありそうです。

以上。

