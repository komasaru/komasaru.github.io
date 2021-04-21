---
layout   : single
title    : "opensource COBOL - Linux Mint にインストール！"
published: true
date     : 2014-03-07 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Cobol
---

opensource COBOL は GNU Cobol（以前の OpenCOBOL）を日本特有のビジネス環境に対応すべく拡張したオープンソースの Cobol 開発環境です。

日本特有のビジネス環境にこだわらなければ、 GNU Cobol(OpenCOBOL) でもよいでしょう。

<!--more-->

### 0. 前提条件

- Linux Mint 13(Maya, 64bit) での作業を想定。
- GNU Cobol(以前の OpenCOBOL) ではなく、opensource COBOL なので混同しないこと。  
  しかし、基本的なことは GNU Cobol(OpenCOBOL) と同じだと考えてよい。
- Redhat 系（RPM でのパッケージ管理）環境なら RPM ファイルをダウンロードしてインストールしてもよいだろう。

### 1. GMP ライブラリインストール

opensource COBOL のコンパイルに GMP(GNU Multi Precision) という「任意精度数演算ライブラリ」が必要なので、アーカイブをダウンロード＆展開して、ビルド＆インストールする。（当記事執筆時点では GMP 5.1.3 が最新）

``` text
$ wget https://gmplib.org/download/gmp/gmp-5.1.3.tar.bz2
$ tar jxvf gmp-5.1.3.tar.bz2
$ cd gmp-5.1.3
$ ./configure
$ make
$ sudo make install
```

### 2. libdb-dev インストール

opensource COBOL のコンパイルに必要な libdb-dev という Berkeley DB ライブラリをインストールしておく。

``` text
$ sudo apt-get -y install libdb-dev
```

### 3. アーカイブダウンロード

「[ダウンロード - OSSコンソーシアム](http://www.osscons.jp/osscobol/download/ "ダウンロード - OSSコンソーシアム")」から最新の tarball をダウンロードしておく。  
当方は、当記事執筆時点で最新の UTF-8 版 "opensource-cobol-1.3.1J-utf8.tar.gz" をダウンロードした。（当記事公開時点では 1.3.2J が最新の模様）

### 4. ビルド＆インストール

アーカイブを展開して、ビルド＆インストールする。

``` text
$ tar zxvf opensource-cobol-1.3.1J-utf8.tar.gz
$ cd opensource-cobol-1.3.1J
$ ./configure
$ make
$ sudo make install
```

### 5. インストール確認

インストールされたかバージョンを表示して確認してみる。

``` text
$ cobc -V
opensource COBOL 1.3.1J
OSS Consortium's patched version of OpenCOBOL1.1(Feb.06 2009)
----
cobc (OpenCOBOL) 1.1.0
Copyright (C) 2001-2009 Keisuke Nishida / Roger While
Built    Mar 04 2014 14:22:09
Packaged 12月 16 2013 12:50:09 JST
```

### 6. 動作確認用ソースコード作成

動作確認用に簡単なソースコードを作成してみる。（COBOL なので、当然ながら 8 〜 72 カラムに記述する）

File: `hello.cob`

{% highlight text linenos %}
       IDENTIFICATION                   DIVISION.
       PROGRAM-ID.                      HELLO.
       AUTHOR.                          mk-mode.
       ENVIRONMENT                      DIVISION.
       DATA                             DIVISION.
       WORKING-STORAGE                  SECTION.
       77 CNT       PIC 9(02)           VALUE 0.
       PROCEDURE                        DIVISION.
           PERFORM 10 TIMES
               ADD 1  TO CNT
               DISPLAY "[" CNT "]"
                       "ようこそ、opensource COBOL の世界へ！"
           END-PERFORM.
       STOP RUN.
{% endhighlight %}

### 7. ソースコードコンパイル

作成したソースコードをコンパイルする。

``` text
$ cobc -x hello.cob
```

メッセージが何も出力されなければコンパイルに成功し、同じディレクトリに "hello" というバイナリファイルが作成される。

### 8. 動作確認

作成されたバイナリファイルを実行してみる。

``` text
$ ./hello
./hello: error while loading shared libraries: libcob.so.1: cannot open shared object file: No such file or directory
```

上記のようになる場合は、共有ライブラリがまだ認識されていないためなので、以下のようにする。

``` text
$ sudo ldconfig
```

正常に実行されれば以下のようになるはず。

``` text
$ ./hello
[01]ようこそ、opensource COBOL の世界へ！
[02]ようこそ、opensource COBOL の世界へ！
[03]ようこそ、opensource COBOL の世界へ！
[04]ようこそ、opensource COBOL の世界へ！
[05]ようこそ、opensource COBOL の世界へ！
[06]ようこそ、opensource COBOL の世界へ！
[07]ようこそ、opensource COBOL の世界へ！
[08]ようこそ、opensource COBOL の世界へ！
[09]ようこそ、opensource COBOL の世界へ！
[10]ようこそ、opensource COBOL の世界へ！
```

### 参考サイト

- [オープンCOBOLソリューション部会 - OSSコンソーシアム](http://www.osscons.jp/osscobol/ "オープンCOBOLソリューション部会 - OSSコンソーシアム")
- [GNU Cobol (formerly OpenCOBOL) - Browse Files at SourceForge.net](http://sourceforge.net/projects/open-cobol/files/ "GNU Cobol (formerly OpenCOBOL) - Browse Files at SourceForge.net")
- [COBOL言語をLinux環境で動かす （1/4）：CodeZine](http://codezine.jp/article/detail/2291 "COBOL言語をLinux環境で動かす （1/4）：CodeZine")
- [The GNU MP Bignum Library](https://gmplib.org/ "The GNU MP Bignum Library")

---

当方元々 COBOLer なので、「昔取った杵柄」でプライベートなマシンに開発環境を整えてはみたものの、実際には使用することはないでしょう。  
「自分のマシンで『開発することが可能』ということが確認できた」ということに留めておく。

今なお公共系・勘定系等では莫大な COBOL 資源が存在しているので、それらの現場で開発に従事していれば別ですが。。。  
でも、記憶が蘇って懐かしかった。

以上。

