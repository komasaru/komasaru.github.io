---
layout   : single
title    : "ImageMagick - コマンドラインで図形描画！"
published: true
date     : 2013-09-16 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- 画像
- ImageMagick
---

画像処理ソフト ImageMagick でコマンドラインから画像に図形を描画する方法についての備忘録です。

個人的に画像内での位置（X座標、Y座標）を確認するために使用したコマンドの例です。

<!--more-->

#### 0. 前提条件

- Linux Mint 14 (64bit) での作業・動作確認を想定。
- 画像処理処理ソフト ImageMagick がインストール済みである。
- 今回使用する画像のサイズは、横：640px, 縦：480px
- 今回描画するのは、直線と円のみ。（ついでに文字も）

#### 1. 図形描画コマンド

以下のようにコマンドを実行する。  
画像の中心を通る垂直な直線と水平な直線、画像の中心を円の中心とた半径10pxの円、中心の右上に文字列を描画している。
書式は `convert test.jpg ＜オプション＞ test_after.jpg`

``` bash 
$ convert test.jpg -strokewidth 2 \
-stroke white -draw "line 320,0 320,479" \
-draw "line 0,240 639,239" \
-stroke cyan -fill none -draw "circle 320,240 310,250" \
-font Courier-Bold -pointsize 36 -fill magenta -stroke black \
-draw "text 340,220 'ImageMagick'" test_after.jpg
```

上記コマンドについて、

- １行目は、変換元画像に "test.jpg" を指定し、線（直線、円）の幅を 2px に設定。
- ２行目は、色を「白」に設定し、座標 (320, 0) から座標 (320, 479) まで直線を描画。
- ３行目は、座標 (0, 240) から座標 (639, 239) まで直線を描画。
- ４行目は、色を「シアン」、塗りつぶし色を「なし」に設定し、中心座標 (320, 240) で座標 (310, 250) を通る円（半径 10px）を描画。
- ５行目は、フォントを「Courier-Bold」、フォントサイズを「36pt」、塗りつぶし色を「マゼンタ」、縁の色を「黒」に設定。
- ６行目は、座標 (340, 220) （左下位置）に、"ImageMagick" という文字列を描画し、"test_after.jpg" に出力。

#### 2. 図形確認

上記のコマンドで生成される画像は以下のようになる。

![test_after]({{site.baseurl}}/images/2013/09/16/test_after.jpg "生成画像")

#### 参考サイト

詳細な説明は以下のサイトで確認できる。

- [ImageMagick: Command-line Tools](http://www.imagemagick.org/script/command-line-tools.php "ImageMagick: Command-line Tools")

---

画像をボカシたり、サイズを変更したり等々もっと色々なことができますが、取り急ぎ画像内の位置を確認したい場合は今回のような方法で十分でした。

以上。

