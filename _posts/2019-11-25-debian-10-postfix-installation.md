---
layout   : single
title    : "Debian 10 (buster) - SMTP サーバ Postfix 構築！"
published: true
date     : 2019-11-25 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- Postfix
---

Debian GNU/Linux 10 (buster) に SMTP サーバ Postfix を構築する方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10 (buster) での作業を想定。
* 接続元のマシンは LMDE 3(Linux Mint Debian Edition3)(64bit) を想定。
* 接続可能なマシンのネットワークは `192.168.11.0/24` を想定。
* ドメイン名は `mk-mode.com`、サーバホスト名は `mail` を想定。
* root ユーザでの作業を想定。

### 1. Postfix のインストール

SMTP サーバ Postfix を以下のようにしてインストールする。  
途中でどの設定を選択するか確認されますが、後で設定を行うので「設定なし」(`No Configuration`)を選択する。

``` text
# apt -y install postfix sasl2-bin
```

### 2. 設定ファイルの編集

設定ファイル雛形から `main.cf` を複製後、編集する。

``` text
# cp /usr/share/postfix/main.cf.dist /etc/postfix/main.cf
```

もしくは、以下のようにしてもよい。（`main.cf.dist` と `main.cf.proto` は内容が同じようなので）

``` text
# cp /etc/postfix/main.cf{.proto,}
```

File: `/etc/postfix/main.cf`

``` text
mail_owner = postfix                   # <= メール所有者

myhostname = mail.mk-mode.com          # <= ホスト名

mydomain = mk-mode.com                 # <= ドメイン名

myorigin = $mydomain                   # <= ローカルからのメール送信時の送信元メールアドレス@以降にドメイン名を付加

inet_interfaces = all                  # <= 外部からのメール受信を許可

mydestination = $myhostname, localhost.$mydomain, localhost, $mydomain, vbox.$mydomain  # <= 自ドメイン宛メールを受信できるようにする

local_recipient_maps = unix:passwd.byname $alias_maps  # <= サーバにアカウントがあれば、その人宛に届く

mynetworks = 127.0.0.0/8               # <= 自ネットワーク

alias_maps = hash:/etc/aliases         # <= 受信メールの再転送先ファイル

alias_database = hash:/etc/aliases     # <= newaliasesコマンドの実行対象

home_mailbox = Maildir/                # <= メールボックス形式を Maildir 形式に

#smtpd_banner = $myhostname ESMTP $mail_name (Debian/GNU)
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
```

### 3. saslauthd の編集

マシン起動時に saslauthd を自動起動させるために `saslauthd` を編集する。

File: `/etc/default/saslauthd`

``` text
START=yes  # <= no を yes に変更
```

これをしないと saslauthd 起動時に以下のような警告が出力される。

``` text
To enable saslauthd, edit /etc/default/saslauthd and set START=yes (warning).
```

### 4. saslauthd の再起動

``` text
# systemctl restart saslauthd
```

### 5. Postfix の再起動

設定を反映させるためにエイリアスの変更を反映させ、 Postfix を再起動する。

``` text
# newaliases
# systemctl restart postfix
```

### 6. ファイアウォール(ufw)の設定

実際に運用する場合は、TCP ポート 25(SMTP) を開放する必要がある。

``` text
# ufw allow 25/tcp
Rule added

# ufw status
    :
25/tcp                     ALLOW       Anywhere
    :
```

### 7. メールの転送設定

root や postmaster 等宛に届いたメールを一般ユーザに転送するには `/etc/aliases` を編集する。  
以下は一例。（最初から `postomaster` を `root` に、 `root` を一般ユーザに転送するようになっているかも知れない）

File: `/etc/aliases`

``` text
postmaster: root
root:       masaru
```

この設定を有効にするために以下のようにする。

``` text
# newaliases                 # <= エイリアスの即時反映
# systemctl restart postfix  # <= Postfix の再起動
```

`/etc/postfix/main.cf` 内で説明されているとおり、 `newaliases` の代わりに `postalias /etc/aliases` でもよい。

---

以上。

