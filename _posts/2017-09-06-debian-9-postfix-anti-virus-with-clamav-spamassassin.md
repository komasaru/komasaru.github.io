---
layout   : single
title    : "Debian 9 (Stretch) - Postfix ウィルス・スパム対策(ClamAV + SpamAssassin)！"
published: true
date     : 2017-09-06 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- Postfix
- ウイルス対策
- スパム対策
---

Debian GNU/Linux 9 (Stretch) にアンチウイルスソフト ClamAV とスパム対策ソフト SpamAssassin をインストールする方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 9 (Stretch) での作業を想定。
* 接続元のマシンは LMDE2(Linux Mint Debian Edition 2)(64bit) を想定。
* SMTP サーバ Postfix を「[Debian 9 (Stretch) - SMTP サーバ Postfix 構築！]({{site.baseurl}}/2017/08/30/debian-9-postfix-installation/ "Debian 9 (Stretch) - SMTP サーバ Postfix 構築！")」の方法で導入済み。
* アンチウィルスソフト ClamAV 導入済み。
* スパムフィルタも運用する。
* アンチウィルス ClamAV との連携には、 ClamAV daemon を使用する方法の他に、ClamSMTP を使用する方法もある。
* スパムフィルタ SpamAssassin との連携には、 amavisd-new を使用する方法の他に SpamPD を使用する方法もある。
* root ユーザでの作業を想定。

### 1. インストール

Postfix を ClamAV と連携させてウィルススキャン・スパムフィルタを行うのに必要な ClamAV daemon, amavisd-new, SpamAssassinを、以下のようにしてインストールする。

``` text
# apt -y install clamav-daemon amavisd-new spamassassin
```

### 2. SpamAssassin 設定ファイルの編集

File: `/etc/default/spamassassin`

{% highlight bash linenos %}
ENABLED=1  # <= スパムフィルタも有効化
{% endhighlight %}

### 3. amavisd-new 設定ファイルの編集

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

# $virus_admin = undef;              # <= コメント化されていることを確認（ウィルス検知を都度通知しない）
{% endhighlight %}

### 4. 15-content_filter_mode の編集

File: `/etc/amavis/conf.d/15-content_filter_mode`

{% highlight bash linenos %}
@bypass_virus_checks_maps = (                                                    # <= コメント解除
   \%bypass_virus_checks, \@bypass_virus_checks_acl, \$bypass_virus_checks_re);  # <= コメント解除

@bypass_spam_checks_maps = (                                                     # <= コメント解除
   \%bypass_spam_checks, \@bypass_spam_checks_acl, \$bypass_spam_checks_re);     # <= コメント解除
{% endhighlight %}

ちなみに、"amavisd.conf" にも同じ記述がある。どちらを有効にしても良いだろう。

### 5. 15-av_scanners の編集

メールのウィルスチェックの度に clamscan が作動するとマシンが非力な場合は非常に重くなるため、 clamav-daemon が動作する今回の環境では clamdscan でウィルスチェックを行うこととする。（clamscan と clamdscan の違いについては、ここでは説明しない）

File: `/etc/amavis/conf.d/15-av_scanners`

{% highlight bash linenos %}
  #['ClamAV-clamscan', 'clamscan',  # <= コメント化
  ['ClamAV-clamscan', 'clamdscan',  # <= 追加
{% endhighlight %}

### 6. 20-debian_defaults の編集

"Considered UNSOLICITED BULK EMAIL, apparently from you" というタイトルのメールが届くことがあるので、それを抑止するための設定を行う。

File: `/etc/amavis/conf.d/20-debian_defaults`

{% highlight bash linenos %}
#$final_banned_destiny     = D_BOUNCE;   # D_REJECT when front-end MTA
$final_banned_destiny     = D_REJECT;   # D_REJECT when front-end MTA
{% endhighlight %}

* `D_PASS` ... メールは受信者に配送される
* `D_REJECT` ... メールは配送されないが、送信者に配送されなかった事を伝える
* `D_BOUNCE` ... メールは配送されないが、送信者に配送されなかった事を伝える。例外で伝えない場合もある
* `D_DISCARD` ... メールは配送されず、送信者にも配送されなかった事を伝えない

### 7. Postfix - main.cf の編集

File: `/etc/postfix/main.cf`

{% highlight bash linenos %}
# 最終行へ追加
content_filter=smtp-amavis:{{ "[" }}127.0.0.1{{ "]" }}:10024
{% endhighlight %}

### 8. Postfix - master.cf の編集

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

### 9. その他の設定

処理に必要なファイルを作成したり、権限設定、ユーザ作成を行う。

``` text
# touch /etc/mailname
# chmod -R 775 /var/lib/amavis/tmp
# usermod -G amavis clamav
```

### 10. サービスの再起動

ClamAV daemon, Postfix, Amavisd を再起動、SpamAssassin を起動する。

``` text
# systemctl restart clamav-daemon
# systemctl restart postfix
# systemctl restart amavis
# systemctl start spamassassin
```

### 11. サービス自動起動の設定

``` text
# systemctl enable spamassassin
Synchronizing state of spamassassin.service with SysV service script with /lib/systemd/systemd-sysv-install.
Executing: /lib/systemd/systemd-sysv-install enable spamassassin

# systemctl is-enabled clamav-daemon
enabled
```

### 12. 動作確認

メールを送信してみる。

``` text
# echo test | mail -s "TEST" root
```

受信メールのヘッダに `X-Virus-Scanned: Debian amavisd-new at ...` の文字列が存在することが確認できれば成功である。（メールソフトでヘッダを表示できる。または、サーバ内に届いたメールファイルを開いてみる）

``` bash
Return-Path: <root@noah.mk-mode.com>
X-Original-To: root@noah.mk-mode.com
Delivered-To: root@noah.mk-mode.com
Received: from localhost (localhost [127.0.0.1])
        by mail.mk-mode.com (Postfix) with ESMTP id 8BF39280063
        for <root@noah.mk-mode.com>; Fri, 14 Jul 2017 23:16:02 +0900 (JST)
X-Virus-Scanned: Debian amavisd-new at noah.mk-mode.com
Received: from mail.mk-mode.com ([127.0.0.1])
        by localhost (noah.mk-mode.com [127.0.0.1]) (amavisd-new, port 10024)
        with ESMTP id 5q6xjujxZI25 for <root@noah.mk-mode.com>;
        Fri, 14 Jul 2017 12:16:02 +0900 (JST)
Received: by mail.mk-mode.com (Postfix, from userid 0)
        id F1DBB280065; Fri, 14 Jul 2017 23:16:01 +0900 (JST)
Subject: TEST
To: <root@noah.mk-mode.com>
X-Mailer: mail (GNU Mailutils 3.1.1)
Message-Id: <20170714031601.F1DBB280065@mail.mk-mode.com>
Date: Fri, 14 Jul 2017 23:16:01 +0900 (JST)
From: root@noah.mk-mode.com (root)

test
```

### 13. 誤検知対策

スパムメールをそうでないメールと誤検知したり、スパムでないメールをスパムと誤検知する場合は、以下のように "local.cf" に追記する。（以下は、架空の設定）

File: `/etc/mail/spamassassin/local.cf`

{% highlight text linenos %}
# 最終行に追記
# Whitelist
whitelist_from xxxx@hoge.ne.jp
whitelist_from yyyy@fuga.jp

# Blacklist
blacklist_from *@foo.biz
blacklist_from aaaa@bar.info
blacklist_from bbbb@bar.info
{% endhighlight %}

---

以上。

