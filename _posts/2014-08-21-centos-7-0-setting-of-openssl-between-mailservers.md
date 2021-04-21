---
layout   : single
title    : "CentOS 7.0 - メールサーバ間通信内容暗号化 OpenSSL！"
published: true
date     : 2014-08-21 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- Postfix
- Dovecot
---

「CentOS 7.0 - メールサーバ間通信内容暗号化 OpenSSL」についての記録です。

（旧バージョンでの作業記録を更新しました。興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

- CentOS 7.0-1406(x86_64) を NetInstall で最小限インストールしている。
- サーバ用途なので、作業は基本的に全て一般ユーザから root になって行う。
- クライアント側は Linux Mint 17 を想定。
- 送信メールサーバ Postfix, 受信メールサーバ Dovecot 構築済みであること。
- FirewallD のゾーンは public を使用する。
- 主に「[CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")」を参照。

### 1. Postfix 設定

#### 1-1. サーバ証明書作成

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

File: `/etc/postfix/main.cf`

{% highlight bash linenos %}
# 以下を最終行へ追加
smtpd_use_tls = yes
smtpd_tls_cert_file = /etc/pki/tls/certs/mail.pem
smtpd_tls_key_file = /etc/pki/tls/certs/mail.pem
smtpd_tls_session_cache_database = btree:/var/lib/postfix/smtpd_scache
{% endhighlight %}

#### 1-3. Postfix 設定ファイル master.cf 編集

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
# systemctl restart postfix
```

#### 1-5. ポート開放

ルータのポート（465番）を開放する。  

#### 1-6. ファイアウォール設定

``` text
# firewall-cmd --add-port=465/tcp
success
# firewall-cmd --add-port=465/tcp --permanent
success
# firewall-cmd --list-ports
110/tcp 465/tcp 4000-4005/tcp
```

### 2. Dovecot 設定

#### 2-1. Dovecot 設定ファイル 10-ssl.conf 編集

File: `/etc/dovecot/conf.d/10-ssl.conf`

{% highlight bash linenos %}
# SSL/TLS support: yes, no, required. 
ssl = yes  # <= 変更（TLS 通信の有効化）

# PEM encoded X.509 SSL/TLS certificate and private key. They're opened before
# dropping root privileges, so keep the key file unreadable by anyone but
# root. Included doc/mkcert.sh can be used to easily generate self-signed
# certificate, just make sure to update the domains in dovecot-openssl.cnf
ssl_cert = </etc/pki/tls/certs/mail.pem  # <= 変更（サーバ証明書を指定）
ssl_key = </etc/pki/tls/certs/mail.pem   # <= 変更（サーバ証明書を指定）
{% endhighlight %}

#### 2-2. Dovecot 再起動

``` text
# systemctl restart dovecot
```

#### 2-3. ポート開放

ルータのポート（POP なら 995番、IMAP なら 993番）を開放する。  
ファイアウォールの設定も開放してあるか確認しておく（"iptables.sh"）。

#### 2.4. ファイアウォール設定

``` text
# firewall-cmd --add-service=pop3s
success
# firewall-cmd --add-service=pop3s --permanent
success
# firewall-cmd --list-services
dhcpv6-client dns ftp nfs pop3s smtp ssh
```

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

---

以上。

