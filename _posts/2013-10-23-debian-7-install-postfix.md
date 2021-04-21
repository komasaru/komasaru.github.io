---
layout   : single
title    : "Debian 7 Wheezy - SMTP サーバ Postfix 構築！"
published: true
date     : 2013-10-23 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- Postfix
---

Debian GNU/Linux 7.1.0 サーバに SMTP サーバ Postfix を構築する方法についての記録です。

SMTP サーバは Simple Mail Transfer Protocol の略で、現在最も普及している電子メール送信プロトコルに対応したサーバのことです。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。

<!--more-->

### 0. 前提条件

- Debian GNU/Linux 7.1.0 での作業を想定。
- 接続元のマシンは Linux Mint 14(64bit) を想定。
- 接続可能なマシンのネットワークは `192.168.11.0/24` を想定。
- ドメイン名は `mk-mode.com`、サーバホスト名は `mail` を想定。

### 1. Postfix インストール

SMTP サーバ Postfix を以下のようにしてインストールする。  
途中でどの設定を選択するか確認されますが、後で設定を行うので "設定なし" を選択する。

``` text 
# aptitude -y install postfix sasl2-bin
```

### 2. 設定ファイル編集

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

### 3. Postfix 再起動

設定を反映させるためにエイリアスの変更を反映させ、 Postfix を再起動する。

``` text 
# newaliases
# /etc/init.d/postfix restart
Stopping Postfix Mail Transport Agent: postfix.
Starting Postfix Mail Transport Agent: postfix.
```

### 4. ファイアウォール（iptables）設定

実際に運用する場合は、ポートを開放する必要がある。

File: `/etc/iptables/rules.v4`

{% highlight bash linenos %} 
# 外部からのTCP25番ポート(SMTP)へのアクセスを許可
-A INPUT -p tcp --dport 25 -j ACCEPT
{% endhighlight %}

そして、設定を反映させるために iptables-persistent を再起動する。

``` text 
# /etc/init.d/iptables-persistent restart
Loading iptables rules... IPv4... skipping IPv6 (no rules to load)...done.
```

### 5. メール転送設定

root や postmaster 等宛に届いたメールを一般ユーザに転送するには "/etc/aliases" を編集する。  
以下は一例。（最初から postomaster を root に転送するようになっているかも知れない。root を一般ユーザに転送するようにしている）

File: `/etc/aliases`

{% highlight bash linenos %} 
# See man 5 aliases for format
postmaster: root
root:       masaru
{% endhighlight %}

この設定を有効にするために以下のようにする。

File: `/etc/aliases`

{% highlight bash linenos %} 
# newaliases                   # <= エイリアスの即時反映
# /etc/init.d/postfix restart  # <= Postfix の再起動
{% endhighlight %}

"/etc/postfix/main.cf" 内で説明されているとおり、 `newaliases` の代わりに `postalias /etc/aliases` でもよい。

### 6. root 宛メールの転送

システムから root 宛に届くメールを一般ユーザに転送するよう "/etc/aliases" を編集する。
（サーバ上の一般ユーザではなく別のメールアドレスに転送したければ、そのままメールアドレスを指定すればよい）

File: `/etc/aliases`

{% highlight bash linenos %} 
root: masaru
{% endhighlight %}

"/etc/aliases" を編集したら以下を実行して反映させる。

``` text 
# newaliases
```

---

以上。

