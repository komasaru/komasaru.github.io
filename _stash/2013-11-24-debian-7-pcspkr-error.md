---
layout   : single
title    : "Debian 7 Wheezy - 起動時に pcspkr ドライバのエラー！"
published: true
date     : 2013-11-24 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
---

Debian GNU/Linux 7.1.0 Wheezy 起動時に dmesg に pcspkr ドライバ（スピーカー用ドライバ）関連のエラーが出力されることがあります。

以下、現象と原因、対策についての備忘録です。

<!--more-->

### 0. 前提条件

- Debian GNU/Linux 7.1.0 Wheezy サーバでの作業を想定。
- ハードウェア環境によっては当現象は発生しない。

### 1. 現象

マシン起動時に以下のようなエラーメッセージが出力される。（"/var/log/dmesg" に記録される）

``` bash 
[    4.345093] Error: Driver 'pcspkr' is already registered, aborting...
```

### 2. 原因

色々調べてみると、以下のようなことが原因らしい。

- 他の名前で、既にカーネルドライバが読み込まれている。

### 3. 対策

既に読み込まれているために読み込み処理を中止しているのであり、後の処理に影響は無いはずではあるが、エラーとして扱われないように "/etc/modprobe.d/blacklist.conf" に記述する。（"/etc/modprobe.d/" 配下の conf ファイルは全て読み込まれるので、名前は何でも良い）

File: `/etc/modprobe.d/blacklist.conf`

{% highlight bash linenos %}
blacklist pcspkr
{% endhighlight %}

### 4. 確認

後は、マシンを再起動して、エラーが出力されないこと、その他に影響が及んでいないことを確認する。

### 5. その他

`alsa-utils` をインストールすればよいような記事も見かけたが、こちらは未確認。

---

これでエラーが出力されなくなりました。

以上。

