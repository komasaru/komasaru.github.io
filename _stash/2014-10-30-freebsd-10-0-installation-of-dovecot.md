---
layout   : single
title    : "FreeBSD 10.0 - 受信メールサーバ Dovecot インストール！"
published: true
date     : 2014-10-30 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- FreeBSD
- Dovecot
---

「FreeBSD 10.0 - 受信メールサーバ Dovecot インストール」についての記録です。

（旧バージョンでの個人の作業記録を更新しました。興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* 以下の作業は、リモート接続して行う。（リモートから `ssh vbox` で接続）
* リモート端末は、 Linux Mint 17 マシンを想定しているが、 Unix 系 OS なら同じ。
* 設定ファイル等のテキストファイルの編集には `vi` コマンドを使用。
* 作業はリモート接続で一般ユーザから root になって行う。
* ドメインは "mk-mode.com" を想定。
* ログローテションをするので logrotate がインストール済みであること。
* 主に[FreeBSDサーバー構築マニュアル](http://freebsd.server-manual.com/ "FreeBSDサーバー構築マニュアル")を参照。

### 1. Dovecot インストール

``` text
# cd /usr/ports/mail/dovecot
# make BATCH=yes install clean
# cd
```

### 2. dovecot.conf 編集

まず、書き込み権限を付与。

``` text
# chmod 640 /usr/local/etc/dovecot.conf
```

そして、編集。

File: `/usr/local/etc/dovecot.conf`

{% highlight bash linenos %}
protocols = imap pop3              # <= 変更（imap, pop3 のみに対応）

ssl = no                           # <= コメント解除＆変更（SSL 拒否）

mail_location = maildir:~/Maildir  # <= 変更（メールボックスの場所）
{% endhighlight %}

### 3. Dovecot 自動起動設定

File: `/etc/rc.conf`

{% highlight bash linenos %}
dovecot_enable="YES"  # <= 追加
{% endhighlight %}

### 4. Dovecot 起動

PortSentry が起動していとポート 143/TCP との競合で Dovecot が起動できないので、まず PortSentry を停止。

``` text
# /usr/local/etc/rc.d/portsentry.sh stop
```

そして、Dovecot を起動。

``` text
# /usr/local/etc/rc.d/dovecot start
Starting dovecot.
If you have trouble with authentication failures,
enable auth_debug setting. See http://wiki.dovecot.org/WhyDoesItNotWork
This message goes away after the first successful login.
```

Dovecot 起動後に再度 PortSentry を起動。

``` text
# /usr/local/etc/rc.d/portsentry.sh start
portsentry (tcp udp)
```

### 5. メールエイリアス DB 再構築

（`user_name` は実際のユーザ名に置き換えること）

File: `/etc/aliases`

{% highlight bash linenos %}
root:    user_name  # <= 最終行に追加（root 宛メールの転送ユーザ（もしくはメールアドレス））
{% endhighlight %}

そして、設定を反映。

``` text
# postalias /etc/aliases
```

### 6. 既存ユーザ用メールディレクトリ作成

（`user_name` は実際のユーザ名に置き換えること）

``` text
# mkdir -p /home/user_name/Maildir/{cur,new,tmp}
# chmod -R 700 /home/user_name/Maildir
# chown -R user_name:user_name /home/user_name/Maildir
```

### 7. 新規ユーザ用メールディレクトリ作成

``` text
# mkdir -p /usr/share/skel/Maildir/{cur,new,tmp}
# chmod -R 700 /usr/share/skel/Maildir/
```

### 8. Procmail 設定

以下の内容でファイルを作成。

File: `/usr/local/etc/procmailrc`

{% highlight bash linenos %}
SHELL=/bin/sh
PATH=/bin:/usr/bin:/usr/local/bin
DROPPRIVS=yes
MAILDIR=$HOME/Maildir
DEFAULT=$MAILDIR/
#LOGFILE=$MAILDIR/procmail.log

# 件名に「未承諾広告※」を含むメールを破棄する
:0
* ^Subject:.*=\?[Ii][Ss][Oo]-2022-[Jj][Pp]\?[Bb]\?GyRCTCQ\+NUJ6OS05cCIo
/dev/null
{% endhighlight %}

### 9. Procmail ログローテーション

以下の内容のファイルを作成。

File: `/usr/local/etc/logrotate.d/procmail`

{% highlight bash linenos %}
/home/*/Maildir/procmail.log {
    monthly
    rotate 4
    missingok
}
{% endhighlight %}

### 10. POP3 接続確認

（`user_name`, `XXXXXXXXXX` は実際のユーザ名・パスワードに置き換えること）

``` text
# telnet localhost 110
Trying 127.0.0.1...
Connected to localhost.
Escape character is '^]'.
+OK Dovecot ready.
USER user_name           # <= 入力
+OK
PASS XXXXXXXXXX          # <= 入力
+OK Logged in.
LIST                     # <= 入力
+OK 0 messages:
.
QUIT                     # <= 入力
+OK Logging out.
Connection closed by foreign host.
```

### 11. BASE64 エンコードでパスワード作成

（`user_name`, `XXXXXXXXXX` は実際のユーザ名・パスワードに置き換えること）

``` text
# perl -MMIME::Base64 -e 'print encode_base64("user_name\0user_name\0user_pass");'
bW1lAHV1AG1hc2FQB1c2aBhc3M2yMQ==
```

（上記のキーは架空（手動でランダムに変更している））

### 12. SMTP 接続確認

（`user_name`, `XXXXXXXXXX`, キーは実際のユーザ名・パスワード、キーに置き換えること）

``` text
# telnet localhost 25
Trying 127.0.0.1...
Connected to localhost.
Escape character is '^]'.
220 mail.mk-mode.com ESMTP Postfix
EHLO localhost                                 # <= 入力
250-mail.mk-mode.com
250-PIPELINING
250-SIZE 10240000
250-VRFY
250-ETRN
250-AUTH SCRAM-SHA-1 DIGEST-MD5 CRAM-MD5 NTLM LOGIN PLAIN
250-AUTH=SCRAM-SHA-1 DIGEST-MD5 CRAM-MD5 NTLM LOGIN PLAIN
250-ENHANCEDSTATUSCODES
250-8BITMIME
250 DSN
AUTH PLAIN bW1lAHV1AG1hc2FQB1c2aBhc3M2yMQ==    # <= 入力
235 2.7.0 Authentication successful
QUIT                                           # <= 入力
221 2.0.0 Bye
Connection closed by foreign host.
```

### 13. メール送信テスト

（`user_name` は実際のユーザ名に置き換えること）

``` text
# echo test | mail -s TEST user_name
# ls /home/user_name/Maildir/new/
1413362731.37180_0.vbox.mk-mode.com
# rm -f /home/user_name/Maildir/new/*  # <= 削除する場合
```

### 14. その他

実運用時にはポート開放の設定を適切に行うこと。

---

以上。

