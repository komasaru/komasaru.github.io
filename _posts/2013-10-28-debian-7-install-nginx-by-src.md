---
layout   : single
title    : "Debian 7 Wheezy - Web サーバ Nginx をインストール（ソースビルド）！"
published: true
date     : 2013-10-28 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- Nginx
---

Debian GNU/Linux 7 Wheezy サーバに Web サーバ Nginx をソースをビルドしてインストールする方法についての記録です。

ちなみに以前、Linux Mint にソースビルドでインストールする方法を紹介しています。（当然、似たような内容となっています）

- [Nginx - Linux Mint にインストール（ソースビルド）！]({{site.baseurl}}/2013/01/14/nginx-linux-mint-install-by-src/ "Nginx - Linux Mint にインストール（ソースビルド）！")

<!--more-->

### 0 前提条件

- Debian GNU/Linux 7.1.0 での作業を想定。
- 接続元のマシンは Linux Mint 14(64bit) を想定。
- インストールする Nginx のバージョンは 1.4.3（当記事執筆時点最新安定版）を想定。

### 1. 必要パッケージインストール

Nginx のビルドに以下のパッケージが必要なので、未インストールならインストールしておく。（他にも必要なものがあればインストールする）

``` text 
# aptitude -y install gcc libpcre3-dev libssl-dev
```

依存する libpcre3, zlib1g-dev もインストールされる。

### 2. アーカイブダウンロード

インストールに使用するアーカイブファイルをダインロードし、解凍する。

``` text 
# cd /usr/local/src/
# wget http://nginx.org/download/nginx-1.4.3.tar.gz
# tar zxvf nginx-1.4.3.tar.gz
```

### 3. ビルド＆インストール

`configure`, `make`, `make install` でビルド・インストールする。  
インストール先はデフォルトでは `/usr/local/nginx` となるが、今後のバージョンアップのことも考慮し、バージョン別にインストール先を指定しリンクを貼るようにした。

``` text 
# cd nginx-1.4.3
# ./configure --prefix=/usr/local/nginx-1.4.3 \
--user=www-data \
--group=www-data \
--pid-path=/var/run/nginx.pid \
--error-log-path=/var/log/nginx/error.log \
--http-log-path=/var/log/nginx/access.log \
--lock-path=/var/run/nginx.lock \
--with-http_ssl_module \
--with-http_realip_module
# make
# make install
# ln -s /usr/local/nginx-1.4.3 /usr/local/nginx
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

``` text 
# /usr/local/nginx/sbin/nginx -V
nginx version: nginx/1.4.3
built by gcc 4.7.2 (Debian 4.7.2-5)
TLS SNI support enabled
configure arguments: --prefix=/usr/local/nginx-1.4.3 --user=www-data --group=www-data --pid-path=/var/run/nginx.pid --error-log-path=/var/log/nginx/error.log --http-log-path=/var/log/nginx/access.log --lock-path=/var/run/nginx.lock --with-http_ssl_module --with-http_realip_module
```

### 5. 設定

今回のインストール環境の場合、基本的（グローバル）な設定のファイルは `/usr/local/nginx/conf/nginx.conf` となる。  
取り急ぎ、デフォルトのままとした。  
詳細な設定は、「[当ブログ Nginx 関連の過去記事](http://www.mk-mode.com/octopress/tags/nginx/ "Tag: Nginx - mk-mode BLOG")」を参照。

### 6. 起動スクリプト作成

サービス起動用スクリプト "/etc/init.d/nginx" を作成する。  
ゼロから作成するのは面倒なので、 "/etc/init.d/skeleton" を複製して編集する。（冒頭の各種定義部分の他、Start, Stop, Restart 時にメッセージを出力するようにしている）  
コメントは不要なら削除してもよい。（ただし、冒頭の `BEGIN INIT INFO` から `END INIT INFO` はコメントではないの削除しないこと）  
もしくは、「[Nginx - InitScriptsJa](http://wiki.nginx.org/InitScriptsJa "InitScriptsJa")」にあるサンプルを参考にして作成してもよい。

File: `/etc/init.d/nginx`

{% highlight bash linenos %} 
#! /bin/sh

### BEGIN INIT INFO

# Provides:          nginx                         # <= 編集
# Required-Start:    $all                          # <= 編集
# Required-Stop:     $all                          # <= 編集
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: Start script of the Nginx.    # <= 編集
# Description:       Start/Stop the nginx daemon.  # <= 編集

### END INIT INFO

# Author: Administrator <root@mk-mode.com>
#
# Please remove the "Author" lines above and replace them
# with your own name if you copy and modify this script.

# Do NOT "set -e"

# PATH should only include /usr/* if it runs after the mountnfs.sh script
PATH=/sbin:/usr/sbin:/bin:/usr/bin:/usr/local/sbin:/usr/local/bin  # <= 編集
DESC="Nginx Daemon"                                # <= 編集
NAME=nginx                                         # <= 編集
DAEMON=/usr/local/nginx/sbin/$NAME
#DAEMON_ARGS="--options args"                      # <= コメントアウト
PIDFILE=/var/run/$NAME.pid
SCRIPTNAME=/etc/init.d/$NAME

# Exit if the package is not installed
[ -x "$DAEMON" ] || exit 0

# Read configuration variable file if it is present
[ -r /etc/default/$NAME ] && . /etc/default/$NAME

# Load the VERBOSE setting and other rcS variables
. /lib/init/vars.sh

# Define LSB log_* functions.
# Depend on lsb-base (>= 3.2-14) to ensure that this file is present
# and status_of_proc is working.
. /lib/lsb/init-functions

#
# Function that starts the daemon/service
#
do_start()
{
        # Return
        #   0 if daemon has been started
        #   1 if daemon was already running
        #   2 if daemon could not be started
        start-stop-daemon --start --quiet --pidfile $PIDFILE --exec $DAEMON --test > /dev/null \
                || return 1
        start-stop-daemon --start --quiet --pidfile $PIDFILE --exec $DAEMON -- \
                $DAEMON_ARGS \
                || return 2
        # Add code here, if necessary, that waits for the process to be ready
        # to handle requests from services started subsequently which depend
        # on this one.  As a last resort, sleep for some time.
}

#
# Function that stops the daemon/service
#
do_stop()
{
        # Return
        #   0 if daemon has been stopped
        #   1 if daemon was already stopped
        #   2 if daemon could not be stopped
        #   other if a failure occurred
        start-stop-daemon --stop --quiet --retry=TERM/30/KILL/5 --pidfile $PIDFILE --name $NAME
        RETVAL="$?"
        [ "$RETVAL" = 2 ] && return 2
        # Wait for children to finish too if this is a daemon that forks
        # and if the daemon is only ever run from this initscript.
        # If the above conditions are not satisfied then add some other code
        # that waits for the process to drop all resources that could be
        # needed by services started subsequently.  A last resort is to
        # sleep for some time.
        start-stop-daemon --stop --quiet --oknodo --retry=0/30/KILL/5 --exec $DAEMON
        [ "$?" = 2 ] && return 2
        # Many daemons don't delete their pidfiles when they exit.
        rm -f $PIDFILE
        return "$RETVAL"
}

#
# Function that sends a SIGHUP to the daemon/service
#
do_reload() {
        #
        # If the daemon can reload its configuration without
        # restarting (for example, when it is sent a SIGHUP),
        # then implement that here.
        #
        start-stop-daemon --stop --signal 1 --quiet --pidfile $PIDFILE --name $NAME
        return 0
}

case "$1" in
  start)
        echo -n "Starting $DESC: $NAME\n"  # <= 追加
        [ "$VERBOSE" != no ] && log_daemon_msg "Starting $DESC" "$NAME"
        do_start
        case "$?" in
                0|1) [ "$VERBOSE" != no ] && log_end_msg 0 ;;
                2) [ "$VERBOSE" != no ] && log_end_msg 1 ;;
        esac
        ;;
  stop)
        echo -n "Stopping $DESC: $NAME\n"  # <= 追加
        [ "$VERBOSE" != no ] && log_daemon_msg "Stopping $DESC" "$NAME"
        do_stop
        case "$?" in
                0|1) [ "$VERBOSE" != no ] && log_end_msg 0 ;;
                2) [ "$VERBOSE" != no ] && log_end_msg 1 ;;
        esac
        ;;
  status)
        status_of_proc "$DAEMON" "$NAME" && exit 0 || exit $?
        ;;
  #reload|force-reload)
        #
        # If do_reload() is not implemented then leave this commented out
        # and leave 'force-reload' as an alias for 'restart'.
        #
        #log_daemon_msg "Reloading $DESC" "$NAME"
        #do_reload
        #log_end_msg $?
        #;;
  restart|force-reload)
        echo -n "Restarting $DESC: $NAME\n"  # <= 追加
        #
        # If the "reload" option is implemented then remove the
        # 'force-reload' alias
        #
        log_daemon_msg "Restarting $DESC" "$NAME"
        do_stop
        case "$?" in
          0|1)
                do_start
                case "$?" in
                        0) log_end_msg 0 ;;
                        1) log_end_msg 1 ;; # Old process is still running
                        *) log_end_msg 1 ;; # Failed to start
                esac
                ;;
          *)
                # Failed to stop
                log_end_msg 1
                ;;
        esac
        ;;
  *)
        #echo "Usage: $SCRIPTNAME {start|stop|restart|reload|force-reload}" >&2
        echo "Usage: $SCRIPTNAME {start|stop|status|restart|force-reload}" >&2
        exit 3
        ;;
esac

:
{% endhighlight %}

### 7. 実行権限付与

作成した `/etc/init.d/nginx` に実行権限を付与する。

``` text 
# chmod +x /etc/init.d/nginx
```

### 8. サービス起動

サービスを使って Nginx を起動してみる。

``` text 
# /etc/init.d/nginx start
Starting nginx daemon: nginx.
```

もしくは、

``` text 
# service nginx start
Starting nginx daemon: nginx.
```

### 9. 起動確認

ブラウザで `http://＜サーバアドレス or ホスト名＞/` にアクセスしてみる。
"Welcome to nginx!" と以下５行くらい表示されば成功。

### 10. 自動起動設定

マシン起動時に自動で Nginx を起動させるには以下のようにする。（`sysv-rc-conf` 導入済みの場合）

``` text 
# sysv-rc-conf nginx on
```

もしくは、以下のようにする。

``` text 
# insserv -d nginx
```

逆に、自動起動しないようにするには以下のようにする。（`sysv-rc-conf` 導入済みの場合）

``` text 
# sysv-rc-conf nginx off
```

あるいは、

``` text 
# insserv -r nginx
```

ちなみに、`update-rc.d` コマンドで設定する方法は最近は非推奨らしい。

### 11. 参考サイト

- [Nginx](http://wiki.nginx.org/Main "Nginx")
- [nginx](http://nginx.org/ja/ "nginx")

---

以上。

