---
layout   : single
title    : "Linux Mint - tmux 2.1 のインストール（by ソースビルド）！"
published: true
date     : 2015-08-03 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- LinuxMint
- tmux
---

ターミナルマルチプレクサ（仮想端末マネージャ）である tmux(Terminal MUltipleXer) の最新版を Linux Mint へインストールする方法についての記録です。

これまで Apt パッケージでインストールした tmux 1.8 を使用していました。  
しかし、使用したいプラグインが tmux 1.9 未満ではインストールできないため、最新版の 2.1 をソースビルドでインストールすることとしました。

<!--more-->

### 0. 前提条件

* Linux Mint 17.2(64bit) での作業を想定。
* Git でソースを取得するため Git がインストール済みであること。
* 当記事執筆時点で最新の tmux 2.1 をインストールする。
* Apt でインストールしていた tmux 1.8 はアンインストールしておく。

### 1. libevent-dev のインストール

libevent-dev 2.x のパッケージが必要なので未インストールならインストールする。  
（以前は Apt では 2.x はインストールできずソースをビルドしてインストールする必要があったが、今は Apt で 2.x がインストール可能）

``` text
$ sudo apt-get install autoconf automake pkg-config libncurses5-dev libevent-dev
```

### 2. tmux のインストール

Git でソースを `clone` して、 `configure`, `make`, `make install` する。  
（但し、`configure` 実行前に `autogen.sh` の実行が必要）

``` text
$ git clone https://github.com/tmux/tmux.git
$ cd tmux
$ ./autogen.sh
$ ./configure
$ make
$ sudo make install
```

### 3. tmux インストールの確認

端末から `tmux` と入力・実行して tmux が起動すればよい。  
また、tmux コンソールが起動後にバージョンも確認してみる。

``` text
$ tmux -V
tmux 2.1
```

もしも、 tmux 起動時に以下のようなメッセージが出力されて起動しない場合は、

``` text
protocol version mismatch (client 8, server 7)
```

古いバージョンの tmux サーバのセッションが残っているため。  
その場合は、以下のように起動中の tmux プロセスを kill すればよい。（厳密に PID をチェックして `kill` してもよい）

``` text
$ killall tmux
```

### 4. その他

その他、各種設定を行う。

当ブログ過去記事も参照。

* [Tag:tmux - mk-mode BLOG](http://www.mk-mode.com/octopress/tags/tmux/ "Tag:tmux - mk-mode BLOG")

一つだけ注意するとするなら、マウスモードの指定方法。  
古いバージョンでは "~/.tmux.conf" で以下のように指定していたが、

File: `~/.tmux.conf`

{% highlight bash linenos %}
set-option -g mode-mouse on
set-option -g mouse-select-pane on
set-option -g mouse-select-window on
set-option -g mouse-resize-pane on
{% endhighlight %}

今のバージョンでは以下のように１行のみ指定すればよい。

File: `~/.tmux.conf`

{% highlight bash linenos %}
set-option -g mouse on
{% endhighlight %}

但し、これだけではマウスでのスクロールができないので、以下のような記述も追加する。

File: `~/.tmux.conf`

{% highlight bash linenos %}
bind-key -n WheelUpPane if-shell -Ft= "#{?pane_in_mode,1,#{alternate_on}}" "send-keys -M" "copy-mode"
{% endhighlight %}

（`set-option` = `set`, `bind-key` = `bind`, `send-keys` = `send` とエイリアスされているので、置き換えてもよい）

### 参考サイト

* [tmux](http://tmux.github.io/ "tmux")

---

これで、使用したかった tmux プラグインが使用できるでしょう。

以上。

