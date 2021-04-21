---
layout   : single
title    : "Debian 9 (Stretch) - POP/IMAP サーバ Dovecot 構築！"
published: true
date     : 2017-09-02 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- Dovecot
---

Debian GNU/Linux 9 (Stretch) に POP/IMAP サーバ Dovecot を構築する方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 9 (Stretch) での作業を想定。
* 接続元のマシンは LMDE2(Linux Mint Debian Edition 2)(64bit) を想定。
* 接続可能なマシンのネットワークは `192.168.11.0/24` を想定。
* ドメイン名は `mk-mode.com`、サーバホスト名は `vbox` を想定。
* IPv6 は使用しないことを想定。
* root ユーザでの作業を想定。

### 1. Dovecot のインストール

POP/IMAP サーバ Dovecot を以下のようにしてインストールする。

``` text
# apt -y install dovecot-common dovecot-pop3d dovecot-imapd
```

### 2. 設定ファイル dovecot.conf の編集

File: `/etc/dovecot/dovecot.conf`

{% highlight bash linenos %}
listen = *  # <= IPv6を使用しない場合
{% endhighlight %}

### 3. 設定ファイル 10-auth.conf の編集

File: `/etc/dovecot/conf.d/10-auth.conf`

{% highlight bash linenos %}
disable_plaintext_auth = no    # <= プレーンテキスト認証も許可

auth_mechanisms = plain login  # <= 認証時のパスフレーズ送信方式
{% endhighlight %}

### 4. 設定ファイル 10-mail.conf の編集

File: `/etc/dovecot/conf.d/10-mail.conf`

{% highlight bash linenos %}
mail_location = maildir:~/Maildir  # <= メールボックス形式をMaildir形式
{% endhighlight %}

### 5. 設定ファイル 10-master.conf の編集

File: `/etc/dovecot/conf.d/10-master.conf`

{% highlight bash linenos %}
# Postfix smtp-auth
unix_listener /var/spool/postfix/private/auth {  # <= コメント解除
    mode = 0666                                  # <= コメント解除
    user = postfix                               # <= 追加（ユーザ）
    group = postfix                              # <= 追加（グループ）
}                                                # <= コメント解除
{% endhighlight %}

### 6. Dovecot の再起動

``` text
# systemctl restart dovecot
```

### 7. ファイアウォール(ufw)の設定

実際に運用する場合は、TCPポート 110(POP3), 143(IMAP) を開放する必要がある。

``` text
# ufw allow 110,143/tcp
Rule added

# ufw status
    :
110,143/tcp                ALLOW       Anywhere
    :
```

### 8. メールソフトの設定

Postfix, Dovecot 構築が完了すれば、メールソフトでメールの送受信が可能になる。  
メールソフトでは以下のように設定すればよい。

* メールアドレス：`アカウント名@メールホスト名`
* パスワード：`アカウントのパスワード`
* 受信メールサーバ：`POP` or `IMAP`
* 受信メールサーバアドレス：`メールホスト名`（内部なら `サーバローカルIPアドレス` でもよい）
* 受信メールサーバポート番号：`110`(POP) or `143`(IMAP)
* ログオンユーザ：`アカウント名`
* 送信メールサーバアドレス：`メールホスト名`（内部なら `サーバローカルIPアドレス` でもよい）
* 送信メールサーバポート番号：`25`
* 送信認証：「必要」

---

以上。

