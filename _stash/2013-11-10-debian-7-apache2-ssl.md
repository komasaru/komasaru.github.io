---
layout   : single
title    : "Debian 7 Wheezy - Apache2 の SSL 化！"
published: true
date     : 2013-11-10 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- Apache
- SSL
---

Debian GNU/Linux 7 Wheezy サーバ上の Web サーバ Apache2 を SSL 化する方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。

<!--more-->

### 0. 前提条件

- Debian GNU/Linux 7.1.0 での作業を想定。
- Web サーバは Apache2 を想定。

### 1. サーバ証明書作成

Apache2 を SSL/TLS で使用できるようサーバ証明書を作成する。

``` text 
# cd /etc/ssl/private

# openssl genrsa -des3 -out server.key 2048
Generating RSA private key, 2048 bit long modulus
........................................................................................................................................+++
............................................................................+++
e is 65537 (0x10001)
Enter pass phrase for server.key:              # <= サーバ鍵パスワード入力
Verifying - Enter pass phrase for server.key:  # <= サーバ鍵パスワード確認入力

# openssl rsa -in server.key -out server.key
Enter pass phrase for server.key:              # <= サーバ鍵パスワード応答
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
Organization Name (eg, company) [Internet Widgits Pty Ltd]:mk-mode.com  # <= サイト名（何でもよい
Organizational Unit Name (eg, section) []:                              # <= 部署名（空でよい）
Common Name (e.g. server FQDN or YOUR name) []:www.mk-mode.com          # <= ホスト名
Email Address []:webmaster@mk-mode.com                                  # <= 管理者メールアドレス

Please enter the following 'extra' attributes
to be sent with your certificate request
A challenge password []:      # <= 追加属性・空エンターでよい
An optional company name []:  # <= 追加属性・空エンターでよい

# openssl x509 -in server.csr -out server.crt -req -signkey server.key -days 3650
Signature ok
subject=/C=JP/ST=Shimane/L=Matsue/O=mk-mode.com/CN=www.mk-mode.com/emailAddress=webmaster@mk-mode.com
Getting Private key
```

作成したサーバ証明書のパーミッションを設定する。（所有者読み込み専用に）

``` text 
# chmod 400 server.*
```

### 2. SSL 設定ファイル編集

設定ファイル "sites-available/default-ssl" を以下のように編集する。

File: `/etc/apache2/sites-available/default-ssl`

{% highlight text linenos %} 
ServerAdmin webmaster@mk-mode.com  # <= 管理者メールアドレス

Options FollowSymLinks ExecCGI     # <= シンボリックリンク許可、CGI スクリプト実行許可（"/var/www" 部分）

AllowOverride All                  # <= .htaccessの許可

SSLCertificateFile /etc/ssl/private/server.crt     # <= 作成したサーバ証明書ファイル
SSLCertificateKeyFile /etc/ssl/private/server.key  # <= 作成した秘密鍵ファイル
{% endhighlight %}

### 3. SSL 設定実行

SSL 設定を有効化するために、以下のように実行する。

``` text 
# a2ensite default-ssl
Enabling site default-ssl.
To activate the new configuration, you need to run:
  service apache2 reload

# a2enmod ssl
Enabling module ssl.
See /usr/share/doc/apache2.2-common/README.Debian.gz on how to configure SSL and create self-signed certificates.
To activate the new configuration, you need to run:
  service apache2 restart
```

### 4. Apache2 再起動

さらに、Apache2 を再起動する。

``` text 
# /etc/init.d/apache2 restart
Restarting web server: apache2 ... waiting .
```

### 5. 動作確認

ブラウザで `https://＜Webサーバのホスト名 or IP アドレス＞/` にアクセスしてみる。  
見栄えはブラウザにより異なるが、証明書をインストールすれば、SSL 接続（HTTPS 接続）が可能になる。

---

以上。

