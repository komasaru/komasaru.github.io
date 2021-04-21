---
layout   : single
title    : "R - 地震活動状況の地図表示！"
published: true
date     : 2014-08-03 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- R
- GIS
- 地図
---

少し前から国土地理院や国土交通省提供の地図情報（Shape ファイル）から R(maptools) を用いて地図を表示してきました。

今回は、国土地理院・地球地図日本上に気象庁発表の地震情報（震源・地震規模）の情報を重ねて表示してみした。

（乱文ご容赦下さい）

<!--more-->

### 0. 前提条件

- R 3.1.1 での作業を想定。
- SHAPE ファイルは国土地理院・地球地図日本を使用。（別途都道府県単位で地物融合済み）

### 1. 地震データ（CSV ファイル）の準備

使用する地震データを何かしらの形で準備する。  
当方は、以前から取り貯めていた「気象庁防災情報 XML」の「震源・震度に関する情報」のデータを整形していかのような CSV ファイルを用意した。（2013/01/01から2014/06/30までの3,357件）

File: `eq_data.csv`

{% highlight text linenos %}
lat,lon,depth,magnitude
-23.1,-176.6,210,7.4
-03.8,154.0,380,7.3
39.1,142.1,50,3.6
40.5,141.7,100,3.9
27.1,127.5,90,4.0
38.9,142.0,50,3.5
40.1,141.8,10,3.1
35.7,141.1,10,4.2
39.0,142.1,50,3.7

         :
 ===< 以降省略 >===
         :

{% endhighlight %}

### 2. R スクリプト作成

以下のような R スクリプト（プログラム）を作成した。  
処理の詳細は説明しない。スクリプト中のコメントで概要を理解してください。

File: `generate_map_prefs.R`

{% highlight text linenos %}
# 国土地理院・地球地図日本に地震情報をプロット

# ライブラリの読み込み
library(gpclib)
library(ggplot2)
library(maptools)

# gpclib ライセンス警告表示の抑止
gpclibPermit()

# Shapefile, CSV ファイルのフルパス
shp_file <- "/path/to/polbnda_jpn_pref.shp"
csv_file <- "/path/to/eq_data.csv"

# Shapefile の読み込み
shp <- readShapePoly(shp_file)

# Shapefile をデータフレーム形式に変換
df <- fortify(shp)

# CSV データ読み込み
csv <- read.csv(csv_file)

# タイトル・コピーライト文字列
title <- "地震の活動状況 [ 2013/01/01 - 2014/06/30 ]"
copy  <- paste(
  "（出典：国土地理院・地球地図日本 / 気象庁・防災情報XML）",
  "© 2014 mk-mode.com", sep = "\n"
)

# 地図描画
g <- ggplot(df)                                              # オブジェクト生成
g <- g + ggtitle(title)                                      # グラフタイトル設定
g <- g + geom_polygon(
  aes(long, lat, group = group),
  colour = "gray20", fill = "darkolivegreen4", size = 0.1
)                                                            # 日本地図描画
g <- g + geom_point(
  data = csv, shape = 1, alpha = 0.5,
  aes(x = lon, y = lat, size = magnitude, colour = depth)
)                                                            # 地震情報 Plot
g <- g + scale_colour_gradient(low = "red", high="midnightblue") # 深さ色設定
g <- g + xlim(c(122, 150)) + ylim(c(23, 47))                 # プロット範囲指定
g <- g + coord_equal()                                       # メモリ刻みを等間隔設定
g <- g + theme(
  plot.background = element_rect(
    colour = "black", size = 0.5
  )
)                                                            # プロット領域背景
g <- g + labs(
  x = copy, y = "", size = "規模(M)", colour = "深さ(km)"
)                                                            # ラベル設定
g <- g + theme(legend.position = "right")                    # 凡例位置
g <- g + theme(
  title = element_text(size = 10, colour = "black"),         # タイトルのサイズ・色
  axis.title.y = element_blank(),                            # y 軸ラベル領域非表示
  axis.title.x = element_text(size = 10, colour = "gray20")  # x 軸ラベルのサイズ・色
)
g <- g + guides(
  colour = guide_legend(order = 1),
  size   = guide_legend(order = 2)
)
g <- g + theme(
  panel.background = element_rect(
    fill = "lightsteelblue", colour = "black",
    size= 0.2 , linetype = 1
  )
)                                                            # グラフ枠・背景

# 画像保存
ggsave(
  file = paste("earthquakes.png"),
  dpi = 100, width = 6.4, height = 6.4,
  g
)
{% endhighlight %}

- [Gits - R script to plot earthquake infos on a map.](https://gist.github.com/komasaru/5fb0db30ef3ccfc28a53 "Gist - R script to plot earthquake infos on a map.")

### 3. R スクリプト実行

R を起動し以下のように R スクリプトを指定して実行する。（表示範囲外の震源データは警告となる）

``` text
> source("earthquake.R")
```

コマンドラインから実行する場合は以下のように実行する。

``` text
$ R --vanilla --slave < earthquake.R
```

`--vanilla` は、R がこれまでに保存していたオブジェクトを「読み込まない」（プレーンな）状態で R を実行するオプション。  
`--slave` は、R の出力（処理内容）を標準出力（ディスプレイ）に表示しないオプション。

### 4. 地図確認

成功すると "earthquakes.png" という画像ファイルが作成されるので表示して確認してみる。

![R_MAPTOOLS_EQ]({{site.baseurl}}/images/2014/08/03/R_MAPTOOLS_EQ.png "R_MAPTOOLS_EQ")

---

「数値データを視覚化することで状況をより把握しやすくなる」ということがよく分かります。

以上。

