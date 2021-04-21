---
layout   : single
title    : "CentOS 7.0 - Web サーバ Nginx 構築（ソースインストール）！"
published: true
date     : 2014-08-28 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- Nginx
---

「CentOS 7.0 - Web サーバ Nginx 構築（ソースインストール）」についての記録です。

（旧バージョンでの作業記録を更新しました。興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

- CentOS 7.0-1406(x86_64) を NetInstall で最小限インストールしている。
- サーバ用途なので、作業は基本的に全て一般ユーザから root になって行う。
- クライアント側は Linux Mint 17 を想定。
- ソースを取得し、ビルドしてインストールする。
- FirewallD のゾーンは public を使用する。
- 当記事執筆時点で最新の安定版 1.6.0 をインストールする。（当記事公開時点の最新安定版は 1.6.1）

### 1. 必要パッケージインストール

ソースビルドに必要なパッケージをあらかじめインストールしておく。

``` text
# yum -y install gcc pcre pcre-devel zlib zlib-devel openssl openssl-devel
```

### 2. アーカイブダウンロード

``` text
# cd /usr/local/src
# wget http://nginx.org/download/nginx-1.6.0.tar.gz
# tar zxvf nginx-1.6.0.tar.gz
```

### 3. ビルド・インストール

`configure`, `make`, `make install` でインストールし、バージョンアップ時にリンク先を変更するだけで済むようリンクを設定する。  
以下の `configure` オプションは一例であり、実際使用する（使用するであろう）機能を吟味した上で設定すること。

``` text
# cd nginx-1.6.0
# ./configure --prefix=/usr/local/nginx-1.6.0 \
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
# ln -s /usr/local/nginx-1.6.0 /usr/local/nginx
# cd
```

configure オプションの `--with-http_stub_status_module` は今後 munin で `stub_status` を用したいため。

### 4. インストール確認

``` text
# /usr/local/nginx/sbin/nginx -V
nginx version: nginx/1.6.0
built by gcc 4.8.2 20140120 (Red Hat 4.8.2-16) (GCC)
TLS SNI support enabled
configure arguments: --prefix=/usr/local/nginx-1.6.0 --user=nginx --group=nginx 
--pid-path=/var/run/nginx.pid --error-log-path=/var/log/nginx/error.log 
--http-log-path=/var/log/nginx/access.log --lock-path=/var/run/nginx.lock 
--with-http_ssl_module --with-http_realip_module --with-http_stub_status_module
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

``` text
# chmod +x /etc/rc.d/init.d/nginx
```

### 8. サービス起動

``` text
# systemctl start nginx
```

### 9. 自動起動設定

nginx はネイティブサービスでないため、 `systemctl enable nginx` は `chkconfig nginx on` にリダイレクトされる。  
最初から `chkconfig nginx on` を実行してもよいだろう。

``` text
# systemctl enable nginx
nginx.service is not a native service, redirecting to /sbin/chkconfig.
Executing /sbin/chkconfig nginx on
The unit files have no [Install] section. They are not meant to be enabled
using systemctl.
Possible reasons for having this kind of units are:
1) A unit may be statically enabled by being symlinked from another unit's
   .wants/ or .requires/ directory.
2) A unit's purpose may be to act as a helper for some other unit which has
   a requirement dependency on it.
3) A unit may be started when needed via activation (socket, path, timer,
   D-Bus, udev, scripted systemctl call, ...).

# chkconfig --list nginx  # <= 2,3,4,5 が on であることを確認
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

### 11. ファイアウォール設定

``` text
# firewall-cmd --add-service=http
success
# firewall-cmd --add-service=http --permanent
success
# firewall-cmd --list-services
dhcpv6-client dns ftp http nfs pop3s smtp ssh
```

### 12. 動作確認

ブラウザで `http://＜サーバ名＞/` にアクセスしてみて以下のように表示されればよい。

![CENTOS_7-0_NGINX]({{site.baseurl}}/images/2014/08/28/CENTOS_7-0_NGINX.png "CENTOS_7-0_NGINX")

### 13. その他設定

今回はデフォルト設定で構築したが、実際には詳細に設定する。  
今回のシリーズでは紹介しないが、当ブログ過去記事をそのまま参考にすることができるだろう。

- [Tag: Nginx - mk-mode BLOG](http://www.mk-mode.com/octopress/tags/nginx/ "Tag: Nginx - mk-mode BLOG")

### その他の参考サイト

- [nginx](http://nginx.org/ja/ "nginx")

---

以上。

