---
layout   : single
title    : "Nginx - CentOS にインストール（ソースビルド）！"
published: true
date     : 2013-01-25 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- CentOS
- Nginx
---

以前、軽量 Web サーバ Nginx をLinux Mint にソースをビルドしてインストールする手順について記録しました。  

- [Nginx - Linux Mint にインストール（ソースビルド）！]({{site.baseurl}}/2013/01/14/nginx-linux-mint-install-by-src "Nginx - Linux Mint にインストール（ソースビルド）！")

今日は、Nginx を CentOS(Redhat 系ディストリビューション) にソースをビルドしてインストールする方法についてです。  
GNU(Debian) 系ディストリビューションとは若干異なる部分があるため、別途記録しておいた次第です。

<!--more-->

### 0 前提条件

- CentOS 6.3 (32bit) での作業を想定。
- インストール先は `/usr/local` とした。

### 1. 必要パッケージインストール

Nginx のビルドに以下のパッケージが必要なので、未インストールならインストールしておく。

``` bash 
$ sudo yum install gcc pcre pcre-devel zlib zlib-devel openssl openssl-devel
```

### 2. アーカイブダウンロード

インストールに使用するアーカイブファイルをダインロードし、解凍する。  
ダウンロード先はユーザルートとした。

``` bash 
$ wget http://nginx.org/download/nginx-1.2.6.tar.gz
$ tar zxvf nginx-1.2.6.tar.gz
```

### 3. インストール

`configure`, `make`, `make install` でビルド・インストールする。  
インストール先はデフォルトでは `/usr/local/nginx` となるが、今後のバージョンアップのことも考慮し、バージョン別にインストール先を指定しリンクを貼るようにした。

``` bash 
$ cd nginx-1.2.6
$ ./configure --prefix=/usr/local/nginx-1.2.6 \
--user=nginx \
--group=nginx \
--pid-path=/var/run/nginx.pid \
--error-log-path=/var/log/nginx/error.log \
--http-log-path=/var/log/nginx/access.log \
--lock-path=/var/run/nginx.lock \
--with-http_ssl_module \
--with-http_realip_module
$ make
$ sudo make install
$ sudo ln -s /usr/local/nginx-1.2.6 /usr/local/nginx
```

`configure` オプションについて。

- `prefix`  
  ... nginx をインストールするディレクトリを指定する。（デフォルト： `/usr/local/nginx`）
- `with-http_ssl_module`  
  ... HTTPS/SSL support（デフォルト：HTTPS は無効）
- `with-http_realip_module`  
  ... For using nginx as backend

### 4. インストール確認

Nginx がインストールできたか確認してみる。  
`-V` オプションで `configure` オプションも確認可能。`-v` でバージョンだけ確認可能。

``` bash 
$ /usr/local/nginx/sbin/nginx -V
nginx version: nginx/1.2.6
built by gcc 4.4.6 20120305 (Red Hat 4.4.6-4) (GCC) 
TLS SNI support enabled
configure arguments: --prefix=/usr/local/nginx-1.2.6 --user=nginx --group=nginx --pid-path=/var/run/nginx.pid --error-log-path=/var/log/nginx/error.log --http-log-path=/var/log/nginx/access.log --lock-path=/var/run/nginx.lock --with-http_ssl_module --with-http_realip_module
```

### 5. 設定

今回のインストール環境の場合、基本的（グローバル）な設定のファイルは `/usr/local/nginx/conf/nginx.conf` となる。  
取り急ぎ、デフォルトのままとした。

### 6. Nginx 起動スクリプト

`/etc/init.d/nginx {start|stop|restart|reload}` でサービスを起動できるよう `/etc/init.d/nginx` を作成する。  
（[参考サイト](http://wiki.nginx.org/RedHatNginxInitScript "RedHatNginxInitScript") の内容を一部修正）

File: `/etc/init.d/nginx`

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

### 7. 実行権限付与

作成した `/etc/init.d/nginx` に実行権限を付与する。

``` bash 
$ sudo chmod +x /etc/init.d/nginx
```

### 8. サービス起動

サービスを使って Nginx を起動してみる。  
（当然、Apache 等同じポートを使用する Web サーバが起動していれば、停止しておく）

``` bash 
$ sudo service nginx start
nginx を起動中:                                            [  OK  ]
```

もしくは、

``` bash 
$ sudo /etc/init.d/nginx start
nginx を起動中:                                            [  OK  ]
```

### 9. 起動確認

ブラウザで `http://127.0.0.1/` にアクセスしてみる。  
以下のような画面が表示されれば OK.

![NGINX]({{site.baseurl}}/images/2013/01/25/NGINX.png "NGINX")

### 10. 自動起動設定

マシン起動時に Nginx が自動起動するようにするには以下のようにする。

``` bash 
$ sudo chkconfig nginx on
$ chkconfig --list nginx
nginx           0:off 1:off 2:on  3:on  4:on  5:on  6:off
```

### 11. 参考サイト

- [Nginx](http://wiki.nginx.org/Main "Nginx")
- [nginx](http://nginx.org/ja/ "nginx")

---

これで、Redhat 系ディストリビューションでも、軽量 Web サーバ Nginx が使用できるようになりました。  
後の設定は、Debian 系で行った方法で大丈夫であるので、当ブログ過去記事等をご参照ください。

以上。

