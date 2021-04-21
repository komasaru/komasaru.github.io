---
layout   : single
title    : "ImageMagick - ２枚の画像を比較！"
published: true
date     : 2013-09-04 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- 画像
- ImageMagick
---

２枚の画像が全く同じものかどうかを確認したいことがごく稀にあるかと思います。

画像処理ソフト ImageMagick のコマンドを使用して比較する方法についての記録です。

<!--more-->

#### 0. 前提条件

- Linux Mint 14 (64bit) での作業・動作確認を想定。
- 画像処理処理ソフト ImageMagick がインストール済みである。
- 今回の作業で使用した画像は以下の３つ。（全てサイズが同じであること）
  1. 元のJPEG画像
     ![TEST_1]({{site.baseurl}}/images/2013/09/04/TEST_1.jpg "元のJPEG画像")
  2. 元のJPEG画像の70%品質のJPEG画像
     ![TEST_2]({{site.baseurl}}/images/2013/09/04/TEST_2.jpg "元のJPEG画像の70%品質のJPEG画像")
  3. 元のJPEG画像に文字を描画したJPEG画像
     ![TEST_3]({{site.baseurl}}/images/2013/09/04/TEST_3.jpg "元のJPEG画像に文字を描画したJPEG画像")

#### 1. 元のJPEG画像と元の70%品質のJPEG画像とノイズ量を比較

ImageMagick の `compare` コマンドを使用して２枚の画像（元のJPEG画像と70%品質のJPEG画像）を比較する。  
`compare` コマンドは、２つ目の画像が１つ目の画像よりどれだけ劣化しているかを確認するためのコマンドであり、 `-metric` オプションでどのアルゴリズムで劣化具合を数値化するかを指定できる。今回は `PSNR` （= ピーク信号対雑音比）を使用した。（PSNR についての詳細は別途お調べください）  
PSNR の計算式の特性から、全く同じ（全く劣化のない）画像なら分母がゼロになって除算できず、`inf` が返ってくる。  
数値が返ってくれば、少なからず２つの画像の間に一致しない（劣化している）部分があると判断できる。

``` bash 
$ compare -metric PSNR TEST_1.jpg TEST_2.jpg diff_1.jpg
42.7951
```

`-verbose` オプションで詳細情報も出力される。

``` bash 
$ compare -verbose -metric PSNR TEST_1.jpg TEST_2.jpg diff_1.jpg
TEST_1.jpg JPEG 640x480 640x480+0+0 8-bit DirectClass 160KB 0.010u 0:00.019
TEST_2.jpg JPEG 640x480 640x480+0+0 8-bit DirectClass 56.9KB 0.000u 0:00.019
Image: TEST_1.jpg
  Channel distortion: PSNR
    red: 43.083
    green: 43.563
    blue: 41.9096
    all: 42.7951
TEST_1.jpg=>diff_1.jpg JPEG 640x480 640x480+0+0 8-bit DirectClass 741KB 0.050u 0:00.089
```

返却値が `inf` でないので、同じ画像ではない（劣化している）ことが分かる。  
また、この処理で次のような画像が生成される。全体的にノイズがかかっているので、このような状態になる。

【元のJPEG画像と70%品質のJPEG画像を compare 】

![diff_1]({{site.baseurl}}/images/2013/09/04/diff_1.jpg "diff_1")

#### 2. 元のJPEG画像と文字を追加したJPEG画像とノイズ量を比較

前項同様、ImageMagick の `compare` コマンドを使用して２枚の画像（元のJPEG画像と文字を追加したJPEG画像）を比較する。  

``` bash 
$ compare -metric PSNR TEST_1.jpg TEST_3.jpg diff_2.jpg
33.9283
```

``` bash 
$ % compare -verbose -metric PSNR TEST_1.jpg TEST_3.jpg diff_2.jpg
TEST_1.jpg JPEG 640x480 640x480+0+0 8-bit DirectClass 160KB 0.010u 0:00.010
TEST_3.jpg JPEG 640x480 640x480+0+0 8-bit DirectClass 166KB 0.010u 0:00.010
Image: TEST_1.jpg
  Channel distortion: PSNR
    red: 30.1508
    green: 38.1227
    blue: 40.2563
    all: 33.9283
TEST_1.jpg=>diff_2.jpg JPEG 640x480 640x480+0+0 8-bit DirectClass 143KB 0.050u 0:00.030
```

前項同様、返却値が `inf` でないので、同じ画像ではない（劣化している）ことが分かる。  
また、この処理で次のような画像が生成される。`compare` では、うっすらと残った元の画像の上にノイズ（文字）部分が描画される。

【元のJPEG画像と同じ品質のJPEG画像に文字を描画した画像を compare 】

![diff_2]({{site.baseurl}}/images/2013/09/04/diff_2.jpg "diff_2")

#### 3. 元のJPEG画像と元の70%品質のJPEG画像のコンポジットを生成して比較

上記 1, 2 の方法とは異なり、２枚（元のJPEG画像と元の70%品質のJPEG画像）の画像のコンポジットを生成して差異を確認する。  
`composite` コマンドを以下のように使用する。  
`-compose difference` は２つの画像の絶対値をとるオプション（同じ色なら 0（黒）になるということ）。

``` bash 
$ composite -compose difference TEST_1.jpg TEST_2.jpg diff_3.jpg
```

この処理で次のような画像が生成される。２つの画像が人の目では区別が付かないくらいなので、ほぼ真っ黒になる。

【元のJPEG画像と70%品質のJPEG画像を composite 】

![diff_3]({{site.baseurl}}/images/2013/09/04/diff_3.jpg "diff_3")

また、以下のように実行すると、"Average value statistic of image" （平均画像統計値？）（0（黒）〜65535（白））が返ってくる。0 なら２つの画像が同じであることになる。

``` bash 
$ identify -format "%[mean]" diff_3.jpg
226.879
```

#### 4. 元のJPEG画像と文字を追加したJPEG画像のコンポジットを生成して比較

前項同様、ImageMagick の `composite` コマンドを使用して２枚の画像（元のJPEG画像と文字を追加したJPEG画像）の画像のコンポジットを生成して差異を確認する。。  

``` bash 
$ composite -compose difference TEST_1.jpg TEST_3.jpg diff_4.jpg
```

この処理で、次のような画像が生成される。

【元のJPEG画像と同じ品質のJPEG画像に文字を描画した画像を composite 】

![diff_4]({{site.baseurl}}/images/2013/09/04/diff_4.jpg "diff_4")

また、以下のように実行すると、"Average value statistic of image" （平均画像統計値？）（0（黒）〜65535（白））が返ってくる。0 なら２つの画像が同じであることになる。

``` bash 
$ identify -format "%[mean]" diff_4.jpg
57.5885
```

#### 参考サイト

- [ImageMagick: Command-line Tools](http://www.imagemagick.org/script/command-line-tools.php "ImageMagick: Command-line Tools")

---

画像処理を頻繁に行う人間でなければ、画像を比較することは滅多にないでしょうが、知っていて損はないでしょう。

以上。

