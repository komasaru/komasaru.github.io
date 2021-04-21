---
layout   : single
title    : "CentOS 7.0 - 送信メールサーバ Postfix 構築！"
published: true
date     : 2014-08-18 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- Postfix
---

「CentOS 7.0 - 送信メールサーバ Postfix 構築」についての記録です。

（旧バージョンでの作業記録を更新しました。興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

- CentOS 7.0-1406(x86_64) を NetInstall で最小限インストールしている。
- サーバ用途なので、作業は基本的に全て一般ユーザから root になって行う。
- クライアント側は Linux Mint 17 を想定。
- IPv6 は無効化していることを想定。
- SMTP-Auth 機能にはシステムのユーザ名・パスワードを使用する。
- FirewallD のゾーンは public を使用する。
- 主に「[CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")」を参照。

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

#relayhost = $mydomain
#relayhost = [gateway.my.domain]
#relayhost = [mailserver.isp.tld]
#relayhost = uucphost
#relayhost = [an.ip.add.ress]
relayhost = [smtp.nifty.com]  # <= 追加（ISP の SMTPサーバー名を指定（@nifty の場合））

#home_mailbox = Mailbox
home_mailbox = Maildir/  # <= コメント解除（メールボックス形式：Maildir形式）

#smtpd_banner = $myhostname ESMTP $mail_name
#smtpd_banner = $myhostname ESMTP $mail_name ($mail_version)
smtpd_banner = $myhostname ESMTP unknown  # <= 追加（メールサーバーソフト名の隠蔽化）

# 以下を最終行へ追加（SMTP-Auth設定）
smtpd_sasl_auth_enable = yes
smtp_sasl_password_maps = hash:/etc/postfix/sasl_passwd
smtp_sasl_mechanism_filter = plain
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

SMTP-Auth 用のユーザ名・パスワードにシステムのものを使用する場合は、SMTP-Auth の設定をする必要がある。  
まず、cyrus-sasl が未インストールならインストールする。

``` text
# yum -y install cyrus-sasl
```

saslauthd を起動する。

``` text
# systemctl start saslauthd
```

自動起動設定は以下のようにする。

``` text
# systemctl enable saslauthd
ln -s '/usr/lib/systemd/system/saslauthd.service' '/etc/systemd/system/multi-user.target.wants/saslauthd.service'
# systemctl list-unit-files -t service | grep saslauthd
saslauthd.service                           enabled  # <= enabled であることを確認
```

そして、ISP の SMTP 認証ファイルを作成する。（以下は ISP が @nifty の場合）

File: `/etc/postfix/sasl_passwd`

{% highlight text linenos %}
[smtp.nifty.com] xxxxxxxx:xxxxxxxx  <=「[ISP の SMTP サーバ名] ユーザ名:パスワード」で指定
{% endhighlight %}

作成した ISP の SMTP 認証ファイルをハッシュ化する。

``` text
# postmap /etc/postfix/sasl_passwd
```

※ちなみに、SMTP-Auth 用ユーザ名・パスワードをシステムのものと別々にするには以下のように "/etc/sasl2/smtpd.conf" を編集すればよい。

File: `/etc/sasl2/smtpd.conf`

{% highlight bash linenos %}
#pwcheck_method: saslauthd
pwcheck_method: auxprop  # <= 変更
{% endhighlight %}

### 4. メールボックス作成（既存ユーザ用）

既存ユーザに対して、Maildir 形式のメールボックスを作成する（「共有ディレクトリ形式（"/var/spool/mail/＜ユーザ名＞"）」で保存されているメールデータを「Maildir 形式」に移行する）作業を行う。（セキュリティ上の観点から）  
既にサーバ運用中の場合は、メールデータ移行中に新規に受信してしまわないよう、メールサーバは停止しておく。（※まだメールサーバを運用していないのなら、この作業は不要）

まず、Maildir 変換ツールが用意されているのでダウンロードする。

``` text
# wget http://perfectmaildir.home-dn.net/perfect_maildir/perfect_maildir.pl -O /usr/local/bin/perfect_maildir.pl
```

ダウンロードした Maildir 変換ツールに実行権限を付与する。

``` text
# chmod +x /usr/local/bin/perfect_maildir.pl
```

Maildir 変換に必要な Perl-TimeDate モジュールを以下のようにしてインストールする。

``` text
# yum -y install perl-TimeDate
```

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

作成した Maildir 一括変換スクリプトを実行して、「共有ディレクトリ形式」のメールボックス "/var/spool/mail/＜ユーザ名＞" を「Maildir 形式」に移行する。（ログは "/tmp/migrate-maildir.log" に保存される）

``` text
# sh migrate-maildir mbox
```

ちなみに、「ホーム Mailbox 形式」のメールボックスを「Maildir 形式」に移行したい場合は以下のようにすればよい。

``` text
# sh migrate-maildir Mailbox
```

Maildir 一括変換スクリプトや Maildir 変換ツールは、もう不要なので削除しておく。

``` text
# rm -f migrate-maildir
# rm -f /usr/local/bin/perfect_maildir.pl
```

### 5. メールボックス作成（新規ユーザ用）

新規にユーザ追加した時に自動でホームディレクトリに「Maildir 形式」のメールボックスが作成されるようにする。

"/etc/skel" ディレクトリ配下にディレクトリを作成しておけば、新規ユーザ作成（`useradd`）時に作成されたユーザディレクトリにコピーされる。

``` text
# mkdir -p /etc/skel/Maildir/{new,cur,tmp}
```

作成したスケルトンディレクトリに権限を設定する。

``` text
# chmod -R 700 /etc/skel/Maildir/
```

### 6. Postfix 再起動

``` text
# systemctl restart postfix
```

### 7. Postfix 自動起動設定

今はデフォルトでインストール・自動起動するようになっているためこの作業は不要が、再インストールした場合には再度設定する。

``` text
# systemctl enable postfix
# systemctl list-unit-files -t service | grep postfix
postfix.service                             enabled  # <= enabled であることを確認
```

### 8. ポート開放

Postfix 運用を開始するには、使用しているルータでポート25番を開放する必要がある。

### 9. ファイアウォール設定

``` text
# firewall-cmd --add-service=smtp
success
# firewall-cmd --add-service=smtp --permanent
success
# firewall-cmd --list-services
dhcpv6-client dns ftp nfs smtp ssh
```

### 10. メールクライアント設定

メールクライアントの送信メールサーバの設定は以下のようにする。  
（受信メールサーバや OpenSSL の設定を行ってからまとめて行う方が良いかも知れない）

- 送信メールサーバ名： "/etc/postfix/main.cf" 内の "myhostname" 設定した FQDN 名
- ポート番号： "25"
- SSL：「不要」（現時点では OpenSSL 設定を行っていないので）
- 認証：「必要」

---

以上。

