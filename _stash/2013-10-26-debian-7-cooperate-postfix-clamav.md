---
layout   : single
title    : "Debian 7 Wheezy - Postfix と ClamAV の連携！"
published: true
date     : 2013-10-26 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- Postfix
- ウイルス対策
---

Debian GNU/Linux 7.1.0 サーバに構築したメールサーバ Postfix をアンチウイルスソフト ClamAV と連携させる方法（スパムフィルタも導入）についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。

<!--more-->

### 0. 前提条件

- Debian GNU/Linux 7.1.0 での作業を想定。
- 接続元のマシンは Linux Mint 14(64bit) を想定。
- SMTP サーバ Postfix 導入済み。
- アンチウイルスソフト ClamAV 導入済み。
- スパムフィルタも運用する。
- アンチウイルス ClamAV との連携には、 ClamAV daemon を使用する方法の他に、ClamSMTP を使用する方法もある。
- スパムフィルタ SpamAssassin との連携には、 amavisd-new を使用する方法の他に SpamPD を使用する方法もある。

### 1. インストール

Postfix を ClamAV と連携させてウイルススキャン・スパムフィルタを行うのに必要な ClamAV daemon, amavisd-new, SpamAssassinを、以下のようにしてインストールする。

``` text 
# aptitude -y install clamav-daemon amavisd-new spamassassin
```

### 2. SpamAssassin 設定ファイル編集

SpamAssassin の設定ファイルを以下のように編集する。

File: `/etc/default/spamassassin`

{% highlight bash linenos %} 
ENABLED=1  # <= スパムフィルタも有効化
{% endhighlight %}

### 3. amavisd-new 設定ファイル編集

Postfix と ClamAV, SpamAssassin を連携するのに必要な amavisd-new の設定ファイルを用意し、編集する。

``` text 
# cp /usr/share/doc/amavisd-new/examples/amavisd.conf-default.gz /etc/amavis/
# gunzip /etc/amavis/amavisd.conf-default.gz
# mv /etc/amavis/amavisd.conf-default /etc/amavis/amavisd.conf
```

File: `/etc/amavis/amavisd.conf`

{% highlight bash linenos %} 
$myhostname = 'mail.mk-mode.com';    # <= ホスト名
$mydomain   = 'mk-mode.com';         # <= ドメイン名

$daemon_user   = 'amavis';           # <= amavis デーモンユーザ名
$daemon_group  = 'amavis';           # <= amavis デーモングループ名

$MYHOME        = '/var/lib/amavis';  # <= amavisd ホーム

# $virus_admin = undef;              # <= コメント化されていることを確認（ウイルス検知を都度通知しない）
{% endhighlight %}

ちなみに、以前のバージョンでは "/etc/amavis/amavisd.conf" で以下の設定も行なっていたが、現在のバージョンでは "/etc/amavis/conf.d/15-av_scanners" で設定されているので意識しなくてよい。

File: `/etc/amavis/conf.d/15-av_scanners`

{% highlight bash linenos %} 
['ClamAV-clamd',
  \&ask_daemon, ["CONTSCAN {}\n", "/var/run/clamav/clamd.ctl"],
  qr/\bOK$/m, qr/\bFOUND$/m,
  qr/^.*?: (?!Infected Archive)(.*) FOUND$/m ],
{% endhighlight %}

### 4. 15-content_filter_mode 編集

"15-content_filter_mode" を以下のように編集（コメント解除）する。

File: `/etc/amavis/conf.d/15-content_filter_mode`

{% highlight bash linenos %} 
@bypass_virus_checks_maps = (
   \%bypass_virus_checks, \@bypass_virus_checks_acl, \$bypass_virus_checks_re);

@bypass_spam_checks_maps = (
   \%bypass_spam_checks, \@bypass_spam_checks_acl, \$bypass_spam_checks_re);
{% endhighlight %}

ちなみに、"amavisd.conf" にも同じ記述がある。どちらを有効にしても良いだろう。

### 5. Postfix - main.cf 編集

Postfix の設定ファイル "main.cf" を以下のように編集する。

File: `/etc/postfix/main.cf`

{% highlight bash linenos %} 
# 最終行へ追加
content_filter=smtp-amavis:[127.0.0.1]:10024
{% endhighlight %}

### 6. Postfix - master.cf 編集

Postfix の設定ファイル "master.cf" を以下のように編集する。

File: `/etc/postfix/master.cf`

{% highlight bash linenos %} 
# 最終行へ追加
smtp-amavis unix -       -       n      -     2 smtp
      -o smtp_data_done_timeout=1200
      -o smtp_send_xforward_command=yes
      -o disable_dns_lookups=yes
127.0.0.1:10025 inet n     -     n     -     - smtpd
      -o content_filter=
      -o local_recipient_maps=
      -o relay_recipient_maps=
      -o smtpd_restriction_classes=
      -o smtpd_client_restrictions=
      -o smtpd_helo_restrictions=
      -o smtpd_sender_restrictions=
      -o smtpd_recipient_restrictions=permit_mynetworks,reject
      -o mynetworks=127.0.0.0/8
      -o strict_rfc821_envelopes=yes
      -o smtpd_error_sleep_time=0
      -o smtpd_soft_error_limit=1001
      -o smtpd_hard_error_limit=1000
{% endhighlight %}

### 7. その他の設定

処理に必要なファイルを作成したり、権限設定、ユーザ作成を行う。

``` text 
# touch /etc/mailname
# chmod -R 775 /var/lib/amavis/tmp
# usermod -G amavis clamav
```

### 8. サービス再起動

ClamAV daemon, Postfix, Amavisd を再起動、SpamAssassin を起動する。

``` text 
# /etc/init.d/clamav-daemon restart
Stopping ClamAV daemon: clamd Waiting . .
Starting ClamAV daemon: clamd .

# /etc/init.d/spamassassin start
Starting SpamAssassin Mail Filter Daemon: spamd.

# /etc/init.d/postfix restart
Stopping Postfix Mail Transport Agent: postfix.
Starting Postfix Mail Transport Agent: postfix.

# /etc/init.d/amavis restart
Stopping amavisd: amavisd-new.
Starting amavisd: amavisd-new.
```

### 9. 動作確認

メールを送信してみる。

``` text 
# echo test | mail -s "TEST" root
```

受信メールのヘッダに "X-Virus-Scanned: Debian amavisd-new at" の文字列が存在することが確認できれば成功である。（メールソフトでヘッダを表示できる。または、サーバ内に届いたメールファイルを開いてみる）

``` text 
Return-Path: <root@mk-mode.com>
X-Original-To: root@mk-mode.com
Delivered-To: root@mk-mode.com
Received: from localhost (localhost [127.0.0.1])
        by mail.mk-mode.com (Postfix) with ESMTP id 9A45AD53
        for <root@mk-mode.com>; Sun,  6 Oct 2013 18:24:44 +0900 (JST)
X-Virus-Scanned: Debian amavisd-new at
Received: from mail.mk-mode.com ([127.0.0.1])
        by localhost (vbox.mk-mode.com [127.0.0.1]) (amavisd-new, port 10024)
        with ESMTP id OCCXf9a0IIxj for <root@mk-mode.com>;
        Sun,  6 Oct 2013 18:24:43 +0900 (JST)
Received: by mail.mk-mode.com (Postfix, from userid 0)
        id A09E0D4E; Sun,  6 Oct 2013 18:24:43 +0900 (JST)
Date: Sun, 06 Oct 2013 18:24:43 +0900
To: root@mk-mode.com
Subject: TEST
User-Agent: Heirloom mailx 12.5 6/20/10
MIME-Version: 1.0
Content-Type: text/plain; charset=us-ascii
Content-Transfer-Encoding: 7bit
Message-Id: <20131006092443.A09E0D4E@mail.mk-mode.com>
From: root@mk-mode.com (root)

test
```

---

以上。

