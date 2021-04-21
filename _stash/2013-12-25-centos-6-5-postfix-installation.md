---
layout   : single
title    : "CentOS 6.5 - 送信メールサーバ（Postfix）構築！"
published: true
date     : 2013-12-25 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- Postfix
---

前回は CentOS 6.5 サーバにファイルサーバ Samba の構築を行いました。  
今回は送信メールサーバ Postfix の構築を行います。

<!--more-->

### 0. 前提条件

- CentOS 6.5(x86_64) を Minimal で最小インストールしている。
- クライントマシンは Linux Mint 14(64bit) を想定。
- SMTP-Auth 機能にはシステムのユーザ名・パスワードを使用する。
- 主に「[CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")」を参考にしている。
  （実際は、過去にこのサイトを参考にして作業した際に記録していたものを参照している）

### 1. Postfix インストール

今は送信メールサーバ Postfix はデフォルトでインストールされている。  
インストールされていない場合は、以下のようにしてインストールする。

``` text
# yum -y install postfix
```

### 2. Postfix 設定ファイル編集

Postfix 設定ファイルを以下のように編集する。（該当箇所のみ抜粋）

File: `/etc/postfix/main.cf`

{% highlight bash linenos %}
#myhostname = host.domain.tld
#myhostname = virtual.domain.tld
myhostname = mail.mk-mode.com  # <=追加（自FQDN名）

#mydomain = domain.tld
mydomain = mk-mode.com   # <= 追加（自ドメイン名）

#myorigin = $myhostname
myorigin = $mydomain     # <= コメント解除（ローカルからのメール送信時の送信元メールアドレス@以降にドメイン名を付加）

inet_interfaces = all         # <= コメント解除（外部からのメール受信を許可）
#inet_interfaces = $myhostname
#inet_interfaces = $myhostname, localhost
#inet_interfaces = localhost  # <= コメント化

#inet_protocols = all
inet_protocols = ipv4  # <= 追加（初期設定時に IPv6 を無効化にした場合 Postfix が影響を受けるので）

#mydestination = $myhostname, localhost.$mydomain, localhost            # <= コメント化
mydestination = $myhostname, localhost.$mydomain, localhost, $mydomain  # <= コメント解除（自ドメイン宛メールを受信可能に）
#mydestination = $myhostname, localhost.$mydomain, localhost, $mydomain,
#       mail.$mydomain, www.$mydomain, ftp.$mydomain

relay_domains = $mydestination  # <= コメント解除（リレーを許可するドメインを指定。デフォルトなのでしてしなくても大丈夫だが）

#home_mailbox = Mailbox
home_mailbox = Maildir/  # <= コメント解除（メールボックス形式：Maildir形式）

#smtpd_banner = $myhostname ESMTP $mail_name
#smtpd_banner = $myhostname ESMTP $mail_name ($mail_version)
smtpd_banner = $myhostname ESMTP unknown  # <= 追加（メールサーバーソフト名の隠蔽化）

# 以下を最終行へ追加（SMTP-Auth設定）
smtpd_sasl_auth_enable = yes
smtpd_sasl_local_domain = $myhostname
smtpd_sasl_security_options = noanonymous  # <= これも追加（匿名ログインを許可しない）
smtpd_recipient_restrictions =
    permit_mynetworks
    permit_sasl_authenticated
    reject_unauth_destination
broken_sasl_auth_clients = yes             # <= これも追加（AUTH コマンドを認識できないメールソフトに対応させる）

# 以下を最終行へ追加(受信メールサイズ制限)
message_size_limit = 10485760  # <= 受信メールサイズを 10MB=10*1024*1024 に制限
{% endhighlight %}

### 3. SMTP-Auth 設定

今回は、SMTP-Auth 用のユーザ名・パスワードにシステムのものを使用するので、以下のように saslauthd を起動すればよい。

``` text
# /etc/rc.d/init.d/saslauthd start
saslauthd を起動中:                                        [  OK  ]

# chkconfig saslauthd on      # <= 自動起動設定
# chkconfig --list saslauthd  # <= 2,3,4,5 が "on" であることを確認
saslauthd       0:off   1:off   2:on    3:on    4:on    5:on    6:off
```

ちなみに、SMTP-Auth 用ユーザ名・パスワードをシステムのものと別々にするには以下のように "/etc/sasl2/smtpd.conf" を編集すればよい。

File: `/etc/sasl2/smtpd.conf`

{% highlight bash linenos %}
#pwcheck_method: saslauthd
pwcheck_method: auxprop  # <= 変更
{% endhighlight %}

### 4. メールボックス作成（既存ユーザ用）

既存ユーザに対して、Maildir 形式のメールボックスを作成する（「共有ディレクトリ形式（"/var/spool/mail/＜ユーザ名＞"）」で保存されているメールデータを「Maildir 形式」に移行する）作業を行う。（セキュリティ上の観点から）

既にサーバ運用中の場合は、メールデータ移行中に新規に受信してしまわないよう、メールサーバは停止しておく。（※まだメールサーバを運用していないのなら、この作業は不要）

#### 4-1. Maildir 変換ツール入手

Maildir 変換ツールが用意されているのでダウンロードする。

``` text
# wget http://perfectmaildir.home-dn.net/perfect_maildir/perfect_maildir.pl -O /usr/local/bin/perfect_maildir.pl
```

#### 4-2. Maildir 変換ツール権限設定

ダウンロードした Maildir 変換ツールに実行権限を付与する。

``` text
# chmod +x /usr/local/bin/perfect_maildir.pl
```

#### 4-3. Perl-TimeDate モジュールインストール

Maildir 変換に必要な Perl-TimeDate モジュールを以下のようにしてインストールする。

``` text
# yum -y install perl-TimeDate
```

#### 4-4. Maildir 一括変換スクリプト作成

Maildir 一括変換スクリプト "migrate-maildir" を以下のように作成する。

File: `migrate-maildir`

{% highlight bash linenos %}
#!/bin/bash

#
#Maildir一括変換スクリプト
#

#メールボックス=>Maildir形式変換スクリプト
#http://perfectmaildir.home-dn.net/
FOLDERCONVERT=/usr/local/bin/perfect_maildir.pl

#一般ユーザリスト
USERLIST=`ls /home/`

#ログ
MIGRATELOG=/tmp/migrate-maildir.log
rm -f $MIGRATELOG

#引数(変換元メールボックス形式)チェック
if [ "$1" != "mbox" ] && [ "$1" != "Mailbox" ]
then
    echo "Usage: migrate-maildir {mbox|Mailbox}"
    exit
fi

#一般ユーザメールボックス移行
for user in $USERLIST;
do
    if [ "$1" = "mbox" ]; then
        inbox="/var/spool/mail/${user}"
    else
        inbox="/home/${user}/Mailbox"
    fi
        if [ -f "${inbox}" ]
    then
        newdir="/home/${user}/Maildir/"
        mkdir -p "$newdir"
        mkdir -p "$newdir"/cur
        mkdir -p "$newdir"/new
        mkdir -p "$newdir"/tmp
        chmod -R 700 "${newdir}"
        $FOLDERCONVERT "$newdir" < "${inbox}" >> $MIGRATELOG 2>&1
        chown -R "${user}":"${user}" "$newdir"
        find "$newdir" -type f  -exec chmod 600 {} \;
    fi
done

#rootユーザメールボックス移行
user="root"
if [ "$1" = "mbox" ]; then
    inbox="/var/spool/mail/${user}"
else
    inbox="/${user}/Mailbox"
fi
if [ -f "${inbox}" ]
then
    newdir="/${user}/Maildir/"
    mkdir -p "$newdir"
    mkdir -p "$newdir"/cur
    mkdir -p "$newdir"/new
    mkdir -p "$newdir"/tmp
    chmod -R 700 "${newdir}"
    $FOLDERCONVERT "$newdir" < "${inbox}" >> $MIGRATELOG 2>&1
    chown -R "${user}":"${user}" "$newdir"
    find "$newdir" -type f  -exec chmod 600 {} \;
fi
{% endhighlight %}

#### 4-5. メールデータ移行

作成した Maildir 一括変換スクリプトを実行して、「共有ディレクトリ形式」のメールボックス "/var/spool/mail/＜ユーザ名＞" を「Maildir 形式」に移行する。（ログは "/tmp/migrate-maildir.log" に保存される）

``` text
# sh migrate-maildir mbox
```

ちなみに、「ホーム Mailbox 形式」のメールボックを「Maildir 形式」に移行したい場合は以下のようにすればよい。

``` text
# sh migrate-maildir Mailbox
```

#### 4-6. メールデータ移行後始末

Maildir 一括変換スクリプトや Maildir 変換ツールは、もう不要なので削除しておく。

``` text
# rm -f migrate-maildir
# rm -f /usr/local/bin/perfect_maildir.pl
```

### 5. メールボックス作成（新規ユーザ用）

新規にユーザ追加した時に自動でホームディレクトリに「Maildir 形式」のメールボックスが作成されるようにする。

#### 5-1. スケルトンディレクトリ作成

"/etc/skel" ディレクトリ配下にディレクトリを作成しておけば、新規ユーザ作成（`useradd`）時に作成されたユーザディレクトリにコピーされる。

``` text
# mkdir -p /etc/skel/Maildir/{new,cur,tmp}
```

#### 5-2. スケルトンディレクトリ権限設定

作成したスケルトンディレクトリに権限を設定する。

``` text
# chmod -R 700 /etc/skel/Maildir/
```

### 6. Postfix 起動

Postfix を以下のようにして起動する。

``` text
# /etc/rc.d/init.d/postfix restart
postfix を停止中:                                          [  OK  ]
postfix を起動中:                                          [  OK  ]
```

### 7. Postfix 自動起動設定

マシン起動時に自動で Postfix が起動するよう設定する。

``` text
# chkconfig postfix on
# chkconfig --list postfix  # <= 2,3,4,5 が "on" であることを確認
postfix         0:off   1:off   2:on    3:on    4:on    5:on    6:off
```

### 8. ポート開放

Postfix 運用を開始するには、使用しているルータでポート25番」を開放する必要がある。

また、ファイアウォールでもポート「25番」を開放する。

### 9. メールクライアント設定

メールクライアントの送信メールサーバの設定は以下のようにする。  
（受信メールサーバや OpenSSL の設定を行ってからまとめて行う方が良いかも知れない）

- 送信メールサーバ名： "/etc/postfix/main.cf" 内の "myhostname" 設定した FQDN 名
- ポート番号： "25"
- SSL：「不要」（現時点では OpenSSL 設定を行っていないので）
- 認証：「必要」

### 参考サイト

- [CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")

---

次回は、Postfix の OP25B 対策について紹介する予定です。

以上。

