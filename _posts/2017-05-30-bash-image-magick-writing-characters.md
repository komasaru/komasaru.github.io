---
layout   : single
title: 'Bash - Image Magick で既存の画像に文字を追加！'
published: true
date     : 2017-05-30 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
- LMDE2
- 画像
- ImageMagick
---

Image Magick で既存の画像に文字を上書きして保存する Bash スクリプトの紹介です。

<!--more-->

### 0. 前提条件

* LMDE2 (Linux Mint Debian Edition 2; 64bit) での作業を想定。
* ImageMagick 6.8.9-9 での作業を想定。（使用するのは `convert` コマンド）

### 1. 元画像の準備

文字を描画したい画像を用意しておく。

以下は、当方が今回使用するサンプル画像。（Copywrite は実際には描画されていない）

![IM_CHARACTER_1.png]({{site.baseurl}}/images/2017/05/30/IM_CHARACTER_1.png "IM_CHARACTER_1")

### 2. Bash スクリプトの作成

以下は、当方の作成例。（適当に編集すること）

画像上部に "MK", 下部に "mode" 当文字を縁取りで描画している。

File: `im_write_char.sh`

{% highlight bash linenos %}
#!/bin/bash

IN=sample.png
OUT=sample_out.png

convert \
  -gravity NorthWest \
  -font URW-Bookman-L-Demi-Bold \
  -pointsize 200 \
  -fill DarkGoldenrod \
  -stroke gray10 -strokewidth 16 -annotate 0x0+22-20  "MK" \
  -stroke none                   -annotate 0x0+22-20  "MK" \
  -pointsize 128 \
  -fill DarkOrange3 \
  -stroke gray10 -strokewidth 16 -annotate 0x0+20+240 "mode" \
  -stroke none                   -annotate 0x0+20+240 "mode" \
  $IN $OUT
{% endhighlight %}

* フォントは URW-Bookman-L-Demi-Bold.
* `-gravity` は基点となる位置。（`NorthWest` は画像左上のこと）
* `-strokewidth` は縁取りの幅。
* `-annotate` で文字を描画。（オプションの数字を色々変更してみれば、どうなるか分かる）
* 最後に入力画像と出力画像のファイル名を指定。

### 3. Bash スクリプトの実行

``` text
$ im_write_char.sh
```

### 4. 出力画像の確認

出力された画像 sample_out.png を確認してみる。（Copywrite は実際には描画されていない）

![IM_CHARACTER_2.png]({{site.baseurl}}/images/2017/05/30/IM_CHARACTER_2.png "IM_CHARACTER_2")

### 5. 参考サイト

* [Command-line Tools: Convert @ ImageMagick](https://www.imagemagick.org/script/convert.php "Command-line Tools: Convert @ ImageMagick")

---

当方、背景が同じで文字が異なる画像を大量に作成したい場合に、今回紹介のスクリプトを改良したものを使用しています。

以上。

