---
layout   : single
title    : "Linux Mint - R インストール！"
published: true
date     : 2013-05-11 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- LinuxMint
- R
---

Redhat 系ディストリビューションでの R（統計解析向けプログラミング言語）のインストール方法は、以前記録していました。

- [* Scientific Linux - R 言語環境構築！ - mk-mode BLOG](http://www.mk-mode.com/octopress/2012/10/12/12002003/ "* Scientific Linux - R 言語環境構築！ - mk-mode BLOG")

GNU 系ディストリビューションでの R のインストール方法について記録を残していなかったので、記録しておきます。

<!--more-->

### 0. 前提条件

- Linux Mint 14 Nadia (64bit) での作業を想定しているが、GNU 系ディストリビューション（Debian, Ubuntu 等）も同様だと思われる。

### 1. sources.list 編集

デフォルトでは apt でインストールできない。パッケージのダウンロード元を追加する設定が必要。  
当記事執筆時点、日本国内に３つのミラーサイトがあるので、好みのサイトを `sources.list` で指定する。  
（以下の３つのうちどれか１つ）

File: `/etc/apt/sources.list`

{% highlight bash linenos %}
deb http://essrc.hyogo-u.ac.jp/cran/bin/linux/ubuntu quantal/
deb http://cran.md.tsukuba.ac.jp/bin/linux/ubuntu quantal/
deb http://cran.ism.ac.jp/bin/linux/ubuntu quantal/
{% endhighlight %}

`quantal` は Linux Mint 14 が Ubuntu 12.10 ベースだから。
10.04 なら `lucid`、12.04 なら `precise` というようになる。

### 2. GPG 公開鍵設定

``` text 
$ gpg --keyserver keyserver.ubuntu.com --recv-key E084DAB9
$ gpg -a --export E084DAB9 | sudo apt-key add -
```

### 3. apt パッケージリスト更新

前述で指定したダウンロード元を有効化するため、apt パッケージリストを更新する。

``` text 
$ sudo apt-get update
```

### 4. R インストール

以下のようにして、R をインストールする。  
（Synaptic パッケージマネージャでインストールすることも可能）

``` text 
$ sudo apt-get install r-base
```

### 5. R 起動

インストールできているか R を起動してみる。  
（メニューの [グラフィックス] - [R] を起動してもよい）

``` text 
$ R

R version 2.15.3 (2013-03-01) -- "Security Blanket"
Copyright (C) 2013 The R Foundation for Statistical Computing
ISBN 3-900051-07-0
Platform: x86_64-pc-linux-gnu (64-bit)

Rは、自由なソフトウェアであり、「完全に無保証」です。 
一定の条件に従えば、自由にこれを再配布することができます。 
配布条件の詳細に関しては、'license()'あるいは'licence()'と入力してください。 

Rは多くの貢献者による共同プロジェクトです。 
詳しくは'contributors()'と入力してください。 
また、RやRのパッケージを出版物で引用する際の形式については 
'citation()'と入力してください。 

'demo()'と入力すればデモをみることができます。 
'help()'とすればオンラインヘルプが出ます。 
'help.start()'でHTMLブラウザによるヘルプがみられます。 
'q()'と入力すればRを終了します。 

> 
```

### 6. R 動作確認

デモを動かしてみる。

``` text 
> demo(persp)
```

Enter キーで次から次へと表示される。

![R_DEMO]({{site.baseurl}}/images/2013/05/11/R_DEMO.png "R_DEMO")

### 7. 参考サイト

- [The R Project for Statistical Computing](http://www.r-project.org/ "The R Project for Statistical Computing")

---

やはり、綺麗なグラフを作成するには必須のツールです。

以上。

