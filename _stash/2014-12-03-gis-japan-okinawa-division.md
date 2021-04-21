---
layout   : single
title    : "R - maptools で沖縄を左上に移動した地図！"
published: true
date     : 2014-12-03 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- R
- GIS
- 地図
---

統計解析向けプログラミング言語 R で maptools ライブラリを使って日本地図を描画する際、沖縄地方を図の左上に移動すると地図が多くなって若干見やすくなります。

その方法についての記録です。

<!--more-->

### 0. 前提条件

* Linux Mint 17 (64bit) での作業を想定。
* R 3.1.2 での作業を想定。
* 使用する地図データは、国土交通省「[国土数値情報](http://w3land.mlit.go.jp/ksj/index.html "国土数値情報 ダウンロードサービス")（行政区域データ）」を想定。  
  更に、使いやすいよう今回は以下ような前処理を施している。（フリーでオープンソースの地理情報システム QGIS にて）
  - 全都道府県データ（Shapefile）を１つのデータに結合している。
  - 面積の小さい地物（ポリゴン）は除去している。
  - 区市町村コード単位で１つの地物（ポリゴン）に融合している。
  - 区市町村コードでユニークにしたいので、区市町村が未割り当ての地物は除去している。
  - 元のデータでは精度が高いため、ファイルサイズが大きかったり、海岸線等で線が重なりあって太線に見えてしまう。それを解消するために適度な「ジオメトリの簡素化」処理をしている。
  また、区市町村コードは `N03_007` という名称のカラムに５桁（先頭２桁は都道府県コード）で格納されていることを認識しておく。

### 1. R ソーススクリプト（標準 Ver.）作成

まず、沖縄地方を分割しない標準的な地図を描画する R ソースコードを作成。（説明はソースコード中のコメントを参照）

File: `japan_standard.R`

{% highlight text linenos %}
# ----------------------------------------
# R scirpt to draw a map of Japan. (Standard Ver.)
# ----------------------------------------
# ライブラリの読み込み
library(gpclib)
library(ggplot2)
library(maptools)

# ----------------------------------------
print("**** 各種設定")
# グラフタイトル
TITLE    <- "日本地図（標準 Ver.）"
# コピーライト文字列
STR_COPY <- paste(
  "（地図出典：国土交通省 - 国土数値情報（行政区域データ））",
  "© 2014 mk-mode.com",
  sep = "\n"
)
# Shapefile のフルパス
FILE_SHP <- "/path/to/japan_all.shp"
# 保存ファイル
FILE_SAV <- "japan_standard.png"

# ----------------------------------------
print("**** Shapefile の読み込み")
shp <- readShapePoly(FILE_SHP, IDvar = "N03_007")

# ----------------------------------------
print("**** データフレーム形式に変換")
df <- fortify(shp)

# ----------------------------------------
print("**** 日本地図描画")
g <- ggplot()                             # オブジェクト生成
g <- g + ggtitle(TITLE)                   # グラフタイトル
g <- g + geom_polygon(
  data = df,
  aes(long, lat, group = group),
  colour = "gray20", fill = "darkolivegreen3", size = 0.05
)                                         # 地図描画
g <- g + xlim(124, 150) + ylim(24, 46)
g <- g + labs(
  x = STR_COPY, y = ""
)
g <- g + coord_equal()                    # メモリ刻み等間隔
g <- g + theme(legend.position = "none")  # 凡例位置
g <- g + theme(
  panel.background = element_rect(
    colour = "black", fill = "lightsteelblue",
    size = 0.2 , linetype = 1
  )
)                                         # グラフ枠・背景

# ----------------------------------------
print("**** 画像保存")
ggsave(
  file = FILE_SAV,
  dpi = 100, width = 8, height = 8,
  g
)
{% endhighlight %}

* [Gist - R scirpt to draw a map of Japan. (Standard Ver.)](https://gist.github.com/komasaru/e8deebb95ccced8aaf99 "Gist - R scirpt to draw a map of Japan. \(Standard Ver.)")

### 2. R ソーススクリプト（沖縄分割 Ver.）作成

次に、沖縄地方を分割して図の左上（日本海北西側）に移動した地図を描画する R ソースコードを作成。（説明はソースコード中のコメントを参照）

File: `japan_okinawa.R`

{% highlight text linenos %}
# ----------------------------------------
# R scirpt to draw a map of Japan. (Okianwa Division Ver.)
# ----------------------------------------
# ライブラリの読み込み
library(gpclib)
library(ggplot2)
library(maptools)

# ----------------------------------------
print("**** 各種設定")
# グラフタイトル
TITLE    <- "日本地図（沖縄移動 Ver.）"
# コピーライト文字列
STR_COPY <- paste(
  "（地図出典：国土交通省 - 国土数値情報（行政区域データ））",
  "© 2014 mk-mode.com",
  sep = "\n"
)
# Shapefile のフルパス
FILE_SHP <- "/path/to/japan_all.shp"
# 保存ファイル
FILE_SAV <- "japan_okinawa.png"

# ----------------------------------------
print("**** Shapefile の読み込み")
shp <- readShapePoly(FILE_SHP, IDvar = "N03_007")
shp.hon <- subset(shp, substring(shp$N03_007, 1, 2) != "47")  # 本土分抽出
shp.oki <- subset(shp, substring(shp$N03_007, 1, 2) == "47")  # 沖縄分抽出

# ----------------------------------------
print("**** データフレーム形式に変換")
df.hon <- fortify(shp.hon)                      # 本土分
df.oki <- fortify(shp.oki)                      # 沖縄分
df.oki$long <- df.oki$long + 6                  # 東へ   6度移動
df.oki$lat  <- df.oki$lat  + 17.5               # 北へ17.5度移動

# ----------------------------------------
print("**** 境界線")
border <- data.frame(
  xx <- c(129, 132.5, 137.5, 137.5),
  yy <- c( 40, 40, 42.5, 45)
)                                               # 境界線

# ----------------------------------------
print("**** 日本地図描画")
g <- ggplot()                                   # オブジェクト生成
g <- g + ggtitle(TITLE)                         # グラフタイトル
g <- g + geom_polygon(
  data = df.hon,
  aes(long, lat, group = group),
  colour = "gray20", fill = "darkolivegreen3", size = 0.05
)                                               # 本土描画
g <- g + geom_polygon(
  data = df.oki,
  aes(long, lat, group = group),
  colour = "gray20", fill = "darkolivegreen3", size = 0.05
)                                               # 沖縄描画
g <- g + geom_path(
  data = border, aes(xx, yy),
  colour = "gray40", size = 0.5
)                                               # 境界線描画
g <- g + xlim(128, 150) + ylim(27, 46)
g <- g + labs(
  x = STR_COPY, y = ""
)
g <- g + coord_equal()                          # メモリ刻み等間隔
g <- g + theme(legend.position = "none")        # 凡例位置
g <- g + theme(
  panel.background = element_rect(
    colour = "black", fill = "lightsteelblue",
    size = 0.2 , linetype = 1
  )
)                                               # グラフ枠・背景

# ----------------------------------------
print("**** 画像保存")
ggsave(
  file = FILE_SAV,
  dpi = 100, width = 8, height = 8,
  g
)
{% endhighlight %}

* [Gist - R scirpt to draw a map of Japan. (Okianwa Division Ver.)](https://gist.github.com/komasaru/6847442be52197ea6519 "Gist - R scirpt to draw a map of Japan. (Okianwa Division Ver.)")

### 3. R ソーススクリプト実行

以下のコマンドで実行する。（GUI ツールの RStudio 等を使用して実行してもよい）

``` text
$ R --vanilla --slave < japan_standard.R
$ R --vanilla --slave < japan_okinawa.R
```

### 4. 画像確認

成功すれば、 R ソーススクリプトと同じディレクトリ内に "japan_standard.png" と "japan_okinawa.png" という画像が作成される。

![日本地図（標準 Ver.）]({{site.baseurl}}/images/2014/12/03/japan_standard.png "日本地図（標準 Ver.）")
![日本地図（沖縄分割 Ver.）]({{site.baseurl}}/images/2014/12/03/japan_okinawa.png "日本地図（沖縄分割 Ver.）")

### 参考サイト

* [沖縄大移動 - 迷途覚路夢中行 - Yahoo!ブログ](http://blogs.yahoo.co.jp/igproj_fusion/16900063.html "沖縄大移動 - 迷途覚路夢中行 - Yahoo!ブログ")

大変参考になりました。(Thanks a lot!)

---

これで、同じ画像サイズでも地図が大きく描画されるようになりました。（ただ、地図上の沖縄地方に何かをプロットする際には、緯度・経度を調整する必要はあります）

以上。

