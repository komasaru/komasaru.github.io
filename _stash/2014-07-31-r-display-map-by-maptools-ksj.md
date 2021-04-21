---
layout   : single
title    : "R - maptools で地図表示（国土数値情報）！"
published: true
date     : 2014-07-31 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- R
- GIS
- 地図
---

少し前に、統計解析向けプログラミング言語の R で maptools パッケージを用いて国土地理院・基盤地図情報から地図（Shape ファイル）を表示しました。

- [R - maptools で地図表示！]({{site.baseurl}}/2014/07/24/r-display-map-by-maptools "R - maptools で地図表示！")

今回は、国土交通省・国土数値情報から地図を表示してみます。  
（今回は `plot` ではなく `ggplot` を使用します）

（乱文ご容赦下さい）

<!--more-->

### 0. 前提条件

- R 3.1.1 での作業を想定。
- SHAPE ファイルは国土交通省・国土数値情報を使用する。（行政区域データ「島根県」分）

### 1. ライブラリのインストール

必要なパッケージが未インストールならインストールする。  
今回必要なのは ggplot2, gpclib, maptools パッケージ。

``` text
> install.packages("ggplot2" , dependencies =TRUE)
> install.packages("gpclib" , dependencies =TRUE)
> install.packages("maptools" , dependencies =TRUE)
```

### 2. R スクリプト作成

Shape ファイルを読み込み地図を表示する R スクリプト（プログラム）を作成する。  
（短いスクリプトなので R 起動後に、インタラクティブに実行してもよい）

File: `test_maptools_ksj.R`

{% highlight text linenos %}
# ライブラリの読み込み
library(gpclib)
library(ggplot2)
library(maptools)

# gpclib ライセンス警告表示の抑止
gpclibPermit()

# Shape ファイルのフルパス
shp_file <- '/path/to/N03-140401_32_GML/N03-14_32_140401.shp'

# Shape ファイルの読み込み
shp <- readShapePoly(shp_file)

# 「松江市(32201)」分のみ抽出
shp.matsue <- subset(shp, shp$N03_007 == "32201")

# データフレーム形式に変換
df <- fortify(shp)
df.matsue <- fortify(shp.matsue)

# Plot
g <- ggplot(df)                           # オブジェクト生成
g <- g + ggtitle("島根県松江市")          # グラフタイトル
g <- g + geom_polygon(
  aes(long, lat, group = group),
  colour = "gray20", size = 0.1,
  fill = "ivory2")                        # 島根県全体
g <- g + geom_polygon(
  data = df.matsue,
  aes(long, lat, group = group),
  colour = "gray20", size = 0.5,
  fill = "cornsilk4")                     # 松江市のみを重ねあわせ
g <- g + coord_equal()                    # メモリ刻み等間隔
g <- g + theme(legend.position = "none")  # 凡例位置
g <- g + theme(
  panel.background = element_rect(
    colour = "black", fill = "lavender",
    size= 0.2 , linetype = 1
  )
)                                         # グラフ枠・背景
#print(g)                                 # 画像表示

# 画像保存
ggsave(
  file = "test_maptools_ksj.png",
  dpi = 100, width = 6.4, height = 6.4,
  g
)
{% endhighlight %}

- [Gits - R script to generate a map of KSJ by maptools.](https://gist.github.com/komasaru/c58347f2b78f1825ba86 "Gist - R script to generate a map of KSJ by maptools.")

### 3. R スクリプト実行

R を起動し以下のように R スクリプトを指定して実行する。

``` text
> source("test_maptools_ksj.R")
```

コマンドラインから実行する場合は以下のように実行する。

``` text
$ R --vanilla --slave < test_maptools_ksj.R
```

`--vanilla` は、R がこれまでに保存していたオブジェクトを「読み込まない」（プレーンな）状態で R を実行するオプション。  
`--slave` は、R の出力（処理内容）を標準出力（ディスプレイ）に表示しないオプション。

### 4. 画像確認

成功すると "test_maptools_ksj.png" という画像ファイルが作成されるので表示して確認してみる。

![R_MAPTOOLS_KSJ_1]({{site.baseurl}}/images/2014/07/31/R_MAPTOOLS_KSJ_1.png "R_MAPTOOLS_KSJ_1")

（使用データの出典：国土数値情報（行政区域データ）・国土交通省）

### 5. その他

今回の処理を応用して、以下のように日本全国のうち１つの都道府県や市区町村をハイライトすることも可能。  
（ただし、日本全国分の SHAPE ファイルは容量が大きく、非力なマシンでは実行に耐えられないかも知れない。地物（ポリゴン）融合や Shapfile 結合して軽くしてから描画させるとよいだろう）

![R_MAPTOOLS_KSJ_2]({{site.baseurl}}/images/2014/07/31/R_MAPTOOLS_KSJ_2.png "R_MAPTOOLS_KSJ_2")

（使用データの出典：国土数値情報（行政区域データ）・国土交通省）

また、今回のように一旦全体図を描画した後にハイライトしたい部分を重ね合わせる方法の他に、ハイライトさせたい部分にフラグを立てた情報を生成し、そのフラグを判定して色を塗り分ける方法も考えられる。  
（ただし、この方法は fortify コマンドを使用する必要があり、このコマンドの動作が重く非力なマシでは実行に耐えられないかも知れない。）

---

他に良い用法もあるのかも知れないが、R で SHAPE ファイルを使用したアプリを作成する際には処理を軽くする方法も考えた方が良いだろう。

以上。

