---
layout   : single
title    : "CentOS 6.5 - Web サーバ Nginx 構築（ソースインストール）！"
published: true
date     : 2014-01-05 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- Nginx
---

前回は CentOS 6.5 サーバで Fetchmail による複数ドメイン宛メールの集約を行いました。  
今回は Web サーバ Nginx の構築（ソースをビルドしてインストール）を行います。

<!--more-->

### 0. 前提条件

- CentOS 6.5(x86_64) を Minimal で最小インストールしている。
- クライントマシンは Linux Mint 14(64bit) を想定。
- ソースを取得し、ビルドしてインストールする。
- 当記事執筆時点で最新の安定版 1.4.4 をインストールする。
- 過去にこのサイトを参考にして作業した際に記録していたものを参照している。

### 1. 必要パッケージインストール

ソースビルドに必要なパッケージをあらかじめインストールしておく。

``` text
# yum install gcc pcre pcre-devel zlib zlib-devel openssl openssl-devel
```

### 2. アーカイブダウンロード

``` text
# cd /usr/local/src
# wget http://nginx.org/download/nginx-1.4.4.tar.gz
# tar zxvf nginx-1.4.4.tar.gz
```

### 3. ビルド・インストール

`configure`, `make`, `make install` でインストールし、バージョンアップ時にリンク先を変更するだけで済むようリンクを設定する。

``` text
# cd nginx-1.4.4
# ./configure --prefix=/usr/local/nginx-1.4.4 \
--user=nginx \
--group=nginx \
--pid-path=/var/run/nginx.pid \
--error-log-path=/var/log/nginx/error.log \
--http-log-path=/var/log/nginx/access.log \
--lock-path=/var/run/nginx.lock \
--with-http_ssl_module \
--with-http_realip_module \
--with-http_stub_status_module
# make
# make install
# ln -s /usr/local/nginx-1.4.4 /usr/local/nginx
# cd
```

configure オプションの `--with-http_stub_status_module` は今後 munin で `stub_status` を用したいため。

### 4. インストール確認

``` text
# /usr/local/nginx/sbin/nginx -V
nginx version: nginx/1.4.4
built by gcc 4.4.7 20120313 (Red Hat 4.4.7-4) (GCC)
TLS SNI support enabled
configure arguments: --prefix=/usr/local/nginx-1.4.4 --user=nginx --group=nginx --pid-path=/var/run/nginx.pid --error-log-path=/var/log/nginx/error.log --http-log-path=/var/log/nginx/access.log --lock-path=/var/run/nginx.lock --with-http_ssl_module --with-http_realip_module --with-http_stub_status_module
```

### 5. 設定

設定は、取り急ぎデフォルトのままとした。

### 6. 起動スクリプト

Nginx サービス起動用スクリプトを以下のように作成する。

File: `/etc/rc.d/init.d/nginx`

{% highlight bash linenos %}
#!/bin/sh
#
# nginx - this script starts and stops the nginx daemon
#
# chkconfig:   - 85 15
# description:  Nginx is an HTTP(S) server, HTTP(S) reverse \
#               proxy and IMAP/POP3 proxy server
# processname: nginx
# config:      /usr/local/nginx/conf/nginx.conf
# config:      /etc/sysconfig/nginx
# pidfile:     /var/run/nginx.pid

# Source function library.
. /etc/rc.d/init.d/functions

# Source networking configuration.
. /etc/sysconfig/network

# Check that networking is up.
[ "$NETWORKING" = "no" ] && exit 0

nginx="/usr/local/nginx/sbin/nginx"
prog=$(basename $nginx)

NGINX_CONF_FILE="/usr/local/nginx/conf/nginx.conf"

[ -f /etc/sysconfig/nginx ] && . /etc/sysconfig/nginx

lockfile=/var/lock/subsys/nginx

make_dirs() {
   # make required directories
   user=`$nginx -V 2>&1 | grep "configure arguments:" | sed 's/[^*]*--user=\([^ ]*\).*/\1/g' -`
   if [ -z "`grep $user /etc/passwd`" ]; then
       useradd -M -s /bin/nologin $user
   fi
   options=`$nginx -V 2>&1 | grep 'configure arguments:'`
   for opt in $options; do
       if [ `echo $opt | grep '.*-temp-path'` ]; then
           value=`echo $opt | cut -d "=" -f 2`
           if [ ! -d "$value" ]; then
               # echo "creating" $value
               mkdir -p $value && chown -R $user $value
           fi
       fi
   done
}

start() {
    [ -x $nginx ] || exit 5
    [ -f $NGINX_CONF_FILE ] || exit 6
    make_dirs
    echo -n $"Starting $prog: "
    daemon $nginx -c $NGINX_CONF_FILE
    retval=$?
    echo
    [ $retval -eq 0 ] && touch $lockfile
    return $retval
}

stop() {
    echo -n $"Stopping $prog: "
    killproc $prog -QUIT
    retval=$?
    echo
    [ $retval -eq 0 ] && rm -f $lockfile
    return $retval
}

restart() {
    configtest || return $?
    stop
    sleep 1
    start
}

reload() {
    configtest || return $?
    echo -n $"Reloading $prog: "
    killproc $nginx -HUP
    RETVAL=$?
    echo
}

force_reload() {
    restart
}

configtest() {
  $nginx -t -c $NGINX_CONF_FILE
}

rh_status() {
    status $prog
}

rh_status_q() {
    rh_status >/dev/null 2>&1
}

case "$1" in
    start)
        rh_status_q && exit 0
        $1
        ;;
    stop)
        rh_status_q || exit 0
        $1
        ;;
    restart|configtest)
        $1
        ;;
    reload)
        rh_status_q || exit 7
        $1
        ;;
    force-reload)
        force_reload
        ;;
    status)
        rh_status
        ;;
    condrestart|try-restart)
        rh_status_q || exit 0
            ;;
    *)
        echo $"Usage: $0 {start|stop|status|restart|condrestart|try-restart|reload|force-reload|configtest}"
        exit 2
esac
{% endhighlight %}

### 7. 起動スクリプト権限設定

作成した Nginx 起動スクリプトに実行権限を付与する。

``` text
# chmod +x /etc/rc.d/init.d/nginx
```

### 8. サービス起動

``` text
# /etc/rc.d/init.d/nginx start
nginx を起動中:                                            [  OK  ]
```

もしくは

``` text
# service nginx start
nginx を起動中:                                            [  OK  ]
```

### 9. 自動起動設定

``` text
# chkconfig nginx on
# chkconfig --list nginx  # <= 2,3,4,5 が "on" であることを確認
nginx           0:off   1:off   2:on    3:on    4:on    5:on    6:off
```

### 10. ログローテーション

ログが肥大化しないようログローテーションの設定をする。

File: `/etc/logrotate.d/nginx`

{% highlight bash linenos %}
/var/log/nginx/*.log {
    missingok
    notifempty
    sharedscrits
    postrotate
        [ ! -f /var/run/nginx.pid ] || kill -USR1 `cat /var/run/nginx.pid`
    endscript
}
{% endhighlight %}

### 11. 動作確認

ブラウザで `http://＜サーバ名＞/` にアクセスしてみて以下のように表示されればよい。

![CENTOS_6-5_NGINX]({{site.baseurl}}/images/2014/01/05/CENTOS_6-5_NGINX.png "CENTOS_6-5_NGINX")

### 12. その他設定

今回はデフォルト設定で構築したが、実際には詳細に設定する。  
今回のシリーズでは紹介しないが、当ブログ過去記事をそのまま参考にすることができるだろう。

- [Tag: Nginx - mk-mode BLOG](http://www.mk-mode.com/octopress/tags/nginx/ "Tag: Nginx - mk-mode BLOG")

### 参考サイト

- [Nginx - Main](http://wiki.nginx.org/Main "Nginx - Main")
- [nginx](http://nginx.org/ja/ "nginx")

---

次回は、DB サーバ MariaDB の構築について紹介する予定です。

以上。

