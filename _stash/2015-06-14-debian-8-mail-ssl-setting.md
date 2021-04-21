---
layout   : single
title    : "Debian 8 (Jessie) - メールサーバ SSL 設定！"
published: true
date     : 2015-06-14 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- Postfix
- Dovecot
- SSL
---

Debian GNU/Linux 8 (Jessie) に導入したメールサーバを SSL 設定する方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 8 (Jessie) での作業を想定。
* 接続元のマシンは Linux Mint 17.1(64bit) を想定。
* SMTP サーバは Postfix, POP/IMAP サーバは Dovecot を想定。  
  - Postfix を「[Debian 8 (Jessie) - SMTP サーバ Postfix 構築！]({{site.baseurl}}/2015/06/12/debian-8-postfix-installation/ "Debian 8 (Jessie) - SMTP サーバ Postfix 構築！")」の方法で導入済み。
  - Dovecot を「[Debian 8 (Jessie) - POP/IMAP サーバ Dovecot 構築！]({{site.baseurl}}/2015/06/13/debian-8-dovecot-installation/ "Debian 8 (Jessie) - POP/IMAP サーバ Dovecot 構築！")」の方法で導入済み。
* 接続可能なマシンのネットワークは `192.168.11.0/24` を想定。
* ドメイン名は `mk-mode.com`、サーバホスト名は `vbox` を想定。
* SSL サーバ OpenSSL 導入済み。（インストールは `aptitude -y install openssl` でよい）

### 1. SSL 証明書の作成

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
------------------------------------------
Country Name (2 letter code) [AU]:JP                                    # <= 国の略名
State or Province Name (full name) [Some-State]:Shimane                 # <= 都道府県名
Locality Name (eg, city) []:Matsue                                      # <= 市区町村名
Organization Name (eg, company) [Internet Widgits Pty Ltd]:mk-mode.com  # <= サイト名（何でもよい）
Organizational Unit Name (eg, section) []:                              # <= 部署名（空でよい）
Common Name (e.g. server FQDN or YOUR name) []:mail.mk-mode.com         # <= ホスト名
Email Address []:postmaster@mk-mode.com                                 # <= 管理者メールアドレス

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

### 2. Postfix - main.cf の設定

File: `/etc/postfix/main.cf`

{% highlight bash linenos %}
# SSL 用（最終行に追加）
smtpd_use_tls = yes
smtpd_tls_cert_file = /etc/ssl/private/server.crt
smtpd_tls_key_file = /etc/ssl/private/server.key
smtpd_tls_session_cache_database = btree:${data_directory}/smtpd_scache
{% endhighlight %}

### 3. Postfix - master.cf の編集

File: `/etc/postfix/master.cf`

{% highlight bash linenos %}
# コメント解除
smtps     inet  n       -       -       -       -       smtpd
  -o syslog_name=postfix/smtps
  -o smtpd_tls_wrappermode=yes
{% endhighlight %}

### 4. Dovecot - 10-ssl.conf の編集

File: `/etc/dovecot/conf.d/10-ssl.conf`

{% highlight bash linenos %}
# SSL 有効化
ssl = yes

# 証明書/鍵ファイル指定
ssl_cert = </etc/ssl/private/server.crt
ssl_key = </etc/ssl/private/server.key
{% endhighlight %}

### 5. Postfix, Dovecot の再起動

``` text
# systemctl restart postfix
# systemctl restart dovecot
```

### 6. ファイアウォール(ufw)の設定

実際に運用する場合は、TCP ポート 465(SMTPS), 993(IMAPS), 995(POP3S) を開放する必要がある。

``` text
# ufw allow 465,993,995/tcp
Rule added
Rule added (v6)

# ufw status
    :
465,993,995/tcp            ALLOW       Anywhere
    :
465,993,995/tcp            ALLOW       Anywhere (v6)
```

### 7. メールソフトの設定

メールソフトではポート番号を変更すればよい。

* 受信メールサーバポート：`993`(IMAP) or `995`(POP)
* 送信メールサーバポート：`465`

認証警告画面が表示され、認証すれば（例外として承認すれば） SSL 通信で送受信できるようになる。

---

以上。

