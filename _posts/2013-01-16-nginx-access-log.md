---
layout   : single
title    : "Nginx - ログフォーマット、アクセスログについて！"
published: true
date     : 2013-01-16 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- LinuxMint
- Nginx
---

軽量 Web サーバ  Nginx の設定の中のアクセスログについてです。  
（Debian, Ubuntu 等 GNU 系ディストリビューションは同様だと思う）

<!--more-->

### 0. 前提条件

- Linux Mint 14 Nadia (64bit) での作業を想定。
- Nginx 1.2.6 がソースビルドによりインストール済み。
- パッケージを利用してインストールした Nginx とはディレクトリ構成等が若干異なるが、アクセスログの設定については同じ。

### 1. ログフォーマットについて

まず、ログフォーマット（`log_format`）とは、アクセスログにログを出力する際に使用するフォーマットのことで、設定ファイル（今回の場合 `/usr/local/nginx/conf/nginx.conf`） に記述して設定する。  
`log_format` を設定しない場合は、以下のようなフォーマットを設定したことになる。（フォーマット名は `combined`）

``` bash 
log_format combined '$remote_addr - $remote_user [$time_local] '
                    '"$request" $status $body_bytes_sent '
                    '"$http_referer" "$http_user_agent"';

# $remote_addr    : クライアントのIPアドレス
# $remote_user    : クライアントのユーザ名
# $time_local     : アクセス日時
# $request        : httpの要求URI
# $status         : httpのステータス
# $body_bytes_sent: 送信バイト数
# $http_referer   : リファラーURL（遷移元URL）
# $http_user_agent: ユーザエージェント情報（ブラウザ名・バージョン等）
```

その他、変数については[参考サイト](http://nginx.org/en/docs/http/ngx_http_log_module.html "Module ngx_http_log_module")を参照。

デフォルト以外のフォーマットを使用する場合は、フォーマット名を変更して変数を編集する。（Gzip 圧縮率を出力するようにする際など）

### 2. アクセスログについて

アクセスログを出力するには、設定ファイル（今回の場合 `/usr/local/nginx/conf/nginx.conf`）に以下のようなフォーマットで記述する。

``` bash 
access_log path [format [buffer=size [flush=time]]];
access_log path format gzip[=level] [buffer=size] [flush=time];
access_log off;
```

設定しない場合は、以下の設定をしたことになる。  
但し、Nginx をビルドしてインストールした場合で、ビルド時のオプションでログファイルパス（`--http-log-path`）を指定した場合は、そのログファイルパスがデフォルトとなる。

``` bash 
access_log logs/access.log combined;
```

### 3. 設定

取り急ぎ、以下のような設定にしてみた。  
当方は http ディレクティブで設定したが、バーチャルホスト別に設定したいなら server ディレクティブ内に記述する。

File: `/usr/local/nginx/conf/nginx.conf`

{% highlight bash linenos %}
http {

  :

    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

  :

}
{% endhighlight %}

### 4. Nginx リロード

設定を有効化させるために Nginx をリロードする。（未起動なら起動する）

``` bash 
$ sudo service nginx reload
```

### 5. 確認

何か作業（サーバへアクセス）してみて、アクセスログファイルを確認してみる。

File: `/var/log/nginx/access.log`

{% highlight bash linenos %}
$ cat /var/log/nginx/access.log
127.0.0.1 - - [02/Jan/2013:23:46:57 +0900] "GET / HTTP/1.1" 200 177 "-" "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:17.0) Gecko/20100101 Firefox/17.0" "-"
127.0.0.1 - - [02/Jan/2013:23:46:58 +0900] "GET /favicon.ico HTTP/1.1" 200 318 "-" "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:17.0) Gecko/20100101 Firefox/17.0" "-"
{% endhighlight %}

設定した通りのフォーマットで記録されている。

### 6. 参考サイト

- [Module ngx_http_log_module](http://nginx.org/en/docs/http/ngx_http_log_module.html "Module ngx_http_log_module")

---

Nginx のアクセスログについての大筋は理解できました。

以上。

