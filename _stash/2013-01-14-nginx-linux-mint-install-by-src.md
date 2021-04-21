---
layout   : single
title    : "Nginx - Linux Mint にインストール（ソースビルド）！"
published: true
date     : 2013-01-14 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- LinuxMint
- Nginx
---

昨日は、Linux Mint に軽量 Web サーバ  Nginx をパーケージインストールする手順について記録しました。  

- [Linux Mint - Nginx インストール（パッケージ使用）！]({{site.baseurl}}/2013/01/14/nginx-linux-mint-install-by-src "Linux Mint - Nginx インストール（パッケージ使用）！")

今日は、Nginx をソースをビルドしてインストールする方法についてです。

<!--more-->
当記事執筆時点では、

- apt では 1.1.19 が最新。
- 安定版ソースは 1.2.6 が最新。
- 開発版ソースは 1.3.9 が最新。

となっているので、より新しいバージョンを使用したい場合はソースからインストールする方法を採用します。  
今回は安定版ソースを使用します。

### 0 前提条件

- Linux Mint 14 Nadia (64bit) での作業を想定。（前回まで Linux Mint 13 Maya でした）
- インストール先は `/usr/local` とした。

### 1. 必要パッケージインストール

Nginx のビルドに以下のパッケージが必要なので、未インストールならインストールしておく。

``` bash 
$ sudo apt-get install gcc libpcre3 libpcre3-dev zlib1g zlib1g-dev openssl libssl-dev
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
--user=www-data \
--group=www-data \
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
built by gcc 4.7.2 (Ubuntu/Linaro 4.7.2-2ubuntu1) 
TLS SNI support enabled
configure arguments: --prefix=/usr/local/nginx-1.2.6 --user=www-data --group=www-data --pid-path=/var/run/nginx.pid --error-log-path=/var/log/nginx/error.log --http-log-path=/var/log/nginx/access.log --lock-path=/var/run/nginx.lock --with-http_ssl_module --with-http_realip_module
```

### 5. 設定

今回のインストール環境の場合、基本的（グローバル）な設定のファイルは `/usr/local/nginx/conf/nginx.conf` となる。  
取り急ぎ、デフォルトのままとした。

### 6. Nginxのシステムサービス化

`sudo /etc/init.d/nginx {start|stop|restart|reload}` でサービスを起動できるよう `/etc/init.d/nginx` を作成する。  
（[参考サイト](http://kyamada.hatenablog.com/entry/2012/09/17/102740 "UbuntuにNginx + rails3 + unicorn + sslの環境を作る - k-yamadaのブログ") の内容そのまま）

File: `/etc/init.d/nginx`

{% highlight bash linenos %}
#! /bin/sh
# Author: Ryan Norbauer http://norbauerinc.com
# Modified: Geoffrey Grosenbach http://topfunky.com
# Modified: Clement NEDELCU
set -e
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
DESC="nginx daemon"
NAME=nginx
DAEMON=/usr/local/nginx/sbin/$NAME
SCRIPTNAME=/etc/init.d/$NAME

# デーモンファイルが見つからなければ、スクリプトを終了する
test -x $DAEMON || exit 0

d_start() {
  $DAEMON || echo -n " already running"
}

d_stop() {
  $DAEMON -s quit || echo -n " not running"
}

d_reload() {
  $DAEMON -s reload || echo -n " could not reload"
}

case "$1" in
  start)
    echo -n "Starting $DESC: $NAME"
    d_start
    echo "."
  ;;
  stop)
    echo -n "Stopping $DESC: $NAME"
    d_stop
    echo "."
  ;;
  reload)
    echo -n "Reloading $DESC: configuration..."
    d_reload
    echo "reloaded."
  ;;
  restart)
    echo -n "Restarting $DESC: $NAME"
    d_stop
    # 再起動の前に2秒スリープする。Nginxデーモンが穏便に終了するための時間を与えるのである。
    sleep 2
    d_start
    echo "."
  ;;
  *)
    echo "Usage: $SCRIPTNAME {start|stop|restart|reload}" >&2
    exit 3
  ;;
esac

exit 0
{% endhighlight %}

### 7. 実行権限付与

作成した `/etc/init.d/nginx` に実行権限を付与する。

``` bash 
$ sudo chmod +x /etc/init.d/nginx
```

### 8. サービス起動

サービスを使って Nginx を起動してみる。

``` bash 
$ sudo service nginx start
Starting nginx daemon: nginx.
```

もしくは、

``` bash 
$ sudo /etc/init.d/nginx start
Starting nginx daemon: nginx.
```

### 9. 起動確認

ブラウザで `http://127.0.0.1/` にアクセスしてみる。  
以下のような画面が表示されれば OK.

![NGINX_1]({{site.baseurl}}/images/2013/01/14/NGINX_1.png "NGINX_1")

### 10. ランレベル設定

適切なランレベルに達したときにスクリプトが自動的に実行されるようにする。  
以下のようにすることで、リブート・シャットダウンレベルでは Nginx の `stop` が実行され、他のランレベルでは `start` が実行されるようになるようだ。

``` bash 
$ sudo update-rc.d -f nginx defaults
update-rc.d: warning: /etc/init.d/nginx missing LSB information
update-rc.d: see <http://wiki.debian.org/LSBInitScripts>
 Adding system startup for /etc/init.d/nginx ...
   /etc/rc0.d/K20nginx -> ../init.d/nginx
   /etc/rc1.d/K20nginx -> ../init.d/nginx
   /etc/rc6.d/K20nginx -> ../init.d/nginx
   /etc/rc2.d/S20nginx -> ../init.d/nginx
   /etc/rc3.d/S20nginx -> ../init.d/nginx
   /etc/rc4.d/S20nginx -> ../init.d/nginx
   /etc/rc5.d/S20nginx -> ../init.d/nginx
```

### 11. 参考サイト

- [Nginx](http://wiki.nginx.org/Main "Nginx")
- [nginx](http://nginx.org/ja/ "nginx")
- [UbuntuにNginx + rails3 + unicorn + sslの環境を作る - k-yamadaのブログ](http://kyamada.hatenablog.com/entry/2012/09/17/102740 "UbuntuにNginx + rails3 + unicorn + sslの環境を作る - k-yamadaのブログ")

---

これで、ローカル環境（GNU ディストリビューション）では、軽量 Web サーバ Nginx が使用できるようになりました。

以上。

