---
layout   : single
title    : "R - maptools で地図表示！"
published: true
date     : 2014-07-24 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- R
- GIS
---

統計解析向けプログラミング言語の R で地図（Shape ファイル）を表示する方法についての記録です。

<!--more-->

### 0. 前提条件

- R 3.1.1 での作業を想定。
- Shape ファイルは国土地理院の基盤地図情報から取得済み。（「島根県」分）

### 1. ライブラリのインストール

Shape ファイルを扱うためのライブラリ maptools が未インストールならインストールする。（ミラーサイトは近場を適当に）

``` text
> install.packages("maptools" , dependencies =TRUE)
```

`dependencies=TRUE` は依存するライブラリも一緒にインストールするオプションで、 deldir, abind, tensor, polyclip, sp, rgeos, spatstat, PBSmapping, RColorBrewer もインストールされる。

（補足）ミラーサイトが上がってない場合は以下のようなエラーとなりインストールできないかも知れない。（随分長い間「兵庫教育大」にあるミラーサイトに接続できない状態が続いているため、当方は「筑波大」にあるミラーサイトに接続するようにしている）

``` text
package ‘maptools’ is not available (for R version 3.1.1)
```

### 2. R スクリプト作成

Shape ファイルを読み込み地図を表示する R スクリプト（プログラム）を作成する。（基本的な用法）  
（短いスクリプトなので R 起動後に、インタラクティブに実行してもよい）

File: `test_maptools.R`

{% highlight text linenos %}
# ライブラリの読み込み
library(maptools)
library(RColorBrewer)

# Shape ファイルのフルパス
shp <- '/path/to/shapefile.shp'

# Shape ファイルの読み込み
# map <- readShapePoly(shp)  # これでもよい
map <- readShapeSpatial(shp)

# 色設定
#（ RColorBrewer - Paired パレット の12色を21市町村分ランダムに設定する例 )
col <- sample(1:12, size=21, replace=T)

# プロット
# ( x, y 軸表示、ラベル「全て水平」、RColorBrewer で塗りつぶし、
#   境界線「青」、境界線太さ「１」 )
plot(map, axes=T, las=1, col=brewer.pal(12,"Paired")[col], border="blue", lwd=1)
{% endhighlight %}

- [Gist - R script to generate a map by maptools.](https://gist.github.com/komasaru/07fa60f41d3b8c288a76 "Gist - R script to generate a map by maptools.")

### 3. R スクリプト実行

R を起動し以下のように R スクリプトを指定して実行する。

``` text
> source("test_maptools.R")
General Polygon Clipper Library for R (version 1.5-5)
        Type 'class ? gpc.poly' for help
 要求されたパッケージ sp をロード中です
Checking rgeos availability: FALSE
        Note: when rgeos is not available, polygon geometry     computations in maptools depend on gpclib,
        which has a restricted licence. It is disabled by default;
        to enable gpclib, type gpclibPermit()
```

上記のようにライセンスに関する警告が出力されるが（無視しても）問題ない。気になるようなら gpclib パッケージをインストールしてスクリプト中で `gpclibPermit()` とすればよい。

成功すると以下のような画像がポップされる。と言いたいところだが、「国土地理院・基盤地図情報」を二次利用等する際には**承認・申請**が必要となるのではここでは紹介しない（できない）。

- [7-7　基盤地図情報は、誰でも自由に利用することができるのでしょうか？ また、国土地理院が作成する基盤地図情報を利用する際には、どのような手続が必要でしょうか？ - FAQ｜国土地理院](http://www.gsi.go.jp/kiban/faq.html#7-7 " - FAQ｜国土地理院")
- [承認申請Q&A｜国土地理院](http://www.gsi.go.jp/LAW/2930-qa.html "承認申請Q&A｜国土地理院")

また、コマンドラインから実行する場合は以下のようにする。

``` text
$ R --vanilla --slave < test_maptools.R
```

`--vanilla` は、R がこれまでに保存していたオブジェクトを「読み込まない」（プレーンな）状態で R を実行するオプション。  
`--slave` は、R の出力（処理内容）を標準出力（ディスプレイ）に表示しないオプション。

コマンドラインから実行した場合は、R スクリプトと同じディレクトリ内に "Rplots.pdf" という PDF ファイルが作成される。

---

R で自由に地図が表示できるようになれば応用範囲がかなり広がると思います。

以上。

