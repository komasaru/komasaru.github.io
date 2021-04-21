---
layout   : single
title    : "R - コロプレスマップ（都道府県別人口密度）！"
published: true
date     : 2014-10-09 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- R
- GIS
- 地図
---

統計解析プログラム言語 R でコロプレスマップ（階級区分図、区画別段彩図とも呼ばれる）を描画してみました。

例として、日本の都道府県別人口密度のデータを使用して地図を塗り分けてみました。

（R について精通している訳でもありません。乱文ご容赦下さい）

<!--more-->

### 0. 前提条件

- R 3.1.1 での作業を想定。
- 地図情報は「国土地理院・地球地図日本」を使用。  
  （参照「[QGIS(Quantum GIS) - 国土地理院・地球地図日本を表示！]({{site.baseurl}}/2014/07/11/qgis-gsi-global-map-japan/ "QGIS(Quantum GIS) - 国土地理院・地球地図日本を表示！")」）
- データは「総務省統計局・平成22年国勢調査」の都道府県別人口密度の部分を使用。

### 1. CSV データの準備

「政府統計の総合窓口 GL01010101(http://www.e-stat.go.jp/SG1/estat/eStatTopPortal.do "")」のサイトの中から「主要な統計から探す」-「国勢調査」とたどるなどして「平成22年国勢調査」のデータ（表計算ファイル）を取得し、表計算ソフト等で「都道府県名」と「人口密度」のデータのみを CSV 形式にしておく。

実際には以下のような内容（ファイル名： "population_density_pref.csv"）で、カラム名は "PREF_NAME", "VALUE" としている。（都道府県名でマッチングすることを考慮している）

File: `"population_density_pref.csv"`

{% highlight text linenos %}
PREF_NAME,VALUE
北海道,70.2
青森県,142.4
岩手県,87.1
宮城県,322.3
秋田県,93.3
      :
=< 途中省略 >=
      :
長崎県,347.5
熊本県,245.4
大分県,188.7
宮崎県,146.7
鹿児島県,185.7
沖縄県,611.9
{% endhighlight %}

### 2. R スクリプト作成

以下のように R スクリプトを作成する。  
詳細な説明はしないが、注意する点は以下のとおり。

- Shapefile の情報と CSV の情報を「都道府県名」でマッチングする。
- classInt ライブラリを使用して分類する。
- 分類する数は使用するカラーバレット以下にする。
- Shapefile と分類データを結合する。
- 結合したデータは「データフレーム形式」に変換する。

File: `population_density_pref.R`

{% highlight text linenos %}
# ライブラリの読み込み
library(gpclib)
library(ggplot2)
library(maptools)
library(classInt)
library(RColorBrewer)

# gpclib ライセンス警告表示の抑止
gpclibPermit()

# ==== 各種定数
TITLE    <- "都道府県別人口密度"             # <= グラフタイトル
TITLE_L  <- "人口密度"                       # <= 凡例タイトル
CNT_DIV  <- 8                                # <= 凡例分割数
UNIT     <- "人/km2"                         # <= 単位
STR_COPY <- paste(
  "（地図出典：国土地理院・地球地図日本（行政界データ））",
  "（データ出典：総務省統計局・平成22年国勢調査）",
  "© 2014 mk-mode.com",
  sep = "\n"
)                                            # <= コピーライト用文字列
FILE_SHP <- "/path/to/polbnda_jpn_pref.shp"  # <= Shapefile のフルパス
FILE_CSV <- "population_density_pref.csv"    # <= CSV ファイル
FILE_SAV <- "population_density_pref.png"    # <= 保存ファイル

# ==== Shapefile の読み込み
shp <- readShapePoly(FILE_SHP, IDvar = "pref_name")

# ==== CSV データ読み込み
csv <- read.csv(FILE_CSV, sep = ",", h = T)

# ==== 都道府県名でマッチング
pref.match <- match(shp$pref_name, csv$PREF_NAME)
dat <- csv[pref.match,]

# ==== 分類
klass <- classIntervals(dat$VALUE, n = CNT_DIV, style = "quantile")
divs <- klass$brks  # <= 凡例ラベル用
rank <- findInterval(klass$var, klass$brks)
rank[rank[] == CNT_DIV + 1] <- CNT_DIV

# ==== 凡例用ラベル設定
label_l <- paste(divs, "〜")

# ==== Shapefile とデータの結合
dat_2 <- spCbind(shp, rank)

# ==== データフレーム形式に変換
df <- fortify(dat_2, region = "rank")

# ==== 地図 Plot
g <- ggplot(df)                                             # <= オブジェクト生成
g <- g + ggtitle(TITLE)                                     # <= グラフタイトル
g <- g + geom_polygon(
  aes(long, lat, group = group, fill = id)
)                                                           # <= 地図描画
g <- g + scale_fill_brewer(
  name    = paste(TITLE_L, "\n(単位：", UNIT, ")"),
  palette = "Blues",
  labels  = label_l
)                                                           # <= 凡例設定
g <- g + geom_path(
  data   = shp,
  aes(long, lat, group = group),
  colour = "black",
  size   = 0.3
)
g <- g + xlim(c(123.0, 150.0))
g <- g + ylim(c(23.0, 45.7))
g <- g + coord_equal()                                      # <= メモリ刻み等間隔
g <- g + labs(x = STR_COPY, y = "")                         # <= x, y 軸ラベル無し
g <- g + theme(
  plot.background = element_rect(
    fill   = "grey80",
    colour = "black",
    size   = 0.5
  )
)                                                           # <= プロット領域背景
g <- g + theme(
  title = element_text(size = 10, colour = "black"),        # <= タイトルのサイズ・色
  axis.title.y = element_blank(),                           # <= y 軸ラベル非表示
  axis.title.x = element_text(size = 7, colour = "gray20")  # <= x 軸ラベルのサイズ・色
)
g <- g + theme(
  panel.background = element_rect(
    fill     = "lightsteelblue",
    colour   = "black",
    size     = 0.2,
    linetype = 1
  )
)                                                           # <= グラフ枠・背景

# ==== 画像保存
ggsave(
  file = FILE_SAV,
  dpi = 100, width = 6.4, height = 6.4,
  g
)
{% endhighlight %}

- [Gist - R script to generate a choropleth map of Japan's population density.](https://gist.github.com/komasaru/7d7e99d8f5fb623f7849 "Gist - R script to generate a choropleth map of Japan's population density.")

### 3. R スクリプト実行

コマンドラインから実行する場合は以下のように実行する。  
（データフレーム形式に変換するのに多少時間がかかるが、それでも非力な環境でも数分程度）

``` text
$ R --vanilla --slave < population_density_pref.R
```

- `--vanilla` は、R がこれまでに保存していたオブジェクトを「読み込まない」（プレーンな）状態で R を実行するオプション。  
- `--slave` は、R の出力（処理内容）を標準出力（ディスプレイ）に表示しないオプション。

ちなみに、 R を起動し実行するするなら以下のようになるでしょうか。

``` text
> source("population_density.R")
```

### 4. 地図確認

成功すると "population_density_pref.png" という画像ファイルが作成されるので表示して確認してみる。

以下の画像は、上記のスクリプトを若干編集して各種分類方法を試してみた結果の画像。

【等量分類: quantil】

![等量分類]({{site.baseurl}}/images/2014/10/09/population_density_pref_quantile.png "等量分類")

【等間隔分類: equal】

![等間隔分類]({{site.baseurl}}/images/2014/10/09/population_density_pref_equal.png "等間隔分類")

【標準偏差分類: sd】

![標準偏差分類]({{site.baseurl}}/images/2014/10/09/population_density_pref_sd.png "標準偏差分類")

【自然階級分類: fisher】

![自然階級分類]({{site.baseurl}}/images/2014/10/09/population_density_pref_fisher.png "自然階級分類")

【視覚的に分かりやすい分類: pretty】

![視覚的に分かりやすい分類]({{site.baseurl}}/images/2014/10/09/population_density_pref_pretty.png "視覚的に分かりやすい分類")

【非階層クラスタリング分類: kmeans】

![非階層クラスタリング分類]({{site.baseurl}}/images/2014/10/09/population_density_pref_kmeans.png "非階層クラスタリング分類")

【階層クラスタリング分類: hclust】

![階層クラスタリング分類]({{site.baseurl}}/images/2014/10/09/population_density_pref_hclust.png "階層クラスタリング分類")

【マニュアル分類: fixed】

![マニュアル分類]({{site.baseurl}}/images/2014/10/09/population_density_pref_fixed.png "マニュアル分類")

---

今回の作業を応用して色々なコロプレスマップが作成できるようになるでしょう。

以上。

