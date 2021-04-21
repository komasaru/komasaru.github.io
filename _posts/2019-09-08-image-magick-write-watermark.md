---
layout   : single
title    : "Image Magick - 画像に透かし文字(watermark)を追加"
published: true
date     : 2019-09-08 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
- Debian
- LMDE3
- 画像
---

過去に Image Magick で既存画像に文字を追加する方法を紹介しました。

* [Bash - Image Magick で既存の画像に文字を追加！ ]({{site.baseurl}}/2017/05/30/bash-image-magick-writing-characters "Bash - Image Magick で既存の画像に文字を追加！ ")

今回は、少し異なった方法で透かし文字(watermark)を追加する方法を紹介します。

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 9.9, LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* Image Magick 6.9.7 での作業を想定。（Image Magick 7 系では、コマンドの使い方に異なる部分があるので注意）
* 元の画像は PNG でも JPEG でもよい。（他フォーマットについては確認していない）

### 1. Bash スクリプトの作成

（以下、当方が普段使用している Bash スクリプト）

* 透かし文字だけの透過画像を作成し、コマンドライン引数で指定した既存の画像に上書きする方法。
* 文字列、透過画像やフォントのサイズは固定で指定している。必要であれば、調整すること。  
  （当スクリプトはフレキシブルに対応できるものではないので）
* 透過画像のサイズより小さい画像を指定するとはみ出るので、要調整。  
  （当スクリプトはフレキシブルに対応できるものではないので）
* 生成後の画像はファイル名の最後に `.wm` を付与するようにしている。

File: `write_watermark.sh`

``` bash
#!/bin/bash

TXT="©2019 mk-mode.com"

convert -size 340x50 xc:black -font Courier-Bold -pointsize 32 -gravity center \
        -draw "fill black  text 0,0  '$TXT'" \
        stamp_fgnd.png
convert -size 340x50 xc:black -font Courier-Bold -pointsize 32 -gravity center \
        -draw "fill white  text  1,1  '$TXT'  \
                           text  0,0  '$TXT'  \
               fill black  text -1,-1 '$TXT'" \
        +matte stamp_mask.png
composite -compose CopyOpacity  stamp_mask.png  stamp_fgnd.png  stamp.png
mogrify -trim +repage stamp.png

composite -gravity southeast -geometry +10+8 stamp.png $1 $1.wm
```

### 2. Bash スクリプトの実行

元画像のパスをコマンドライン引数に指定して実行する。

``` text
$ ./write_watermark.sh /path/to/image.png
```

成功すれば、元画像と同じディレクトリ内に `image.png.wm` という画像ファイルが作成されるはず。

### 3. 画像の確認

元画像と同じディレクトリ内の `image.png.wm` という画像ファイルを確認してみる。

![IM_WATERMARK]({{site.baseurl}}/images/2019/09/08/IM_WATERMARK.png "IM_WATERMARK")

---

以上。

