---
layout   : single
title    : "CentOS 6.5 - メールサーバ（Postfix）でウイルスチェック！"
published: true
date     : 2013-12-29 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- Postfix
- ウイルス対策
---

前回は CentOS 6.5 サーバで OpenSSL によるメールサーバ間通信内容暗号化を行いました。  
今回はメールサーバ Postfix でウイルスチェックを行います。

送信メールサーバ Postfix と Clam AntiVirus を Amavisd-new で連携して、メールのウイルスチェックを行う。

<!--more-->

### 0. 前提条件

- CentOS 6.5(x86_64) を Minimal で最小インストールしている。
- クライントマシンは Linux Mint 14(64bit) を想定。
- 送信メールサーバ Postfix 構築済みであること。
- [CentOS 6.5 - 初期設定！]( "CentOS 6.5 - 初期設定！") 内のとおり RPMforege, EPEL リポジトリの導入を行なっている。
- 主に「[CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")」を参考にしている。  
  （実際は、過去にこのサイトを参考にして作業した際に記録していたものを参照している）

### 1. clamd 設定ファイル編集

clamd 設定ファイル "/etc/clamd.conf" を以下のように編集する。

File: `/etc/clamd.conf`

{% highlight bash linenos %}
# Path to a local socket file the daemon will listen on.
# Default: disabled (must be specified by a user)
LocalSocket /var/run/clamav/clamd.sock  # <= 変更（clamd をソケット通信型で起動するようにする。今はデフォルトこうなっている）

# TCP port address.
# Default: disabled
#TCPSocket 3310  # <= コメントアウト（clamd の TCP 通信無効化）
{% endhighlight %}

### 2. clamd 再起動

``` text
# /etc/rc.d/init.d/clamd restart
Stopping Clam AntiVirus Daemon:                            [  OK  ]
Starting Clam AntiVirus Daemon:                            [  OK  ]
```

### 3. amavisd-new インストール

RPMforge リポジトリから amavisd-new をインストールする。

``` text
# yum --enablerepo=rpmforge -y install amavisd-new
```

### 4. amavisd-new 設定ファイル編集

amavisd-new 設定ファイル "/etc/amavisd.conf" を以下のように編集する。

File: `/etc/amavisd.conf`

{% highlight bash linenos %}
# COMMONLY ADJUSTED SETTINGS:
$undecipherable_subject_tag = '';  # <= 追加（メール件名に "***UNCHECKED***" を付加しない）

@bypass_spam_checks_maps  = (1);  # controls running of anti-spam code  # < = コメント解除
# <= スパムチェックは行なわない（スパムチェックは procmail 経由で spamc コマンドで行なう）

$mydomain = 'mk-mode.com';   # a convenient default for other settings  # <= 変更（自ドメイン名）

#$QUARANTINEDIR = "/var/virusmails";  # <= コメント化（ウイルスメールは隔離しない）

#$virus_admin               = "virusalert\@$mydomain";  # notifications recip.  # <= コメント化（ウイルス検知メールを管理者宛に通知しない）

['ClamAV-clamd',  # <= コメント解除
  \&ask_daemon, ["CONTSCAN {}\n", "/var/run/clamav/clamd.sock"],  # <= コメント解除
  qr/\bOK$/m, qr/\bFOUND$/m,                                      # <= コメント解除
  qr/^.*?: (?!Infected Archive)(.*) FOUND$/m ],                   # <= コメント解除

### BLOCKED ANYWHERE

# qr'^UNDECIPHERABLE$',  # is or contains any undecipherable components
# qr'^\.(exe-ms|dll)$',                   # banned file(1) types, rudimentary  # <= コメント化（exe, dll ファイルを受信できるようにする場合のみ）
# qr'^\.(exe|lha|tnef|cab|dll)$',         # banned file(1) types
{% endhighlight %}

### 5. amavisd-new 起動

``` text
# /etc/rc.d/init.d/amavisd start
Mail Virus Scanner (amavisd) を起動中:                     [  OK  ]
```

### 6. amavisd-new 自動起動設定

``` text
# chkconfig amavisd on
# chkconfig --list amavisd  # <= 2,3,4,5 が "on" であることを確認
amavisd         0:off   1:off   2:on    3:on    4:on    5:on    6:off
```

### 7. 動作確認

メールを自分宛に送信してみて受信したメールのヘッダに以下のような記述があるか確認する。

``` text
X-Virus-Scanned: amavisd-new at mk-mode.com
```

また、ウイルスメールを送信してみて受信しないことも確認する。

### 参考サイト

- [CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")

---

次回は、メールサーバ Postfix でスパムチェックを行う方法について紹介する予定です。

以上。

