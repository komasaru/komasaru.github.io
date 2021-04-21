---
layout   : single
title    : "Linux - バーコード画像生成！"
published: true
date     : 2013-09-29 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
---

Linux のコマンドラインからバーコード画像を生成する方法についての記録です。

以前、職務の都合で Windows マシンからバーコードを生成してラベラーに出力することはしたことがありました。

今回は、Linux のコマンドラインからのバーコード生成が可能かどうか確認してみた次第です。

<!--more-->

#### 0. 前提条件

- Linux Mint 14 (64bit) での作業を想定。
- インストールするソフトは GNU Barcode というソフト。
- 今回は、ソースを取得後ビルドしてインストールする。（パッケージからのインストールしてもよい。）
- JANコード（13桁）、短JANコード（８桁）は、それぞれ EAN13, EAN8 であると認識しておく。

#### 1. アーカイブファイルダウンロード

アーカイブファイルをダウンロードする。  
今回は、当記事執筆時点で最新の Ver.0.99 をダウンロードする。（ただし、ページには beta 版である旨が記載される。問題があるようなら Ver.0.98 をダウンロードする。当方は、問題なかった。）

``` bash 
$ wget http://ftp.gnu.org/gnu/barcode/barcode-0.99.tar.gz
```

#### 2. アーカイブファイル展開

ダウンロードしたアーカイブファイルを展開し、展開されたディレクトリ内へ移動する。

``` bash 
$ tar zxvf barcode-0.99.tar.gz
$ cd barcode-0.99
```

#### 3. ビルド＆インストール

以下のように、`configure`, `make`, `make install` を行う。（よくある方法）  
最後に一時ファイルを削除する。

``` bash 
$ ./configure
$ make
$ sudo make install
$ make clean
```

#### 4. インストール確認

GNU Barcode がインストールされたか、バージョンを表示して確認してみる。

``` bash 
$ barcode --version
GNU barcode 0.99 is a tool to convert text strings to printed bars.

License GPLv3+: GNU GPL version 3 or later <http://gnu.org/licenses/gpl.html>.
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.

Mail bug reports and suggestions to <bug-barcode@gnu.org>.
```

#### 5. バーコード画像生成

`--help` オプション（実際は、存在しないオプションなら何でもよい）で、どのようなオプションが存在するのか、どのような種類のバーコードがサポートされているのか確認できる。

単純にバーコード画像（EPS 画像）を生成するなら、以下のようにすればよい。

`-b` でバーコードを生成したい数字の文字列を指定する。  
オプション `-t 3x10` は A4 用紙を3行10列のテーブルとみなし、左上に描画するという意味。（余白を入れたければ `-t 3x10+10+8` のように px 単位で追記する）

``` bash 
$ barcode -b 4901777216907 -t 3x10 -o barcode_1.eps
```

![barcode_1]({{site.baseurl}}/images/2013/09/29/barcode_1.png "バーコード１")

オプション `-g 160x60` は A4 用紙の左下を基準にして、ｘ軸方向に 160px, ｙ軸方向に 60px の位置に描画する。（余白を入れたければ `-g 160x60+20+10` のように px 単位で追記する）

``` bash 
$ barcode -b 4901777216907 -g 160x40 -o barcode_2.eps
```

![barcode_2]({{site.baseurl}}/images/2013/09/29/barcode_2.png "バーコード２")

一度に複数のバーコードを生成するなら `-b` オプションを続けて指定する。

``` bash 
$ barcode -b 4901777216907 -b 1234567890123 -t 3x10+10+10 -o barcode_3.eps
```

![barcode_3]({{site.baseurl}}/images/2013/09/29/barcode_3.png "バーコード３")

ちなみに、バーコード下の数字が小さく表示されるのは、チェックデジット（最後の１文字）が誤っているからであり、修正すれば数字が大きくなる。

``` bash 
$ barcode -b 4901777216907 -b 1234567890128 -t 3x10+10+10 -o barcode_4.eps
```

![barcode_4]({{site.baseurl}}/images/2013/09/29/barcode_4.png "バーコード４")

また、生成される画像は EPS 形式（PS-Adobe-2.0形式）であるが、EPS 形式以外の形式にしたければ、画像処理ソフト ImageMagick の `convert` コマンド等で適宜変換するとよい。

#### 6. バーコード読み取りテスト

生成されたバーコードが正しいか、正しく読み取れるか、バーコードリーダ（もちろん、携帯端末搭載のものでも可）で実際に読み取ってみるとよい。正常に読み取れるはずである。

#### 参考サイト

- [Barcode - GNU Project - Free Software Foundation](http://www.gnu.org/software/barcode/ "Barcode - GNU Project - Free Software Foundation")

---

色々な規格のバーコードに対応していますが、ITF（日本国内の場合は 13 桁のJANコードに 1 桁の物流コードを付与した 14桁 で標準化されている）には（厳密には）対応していないようです。（生成されないことはないですが、チェックデジットが効かなかったりします。）

また、日本発祥の二次元バーコード「ＱＲコード」も対応していないようです。

以上。

