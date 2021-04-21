---
layout   : single
title    : "Nginx - 基本的な設定！"
published: true
date     : 2013-01-15 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- LinuxMint
- Nginx
---

Linux Mint にソースをビルドしてインストールした軽量 Web サーバ  Nginx の基本的な設定についてです。  
（Debian, Ubuntu 等 GNU 系ディストリビューションは同様だと思う）

ソースをビルドしてインストールする方法については過去記事を参照。

- [Linux Mint - Nginx インストール（ソースビルド）！]({{site.baseurl}}/2013/01/14/nginx-linux-mint-install-by-src "Linux Mint - Nginx インストール（ソースビルド）！")

<!--more-->

### 0. 前提条件

- Linux Mint 13 Maya (64bit) での作業を想定。
- Nginx 1.2.6 がソースビルドによりインストール済み。
- パッケージを利用してインストールした Nginx とはディレクトリ構成等が若干異なる。
  （別途作成したヴァーチャルホストの設定ファイルを取り込む形式になっていたり・・・）

### 1. 基本設定

基本的（グローバル）な設定は `/usr/local/nginx/conf/nginx.conf` で行う。  
取り急ぎ以下のようにした。（コメント部分は省略）

File: `/usr/local/nginx/conf/nginx.conf`

{% highlight bash linenos %}
worker_processes  2;                             # <= CPU コア数を超えない最大値に変更

events {
    worker_connections  1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;

    sendfile        on;

    keepalive_timeout  65;

    server {
        listen       80;
        server_name  localhost;                  # <= 取り急ぎ localhost のまま

        location / {
            root   /var/www/html;                # <= 実際のドキュメントルートに変更
            index  index.html index.htm;
        }

        error_page  404              /404.html;  # <= コメント解除

        error_page  500 502 503 504  /50x.html;
        #location = /50x.html {                  # <= コメントアウト
        #    root   html;                        # <= コメントアウト
        #}                                       # <= コメントアウト

        location ~ /\. {                         # <= 追加
            deny           all;                  # <= 追加
            access_log     off;                  # <= 追加
            log_not_found  off;                  # <= 追加
        }                                        # <= 追加
    }
}
{% endhighlight %}

エラーページについて、`404.html`、`50x.html` ファイルは実際のドキュメントルート（今回は `/var/www/html` ディレクトリ）配下に置いたので、上記のようにした。  
また、Nginx では `.htaccess` 等のドットファイルは使用しないので、アクセスを拒否しログ出力もオフにした。（全てのドットファイルについて）

### 2. バーチャルホスト設定

バーチャルホストの設定は、設定ファイル `/usr/local/nginx/conf/nginx.conf` 内で `server` ディレクティブを作成して行う。  
今回は、特にバーチャルホストの設定はしないので編集しない。

### 3. 設定ファイル文法チェック

作成・編集した設定ファイルの文法が誤っていないかチェックしてみる。  

``` bash 
$ sudo /usr/local/nginx/sbin/nginx -t
nginx: the configuration file /usr/local/nginx-1.2.6/conf/nginx.conf syntax is ok
nginx: configuration file /usr/local/nginx-1.2.6/conf/nginx.conf test is successful
```

### 4. Nginx リロード

設定有効化のため、 Nginx をリロード（当然、起動していなければ起動）する。

``` bash 
$ sudo service nginx reload
Reloading nginx daemon: configuration...reloaded.
```

### 5. 確認

ブラウザで `http://127.0.0.1/` にアクセスしてみて、サーバルート（今回は `/var/www/html/`）に用意した `index.html` のページが表示されれば OK.

---

これで、静的な HTML は表示可能となった。

今回は取り急ぎ単純なページを表示させるだけの作業だったが、実際には PHP を動かせるようにしたり、キャッシュの対応をしたり、セキュアな対応をしたり等々する必要がある。

以上。

