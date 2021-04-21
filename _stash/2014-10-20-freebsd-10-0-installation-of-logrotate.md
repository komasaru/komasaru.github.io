---
layout   : single
title    : "FreeBSD 10.0 - ログローテーション logrotate インストール！"
published: true
date     : 2014-10-20 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- FreeBSD
---

「FreeBSD 10.0 - ログローテーション logrotate インストール」についての記録です。

（旧バージョンでの個人の作業記録を更新しました。興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* 以下の作業は、リモート接続して行う。（リモートから `ssh vbox` で接続）
* リモート端末は、 Linux Mint 17 マシンを想定しているが、 Unix 系 OS なら同じ。
* 設定ファイル等のテキストファイルの編集には `vi` コマンドを使用。
* 作業はリモート接続で一般ユーザから root になって行う。
* 主に[FreeBSDサーバー構築マニュアル](http://freebsd.server-manual.com/ "FreeBSDサーバー構築マニュアル")を参照。

### 1. logrotate インストール

``` text
# cd /usr/ports/sysutils/logrotate
# make BATCH=yes install clean
# cd
```

### 2. logrotate 設定ファイル編集

まず、サンプルの設定ファイルから複製。

``` text
# cp /usr/local/etc/logrotate.conf.sample /usr/local/etc/logrotate.conf
```

そして、取り急ぎ以下のように編集。

File: `/usr/local/etc/logrotate.conf`

{% highlight bash linenos %}
#compress            # <= コメント化（圧縮しない）

#/var/log/lastlog {  # <= コメント化（lastlog はローテーションしない）
#    monthly         # <=     〃
#    rotate 1        # <=     〃
#}                   # <=     〃
{% endhighlight %}

更に、各種設定ファイル格納ディレクトリ（include 用）を作成。

``` text
# mkdir /usr/local/etc/logrotate.d
```

最後に、定時実行されるよう cron に登録。（以下を最終行に追記）

File: `/etc/crontab`

{% highlight bash linenos %}
0       0       *       *       *       root    /usr/local/sbin/logrotate /usr/local/etc/logrotate.conf > /dev/null 2>&1
{% endhighlight %}

### 3. その他

ステータスを更新する場合は、以下のようにすればよい。

``` text
# logrotate -d /usr/local/etc/logrotate.conf
```

強制的にログローテーションを実行する場合は、以下のようにすればよい。

``` text
# logrotate -f /usr/local/etc/logrotate.conf
```

---

以上。

