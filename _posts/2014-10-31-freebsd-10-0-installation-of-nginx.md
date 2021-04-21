---
layout   : single
title    : "FreeBSD 10.0 - HTTP & リバースプロキシサーバ Nginx インストール！"
published: true
date     : 2014-10-31 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- FreeBSD
- Nginx
---

「FreeBSD 10.0 - HTTP & リバースプロキシサーバ Nginx インストール」についての記録です。

（旧バージョンでの個人の作業記録を更新しました。興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* 以下の作業は、リモート接続して行う。（リモートから `ssh vbox` で接続）
* リモート端末は、 Linux Mint 17 マシンを想定しているが、 Unix 系 OS なら同じ。
* 設定ファイル等のテキストファイルの編集には `vi` コマンドを使用。
* 作業はリモート接続で一般ユーザから root になって行う。
* HTTP サーバに Apache は使用しない。

### 1. Nginx インストール

``` text
# cd /usr/ports/www/nginx
# make BATCH=yes install clean
# cd
```

### 2. Nginx インストール確認

バージョンを表示させて Nginx がインストールされたか確認。

``` text
# nginx -V
nginx version: nginx/1.6.2
TLS SNI support enabled
configure arguments: --prefix=/usr/local/etc/nginx --with-cc-opt='-I /usr/local/include' --with-ld-opt='-L /usr/local/lib' --conf-path=/usr/local/etc/nginx/nginx.conf --sbin-path=/usr/local/sbin/nginx --pid-path=/var/run/nginx.pid --error-log-path=/var/log/nginx-error.log --user=www --group=www --with-ipv6 --http-client-body-temp-path=/var/tmp/nginx/client_body_temp --http-fastcgi-temp-path=/var/tmp/nginx/fastcgi_temp --http-proxy-temp-path=/var/tmp/nginx/proxy_temp --http-scgi-temp-path=/var/tmp/nginx/scgi_temp --http-uwsgi-temp-path=/var/tmp/nginx/uwsgi_temp --http-log-path=/var/log/nginx-access.log --with-http_stub_status_module --with-pcre --with-http_ssl_module
```

### 3. 設定ファイル編集

設定ファイルは "/usr/local/etc/nginx/nginx.conf" であるが、今回は、取り急ぎデフォルトのまま。（実運用時に詳細に設定する）

設定ファイルを編集した場合は `nginx -t` で文法チェックを行うとよい。（Nginx 起動時にもチェックされるが）

### 4. Nginx 自動起動設定

File: `/etc/rc.conf`

{% highlight bash linenos %}
nginx_enable="YES"  # <= 追加
{% endhighlight %}

### 5. Nginx 起動

``` text
# /usr/local/etc/rc.d/nginx start
Performing sanity check on nginx configuration:
nginx: the configuration file /usr/local/etc/nginx/nginx.conf syntax is ok
nginx: configuration file /usr/local/etc/nginx/nginx.conf test is successful
Starting nginx.
```

### 5. 動作確認

ポート 80/TCP が開放されていることを確認して、ブラウザで `http://＜サーバ IP アドレス＞/` にアクセスしてみる。  
Nginx のデフォルトの画面（"Welcome to nginx!" ...）が表示されることを確認。

---

以上。

