---
layout   : single
title    : "CentOS 7.0 - 受信メールサーバ Dovecot 構築！"
published: true
date     : 2014-08-20 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- Dovecot
---

「CentOS 7.0 - 受信メールサーバ Dovecot 構築」についての記録です。

（旧バージョンでの作業記録を更新しました。興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

- CentOS 7.0-1406(x86_64) を NetInstall で最小限インストールしている。
- サーバ用途なので、作業は基本的に全て一般ユーザから root になって行う。
- クライアント側は Linux Mint 17 を想定。
- 送信メールサーバは Postfix を想定。（Sendmail 等については各自お調べください）
- FirewallD のゾーンは public を使用する。
- 主に「[CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")」を参照。

### 1. Dovecot インストール

``` text
# yum -y install dovecot
```

### 2. Dovecot 設定ファイル dovecot.conf 編集

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

``` text
# systemctl start dovecot
```

### 6. Dovecot 自動起動設定

``` text
# systemctl enable dovecot
ln -s '/usr/lib/systemd/system/dovecot.service' '/etc/systemd/system/multi-user.target.wants/dovecot.service'
# systemctl list-unit-files -t service | grep  dovecot
dovecot.service                             enabled  # <= enabled であることを確認
```

### 7. ポート開放

メールを受信にするにはルータのポート（POP なら 110 番、IMAP なら 143 番）を開放する。

### 8. ファイアウォール設定

``` text
# firewall-cmd --add-port=110/tcp
success
# firewall-cmd --add-port=110/tcp --permanent
success
# firewall-cmd --list-ports
110/tcp 4000-4005/tcp
```

### 9. メールクライアント設定

メールクライアントの送信メールサーバの設定は以下のようにする。  
（受信メールサーバや OpenSSL の設定を行ってからまとめて行う方が良いかも知れない）

- サーバの種類："POP" or "IMAP"
- 受信メールサーバ名： 受信メールサーバ FQDN 名
- ポート番号： "110"（POP の場合） or "143"（IMAP の場合）
- 認証：「必要」

---

以上。

