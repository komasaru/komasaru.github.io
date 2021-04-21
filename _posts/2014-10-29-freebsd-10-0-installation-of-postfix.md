---
layout   : single
title    : "FreeBSD 10.0 - 送信メールサーバ Postfix インストール！"
published: true
date     : 2014-10-29 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- FreeBSD
- Postfix
---

「FreeBSD 10.0 - 送信メールサーバ Postfix インストール」についての記録です。

（旧バージョンでの個人の作業記録を更新しました。興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* 以下の作業は、リモート接続して行う。（リモートから `ssh vbox` で接続）
* リモート端末は、 Linux Mint 17 マシンを想定しているが、 Unix 系 OS なら同じ。
* 設定ファイル等のテキストファイルの編集には `vi` コマンドを使用。
* 作業はリモート接続で一般ユーザから root になって行う。
* ドメインは "mk-mode.com" を想定。
* 主に[FreeBSDサーバー構築マニュアル](http://freebsd.server-manual.com/ "FreeBSDサーバー構築マニュアル")を参照。

### 1. Procmail インストール

メール振り分けに Procmail を使用するのでインストール。

``` text
# cd /usr/ports/mail/procmail
# make BATCH=yes install clean
# cd
```

### 2, pkgtools.conf 編集

`make` 実行時に常時設定するパラメータを設定しておく。

File: `/usr/local/etc/pkgtools.conf`

{% highlight bash linenos %}
  MAKE_ARGS = {
    'security/cyrus-sasl2' => 'WITHOUT_OTP=yes',         # <= 追加
    'security/cyrus-sasl2-saslauthd' => 'WITH_BDB=yes',  # <= 追加
    'mail/postfix' => 'WITH_SASL2=yes WITH_TLS=yes',     # <= 追加
  }
{% endhighlight %}

### 3. Cyrus SASL2 インストール

SASL 認証に Cyrus SASL2 を使用するのでインストール。

``` text
# cd /usr/ports/security/cyrus-sasl2
# make BATCH=yes WITHOUT_OTP=yes WITH_BDB=yes install clean
# rehash
```

### 4. Cyrus saslauthd インストール

Cyrus SASL2 認証用デーモンをインストール。

``` text
# cd /usr/ports/security/cyrus-sasl2-saslauthd
# make BATCH=yes WITH_BDB=yes install clean
```

### 5. Postfix インストール

``` text
# cd /usr/ports/mail/postfix
# make WITH_SASL2=yes WITH_TLS=yes WITH_BDB=yes install clean
Would you like to activate Postfix in /etc/mail/mailer.conf [n]?  # <= エンター応答（mailer.conf は後で手動で書き換えるので "n" 応答）
# rehash
# cd
```

### 6. main.cf 編集

File: `/usr/local/etc/postfix/main.cf`

{% highlight bash linenos %}
myhostname = mail.mk-mode.com              # <= コメント解除＆変更（自ホスト名）

mydomain = mk-mode.com                     # <= コメント解除＆変更（自ドメイン名）

myorigin = $mydomain                       # <= コメント解除（送信元メール）

inet_interfaces = all                      # <= コメント解除（待ち受けるネットワークアドレス）

mydestination = $myhostname, localhost.$mydomain, localhost, $mydomain  # <= コメント解除（ローカル受信ドメイン）

relay_domains = $mydestination             # <= コメント解除（リレー許可ドメイン）

alias_maps = hash:/etc/aliases             # <= コメント解除（エイリアス設定）

alias_database = hash:/etc/aliases         # <= コメント解除（エイリアス設定）

home_mailbox = Maildir/                    # <= コメント解除（メールボックスを Maildir 形式に）

mailbox_command = /usr/local/bin/procmail  # <= コメント解除＆変更（procmail のパス）

# 最終行に以下を追記（SASL による SMTP 認証）
# Cyrus-SASL configuration
smtpd_sasl_auth_enable = yes               # <= SASL による SMTP-Auth の許可
smtpd_sasl_local_domain = $mydomain        # <= リレーの許可
smtpd_sasl_security_options = noanonymous  # <= 匿名ログイン拒否
smtpd_recipient_restrictions = permit_mynetworks, permit_sasl_authenticated, reject_unauth_destination  # <= リレー許可設定
broken_sasl_auth_clients = yes             # <= AUTH コマンド認識不可のメールソフトに対応
{% endhighlight %}

### 7. saslauthd 自動起動設定

File: `/etc/rc.conf`

{% highlight bash linenos %}
saslauthd_enable="YES"       # <= 追加
saslauthd_flags="-a sasldb"  # <= 追加
{% endhighlight %}

### 8. saslauthd 起動

``` text
# /usr/local/etc/rc.d/saslauthd start
Starting saslauthd.
```

### 9. SMTP AUTH 設定

以下の内容のファイルを作成。

File: `/usr/local/lib/sasl2/smtpd.conf`

{% highlight bash linenos %}
pwcheck_method: auxprop
{% endhighlight %}

### 10. SMTP AUTH ユーザ追加

（`user_name` は実際のユーザ名に置き換えること）

``` text
# saslpasswd2 -c -u mk-mode.com user_name
Password: XXXXXXXXXX                    # <= メールユーザのパスワード
Again (for verification): XXXXXXXXXX    # <= パスワード確認入力
[root@freebsd ~]# sasldblistusers2     # <= メールユーザ確認
user_name@mk-mode.com: userPassword
```

### 11. /usr/local/etc/sasldb2 所有権変更

``` text
# chown cyrus:mail /usr/local/etc/sasldb2
# chmod 640 /usr/local/etc/sasldb2
```

### 12. Sendmail 停止

デフォルトで起動している Sendmail を停止。（依存する他の起動中サービスも停止される）

``` text
# /etc/rc.d/sendmail stop
Stopping sendmail.
sendmail_submit not running? (check /var/run/sendmail.pid).
Stopping sendmail_msp_queue.
```

### 13. Sendmail 自動起動解除

File: `/etc/rc.conf`

{% highlight bash linenos %}
sendmail_enable="NO"            # <= 追加
sendmail_submit_enable="NO"     # <= 追加
sendmail_outbound_enable="NO"   # <= 追加
sendmail_msp_queue_enable="NO"  # <= 追加
{% endhighlight %}

その他、以下の作業も必要。

File: `/etc/periodic.conf`

{% highlight bash linenos %}
daily_clean_hoststat_enable="NO"        # <= 新規追加
daily_status_mail_rejects_enable="NO"   # <= 新規追加
daily_status_include_submit_mailq="NO"  # <= 新規追加
daily_submit_queuerun="NO"              # <= 新規追加
{% endhighlight %}

``` text
# mv /etc/mail/mailer.conf /etc/mail/mailer.conf.org
```

File: `/etc/mail/mailer.conf`

{% highlight bash linenos %}
sendmail    /usr/local/sbin/sendmail  # <= 新規追加
send-mail   /usr/local/sbin/sendmail  # <= 新規追加
mailq       /usr/local/sbin/sendmail  # <= 新規追加
newaliases  /usr/local/sbin/sendmail  # <= 新規追加
{% endhighlight %}

File: `/etc/make.conf`

{% highlight bash linenos %}
NO_MAILWRAPPER=YES  # <= 新規追加
NO_SENDMAIL=YES     # <= 新規追加
{% endhighlight %}

### 14. Postfix 自動起動設定

File: `/etc/rc.conf`

{% highlight bash linenos %}
postfix_enable="YES"  # <= 追加
{% endhighlight %}

### 15. Postfix 起動

``` text
# /usr/local/etc/rc.d/postfix start
postfix/postfix-script: starting the Postfix mail system
```

---

以上。

