---
layout   : single
title    : "CentOS 7.0 - メールサーバ Postfix でウィルス＆スパムチェック！"
published: true
date     : 2014-08-22 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- Postfix
---

「CentOS 7.0 - メールサーバ Postfix でウィルス＆スパムチェック」についての記録です。

（旧バージョンでの作業記録を更新しました。興味がなければスルーしてください）

<!--more-->

送信メールサーバ Postfix と Clam AntiVirus, SpamAssassin を Procmail で連携して、メールのウィルス＆スパムチェックを行う。

### 0. 前提条件

- CentOS 7.0-1406(x86_64) を NetInstall で最小限インストールしている。
- サーバ用途なので、作業は基本的に全て一般ユーザから root になって行う。
- クライアント側は Linux Mint 17 を想定。
- 送信メールサーバ Postfix 構築済みであること。
- アンチウィルスソフト Clam AntiVirus 構築済みであること。
- 主に「[CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")」を参照。

### 1. SpamAssassin インストール

``` text
# yum -y install spamassassin
```

### 2. SpamAssassin 起動

``` text
# systemctl start spamassassin
```

### 3. SpamAssassin 自動起動設定

``` text
# systemctl enable spamassassin
ln -s '/usr/lib/systemd/system/spamassassin.service' '/etc/systemd/system/multi-user.target.wants/spamassassin.service'
# systemctl list-unit-files -t service | grep spamassassin
spamassassin.service                        enabled  # <= enabled であることを確認
```

### 4. SpamAssassin 設定ファイル最新化スクリプト作成

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
    if [ -f /etc/rc.d/init.d/spamassassin ]; then
        /etc/rc.d/init.d/spamassassin restart > /dev/null
    else
        systemctl restart spamassassin > /dev/null
    fi
fi
cp user_prefs user_prefs.org
{% endhighlight %}

### 5. SpamAssassin 設定ファイル最新化スクリプト権限設定

``` text
# chmod +x spamassassin-update
```

### 6. SpamAssassin 設定ファイル最新化スクリプト実行

``` text
# ./spamassassin-update
```

### 7. SpamAssassin 設定ファイル最新化スクリプト定期起動設定

``` text
# mv spamassassin-update /etc/cron.daily/
```

### 8. SpamAssassin ルール自動更新設定

SpamAssassin ルールが自動で更新されるよう cron 設定を編集する。（今は、デフォルトでこうなっている）

File: `/etc/cron.d/sa-update`

{% highlight bash linenos %}
10 4 * * * root /usr/share/spamassassin/sa-update.cron 2>&1 | tee -a /var/log/sa-update.log  # <= コメント解除
{% endhighlight %}

### 9. Postfix 設定ファイル編集

Postfix と連携させるために Postfix 設定ファイル "/etc/postfix/main.cf" を以下のように編集する。（該当箇所のみ抜粋）

File: `/etc/postfix/main.cf`

{% highlight bash linenos %}
#mailbox_command = /some/where/procmail
#mailbox_command = /some/where/procmail -a "$EXTENSION"
mailbox_command = /usr/bin/procmail  # <= 追加（Procmailと連携）
{% endhighlight %}

### 10. procmail 設定ファイル作成

メール振り分けのために procmail 設定ファイルを作成する。

File: `/etc/procmailrc`

{% highlight bash linenos %}
SHELL=/bin/bash
PATH=/usr/bin:/bin
DROPPRIVS=yes
MAILDIR=$HOME/Maildir
DEFAULT=$MAILDIR/
SPAM=$MAILDIR/.Spam/
LOGFILE=$HOME/.procmail.log # ログ出力先
#VERBOSE=ON # 詳細ログ出力

# Clam AntiVirusによるウィルスチェック
AV_REPORT=`/usr/bin/clamdscan  --no-summary - 2>&1| awk -F\n -v ORS=' ' '{print}'|awk '{print $NF}'`
VIRUS=`if [ "$AV_REPORT" != "OK" ]; then echo Yes; else echo No;fi`
:0fw
| formail -i "X-Virus: $VIRUS"

# Clam AntiVirusがウィルス判定したメールは削除
:0
* ^X-Virus: Yes
/dev/null

# SpamAssassinによるスパムチェック
:0fw
|/usr/bin/spamc

# SpamAssassinにより判定されたSpam-Levelが一定値(ここでは20)以上の場合は削除
# ※必要なメールが削除されてしまう可能性があることに留意すること
:0
* ^X-Spam-Level: \*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*
/dev/null
{% endhighlight %}

====[ 2014-09-05 追記 ]===>  
**`clamscan` コマンドは起動の都度ウィルス定義ファイルを読み込んで処理を行うため非力なマシンでは重くなる。よって、 `clamdscan` コマンドに変更している。（`clamd` 起動している場合限定）**  
<===[ 2014-09-05 追記 ]====

### 11. procmail ログローテーション設定ファイル作成

procmail のログが肥大化しないようログローテーションの設定ファイルを作成する。

File: `/etc/logrotate.d/procmail`

{% highlight bash linenos %}
/home/*/Maildir/.procmail.log {
    missingok
    nocreate
    notifempty
}
{% endhighlight %}

### 12. メールクライアント設定

スパムメールの件名には "***SPAM***" の文字列が付与されるので、スパム用フォルダに振り分けるようにするなり適宜設定する。

---

以上。

