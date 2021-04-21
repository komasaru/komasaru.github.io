---
layout   : single
title    : "CentOS 6.5 - メールサーバ間通信内容暗号化（OpenSSL）！"
published: true
date     : 2013-12-28 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- Postfix
- Dovecot
---

前回は CentOS 6.5 サーバに受信メールサーバ Dovecot の構築を行いました。  
今回は OpenSSL によるメールサーバ間通信内容暗号化を行います。

<!--more-->

### 0. 前提条件

- CentOS 6.5(x86_64) を Minimal で最小インストールしている。
- クライントマシンは Linux Mint 14(64bit) を想定。
- 送信メールサーバ Postfix, 受信メールサーバ Dovecot 構築済みであること。
- 主に「[CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")」を参考にしている。  
  （実際は、過去にこのサイトを参考にして作業した際に記録していたものを参照している）

### 1. Postfix 設定

#### 1-1. サーバ証明書作成

以下のようにしてサーバ証明書を作成する

``` text
# cd /etc/pki/tls/certs/
# make mail.pem
umask 77 ; \
        PEM1=`/bin/mktemp /tmp/openssl.XXXXXX` ; \
        PEM2=`/bin/mktemp /tmp/openssl.XXXXXX` ; \
        /usr/bin/openssl req -utf8 -newkey rsa:2048 -keyout $PEM1 -nodes -x509 -days 365 -out $PEM2 -set_serial 0 ; \
        cat $PEM1 >  mail.pem ; \
        echo ""    >> mail.pem ; \
        cat $PEM2 >> mail.pem ; \
        rm -f $PEM1 $PEM2
Generating a 2048 bit RSA private key
...................................................................................+++
...................+++
writing new private key to '/tmp/openssl.xZLZ4S'
-----
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Country Name (2 letter code) [XX]:JP                                       # <= 国名
State or Province Name (full name) []:Shimane                              # <= 都道府県名
Locality Name (eg, city) [Default City]:Matsue                             # <= 市区町村名
Organization Name (eg, company) [Default Company Ltd]:mk-mode.com          # <= 会社名・サイト名
Organizational Unit Name (eg, section) []:                                 # <= 部署名
Common Name (eg, your name or your server's hostname) []:mail.mk-mode.com  # <= ホスト名・管理者名
Email Address []:postmaster@mk-mode.com                                    # <= 管理者メールアドレス
# cd
```

#### 1-2. Postfix 設定ファイル main.cf 編集

Postfix 設定ファイル "/etc/postfix/main.cf" を以下のように編集する。

File: `/etc/postfix/main.cf`

{% highlight bash linenos %}
# 以下を最終行へ追加
smtpd_use_tls = yes
smtpd_tls_cert_file = /etc/pki/tls/certs/mail.pem
smtpd_tls_key_file = /etc/pki/tls/certs/mail.pem
smtpd_tls_session_cache_database = btree:/var/lib/postfix/smtpd_scache
{% endhighlight %}

#### 1-3. Postfix 設定ファイル master.cf 編集

Postfix 設定ファイル "/etc/postfix/master.cf" を以下のように編集する。

File: `/etc/postfix/master.cf`

{% highlight bash linenos %}
# ==========================================================================
# service type  private unpriv  chroot  wakeup  maxproc command + args
#               (yes)   (yes)   (yes)   (never) (100)
# ==========================================================================
smtp      inet  n       -       n       -       -       smtpd
#submission inet n       -       n       -       -       smtpd
#  -o smtpd_tls_security_level=encrypt
#  -o smtpd_sasl_auth_enable=yes
#  -o smtpd_client_restrictions=permit_sasl_authenticated,reject
#  -o milter_macro_daemon_name=ORIGINATING
smtps     inet  n       -       n       -       -       smtpd  # <= コメント解除
  -o smtpd_tls_wrappermode=yes                                 # <= コメント解除
  -o smtpd_sasl_auth_enable=yes                                # <= コメント解除
{% endhighlight %}

#### 1-4. Postfix 再起動

``` text
# /etc/rc.d/init.d/postfix restart
postfix を停止中:                                          [  OK  ]
postfix を起動中:                                          [  OK  ]
```

#### 1-5. ポート開放

ルータのポート（465番）を開放する。  
ファイアウォールの設定も開放してあるか確認しておく（"iptables.sh"）。

### 2. Dovecot 設定

#### 2-1. Dovecot 設定ファイル 10-ssl.conf 編集

Dovecot 設定ファイル "/etc/dovecot/conf.d/10-ssl.conf" を以下のように編集する。

File: `/etc/dovecot/conf.d/10-ssl.conf`

{% highlight bash linenos %}
# SSL/TLS support: yes, no, required. 
ssl = yes  # <= コメント解除（TLS 通信の有効化）

# PEM encoded X.509 SSL/TLS certificate and private key. They're opened before
# dropping root privileges, so keep the key file unreadable by anyone but
# root. Included doc/mkcert.sh can be used to easily generate self-signed
# certificate, just make sure to update the domains in dovecot-openssl.cnf
ssl_cert = </etc/pki/tls/certs/mail.pem  # <= 変更（サーバ証明書を指定）
ssl_key = </etc/pki/tls/certs/mail.pem   # <= 変更（サーバ証明書を指定）
{% endhighlight %}

#### 2-2. Dovecot 再起動

``` text
# /etc/rc.d/init.d/dovecot restart
Dovecot Imap を停止中:                                     [  OK  ]
Dovecot Imap を起動中:                                     [  OK  ]
```

#### 2-3. ポート開放

ルータのポート（POP なら 995番、IMAP なら 993番）を開放する。  
ファイアウォールの設定も開放してあるか確認しておく（"iptables.sh"）。

### 3. インポート用サーバ証明書作成

メールクライアントへインポートするためのサーバ証明書を以下のようにして作成する。  
作成後は、"/etc/pki/tls/certs/mail.der" FTP 等何かしらの手段でクライアントマシンにサーバ証明書ファイルをコピーする。

``` text
# cd /etc/pki/tls/certs
# openssl x509 -in mail.pem -outform DER -out mail.der
```

### 4. メールクアント設定

メールクライアントでは、先ほど作成したサーバ証明書をインポートする。（方法はメールクライアントによる）  
そして、送信メールサーバの設定で ”SSL” を使用するようにチェックする。  
ポートは以下のようにする。

- 送信メールサーバ： 465
- 受信メールサーバ： 995（POP の場合） or 993（IMAP の場合）

### 5. 動作確認

内部や外部からメールを送受信して正常に動作するか確認する。

### 参考サイト

- [CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")

---

次回は、メールサーバ Postfix でウィルスチェックする方法について紹介する予定です。

以上。

