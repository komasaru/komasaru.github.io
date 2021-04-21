---
layout   : single
title    : "CentOS 6.5 - 受信メールサーバ（Dovecot）構築！"
published: true
date     : 2013-12-27 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- Dovecot
---

前回は CentOS 6.5 サーバに Postfix の OP25B 対策を行いました。  
今回は受信メールサーバ Dovecot の構築を行います。

<!--more-->

### 0. 前提条件

- CentOS 6.5(x86_64) を Minimal で最小インストールしている。
- クライントマシンは Linux Mint 14(64bit) を想定。
- 主に「[CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")」を参考にしている。  
  （実際は、過去にこのサイトを参考にして作業した際に記録していたものを参照している）

### 1. Dovecot インストール

受信メールサーバ Dovecot を以下のようにしてインストールする。

``` text
# yum -y install dovecot
```

### 2. Dovecot 設定ファイル covecot.conf 編集

初期設定時 IPv6 を無効化にした場合 Dovecot が影響を受けるので以下のようにする。

File: `/etc/dovecot/dovecot.conf`

{% highlight bash linenos %}
#listen = *, ::
listen = *       # <= 追加
{% endhighlight %}

### 3. Dovecot 設定ファイル 10-mail.conf 編集

Dovecot 設定ファイルの "10-mail.conf" を以下のように編集する。（該当箇所のみ抜粋）

File: `/etc/dovecot/conf.d/10-mail.conf`

{% highlight bash linenos %}
#mail_location =
mail_location = maildir:~/Maildir  # <= 追加（「Maildir 形式」メールボックを使用）

#valid_chroot_dirs =
valid_chroot_dirs = /home  # <= 追加（OpenSSH+Chrootを導入している場合）
{% endhighlight %}

### 4. Dovecot 設定ファイル 10-auth.conf 編集

Dovecot 設定ファイルの "10-auth.conf" を以下のように編集する。（該当箇所のみ抜粋）

File: `/etc/dovecot/conf.d/10-auth.conf`

{% highlight bash linenos %}
#disable_plaintext_auth = yes
disable_plaintext_auth = no  # <= 追加（プレインテキスト認証を許可。OpenSSL によりメールサーバ間通信内容を暗号化する場合）
{% endhighlight %}

### 5. Dovecot 起動

Dovecot を以下のようにして起動する。

``` text
# /etc/rc.d/init.d/dovecot start
Dovecot Imapを起動中:                                      [  OK  ]
```

### 6. Dovecot 自動起動設定

マシン起動時に自動で Dovecot が起動するように設定する。

``` text
# chkconfig dovecot on
# chkconfig --list dovecot  # <= 2,3,4,5 が "on" であることを確認
dovecot         0:off   1:off   2:on    3:on    4:on    5:on    6:off
```

### 7. ポート開放

メールを受信にするにはルータのポート（POP なら 110 番、IMAP なら 143 番）を開放する。

### 8. メールクライアント設定

メールクライアントの送信メールサーバの設定は以下のようにする。  
（受信メールサーバや OpenSSL の設定を行ってからまとめて行う方が良いかも知れない）

- サーバの種類："POP" or "IMAP"
- 受信メールサーバ名： 受信メールサーバ FQDN 名
- ポート番号： "110"（POP の場合） or "143"（IMAP の場合）
- 認証：「必要」

### 参考サイト

- [CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")

---

次回は、OpenSSL によるメールサーバ間通信内容暗号化について紹介する予定です。

以上。

