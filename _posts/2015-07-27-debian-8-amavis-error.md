---
layout   : single
title    : "AMaViS - エラー(on Debian 8 Jessie)！"
published: true
date     : 2015-07-27 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- Mail
- Postfix
- ウイルス対策
---

Debian GNU/Linux 8 Jessie で Postfix と AMaViS を連携してメールのウイルスチェックを行うようにしているのですが、メールログにエラーメッセージが出力されていたので、調査して対策を施しました。

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 8.1 Jessie での作業を想定。
* アンチウィルスソフト ClamAV を「[Debian 8 (Jessie) - アンチウィルスソフト導入！]({{site.baseurl}}/2015/05/29/debian-8-anti-virus-installation/ "Debian 8 (Jessie) - アンチウィルスソフト導入！")」の方法でインストールしていることを想定。
* SMTP サーバ Postfix を「[Debian 8 (Jessie) - SMTP サーバ Postfix 構築！]({{site.baseurl}}/2015/06/12/debian-8-postfix-installation/ "Debian 8 (Jessie) - SMTP サーバ Postfix 構築！")」の方法でインストールしていることを想定。
* Postfix と ClamAV の連携を「[Debian 8 (Jessie) - Postfix と ClamAV の連携！]({{site.baseurl}}/2015/06/15/debian-8-postfix-cooperation-with-clamav/ "Debian 8 (Jessie) - Postfix と ClamAV の連携！")」の方法で行なっていることを想定。

### 1. 現象

メールログに以下のようなエラーメッセージが出力される。

File: `/var/log/mail.log`

{% highlight text linenos %}
Jun  1 10:57:36 noah amavis[28256]: (28256-04-7) (!)run_av (ClamAV-clamd) FAILED - unexpected , output="/var/lib/amavis/tmp/amavis-20150601T105343-28256-JUnFx0XC/parts: lstat() failed: Permission denied. ERROR\n"
Jun  1 10:57:36 noah amavis[28256]: (28256-04-7) (!)ClamAV-clamd av-scanner FAILED: CODE(0x29c09b0) unexpected , output="/var/lib/amavis/tmp/amavis-20150601T105343-28256-JUnFx0XC/parts: lstat() failed: Permission denied. ERROR\n" at (eval 96) line 905.
Jun  1 10:57:36 noah amavis[28256]: (28256-04-7) (!)WARN: all primary virus scanners failed, considering backups
Jun  1 10:57:36 noah amavis[28256]: (28256-04-7) (!)run_av (ClamAV-clamscan) FAILED - unexpected exit 2, output="WARNING: Ignoring unsupported option --recursive (-r)\nWARNING: Ignoring unsupported option --tempdir\n/var/lib/amavis/tmp/amavis-20150601T105343-28256-JUnFx0XC/parts: lstat() failed: Permission denied. ERROR"
Jun  1 10:57:36 noah amavis[28256]: (28256-04-7) (!)ClamAV-clamscan av-scanner FAILED: /usr/bin/clamdscan unexpected exit 2, output="WARNING: Ignoring unsupported option --recursive (-r)\nWARNING: Ignoring unsupported option --tempdir\n/var/lib/amavis/tmp/amavis-20150601T105343-28256-JUnFx0XC/parts: lstat() failed: Permission denied. ERROR" at (eval 96) line 905.
Jun  1 10:57:36 noah amavis[28256]: (28256-04-7) (!!)AV: ALL VIRUS SCANNERS FAILED
{% endhighlight %}

### 2. 原因

エラーメッセージに出ているとおり、権限がおかしい。

### 3. 対策

3-1 の方法はよくある方法だが、今回注目したかったのは 3-2 の方法。

#### 3-1. ユーザ ID, グループ ID の確認

`id` コマンドで clamav, amavis のユーザ ID, グループ ID を確認する。

``` text
# id clamav
uid=108(clamav) gid=113(clamav) groups=113(clamav),123(amavis)

# id amavis
uid=115(amavis) gid=123(amavis) groups=123(amavis)
```

clamav ユーザが amavis グループに属していれば、それでよい。

clamav ユーザが amavis グループに属していなければ、以下のようにして amavis グループに追加する。（`-a` オプションは重要。このオプションを付け忘れると clamav ユーザが既に属していたグループから外れてしまう）

``` text
# usermod -a -G amavis clamav
```

clamav ユーザを amavis グループに追加した場合は、 clamav-daemon, amavis, postfix を再起動する。

``` text
# systemctl restart clamav-daemon
# systemctl restart amavis
# systemctl restart postfix
```

#### 3-2. clamd.conf の編集

前項 3-1 の方法でもエラーが解消しない場合は、 ClamAV Daemon 設定ファイル "clamd.conf" の `AllowSupplementaryGroups` を確認してみる。

`false` になっていた場合は `true`（グループ権限も移譲）に変更する。

File: `/etc/clamav/clamd.conf`

{% highlight bash linenos %}
AllowSupplementaryGroups true  # <= false を true に変更
{% endhighlight %}

そして、 clamav-daemon, amavis, postfix を再起動する。（起動順に注意すべき旨を紹介しているサイトもあるが、起動順が影響しているか否かは当方未確認）

``` text
# systemctl restart clamav-daemon
# systemctl restart amavis
# systemctl restart postfix
```

---

以上。

