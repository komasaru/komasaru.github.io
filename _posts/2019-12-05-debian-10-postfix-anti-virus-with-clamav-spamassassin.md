---
layout   : single
title    : "Debian 10 (buster) - Postfix ウィルス・スパム対策(ClamAV + SpamAssassin)！"
published: true
date     : 2019-12-05 00:20:00 +0900
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

Debian GNU/Linux 10 (buster) にアンチウイルスソフト ClamAV とスパム対策ソフト SpamAssassin をインストールする方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10 (buster) での作業を想定。
* SMTP サーバ Postfix を「[Debian 10 (buster) - SMTP サーバ Postfix 構築！]({{site.baseurl}}/2019/11/25/debian-10-postfix-installation "Debian 10 (buster) - SMTP サーバ Postfix 構築！")」の方法で導入済み。
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

{% highlight bash %}
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

{% highlight bash %}
$myhostname = 'mail.mk-mode.com';    # <= ホスト名
$mydomain   = 'mk-mode.com';         # <= ドメイン名

$daemon_user   = 'amavis';           # <= amavis デーモンユーザ名
$daemon_group  = 'amavis';           # <= amavis デーモングループ名

$MYHOME        = '/var/lib/amavis';  # <= amavisd ホーム

# $virus_admin = undef;             # <= コメント化されていることを確認（ウィルス検知を都度通知しない）
{% endhighlight %}

### 4. 15-content_filter_mode の編集

File: `/etc/amavis/conf.d/15-content_filter_mode`

{% highlight bash %}
@bypass_virus_checks_maps = (                                                    # <= コメント解除
   \%bypass_virus_checks, \@bypass_virus_checks_acl, \$bypass_virus_checks_re);  # <= コメント解除

@bypass_spam_checks_maps = (                                                     # <= コメント解除
   \%bypass_spam_checks, \@bypass_spam_checks_acl, \$bypass_spam_checks_re);     # <= コメント解除
{% endhighlight %}

ちなみに、"amavisd.conf" にも同じ記述がある。どちらを有効にしても良いだろう。

### 5. 15-av_scanners の編集

メールのウィルスチェックの度に `clamscan` が作動するとマシンが非力な場合は非常に重くなるため、 `clamav-daemon` が動作する今回の環境では `clamdscan` でウィルスチェックを行うこととする。（`clamscan` と `clamdscan` の違いについては、ここでは説明しない）

File: `/etc/amavis/conf.d/15-av_scanners`

{% highlight bash %}
  #['ClamAV-clamscan', 'clamscan',  # <= コメント化
  ['ClamAV-clamscan', 'clamdscan',  # <= 追加
{% endhighlight %}

### 6. Postfix - main.cf の編集

File: `/etc/postfix/main.cf`

{% highlight bash %}
# 最終行へ追加
content_filter=smtp-amavis:{{ "[" }}[127.0.0.1]{{ "]" }}:10024
{% endhighlight %}

### 7. Postfix - master.cf の編集

File: `/etc/postfix/master.cf`

{% highlight bash %}
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
Synchronizing state of spamassassin.service with SysV service script with /lib/systemd/systemd-sysv-install.
Executing: /lib/systemd/systemd-sysv-install enable spamassassin
insserv: warning: current start runlevel(s) (empty) of script `spamassassin' overrides LSB defaults (2 3 4 5).
insserv: warning: current stop runlevel(s) (0 1 2 3 4 5 6) of script `spamassassin' overrides LSB defaults (0 1 6).
Created symlink /etc/systemd/system/multi-user.target.wants/spamassassin.service → /lib/systemd/system/spamassassin.service.

# systemctl is-enabled spamassassin
enabled
```

### 12. 動作確認

メールを送信してみる。

``` text
# echo test | mail -s "TEST" root
```

受信メールのヘッダに "X-Virus-Scanned: Debian amavisd-new at" の文字列が存在することが確認できれば成功である。（メールソフトでヘッダを表示できる。または、サーバ内に届いたメールファイルを開いてみる）

メール送信コマンド `mail` が使用できない場合は、 `mailutils` or `heirloom-mailx` or `bsd-mailx` 等をインストールする。複数ある場合は、`update-alternatives --config mailx` でデフォルト設定をする。

``` text
Return-Path: <root@vbox.mk-mode.com>
X-Original-To: root@vbox.mk-mode.com
Delivered-To: root@vbox.mk-mode.com
Received: from localhost (localhost [127.0.0.1])
        by mail.mk-mode.com (Postfix) with ESMTP id 66B7A520067
        for <root@vbox.mk-mode.com>; Fri, 27 Sep 2019 10:25:33 +0900 (JST)
X-Virus-Scanned: Debian amavisd-new at
Received: from mail.mk-mode.com ([127.0.0.1])
        by localhost (vbox.mk-mode.com [127.0.0.1]) (amavisd-new, port 10024)
        with ESMTP id 35_2GffJRm60 for <root@vbox.mk-mode.com>;
        Fri, 27 Sep 2019 10:25:32 +0900 (JST)
Received: by mail.mk-mode.com (Postfix, from userid 0)
        id 5F9A3520065; Fri, 27 Sep 2019 10:25:32 +0900 (JST)
Subject: TEST
To: <root@vbox.mk-mode.com>
X-Mailer: mail (GNU Mailutils 3.5)
Message-Id: <20190927012532.5F9A3520065@mail.mk-mode.com>
Date: Fri, 27 Sep 2019 10:25:32 +0900 (JST)
From: root <root@vbox.mk-mode.com>

test
```

### 13. 誤検知対策

スパムメールをそうでないメールと誤検知したり、スパムでないメールをスパムと誤検知する場合は、以下のように "local.cf" に追記する。（以下は一例）

File: `/etc/mail/spamassassin/local.cf`

{% highlight bash %}
# 最終行に追記
# Whitelist
whitelist_from admin@dreammail.ne.jp
whitelist_from magsta@dreammail.jp
whitelist_from mail_serve@pub.mtk.nao.ac.jp
whitelist_from mailmag@mag2.com
whitelist_from mailman-owner@stat.math.ethz.ch
whitelist_from mikopi@mail.anshin-m.net
whitelist_from mytc@tsite.jp
whitelist_from n-link_owners@nissan.co.jp

# Blacklist
blacklist_from *@3fyye3.biz
blacklist_from *@admac.co.jp
blacklist_from *@choa4im5nvvh67i.info
blacklist_from chgetter7ipg@yahoo.co.jp
blacklist_from festa_s7896@yahoo.co.jp
blacklist_from gleesphirqurpl@alnutr.info
blacklist_from gmblumasuki@yahoo.co.jp
blacklist_from goldten0921@yahoo.co.jp
blacklist_from gonyou6613@yahoo.co.jp
blacklist_from happy26sap@yahoo.co.jp
blacklist_from happylife_892@yahoo.co.jp
blacklist_from hikken_bestten@yahoo.co.jp
blacklist_from himitunoheya111@yahoo.co.jp
blacklist_from hirosimakino@livedoor.co.jp
blacklist_from hirosiokazaki@hotmail.co.jp
blacklist_from info_mitui_trust@yahoo.co.jp
blacklist_from info@2qmail.info
blacklist_from info@kurokage-keiba.com
blacklist_from info@s1-farm.com
blacklist_from info@virgo-0528-q.mobi
blacklist_from info@soho-pro.info
blacklist_from iwaryouko@livedoor.co.jp
blacklist_from kanemochioudou@yahoo.co.jp
blacklist_from katigumibakuro@yahoo.co.jp
blacklist_from kininaru824@yahoo.co.jp
blacklist_from m_a_star_2sin@yahoo.co.jp
blacklist_from mag@25-mail.com
blacklist_from mag@gekimail.com
blacklist_from mail@bitsatelite.com
blacklist_from makiurata@hotmail.co.jp
blacklist_from manamisatou5512@livedoor.co.jp
blacklist_from maneweek@yahoo.co.jp
blacklist_from masasinakamori@livedoor.co.jp
blacklist_from mir9884@yahoo.co.jp
blacklist_from nagayou6612@yahoo.co.jp
blacklist_from otokukan_saisin@yahoo.co.jp
blacklist_from qef940320z@yahoo.co.jp
blacklist_from sakimatuda@infoseek.jp
blacklist_from sawaken6611@yahoo.co.jp
blacklist_from sawamami777@livedoor.co.jp
blacklist_from seijiasagoe@infoseek.jp
blacklist_from sendonly@ammag.biz
blacklist_from sendonly@bbmmag.com
blacklist_from sendonly@dvehwha.net
blacklist_from sendonly@emmag.biz
blacklist_from sendonly@gm78server.jp
blacklist_from takayukisaitou@hotmail.co.jp
blacklist_from tobidase152@yahoo.co.jp
blacklist_from urakininaru@yahoo.co.jp
blacklist_from yaberyousuke@infoseek.jp
blacklist_from youkonakazato@hotmail.co.jp
blacklist_from yume_kana_mahou@yahoo.co.jp
blacklist_from Yuliya
{% endhighlight %}

---

以上。

