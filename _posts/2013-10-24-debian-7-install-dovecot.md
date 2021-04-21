---
layout   : single
title    : "Debian 7 Wheezy - POP/IMAP サーバ Dovecot 構築！"
published: true
date     : 2013-10-24 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- Dovecot
---

Debian GNU/Linux 7.1.0 サーバに POP/IMAP サーバ Dovecot を構築する方法についての記録です。

POP は Post Office Protocol の略、IMAP は Internet Message Access Protocol の略で電子メール受信プロトコルのことです。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。

<!--more-->

### 0. 前提条件

- Debian GNU/Linux 7.1.0 での作業を想定。
- 接続元のマシンは Linux Mint 14(64bit) を想定。
- 接続可能なマシンのネットワークは `192.168.11.0/24` を想定。
- ドメイン名は `mk-mode.com`、サーバホスト名は `vbox` を想定。

### 1. Postfix インストール

POP/IMAP サーバ Dovecot を以下のようにしてインストールする。

``` text 
# aptitude -y install dovecot-common dovecot-pop3d dovecot-imapd
```

### 2. 設定ファイル dovecot.conf 編集

設定ファイル "dovecot.conf" を編集する。

File: `/etc/dovecot/dovecot.conf`

{% highlight bash linenos %} 
listen = *  # <= IPv6を使用しない場合
{% endhighlight %}

### 3. 設定ファイル 10-auth.conf 編集

設定ファイル "10-auth.conf" を編集する。

File: `/etc/dovecot/conf.d/10-auth.conf`

{% highlight bash linenos %} 
disable_plaintext_auth = no    # <= プレーンテキスト認証も許可

auth_mechanisms = plain login  # <= 認証時のパスフレーズ送信方式
{% endhighlight %}

### 4. 設定ファイル 10-mail.conf 編集

設定ファイル "10-mail.conf" を編集する。

File: `/etc/dovecot/conf.d/10-mail.conf`

{% highlight bash linenos %} 
mail_location = maildir:~/Maildir  # <= メールボックス形式をMaildir形式
{% endhighlight %}

### 5. 設定ファイル 10-master.conf 編集

設定ファイル "10-master.conf" を編集する。

File: `/etc/dovecot/conf.d/10-master.conf`

{% highlight bash linenos %} 
# Postfix smtp-auth
unix_listener /var/spool/postfix/private/auth {
    mode = 0666
    user = postfix   # <= ユーザ
    group = postfix  # <= グループ
} 
{% endhighlight %}

### 6. Dovecot 再起動

設定を反映させるために Dovecot を再起動する。

``` text 
# /etc/init.d/dovecot restart
Restarting IMAP/POP3 mail server: dovecot.
```

### 7. ファイアウォール（iptables）設定

実際に運用する場合は、ポートを開放する必要がある。

File: `/etc/iptables/rules.v4`

{% highlight bash linenos %} 
# 外部からのTCP110番ポート(POP3)へのアクセスを許可
-A INPUT -p tcp --dport 110 -j ACCEPT

# 外部からのTCP143番ポート(IMAP)へのアクセスを許可
-A INPUT -p tcp --dport 143 -j ACCEPT
{% endhighlight %}

そして、設定を反映させるために iptables-persistent を再起動する。

``` text 
# /etc/init.d/iptables-persistent restart
Loading iptables rules... IPv4... skipping IPv6 (no rules to load)...done.
```

### 8. メールソフト設定

Postfix, Dovecot 構築が完了すれば、メールソフトでメールの送受信が可能になる。  
メールソフトでは以下のように設定すればよい。

- メールアドレス：`アカウント名@メールホスト名`
- パスワード：`アカウントのパスワード`
- 受信メールサーバ：`POP` or `IMAP`
- 受信メールサーバアドレス：`メールホスト名`（内部なら `サーバローカルIPアドレス` でもよい）
- 受信メールサーバポート番号：`110`(POP) or `143`(IMAP)
- ログオンユーザ：`アカウント名`
- 送信メールサーバアドレス：`メールホスト名`（内部なら `サーバローカルIPアドレス` でもよい）
- 送信メールサーバポート番号：`25`
- 送信認証：「必要」

---

以上。

