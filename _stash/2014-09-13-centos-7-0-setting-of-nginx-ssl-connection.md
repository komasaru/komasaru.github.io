---
layout   : single
title    : "CentOS 7.0 - Web サーバ Nginx で SSL 接続！"
published: true
date     : 2014-09-13 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- Nginx
---

「CentOS 7.0 - Web サーバ Nginx で SSL 接続」についての記録です。

（旧バージョンでの作業記録を更新しました。興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

- CentOS 7.0-1406(x86_64) を NetInstall で最小限インストールしている。
- サーバ用途なので、作業は基本的に全て一般ユーザから root になって行う。
- クライアント側は Linux Mint 17 を想定。
- Web(HTTP)サーバ Nginx が「[CentOS 7.0 - Web サーバ Nginx 構築（ソースインストール）！]( "CentOS 7.0 - Web サーバ Nginx 構築（ソースインストール）！")」の方法で導入済みであることを想定。

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
        listen       443 ssl;
    #    server_name  localhost;
        server_name  www.mk-mode.com;

        ssl                  on;
    #    ssl_certificate      cert.pem;
        ssl_certificate      /etc/pki/tls/certs/server.crt;
    #    ssl_certificate_key  cert.key;
        ssl_certificate_key  /etc/pki/tls/certs/server.key;

        ssl_session_cache    shared:SSL:1m;
        ssl_session_timeout  5m;

        ssl_ciphers  HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers  on;

        location / {
            root   html;
            index  index.html index.htm;
        }
    }
{% endhighlight %}

### 4. Nginx 再起動

``` text
# systemctl restart nginx
```

### 5. ファイアウォール設定

ポート TCP:443 を開放する。

``` text
# firewall-cmd --add-port=443/tcp
success
# firewall-cmd --add-port=443/tcp --permanent
success
# firewall-cmd --list-ports
110/tcp 465/tcp 4000-4005/tcp 443/tcp 873/tcp
```

### 6. 動作確認

ブラウザから `https://＜サーバ名orIPアドレス＞/` にアクセスし、セキュリティに関するページが表示されたら適宜インストールする。  
ブラウザにより異なるが、Firefox なら「危険を理解した上で接続するには」をクリック後「例外追加」ボタンをクリックする。そして開いたウィンドウ内で「セキュリティ例外を追加」ボタンをクリックする。  
認証に成功すると以下のように表示される。

![CENTOS_7-0_NGINX_SSL]({{site.baseurl}}/images/2014/09/13/CENTOS_7-0_NGINX_SSL.png "CENTOS_7-0_NGINX_SSL")

### 参考サイト

- [HTTPS サーバの設定](http://nginx.org/ja/docs/http/configuring_https_servers.html "HTTPS サーバの設定")

---

以上。

