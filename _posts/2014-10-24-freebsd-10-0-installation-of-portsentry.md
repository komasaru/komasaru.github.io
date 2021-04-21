---
layout   : single
title    : "FreeBSD 10.0 - ポートスキャン遮断 PortSentry インストール！"
published: true
date     : 2014-10-24 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- FreeBSD
---

「FreeBSD 10.0 - ポートスキャン遮断 PortSentry インストール」についての記録です。

（旧バージョンでの個人の作業記録を更新しました。興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* 以下の作業は、リモート接続して行う。（リモートから `ssh vbox` で接続）
* リモート端末は、 Linux Mint 17 マシンを想定しているが、 Unix 系 OS なら同じ。
* 設定ファイル等のテキストファイルの編集には `vi` コマンドを使用。
* 作業はリモート接続で一般ユーザから root になって行う。
* 主に[FreeBSDサーバー構築マニュアル](http://freebsd.server-manual.com/ "FreeBSDサーバー構築マニュアル")を参照。

### 1. PortSentry インストール

``` text
# cd /usr/ports/security/portsentry
# make BATCH=yes install clean
# cd
```

### 2. PortSentry 設定

``` text
# cp /usr/local/etc/portsentry.conf.default /usr/local/etc/portsentry.conf
# chmod 640 /usr/local/etc/portsentry.conf
```

File: `/usr/local/etc/portsentry.conf`

{% highlight bash linenos %}
#KILL_ROUTE="/bin/echo 'block in log on external_interface from $TARGET$/32 to any' | /sbin/ipf -f -"
KILL_ROUTE="/bin/echo 'block in log on external_interface from $TARGET$/32 to any' | /sbin/ipf -f -"  # <= コメント解除
{% endhighlight %}

### 3. PortSentry 起動

``` text
# /usr/local/etc/rc.d/portsentry.sh start
 portsentry (tcp udp)
```

### 4. PortSentry 起動確認

``` text
# ps ax | grep port
1158  -  Is    0:00.00 /usr/local/bin/portsentry -tcp
1160  -  Is    0:00.00 /usr/local/bin/portsentry -udp
```

---

以上。

