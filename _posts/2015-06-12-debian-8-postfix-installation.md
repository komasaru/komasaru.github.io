---
layout   : single
title    : "Debian 8 (Jessie) - SMTP サーバ Postfix 構築！"
published: true
date     : 2015-06-12 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- Postfix
---

Debian GNU/Linux 8 (Jessie) に SMTP サーバ Postfix を構築する方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 8 (Jessie) での作業を想定。
* 接続元のマシンは Linux Mint 17.1(64bit) を想定。
* 接続可能なマシンのネットワークは `192.168.11.0/24` を想定。
* ドメイン名は `mk-mode.com`、サーバホスト名は `mail` を想定。

### 1. Postfix のインストール

SMTP サーバ Postfix と認証・セキュリティツールを以下のようにしてインストールする。  
途中でどの設定を選択するか確認されますが、後で設定を行うので "No Configuration(設定なし)" を選択する。

``` text
# apt-get -y install postfix sasl2-bin
```

### 2. 設定ファイルの編集

設定ファイル "main.cf" を所定のディレクトリへ移動後、編集する。

``` text
# cp /usr/lib/postfix/main.cf /etc/postfix/main.cf
```

File: `/etc/postfix/main.cf`

{% highlight bash linenos %}
mail_owner = postfix                   # <= メール所有者

myhostname = mail.mk-mode.com          # <= ホスト名

mydomain = mk-mode.com                 # <= ドメイン名

myorigin = $mydomain                   # <= ローカルからのメール送信時の送信元メールアドレス@以降にドメイン名を付加

inet_interfaces = all                  # <= 外部からのメール受信を許可

mydestination = $myhostname, localhost.$mydomain, localhost, $mydomain  # <= 自ドメイン宛メールを受信できるようにする

local_recipient_maps = unix:passwd.byname $alias_maps  # <= サーバにアカウントがあれば、その人宛に届く

mynetworks = 127.0.0.0/8, 192.168.11.0/24  # <= 自ネットワーク

alias_maps = hash:/etc/aliases         # <= 受信メールの再転送先ファイル

alias_database = hash:/etc/aliases     # <= newaliasesコマンドの実行対象

home_mailbox = Maildir/                # <= メールボックス形式を Maildir 形式に

#smtpd_banner = $myhostname ESMTP $mail_name (@@DISTRO@@)
smtpd_banner = $myhostname ESMTP       # <= メールサーバーソフト名の隠蔽化

sendmail_path = /usr/sbin/postfix      # <= Postfix sendmail コマンドの場所

newaliases_path = /usr/bin/newaliases  # <= Postfix newaliases コマンドの場所

mailq_path = /usr/bin/mailq            # <= Postfix mailq コマンドの場所

setgid_group = postdrop                # <= set-gid Postfix コマンドおよびグループ書き込み可能な Postfix ディレクトリを所有するグループ

#html_directory =                      # <= コメント化

#manpage_directory =                   # <= コメント化

#sample_directory =                    # <= コメント化

#readme_directory =                    # <= コメント化

# 最終行へ追加
message_size_limit = 10485760          # <= 送受信メールサイズを10Mに制限
mailbox_size_limit = 1073741824        # <= メールボックスサイズを1Gに制限

# SMTP-Auth用
smtpd_sasl_type = dovecot
smtpd_sasl_path = private/auth
smtpd_sasl_auth_enable = yes
smtpd_sasl_security_options = noanonymous
smtpd_sasl_local_domain = $myhostname
smtpd_client_restrictions = permit_mynetworks,reject_unknown_client,permit
smtpd_recipient_restrictions = permit_mynetworks,permit_auth_destination,permit_sasl_authenticated,reject
{% endhighlight %}

### 3. saslauthd の編集

マシン起動時に saslauthd を自動起動させるために "saslauthd" を編集する。

File: `/etc/default/saslauthd`

{% highlight bash linenos %}
START=yes  # <= no を yes に変更
{% endhighlight %}

これをしないと saslauthd 起動時に以下のような警告が出力される。

``` text
To enable saslauthd, edit /etc/default/saslauthd and set START=yes (warning).
```

### 4. saslauthd の起動

``` text
# systemctl start saslauthd
```

### 5. Postfix の再起動

設定を反映させるためにエイリアスの変更を反映させ、 Postfix を再起動する。

``` text
# newaliases
# systemctl restart postfix
Stopping Postfix Mail Transport Agent: postfix.
Starting Postfix Mail Transport Agent: postfix.
```

### 6. ファイアウォール(ufw)の設定

実際に運用する場合は、TCP ポート 25(SMTP) を開放する必要がある。

``` text
# ufw allow 25/tcp
Rule added
Rule added (v6)

# ufw status
    :
25/tcp                     ALLOW       Anywhere
    :
25/tcp                     ALLOW       Anywhere (v6)
```

### 7. メールの転送設定

root や postmaster 等宛に届いたメールを一般ユーザに転送するには "/etc/aliases" を編集する。  
以下は一例。（最初から postomaster を root に転送するようになっているかも知れない。root を一般ユーザに転送するようにしている）

File: `/etc/aliases`

{% highlight bash linenos %}
postmaster: root
root:       masaru
{% endhighlight %}

この設定を有効にするために以下のように実行する。

``` text
# newaliases                 # <= エイリアスの即時反映
# systemctl restart postfix  # <= Postfix の再起動
```

"/etc/postfix/main.cf" 内で説明されているとおり、 `newaliases` の代わりに `postalias /etc/aliases` でもよい。

---

以上。

