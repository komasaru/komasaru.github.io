---
layout   : single
title    : "CentOS 6.5 - Web サーバ Nginx で SSL 接続！"
published: true
date     : 2014-01-18 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- Nginx
---

前回は CentOS 6.5 サーバ上のサーバ監視ツール munin で Web(HTTP) サーバ Nginx の監視設定を行いました。  
今回は Web(HTTP) サーバ Nginx で SSL 接続するため設定を行います。

<!--more-->

### 0. 前提条件

- CentOS 6.5(x86_64) を Minimal で最小インストールしている。
- クライントマシンは Linux Mint 14(64bit) を想定。
- Web(HTTP)サーバ Nginx が「[CentOS 6.5 - Web サーバ Nginx 構築（ソースインストール）！](2014-01-05-centos-6-5-nginx-installation-by-src "CentOS 6.5 - Web サーバ Nginx 構築（ソースインストール）！")」の方法で導入済みであることを想定。

### 1. SSL 証明書作成

SSL 証明書を以下のようにして作成する。

``` text
# cd /etc/pki/tls/certs
# sed -i 's/365/3650/g' Makefile
# make server.crt
umask 77 ; \
        /usr/bin/openssl genrsa -aes128 2048 > server.key
Generating RSA private key, 2048 bit long modulus
...................+++
.............................................................+++
e is 65537 (0x10001)
Enter pass phrase:                                                        # <= パスワード設定
Verifying - Enter pass phrase:                                            # <= パスワード確認入力
umask 77 ; \
        /usr/bin/openssl req -utf8 -new -key server.key -x509 -days 3650 -out server.crt -set_serial 0
Enter pass phrase for server.key:                                         # <= パスワード入力
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Country Name (2 letter code) [XX]:JP                                      # <= 国名
State or Province Name (full name) []:Shimane                             # <= 都道府県名
Locality Name (eg, city) [Default City]:Matsue                            # <= 市区町村名
Organization Name (eg, company) [Default Company Ltd]:mk-mode.com         # <= 会社名・サイト名
Organizational Unit Name (eg, section) []:                                # <= 部署名
Common Name (eg, your name or your server's hostname) []:www.mk-mode.com  # <= ホスト名・管理者名
Email Address []:webmaster@mk-mode.com                                    # <= 管理者メールアドレス
```

### 2. パスワード削除

サーバ用秘密鍵からパスワードを削除する。

``` text
# openssl rsa -in server.key -out server.key
Enter pass phrase for server.key:  # <= パスワード入力
writing RSA key
```

### 3. Nginx 設定ファイル編集

以下のように、Nginx 設定ファイル "HTTPS server" 用 "server" ディレクティブ内を、コメント解除しキー設定を先ほど設定したものに変更する。

File: `/usr/local/nginx/conf/nginx.conf`

{% highlight bash linenos %}

    # HTTPS server
    #
    server {
        listen       443;
    #    server_name  localhost;
        server_name  www.mk-mode.com;

        ssl                  on;
    #    ssl_certificate      cert.pem;
        ssl_certificate      /etc/pki/tls/certs/server.crt;
    #    ssl_certificate_key  cert.key;
        ssl_certificate_key  /etc/pki/tls/certs/server.key;

        ssl_session_timeout  5m;

        ssl_protocols  SSLv2 SSLv3 TLSv1;
        ssl_ciphers  HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers   on;

        location / {
            root   html;
            index  index.html index.htm;
        }
    }
{% endhighlight %}

### 4. Nginx 再起動

``` text
# /etc/rc.d/init.d/nginx restart
nginx: the configuration file /usr/local/nginx/conf/nginx.conf syntax is ok
nginx: configuration file /usr/local/nginx/conf/nginx.conf test is successful
nginx を停止中:                                            [  OK  ]
nginx を起動中:                                            [  OK  ]
```

### 5. 動作確認

ブラウザから `https://＜サーバ名orIPアドレス＞/` にアクセスし、セキュリティに関するページが表示されたら適宜インストールする。  
ブラウザにより異なるが、Firefox なら「危険を理解した上で接続するには」をクリック後「例外追加」ボタンをクリックする。そして開いたウィンドウ内で「セキュリティ例外を追加」ボタンをクリックする。  
認証に成功すると以下のように表示される。

![CENTOS_6-5_NGINX_SSL]({{site.baseurl}}/images/2014/01/18/CENTOS_6-5_NGINX_SSL.png "CENTOS_6-5_NGINX_SSL")

### 参考サイト

- [HTTPS サーバの設定](http://nginx.org/ja/docs/http/configuring_https_servers.html "HTTPS サーバの設定")

---

次回は、PHP のインストール（ソースビルド）について紹介する予定です。

以上。

