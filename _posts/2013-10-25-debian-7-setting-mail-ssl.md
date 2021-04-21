---
layout   : single
title    : "Debian 7 Wheezy - メールサーバ SSL 設定！"
published: true
date     : 2013-10-25 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- Postfix
- Dovecot
---

Debian GNU/Linux 7.1.0 サーバに構築したメールサーバ Postfix, Dovecot で SSL 通信を可能にする方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。

<!--more-->

### 0. 前提条件

- Debian GNU/Linux 7.1.0 での作業を想定。
- 接続元のマシンは Linux Mint 14(64bit) を想定。
- 接続可能なマシンのネットワークは `192.168.11.0/24` を想定。
- ドメイン名は `mk-mode.com`、サーバホスト名は `vbox` を想定。
- SSL サーバ OpenSSL 導入済み。（インストールは `aptitude -y install openssl` でよい）

### 1. SSL 証明書作成

SSL 証明書を以下のように作成する。

``` text 
# cd /etc/ssl/private

# openssl genrsa -des3 -out server.key 2048
Generating RSA private key, 2048 bit long modulus
..................................+++
.......................................................+++
e is 65537 (0x10001)
Enter pass phrase for server.key:              # <= サーバ証明書用パスワード設定
Verifying - Enter pass phrase for server.key:  # <= サーバ証明書用パスワード確認入力

# openssl rsa -in server.key -out server.key
Enter pass phrase for server.key:              # <= サーバ証明書用パスワード応答
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
Email Address []:webmaster@mk-mode.com                                  # <= 管理者メールアドレス

Please enter the following 'extra' attributes
to be sent with your certificate request
A challenge password []:      # <= 追加属性・空エンターでよい
An optional company name []:  # <= 追加属性・空エンターでよい

# openssl x509 -in server.csr -out server.crt -req -signkey server.key -days 3650
Signature ok
subject=/C=JP/ST=Shimane/L=Matsue/O=mk-mode.com/CN=www.mk-mode.com/emailAddress=webmaster@mk-mode.com
Getting Private key

# chmod 400 server.*
```

### 2. Postfix - main.cf 設定

Postfix の設定ファイル "main.cf" を以下のように編集する。

File: `/etc/postfix/main.cf`

{% highlight bash linenos %} 
# SSL 用（最終行に追加）
smtpd_use_tls = yes
smtpd_tls_cert_file = /etc/ssl/private/server.crt
smtpd_tls_key_file = /etc/ssl/private/server.key
smtpd_tls_session_cache_database = btree:${data_directory}/smtpd_scache
{% endhighlight %}

### 3. Postfix - master.cf 編集

Postfix の設定ファイル "master.cf" を以下のように編集する。

File: `/etc/postfix/master.cf`

{% highlight bash linenos %} 
# コメント解除
smtps     inet  n       -       -       -       -       smtpd
  -o syslog_name=postfix/smtps
  -o smtpd_tls_wrappermode=yes
{% endhighlight %}

### 4. Dovecot - 10-ssl.conf 編集

Dovecot の設定ファイル "10-ssl.conf" を以下のように編集する。

File: `/etc/dovecot/conf.d/10-ssl.conf`

{% highlight bash linenos %} 
# SSL 有効化
ssl = yes

# 証明書/鍵ファイル指定
ssl_cert = </etc/ssl/private/server.crt
ssl_key = </etc/ssl/private/server.key
{% endhighlight %}

### 5. Postfix, Dovecot 再起動

設定を反映させるため、Postfix, Dovecot を再起動する。

``` text 
# /etc/init.d/postfix restart
Stopping Postfix Mail Transport Agent: postfix.
Starting Postfix Mail Transport Agent: postfix.

# /etc/init.d/dovecot restart
Restarting IMAP/POP3 mail server: dovecot.
```

### 6. ファイアウォール（iptables）設定

実際に運用する場合は、ポートを開放する必要がある。

File: `/etc/iptables/rules.v4`

{% highlight bash linenos %} 
# 外部からのTCP465番ポート(SMTPS)へのアクセスを許可
-A INPUT -p tcp --dport 465 -j ACCEPT

# 外部からのTCP995番ポート(POP3S)へのアクセスを許可
-A INPUT -p tcp --dport 995 -j ACCEPT

# 外部からのTCP993番ポート(IMAPS)へのアクセスを許可
-A INPUT -p tcp --dport 993 -j ACCEPT
{% endhighlight %}

そして、設定を反映させるために iptables-persistent を再起動する。

``` text 
# /etc/init.d/iptables-persistent restart
Loading iptables rules... IPv4... skipping IPv6 (no rules to load)...done.
```

### 7. メールソフト設定

メールソフトではポート番号を変更すればよい。

- 受信メールサーバポート：`993`(IMAP) or `995`(POP)
- 送信メールサーバポート：`465`

認証警告画面が表示され、認証すれば（例外として承認すれば） SSL 通信で送受信できるようになる。

---

以上。

