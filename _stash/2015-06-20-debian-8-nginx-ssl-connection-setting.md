---
layout   : single
title    : "Debian 8 (Jessie) - Web サーバ Nginx で SSL 接続！"
published: true
date     : 2015-06-20 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- Nginx
- SSL
---

Debian GNU/Linux 8 (Jessie) に構築した Web サーバ Nginx で SSL 接続するための設定についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 8 (Jessie) での作業を想定。
* クライアント側は Linux Mint 17.1 を想定。
* サーバ用途なので、作業は基本的に全て一般ユーザから root になって行う。
* Web(HTTP)サーバ Nginx が「[Debian 8 (Jessie) - Web サーバ Nginx 構築（Nginx 公式リポジトリ使用）！]({{site.baseurl}}/2015/06/19/debian-8-nginx-installation-by-official-apt/ "Debian 8 (Jessie) - Web サーバ Nginx 構築（Nginx 公式リポジトリ使用）！")」の方法で導入済みであることを想定。
* 当方はメールサーバ構築時に SSL 証明書作成済みであったので、以下の "2" から作業を行なった。

### 1. SSL 証明書の作成

openssl 未インストールならインストール。

``` text
# apt-get -y install openssl
```

秘密鍵生成。

``` text
# cd /etc/ssl/private
# openssl genrsa -des3 -out server.key 2048
Generating RSA private key, 2048 bit long modulus
...................+++
.....+++
e is 65537 (0x10001)
Enter pass phrase for server.key:              # <= パスフレーズ設定
Verifying - Enter pass phrase for server.key:  # <= 確認再入力
```

秘密鍵からパスフレーズを削除。

``` text
# openssl rsa -in server.key -out server.key
Enter pass phrase for server.key:              # <= パスフレーズ
writing RSA key

# openssl req -new -days 3650 -key server.key -out server.csr
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Country Name (2 letter code) [AU]:JP                                    # <= 国の略名
State or Province Name (full name) [Some-State]:Shimane                 # <= 都道府県名
Locality Name (eg, city) []:Matsue                                      # <= 市区町村名
Organization Name (eg, company) [Internet Widgits Pty Ltd]:mk-mode.com  # <= サイト名（何でもよい）
Organizational Unit Name (eg, section) []:                              # <= 部署名（空でよい）
Common Name (e.g. server FQDN or YOUR name) []:www.mk-mode.com          # <= ホスト名
Email Address []: webmaster@mk-mode.com                                 # <= 管理者メールアドレス
Please enter the following 'extra' attributes
to be sent with your certificate request
A challenge password []:                                                # <= 追加属性・空エンターでよい
An optional company name []:                                            # <= 追加属性・空エンターでよい

# openssl x509 -in server.csr -out server.crt -req -signkey server.key -days 3650
Signature ok
subject=/C=JP/ST=Hiroshima/L=Hiroshima/O=GTS/OU=Server World/CN=www.server.world/emailAddress=xxx@server.world
Getting Private key
```

権限選定。

``` text
# chmod 400 server.*
```

### 2. Nginx 設定ファイルの編集

以下のように、Nginx 設定ファイル "HTTPS server" 用 "server" ディレクティブ内を、コメント解除しキー設定を先ほど設定したものに変更する。  
（Nginx のインストール方法やバージョンによっては設定ファイルの構成が異なるので注意。以下は「[Debian 8 (Jessie) - Web サーバ Nginx 構築（Nginx 公式リポジトリ使用）！]({{site.baseurl}}/2015/06/19/debian-8-nginx-installation-by-official-apt/ "Debian 8 (Jessie) - Web サーバ Nginx 構築（Nginx 公式リポジトリ使用）！")」の方法でインストールした場合）

まず、SSL 用設定ファイルサンプルを複製。

``` text
# cd /etc/nginx/conf.d
# cp example_ssl.conf ssl.conf
```

そして、編集。

File: `/etc/nginx/conf.d/ssl.conf`

{% highlight bash linenos %}
# HTTPS server
#
server {
    listen       443 ssl;
    server_name  localhost;

    #ssl_certificate      cert.pem;
    ssl_certificate      /etc/ssl/private/server.crt;
    #ssl_certificate_key  cert.key;
    ssl_certificate_key  /etc/ssl/private/server.key;

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

### 3. Nginx の再起動

``` text
# systemctl restart nginx
```

### 4. ファイアウォール(ufw)の設定

ポート TCP:443 を開放する。

``` text
# ufw allow 443/tcp
Rule added
Rule added (v6)

# ufw status
    :
443/tcp                    ALLOW       Anywhere
    :
443/tcp                    ALLOW       Anywhere (v6)
```

### 6. 動作確認

ブラウザから `https://＜サーバ名orIPアドレス＞/` にアクセスし、セキュリティに関するページが表示されたら適宜インストールする。  
ブラウザにより異なるが、Firefox なら「危険を理解した上で接続するには」をクリック後「例外追加」ボタンをクリックする。そして開いたウィンドウ内で「セキュリティ例外を追加」ボタンをクリックする。  
認証に成功すると以下のように表示される。

### 参考サイト

- [HTTPS サーバの設定](http://nginx.org/ja/docs/http/configuring_https_servers.html "HTTPS サーバの設定")

---

以上。

