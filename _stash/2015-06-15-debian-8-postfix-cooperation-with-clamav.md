---
layout   : single
title    : "Debian 8 (Jessie) - Postfix と ClamAV の連携！"
published: true
date     : 2015-06-15 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- Postfix
- ウイルス対策
---

Debian GNU/Linux 8 (Jessie) に導入した SMTP サーバ Postfix を アンチウイルスソフト ClamAV と連携する方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 8 (Jessie) での作業を想定。
* 接続元のマシンは Linux Mint 17.1(64bit) を想定。
* SMTP サーバ Postfix を「[Debian 8 (Jessie) - SMTP サーバ Postfix 構築！]({{site.baseurl}}/2015/06/12/debian-8-postfix-installation/ "Debian 8 (Jessie) - SMTP サーバ Postfix 構築！")」の方法で導入済み。
* アンチウイルスソフト ClamAV 導入済み。
* スパムフィルタも運用する。
* ちなみに、アンチウイルス ClamAV との連携には、 ClamAV daemon を使用する方法の他にClamSMTP を使用する方法もある。
* ちなみに、スパムフィルタ SpamAssassin との連携には、 amavisd-new を使用する方法の他に SpamPD を使用する方法もある。

### 1. インストール

Postfix を ClamAV と連携させてウイルススキャン・スパムフィルタを行うのに必要な ClamAV daemon, amavisd-new, SpamAssassinを、以下のようにしてインストールする。

``` text
# apt-get -y install clamav-daemon amavisd-new spamassassin
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

# $virus_admin = undef;              # <= コメント化されていることを確認（ウイルス検知を都度通知しない）
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

メールのウイルスチェックの度に clamscan が作動するとマシンが非力な場合は非常に重くなるため、 clamav-daemon が動作する今回の環境では clamdscan でウイルスチェックを行うこととする。（clamscan と clamdscan の違いについては、ここでは説明しない）

File: `/etc/amavis/conf.d/15-av_scanners`

{% highlight bash linenos %}
  #['ClamAV-clamscan', 'clamscan',  # <= コメント化
  ['ClamAV-clamscan', 'clamdscan',  # <= 追加
{% endhighlight %}

### 6. Postfix - main.cf の編集

File: `/etc/postfix/main.cf`

{% highlight bash linenos %}
# 最終行へ追加
content_filter=smtp-amavis:{{ "[" }}127.0.0.1{{ "]" }}:10024
{% endhighlight %}

### 7. Postfix - master.cf の編集

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

### 8. その他の設定

処理に必要なファイルを作成したり、権限設定、ユーザ作成を行う。

``` text
# touch /etc/mailname
# chmod -R 775 /var/lib/amavis/tmp
# usermod -G amavis clamav
```

### 9. サービスの再起動

ClamAV daemon, Postfix, Amavisd を再起動、SpamAssassin を起動する。

``` text
# systemctl restart clamav-daemon
# systemctl restart postfix
# systemctl restart amavis
# systemctl start spamassassin
```

### 10. サービス自動起動の設定

``` text
# systemctl enable spamassassin
Synchronizing state for spamassassin.service with sysvinit using update-rc.d...
Executing /usr/sbin/update-rc.d spamassassin defaults
Executing /usr/sbin/update-rc.d spamassassin enable
[root@noah ~]# systemctl list-unit-files -t service | grep clamav-daemon
clamav-daemon.service                  enabled
```

### 11. 動作確認

メールを送信してみる。

``` text
# echo test | mail -s "TEST" root
```

受信メールのヘッダに "X-Virus-Scanned: Debian amavisd-new at" の文字列が存在することが確認できれば成功である。（メールソフトでヘッダを表示できる。または、サーバ内に届いたメールファイルを開いてみる）

``` bash
Return-Path: <root@mk-mode.com>
X-Original-To: root@mk-mode.com
Delivered-To: root@mk-mode.com
Received: from localhost (localhost [127.0.0.1])
        by mail.mk-mode.com (Postfix) with ESMTP id A7E6B11EE65
        for <root@mk-mode.com>; Mon,  4 May 2015 11:31:12 +0900 (JST)
X-Virus-Scanned: Debian amavisd-new at vbox.mk-mode.com
Received: from mail.mk-mode.com ([127.0.0.1])
        by localhost (vbox.mk-mode.com [127.0.0.1]) (amavisd-new, port 10024)
        with ESMTP id eTIZzJ9Wy5Lu for <root@mk-mode.com>;
        Mon,  4 May 2015 11:31:01 +0900 (JST)
Received: by mail.mk-mode.com (Postfix, from userid 0)
        id 1499A11EE63; Mon,  4 May 2015 11:31:01 +0900 (JST)
To: root@mk-mode.com
Subject: TEST
Message-Id: <20150504023101.1499A11EE63@mail.mk-mode.com>
Date: Mon,  4 May 2015 11:31:01 +0900 (JST)
From: root@mk-mode.com (root)

test
```

---

以上。

