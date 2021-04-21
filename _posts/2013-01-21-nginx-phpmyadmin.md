---
layout   : single
title    : "Nginx - phpMyAdmin を使用する！"
published: true
date     : 2013-01-21 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- LinuxMint
- Nginx
- PHP
- MySQL
---

軽量 Web サーバ Nginx で phpMyAdmin（MySQLサーバーをウェブブラウザで管理するためのデータベース接続クライアントツール）を使用する方法についてです。

既にインストールされている phpMyAdmin を Nginx で利用する方法についてです。PHP, phpMyAdmin, MySQL 等のインストールについてはここでは説明しません。

<!--more-->

### 0. 前提条件

- Linux Mint 14 Nadia (64bit) での作業を想定。
- Nginx 1.2.6 がソースビルドによりインストール済み。
- パッケージを利用してインストールした Nginx とはディレクトリ構成等が若干異なる。
  （別途作成したヴァーチャルホストの設定ファイルを取り込む形式になっていたり・・・）
- PHP 5.4.6 がインストール済み。（古いバージョンだと作業が異なるかも知れない）
- MySQL サーバがインストール済み。（当方は 5.5.28）
- PHP5-FPM がインストール済み。（当方は 5.4.6）
- phpMyAdmin がインストール済み。（当方は 3.4.11）
- phpMyAdmin はサブディレクトリ運用とする。（`http://localhost/phpmyadmin/` という URL での運用）

### 1. Nginx 設定ファイル編集

Nginx の設定ファイル `/usr/local/nginx/conf/nginx.conf` の `server` ディレクティブに以下の記述を追加する。  
（phpMyAdmin が `/usr/share/phpmyadmin` ディレクトリにインストールされている場合）

``` bash 
    server {

        # ===< 省略 >===

        # phpmyadmin setting
        location /phpmyadmin {
            alias /usr/share/phpmyadmin;
            index index.php;
            allow 127.0.0.1;
            allow 192.168.11.0/24;
            deny  all;
        }

        location ~ /phpmyadmin/.*\.php$ {
            fastcgi_pass    unix:/var/run/php5-fpm.sock;
            fastcgi_index   index.php;
            fastcgi_param   SCRIPT_FILENAME  /usr/share/$uri;
            include         fastcgi_params;
        }

        # ===< 省略 >===

    }
```

この設定では、`allow` と `deny` でローカルホストとローカルネットワークからのみアクセス可能にしている。  
`allow` を `deny` より先に記述すること。`deny` を先に記述すると全てアクセス拒否となってしまう。  
また、上記の設定は php ファイル全体の設定 `location ~ \.php$ { ...` より先に記述すること。

### 2. Nginx 起動

設定を有効化するために Nginx をリロードする。  
起動していないのなら起動する。  
（当然、MySQL, PHP5-FPM も起動していること）

### 3. 動作確認

ブラウザで `http://localhost/phpmyadmin` にアクセスしてみて、以下のようなページが表示されれば OK.

![NGINX_PHPMYADMIN]({{site.baseurl}}/images/2013/01/21/NGINX_PHPMYADMIN.png "NGINX_PHPMYADMIN")

また、ログインしてみて正常に動作するかも確認してみる。

---

これで、Nginx で phpMyAdmin が利用できるようになりました。

当方実際には、phpMyAdmin よりも MySQL Workbench を利用することがほとんどなのですが、いざという時に使えたほうがよいので設定した次第です。

以上。

