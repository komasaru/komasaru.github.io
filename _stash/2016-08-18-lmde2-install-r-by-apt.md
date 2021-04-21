---
layout   : single
title    : "LMDE2 - R インストール（by Apt パッケージ）！"
published: true
date     : 2016-08-18 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- LinuxMint
- LMDE2
- R
---

以前、 Scientific Linux や Linux Mint のデスクトップ環境に統計解析向けプログラミング言語 R をインストールしたことを記事にしました。

* [Scientific Linux - R 言語環境構築！]({{site.baseurl}}/2012/10/12/12002003/ "Scientific Linux - R 言語環境構築！")
* [Linux Mint - R インストール！]({{site.baseurl}}/2013/05/11/linuxmint-install-r/ "Linux Mint - R インストール！")

今回は、 LMDE2(Linux Mint Debian Edition 2) のデスクトップ環境にインストールする方法についての記録です。（Linux Mint にインストールした際と若干異なる部分があったし、本家 Web サイトにはソースからのビルドインストールについての説明しかないので）

<!--more-->

### 0. 前提条件

* LMDE2(Linux Mint Debian Edition 2) での作業を想定。
* Apt パッケージの取り扱いは `aptitude` や `apt-get` コマンではなく `apt` コマンドで行っている。

### 1. ソースリストの作成

File: `/etc/apt/sources.list.d/r.list`

{% highlight bash linenos %}
deb http://cran.ism.ac.jp/bin/linux/debian jessie-cran3/
{% endhighlight %}

（"/etc/apt/sources.list" に直接追記してもよい）

### 2. GPG 公開鍵の設定

``` text
$ sudo apt-key adv --keyserver keys.gnupg.net --recv-key 381BA480
```

### 3. パッケージリストの更新

``` text
$ sudo apt update
```

### 4. R のインストール

``` text
$ sudo apt install r-base r-base-dev
```

### 5. R の起動（インストールの確認）

``` text
$ R

R version 3.3.1 (2016-06-21) -- "Bug in Your Hair"
Copyright (C) 2016 The R Foundation for Statistical Computing
Platform: x86_64-pc-linux-gnu (64-bit)

R は、自由なソフトウェアであり、「完全に無保証」です。
一定の条件に従えば、自由にこれを再配布することができます。
配布条件の詳細に関しては、'license()' あるいは 'licence()' と入力してください。

R は多くの貢献者による共同プロジェクトです。
詳しくは 'contributors()' と入力してください。
また、R や R のパッケージを出版物で引用する際の形式については
'citation()' と入力してください。

'demo()' と入力すればデモをみることができます。
'help()' とすればオンラインヘルプが出ます。
'help.start()' で HTML ブラウザによるヘルプがみられます。
'q()' と入力すれば R を終了します。

>
```

### 6. 動作確認

``` text
> demo(persp)
```

Enter キーで次から次へと表示される。

![R_DEMO]({{site.baseurl}}/images/2016/08/18/R_DEMO.png "R_DEMO")

また、以下のようにスクリプトを記述すると、

``` text

> x <- seq(-10, 10, length= 50);   y <- x
> f <- function(x, y) { r <- sqrt(x^2+y^2); 10 * sin(r)/r }
> z <- outer(x, y, f);
> persp(x, y, z, theta=30, phi=30, expand=0.5, ltheta=100, shade=0.5)
> persp(x, y, z, theta = 30, phi = 30, expand = 0.5, col = rainbow(50), border=NA)
```

次のような画像が出力される。

![R_DEMO_2]({{site.baseurl}}/images/2016/08/18/R_DEMO_2.png "R_DEMO_2")

終了は

``` text
> q()
```

### 7. 参考サイト

* [R: The R Project for Statistical Computing](https://www.r-project.org/ "R: The R Project for Statistical Computing")
* [The Comprehensive R Archive Network](https://cran.ism.ac.jp/ "The Comprehensive R Archive Network")

---

以上。

