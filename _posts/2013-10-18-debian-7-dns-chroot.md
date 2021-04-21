---
layout   : single
title    : "Debian 7 Wheezy - BIND の chroot 化！"
published: true
date     : 2013-10-18 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- DNS
---

Debian GNU/Linux 7.1.0 に 構築した DNS サーバ BIND を chroot 化する方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。

ちなみに、「BIND の chroot 化」とは、仮に BIND に脆弱性があった場合に root 権限を奪われては困るので、BIND のルートディレクトリを別のディレクトリに設定することです。

<!--more-->

### 0. 前提条件

- 構築先は Debian GNU/Linux 7.1.0 を想定。
- DNS サーバ BIND が構築済みであることを想定。
- chroot ディレクトリは `/var/bind9/chroot/` とする。

### 1. BIND 停止

BIND が起動していると設定に失敗するので、BIND が起動している場合は停止する。

``` text 
# /etc/init.d/bind9 stop
```

### 2. 起動オプション編集

起動時のオプションを変更するよう "/etc/default/bind9" を編集する。

File: `/etc/default/bind9`

{% highlight bash linenos %} 
#OPTIONS="-u bind -4"
OPTIONS="-u bind -4 -t /var/bind9/chroot"
{% endhighlight %}

### 3. ディレクトリ作成

chroot 用ディレクトリを作成する。

``` text 
# mkdir -p /var/bind9/chroot/{etc,dev,var/cache/bind,var/run/named}
```

### 4. スペシャルファイル作成

chroot 化に必要なスペシャルファイルを作成し、パーミッションを変更する。

``` text 
# mknod /var/bind9/chroot/dev/null c 1 3
# mknod /var/bind9/chroot/dev/random c 1 8
# chmod 660 /var/bind9/chroot/dev/{null,random}
```

### 5. ディレクトリ移動

元々の BIND ディレクトリを chroot 用ディレクトリへ移動する。

``` text 
# mv /etc/bind /var/bind9/chroot/etc
```

### 6. シンボリックリンク作成

BIND を chroot 用ディレクトリにリンクするようシンボリックリンクを設定する。

``` text 
# ln -s /var/bind9/chroot/etc/bind /etc/bind
```

### 7. 所有者・グループ・パーミッション変更

所有者・グループ・パーミッションを変更する。

``` text 
# chown -R bind:bind /etc/bind/*
# chmod 775 /var/bind9/chroot/var/{cache/bind,run/named}
# chgrp bind /var/bind9/chroot/var/{cache/bind,run/named}
```

### 8. 起動スクリプト編集

起動スクリプト "/etc/init.d/bind9" 内の PID ファイルのパスを変更する。

File: `/etc/init.d/bind9`

{% highlight bash linenos %} 
PIDFILE=/var/bind9/chroot/var/run/named/named.pid
{% endhighlight %}

### 9. システムログ設定

rsyslog にログを出力するよう設定を編集する。

``` text 
# echo "\$AddUnixListenSocket /var/bind9/chroot/dev/log" > /etc/rsyslog.d/bind-chroot.conf
```

### 10. syslogd 再起動

システムログ設定を編集したので、syslogd を再起動する。

``` text 
# /etc/init.d/rsyslog restart
```

### 11. BIND 起動

停止していた BIND を起動する。

``` text 
# /etc/init.d/bind9 start
```

### 参考サイト

- [Bind9 - Debian Wiki](https://wiki.debian.org/Bind9#Bind_Chroot "Bind9 - Debian Wiki")

---

以上。

