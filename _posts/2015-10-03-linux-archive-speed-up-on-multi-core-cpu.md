---
layout   : single
title    : "Linux - マルチコア CPU で高速圧縮！"
published: true
date     : 2015-10-03 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
---

通常、 Linux の `tar` コマンドでファイル等の圧縮を行う場合、 CPU コアを１つしか使用しません。

２つ以上 CPU コアを搭載していることの多い昨今、 CPU コアを全て使用して圧縮を行うと時間の節約になります。

今回、圧縮・解凍をマルチコアで並列に処理してくれる `pigz` を使用してみました。

<!--more-->

### 0.前提条件

* Linux Mint 17.2(64bit) での作業を想定。
* Intel Core2Duo CPU E8500 (3.16GHz x 2) での作業を想定。

### 1. pigz のインストール

Apt パッケージを使用する（但し、最新版ではない可能性が高い）

``` text
$ sudo apt-get install pigz
```

もしくは、最新版アーカイブを取得＆展開後、 `make` して適当な位置に配置してもよい。（但し、当方の環境ではビルドエラーになった）

``` text
$ wget http://zlib.net/pigz/pigz-2.3.3.tar.gz
$ tar zxvf pigz-2.3.3.tar.gz
$ cd pigz-2.3.3
$ make
$ sudo mv ./pigz /usr/local/bin/pigz
$ sudo mv ./unpigz /usr/local/bin/unpigz
```

### 2. pigz インストールの確認

``` text
$ pigz --version
pigz 2.3
```

### 3. 圧縮

比較のため、まず `tar` コマンドで圧縮してみる。  
（圧縮対象は、サブディレクトリ：2層、ファイル数：121,653個、容量：約100MB の "test" という名称のディレクトリ）

``` text
$ time tar zcf test.tar.gz test

real    0m4.711s
user    0m4.402s
sys     0m0.938s
```

次に、 pigz 圧縮してみる。  
ディレクトリを再帰的に圧縮できる `-r` もあるが、これはファイルそれぞれが圧縮されてしまうので、 `tar` コマンドで一旦ファイルをまとめてから `pigz` コマンドで圧縮する。また、デフォルトでは全てのプロセッサを使用するが、同時実行スレッド数を指定する `-p` オプション等もある。

``` text
$ time tar c test | pigz > test.tar.gz

real    0m2.987s
user    0m4.624s
sys     0m0.682s
```

ちなみに、単純に１つのファイルを圧縮するだけなら `pigz -k test.tar.gz` でよい（`-k` は元のファイルを残すオプション）。

さらに、 `pigz` コマンドを `tar` コマンドのオプションで使用して圧縮してみる。

``` text
$ time tar cf test.tar.gz test --use-compress-program=pigz

real    0m2.970s
user    0m4.542s
sys     0m0.632s
```

### 4. 解凍

まず、単純に `tar` コマンドで圧縮したファイルを解凍してみる。

``` text
$ time tar zxf test.tar.gz

real    0m18.441s
user    0m1.813s
sys     0m3.022s
```

次に、 `pigz` で圧縮したファイルを `tar` コマンドで解凍してみる。

``` text
$ time tar xf test.tar.gz --use-compress-program=pigz

real    0m17.526s
user    0m1.193s
sys     0m3.310s
```

### 5. 所感

* コア数 2 の非力な環境でも約 2/3 の速度で圧縮することができたのだが、場合によっては pigz を使用する方が遅くなることもある。
* 今回、解凍についてはそれほど差が認められなかった。
* 当然、環境によって結果は異なるだろう。

従って、当方は明らかに圧縮の高速化が見込める場合のみ pigz を使用することとした。

### 6. 参考サイト

* [pigz - Parallel gzip](http://zlib.net/pigz/ "pigz - Parallel gzip")

---

非力な環境では、それほど積極的に使用したいと思うようなコマンドでもありませんでした。

しかし、コアを複数使用して圧縮・解凍ができる、といういことを認識できたことに若干の喜びを感じた次第です。

以上。

