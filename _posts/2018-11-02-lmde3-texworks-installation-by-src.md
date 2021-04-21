---
layout   : single
title    : "LMDE 3 - TeXworks インストール（ソースビルド）！"
published: true
date     : 2018-11-02 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- TeX
---

　$$\TeX$$ を扱うための GUI ツール TeXworks を LMDE 3 (Linux Mint Debian Edition 3) に、ソースをビルドしてインストールする方法＆設定についての記録です。

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* TeX Live 2018 がインストール済みであることを想定。（参照：「[LMDE2 - TeX Live 2016 のインストール（by ISO イメージ）！]({{site.baseurl}}/2016/08/26/texlive-installation-on-linux-mint "LMDE2 - TeX Live 2016 のインストール（by ISO イメージ）！")」）

### 1. ライブラリのインストール

TeXworks のインストールに必要なライブラリをインストールしておく。

``` text
$ sudo apt install libqt4-dev libpoppler-qt4-dev libhunspell-dev
```

依存するライブラリもインストールされる。

### 2. TeXworks のインストール

``` text
$ git clone https://github.com/TeXworks/texworks.git
$ cd texworks
$ mkdir build
$ cd build
$ cmake ..
$ make
$ sudo make install
```

### 3. TeXworks の起動

メニューの「オフィス」に "TeXworks" ができているので、クリックして起動してみる。（メニューになければ、マシンを再起動してみる）

### 4. シェルスクリプト作成

texファイル → platex → dviファイル → dvipdfmx → pdfファイル → PDFビュア という流れで tex ファイルから PDF を作成するのだが、これを一連で処理するためのスクリプトを作成する。

File: `/usr/local/texlive/2018/bin/x86_64-linux/pdfplatex.sh`

{% highlight bash linenos %}
#!/bin/sh
platex $1 || exit 1
dvipdfmx $1 || exit 1
{% endhighlight %}

そして、実行権限を付与。

``` text
$ sudo chmod +x /usr/local/texlive/2018/bin/x86_64-linux/pdfplatex.sh
```

※以降の作業でシェルの所有者によるエラーが発生する場合は、所有者を実行するユーザに変更してみる。

``` text
$ sudo chown hoge:hoge /usr/local/texlive/2012/bin/x86_64-linux/pdfplatex.sh
```

### 5. タイプセットの変更

メニューの [編集] - [設定] を開き、[タイプセット] タブの [タイプセットの方法] に "pdfpLaTeX" を追加する。

* 名前：`pdfpLaTeX`
* プログラム：`/usr/local/texlive/2018/bin/x86_64-linux/pdfplatex.sh`
* 引数：`$basename`

そして、作成した `pdfpLaTeX` を最上位に移動し、デフォルトも `pdfpLaTeX` に変更する。

### 6. 動作確認

tex ファイルを作成し、左上にあるタイプセットボタンをクリックする。 構文にエラーがなければ、自動で dvi ファイル、pdf ファイルを作成し、PDFビュアで作成された PDF が表示されるはずです。
※$$\TeX$$そのものについての詳細ここでは述べません。別途お調べ下さい。

---

以上、

