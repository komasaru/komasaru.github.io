---
layout   : single
title    : "Debian 9 (Stretch) - DNS サーバ BIND9 の chroot 化！"
published: true
date     : 2017-08-22 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- DNS
---

Debian GNU/Linux 9 (Stretch) に構築した DNS サーバを chroot 化する方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 9 (Stretch) での作業を想定。
* DNS サーバ BIND が構築済みであることを想定。
* chroot ディレクトリは `/var/bind9/chroot/` とする。
* root ユーザでの作業を想定。

### 1. BIND の停止

BIND が起動していると設定に失敗するので、BIND が起動している場合は停止する。

``` text
# systemctl stop bind9
```

### 2. 起動オプションの編集

起動時のオプションを変更するよう "/etc/default/bind9" を編集する。

File: `/etc/default/bind9`

{% highlight bash linenos %}
#OPTIONS="-u bind -4"
OPTIONS="-u bind -4 -t /var/bind9/chroot"
{% endhighlight %}

もしくは、 SystemD のスクリプトを編集する必要があるかもしれない。※微妙な環境の違いによる

File: `/lib/systemd/system/bind9.service`

{% highlight bash linenos %}
[Service]
ExecStart=/usr/sbin/named -f -u bind -4 -t /var/bind9/chroot  # <= 変更
ExecReload=/usr/sbin/rndc reload
ExecStop=/usr/sbin/rndc stop
{% endhighlight %}

### 3. ディレクトリの作成

chroot 用ディレクトリを作成する。

``` text
# mkdir -p /var/bind9/chroot/{etc,dev,var/cache/bind,var/run/named}
```

### 4. スペシャルファイルの作成

chroot 化に必要なスペシャルファイルを作成し、パーミッションを変更する。

``` text
# mknod /var/bind9/chroot/dev/null c 1 3
# mknod /var/bind9/chroot/dev/random c 1 8
# chmod 660 /var/bind9/chroot/dev/{null,random}
```

### 5. ディレクトリの移動

元々の BIND ディレクトリを chroot 用ディレクトリへ移動する。

``` text
# mv /etc/bind /var/bind9/chroot/etc
```

### 6. シンボリックリンクの作成

BIND を chroot 用ディレクトリにリンクするようシンボリックリンクを設定する。

``` text
# ln -s /var/bind9/chroot/etc/bind /etc/bind
```

### 7. 所有者・グループ・パーミッションの変更

``` text
# chown -R bind:bind /etc/bind/*
# chmod 775 /var/bind9/chroot/var/{cache/bind,run/named}
# chgrp bind /var/bind9/chroot/var/{cache/bind,run/named}
```

### 8. 起動スクリプトの編集

起動スクリプト "/etc/init.d/bind9" 内の PID ファイルのパスを変更する。

File: `/etc/init.d/bind9`

{% highlight bash linenos %}
PIDFILE=/var/bind9/chroot/var/run/named/named.pid
{% endhighlight %}

### 9. システムログの設定

rsyslog にログを出力するよう設定を編集する。（ファイル新規作成）

File: `/etc/rsyslog.d/bind-chroot.conf`

{% highlight text linenos %}
$AddUnixListenSocket /var/bind9/chroot/dev/log
{% endhighlight %}

### 10. syslogd の再起動

システムログ設定を編集したので、syslogd を再起動する。

``` text
# systemctl restart rsyslog
```

### 11. BIND の起動

停止させていた BIND を起動する。

"/lib/systemd/system/bind9.service" を編集した場合は、まず以下を実行し、

``` text
# systemctl daemon-reload
```

そして、以下を実行。

``` text
# systemctl start bind9
```

### 参考サイト

- [Bind9 - Debian Wiki](https://wiki.debian.org/Bind9#Bind_Chroot "Bind9 - Debian Wiki")

---

以上。

