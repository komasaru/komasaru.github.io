---
layout   : single
title    : "CentOS 6.5 - メールサーバ（Postfix）でスパムチェック！"
published: true
date     : 2013-12-30 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- Postfix
- スパム対策
---

前回は CentOS 6.5 サーバ上のメールサーバ Postfix でウィルスチェックを行いました。  
今回はメールサーバ Postfix でスパムチェックを行います。

送信メールサーバ Postfix と SpamAssassin を Amavisd-new で連携して、スパムメールチェックを行う。

<!--more-->

### 0. 前提条件

- CentOS 6.5(x86_64) を Minimal で最小インストールしている。
- クライントマシンは Linux Mint 14(64bit) を想定。
- 送信メールサーバ Postfix 構築済みであること。
- [CentOS 6.5 - 初期設定！]( "CentOS 6.5 - 初期設定！") 内のとおり RPMforege, EPEL リポジトリの導入を行なっている。
- 主に「[CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")」を参考にしている。  
  （実際は、過去にこのサイトを参考にして作業した際に記録していたものを参照している）

### 1. v310.pre 編集

  
SpamAssassin 設定ファイルの ok_languages オプションを有効にするため、"v310.pre" ファイルを以下のように編集する。

File: `/etc/mail/spamassassin/v310.pre`

{% highlight bash linenos %}
# TextCat - language guesser
#
loadplugin Mail::SpamAssassin::Plugin::TextCat  # <= コメント解除（TextCatプラグイン有効化）
{% endhighlight %}

### 2. SpamAssassin 設定ファイル最新化スクリプト作成

SpamAssassin 設定ファイルを最新化するためのスクリプトを以下のように作成する。

File: `spamassassin-update`

{% highlight bash linenos %}
#!/bin/bash

# SpamAssassin設定ファイル最新版ダウンロード
cd /etc/mail/spamassassin
wget -qN http://www.flcl.org/~yoh/user_prefs

# 設定ファイル更新時のみSpamAssassin再起動
diff user_prefs user_prefs.org > /dev/null 2>&1
if [ $? -ne 0 ]; then
    cp user_prefs local.cf

    # スパム判断したメールを添付形式にしないように設定
    echo "report_safe 0" >> local.cf

    # スパム判断したメールの件名に｢***SPAM***｣を付加するように設定※受信メールサーバーがPOPの場合のみ
    echo "rewrite_header Subject ***SPAM***" >> local.cf

    # SpamAssassin再起動
    /etc/rc.d/init.d/spamassassin restart > /dev/null
fi
cp user_prefs user_prefs.org
{% endhighlight %}

### 3. SpamAssassin 設定ファイル最新化スクリプト権限設定

SpamAssassin 設定ファイル最新化スクリプトに実行権限を付与する。

``` text
# chmod +x spamassassin-update
```

### 4. SpamAssassin 設定ファイル最新化スクリプト実行

``` text
# ./spamassassin-update
```

### 5. SpamAssassin 設定ファイル最新化スクリプト定期起動設定

SpamAssassin 設定ファイル最新化スクリプトが毎日自動で実行されるよう、cron ディレクトリへ移動する。

``` text
# mv spamassassin-update /etc/cron.daily/
```

### 6. SpamAssassin ルール自動更新設定

SpamAssassin ルールが自動で更新されるよう cron 設定を編集する。（今は、デフォルトでこうなっている）

File: `/etc/cron.d/sa-update`

{% highlight bash linenos %}
10 4 * * * root /usr/share/spamassassin/sa-update.cron 2>&1 | tee -a /var/log/sa-update.log  # <= コメント解除
{% endhighlight %}

### 7. Postfix 設定ファイル編集

Postfix と連携させるために Postfix 設定ファイル "/etc/postfix/main.cf" を以下のように編集する。（該当箇所のみ抜粋）

File: `/etc/postfix/main.cf`

{% highlight bash linenos %}
#mailbox_command = /some/where/procmail
#mailbox_command = /some/where/procmail -a "$EXTENSION"
mailbox_command = /usr/bin/procmail  # <= 追加（Procmailと連携）
{% endhighlight %}

### 8. procmail 設定ファイル作成

メール振り分けのために procmail 設定ファイルを作成する。

File: `/etc/procmailrc`

{% highlight bash linenos %}
SHELL=/bin/bash
PATH=/usr/bin:/bin
DROPPRIVS=yes
MAILDIR=$HOME/Maildir
DEFAULT=$MAILDIR/
SPAM=$MAILDIR/.Spam/
LOGFILE=$MAILDIR/procmail.log # ログ出力先
#VERBOSE=ON # 詳細ログ出力

# SpamAssassinによるスパムチェック
:0fw
|/usr/bin/spamc

# SpamAssassinにより判定されたSpam-Levelが一定値(ここでは20)以上の場合は削除
# ※必要なメールが削除されてしまう可能性があることに留意すること
:0
* ^X-Spam-Level: \*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*
/dev/null
{% endhighlight %}

### 9. procmail ログローテーション設定ファイル作成

procmail のログが肥大化しないようログローテーションの設定ファイルを作成する。

File: `/etc/logrotate.d/procmail`

{% highlight bash linenos %}
/home/*/Maildir/procmail.log {
    missingok
    nocreate
    notifempty
}
{% endhighlight %}

### 10. Postfix 設定ファイル master.cf 編集

amavisd-new と連携させるために、Postfix 設定ファイル "/etc/postfix/master.cf" を以下のように編集する。

File: `/etc/postfix/master.cf`

{% highlight bash linenos %}
#以下を最終行へ追加
smtp-amavis unix -    -    n    -    2  smtp
    -o smtp_data_done_timeout=1200
    -o smtp_send_xforward_command=yes
    -o disable_dns_lookups=yes

127.0.0.1:10025 inet n    -    n    -    -  smtpd
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

### 11. Postfix 設定ファイル main.cf 編集

amavisd-new と連携させるために、Postfix 設定ファイル "/etc/postfix/main.cf" を以下のように編集する。

File: `/etc/postfix/main.cf`

{% highlight bash linenos %}
content_filter=smtp-amavis:[127.0.0.1]:10024  # <= 最終行へ追加
{% endhighlight %}

### 12. Postfix 再起動

``` text
# /etc/rc.d/init.d/postfix restart
postfix を停止中:                                          [  OK  ]
postfix を起動中:                                          [  OK  ]
```

### 13. SpamAssassin 起動

``` text
# /etc/rc.d/init.d/spamassassin start
spamd を起動中:                                            [  OK  ]
```

### 14. SpamAssassin 自動起動設定

``` text
# chkconfig spamassassin on
# chkconfig --list spamassassin  # <= 2,3,4,5 が "on" であることを確認
spamassassin    0:off   1:off   2:on    3:on    4:on    5:on    6:off
```

### 15. メールクライアント設定

スパムメールの件名には `***SPAM***` の文字列が付与されるので、スパム用フォルダに振り分けるようにするなり適宜設定する。

### 参考サイト

- [CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")

---

次回は、Postfix + SpamAssassin でのスパムメール誤認識対策について紹介する予定です。

以上。

