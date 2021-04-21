---
layout   : single
title    : "GIS - GMT で標高データを描画！"
published: true
date     : 2015-01-06 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- GIS
- 地図
- GMT
---

こんにちは。

今回は、GMT(The Generic Mapping Tools) で地図に標高データを反映させる方法についての記録です。

（当方、 GIS についてはそれほど精通している訳でもありません。ご承知おきください）

<!--more-->

### 0. 前提条件

* Linux Mint 17.1(64bit) での作業を想定。
* GMT 5.1.1 での作業を想定。
* 日本と周辺の陸地・海底を標高・水深で色分けする。

### 1. 標高データの準備

NOAA（アメリカ海洋大気庁）が "[ETOPO1 Global Relief - ngdc.noaa.gov](http://www.ngdc.noaa.gov/mgg/global/global.html "ETOPO1 Global Relief - ngdc.noaa.gov")" で公開している陸地・海底地形データ "ETOPO1_Bed_g_gmt4.grd.gz"（約400MB）をダウンロードする。（Bedrock でなく、南極大陸やグリーンランドの氷の厚みも考慮した Ice Surface のデータでも違いはないだろう）  
（ちなみに、 "ETOPO1" は緯度・経度が１分間隔の地形データのこと）

ダウンロード後、展開しておく。（約930MBほどになる）

### 2. シェルスクリプトの作成

複数の一連作業を一括で行いたいので、以下のような Bash スクリプトを作成。

File: `JAPAN_ETOPO1.sh`

{% highlight bash linenos %}
#! /bin/bash

# 各種定数
GRD_SRC="ETOPO1_Bed_g_gmt4.grd"
F_NAME="JAPAN_ETOPO1"
RANGE=126/149/25/46
SIZE=12c

# 用紙サイズ
gmtset PS_MEDIA = Custom_18cx20c

# 範囲抽出
grdcut $GRD_SRC -R${RANGE} -G${F_NAME}.grd

# 配色設定
makecpt -Crelief -T-8000/8000/100 -Z > ${F_NAME}.cpt

# 図描画
grdimage ${F_NAME}.grd -R${RANGE} -JM${SIZE} -C${F_NAME}.cpt -E100 -P -K > ${F_NAME}.ps

# 等高線描画（不要ならコメントアウト）
grdcontour ${F_NAME}.grd -JM${SIZE} -C1000 -W0.1,128/128/128 -L-8000/8000 -A1000tf8 -O -K >> ${F_NAME}.ps

# 海岸線描画（陸域に標高データが不要ならコメント解除）
#pscoast -R${RANGE} -JM${SIZE} -Df -Wthinnest,gray -Gwheat -Lf128/45/35/200k -O -K >> ${F_NAME}.ps
# 海岸線描画（海域に深度データが不要ならコメント解除）
#pscoast -R${RANGE} -JM${SIZE} -Df -Wthinnest,gray -S240/255/255 -Lf128/45/35/100k -O -K >> ${D_IMG}/${F_NAME}.ps

# 縦軸・横軸描画
psbasemap -R${RANGE} -JM${SIZE} -Ba5f5WSne -O -K >> ${F_NAME}.ps

# 凡例描画
psscale -Ba4000g2000f1000 -C${F_NAME}.cpt -D6c/-1c/6c/0.5ch -O >> ${F_NAME}.ps
{% endhighlight %}

* [Gist - Bash script to paint a map with elevation data.](https://gist.github.com/komasaru/02b4bf225e8834653f1f "Gist - Bash script to paint a map with elevation data.")

以下、各コマンド・オプション等の説明。

* 各種定数
  - `GRD_SRC` 元となる標高データ(grdファイル)を指定
  - `F_NAME` 出力ファイル名を指定（grd, cpt, ps に共通で使用）
  - `RANGE` 描画したい地図の範囲を指定（`西端経度/東端経度/南端緯度/北端緯度` の書式で指定）
  - `SIZE` 描画したい地図の横幅を指定（単位：cm）
* `gmtset` 出力用紙のサイズを指定
  - `PS_MEDIA = Custom_18cx20c` 用紙サイズを「18cm x 20cm のカスタム設定」に設定
* `grdcut` 標高データの必要な部分のみ抽出
  - 第１引数に元となる grd データファイルを指定
  - `-R${RANGE}` 抽出範囲を設定
  - `-G${F_NAME}.grd` 出力ファイル名を指定
* `makecpt` カラーパレットを指定
  - `-Crelief` カラーパレットを "relief" 設定
  - `-T-8000/8000/100` 深さ8,000m〜標高8,000mに100m単位で配色に設定
  - `-Z` 連続的になるよう設定
  - `> ${F_NAME}.cpt` 出力するカラーパレットファイルを指定
    （カラーパレット一覧は "[GMT: Standard Colour Palettes for Relief Maps](http://www.geos.ed.ac.uk/it/howto/GMT/CPT/palettes.html "GMT: Standard Colour Palettes for Relief Maps")" で確認可能）
* `grdimage` 実際に図を描画
  - 第１引数に grd データファイルを指定
  - `-R${RANGE}` 描画範囲を設定
  - `-JM${SIZE}` 「メルカトル図法」で指定幅に設定
  - `-C${F_NAME}.cpt` カラーパレットファイルを指定
  - `-E100` 解像度を 100dpi に設定
  - `-P` 用紙をポートレートに設定
  - `-K` 追加可能に設定
  - `> ${F_NAME}.ps` 出力ファイルを指定
* `grdcontour` 等高線・等深度線を描画
  - 第１引数に grd データファイルを指定
  - `-JM${SIZE}` 「メルカトル図法」で指定幅に設定
  - `-C1000` 等高線間隔を 1,000m に設定
  - `-Wthinnest,128/128/128` 投稿線の太さを「極細」、色をグレー(`gray` よりやや濃い目の色)に設定
  - `-L-8000/8000` 等高線の下限・上限を -8,000m、 8,000m に設定
  - `-A1000tf8` アノテーション（標高の数値）を 1,000m 間隔で透過に、フォントサイズ 8 に設定
  - `-O` 既存ファイルに追記するよう設定
  - `-K` 更に追記可能となるよう設定
  - `>> ${F_NAME}.ps` 追記する出力ファイルを指定
* `pscoast` 海岸線を描画（陸域の標高データ、海域の深度データが不要の場合に実行）
  - `-R${RANGE}` 描画範囲を設定
  - `-JM${SIZE}` 「メルカトル図法」で指定幅に設定
  - `-Df` 使用する海岸線データを「フル解像度」に設定
  - `-Wthinnest,gray` 海岸線の太さを「極細」、色をグレー(`128/128/128` よりやや薄目の色)に設定
  - `-Gwheat` 陸域の色を「小麦色」に設定
  - `-S240/255/255` 海域の色を淡い色に設定
  - `-Lf128/45/45/200k` 東経128度・北緯45度の位置に北緯35度の位置の 100km スケールを描画
  - `-O` 既存ファイルに追記するよう設定
  - `-K` 更に追記可能となるよう設定
  - `>> ${F_NAME}.ps` 追記する出力ファイルを指定
* `psbasemap` 縦軸・横軸を描画
  - `-R${RANGE}` 描画範囲を設定
  - `-JM${SIZE}` 「メルカトル図法」で指定幅に設定
  - `-Ba5f5WSne` 5度間隔でラベル出力、5度間隔で軸塗り分け、ラベルを出力を西(W)側と南(S)側に設定
  - `-O` 既存ファイルに追記するよう設定
  - `-K` 更に追記可能となるよう設定
  - `>> ${F_NAME}.ps` 追記する出力ファイルを指定
* `psscale` で凡例を描画
  - `-Ba4000g2000f1000` 4,000m 間隔でラベル出力、2,000m 間隔で凡例に区切り線、1,000m 間隔で目盛りを設定
  - `-C${F_NAME}.cpt` 使用するカラーパレットファイルを指定
  - `-D6c/-1c/6c/0.5ch` 中心位置が図の左端から 6cm, 下端から -1cm, 長さが 6cm, 幅が 0.5cm のスケールバーを水平に描画する設定
  - `-O` 既存ファイルに追記するよう設定
  - `>> ${F_NAME}.ps` 追記する出力ファイルを指定

【注】更に追加で描画する必要がある場合に `-K` オプションを、既存のファイルに追加で描画する場合に `-O` オプションを指定する必要がある。

### 3. シェルスクリプトの実行

``` text
$ ./JAPAN_ETOPO1.sh
```

### 4. 画像確認

以下のような画像が描画されるはずである。（以下の画像は、公開の都合上 PS ファイルのハードコピーを撮った PNG 画像）

![JAPAN_ETOPO1_1]({{site.baseurl}}/images/2015/01/06/JAPAN_ETOPO1_1.png "JAPAN_ETOPO1_1")

等高線・等深度線を除外してスッキリさせれば以下のようになる。

![JAPAN_ETOPO1_2]({{site.baseurl}}/images/2015/01/06/JAPAN_ETOPO1_2.png "JAPAN_ETOPO1_2")

### 5. 参考サイト

* [Man pages - GMT 5.1.1 documentation](http://gmt.soest.hawaii.edu/doc/5.1.1/index.html "Man pages - GMT 5.1.1 documentation")

---

今回のようにある程度描画方法を確立させておけば、今後色々と容易に応用できそうです。

以上。

