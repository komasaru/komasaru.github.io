---
layout   : single
title    : "Linux - QR コード画像生成！"
published: true
date     : 2013-10-02 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
---

先日、Linux のコマンドラインからのバーコード画像（一次元）を生成してみました。

- [Linux - バーコード画像生成！]({{site.baseurl}}/2013/09/29/linux-generate-barcode-image "Linux - バーコード画像生成！")

当然、一次元のバーコード画像を生成したら次に二次元バーコードの QR コード画像も生成してみたくなります。

以下、Linux のコマンドラインから QR コード画像を生成する方法についての備忘録です。

<!--more-->

#### 0. 前提条件

- Linux Mint 14 (64bit) での作業を想定。
- 今回は、qrencode(QR Code encoder into PNG image) というパッケージを使用してインストールする。
- Mac の QREncoder とは別物であるので注意。

#### 1. パッケージインストール

パッケージからのインストールなので `apt-get install qrencode` でインストールするか、Synaptic パッケージマネージャでインストールする。

#### 2. インストール確認

qrencode がインストールされたか、バージョンを表示して確認してみる。

``` bash 
$ qrencode --version
qrencode version 3.3.0
Copyright (C) 2006-2012 Kentaro Fukuchi
```

#### 3. QR コード画像生成

`--help` オプションで、使用方法やどのようなオプションが存在するのか確認できる。

単純にバーコード画像（PNG 画像）を生成するなら、以下のようにすればよい。

``` bash 
$ qrencode -o qrcode_1.png http://www.mk-mode.com/octopress/
```

![qrcode_1]({{site.baseurl}}/images/2013/10/02/qrcode_1.png "QRコード１")

デフォルトでは、１つのドットが 3px となっているが、`-s` オプションで変更可能である。

``` bash 
$ qrencode -o qrcode_2.png -s 5 http://www.mk-mode.com/octopress/
```

![qrcode_2]({{site.baseurl}}/images/2013/10/02/qrcode_2.png "QRコード２")

QR コードは、一部が読み取り不能でも訂正できるような規格になっていて、「誤り訂正レベル」で復元可能率を指定できる。qrencode はデフォルトでは「レベルＬ（約 7% 復元可能）」となっているが、`-l` オプションで変更可能である。（値は `L` or `M` or `Q` or `H`）

``` bash 
$ qrencode -o qrcode_3.png -s 5 -l H http://www.mk-mode.com/octopress/
```

![qrcode_3]({{site.baseurl}}/images/2013/10/02/qrcode_3.png "QRコード３")

デフォルトでは、PNG 形式の画像が生成されるが、`-t` オプションで EPS, ANSI, ANSI256, ASCII 形式の画像が生成されるようにすることも可能である。

``` bash 
$ qrencode -o qrcode_4.eps -t EPS http://www.mk-mode.com/octopress/
```

#### 4. バーコード読み取りテスト

生成された QR コードが正しいか、正しく読み取れるか、読み取り装置（もちろん、携帯端末搭載のものでも可）で実際に読み取ってみるとよい。正常に読み取れるはずである。

---

これで、GNU Barcode で不可能だった QR コード生成もできるようになりました。

以上。

