---
layout   : single
title    : "FreeBSD 10.0 - SSH 公開鍵認証！"
published: true
date     : 2014-10-19 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- FreeBSD
- SSH
---

「FreeBSD 10.0 - SSH 公開鍵認証」についての記録です。

（旧バージョンでの個人の作業記録を更新しました。興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* インストール作業時に SSH サーバをインストールを行っている。
* 以下の作業は、リモート接続して行う。（リモートから `ssh vbox` で接続）
* リモート端末は、 Linux Mint 17 マシンを想定しているが、 Unix 系 OS なら同じ。
* 設定ファイル等のテキストファイルの編集には `vi` コマンドを使用。
* 作業はリモート接続で一般ユーザから root になって行う。
* リモート操作は既存の端末で行う（当然、端末ソフトを使用してもよい）
* SSH サーバのポートはセキュリティ上デフォルトの 22 から変更していることを想定。
* 主に[FreeBSDサーバー構築マニュアル](http://freebsd.server-manual.com/ "FreeBSDサーバー構築マニュアル")を参照。

### 1. 鍵ペア（公開・秘密）の生成

クライアント側で以下のコマンドで公開鍵・秘密鍵を生成する。 作成先・ファイル名を指定しなければ、/home/(ユーザ名)/.ssh/ に id_rsa, id_rsa.pub が作成される。 途中、鍵用のパスワードも入力する。（以下ではファイル名を "id_rsa_vbox_freebsd" としている）

``` text
$ ssh-keygen
Generating public/private rsa key pair.
Enter file in which to save the key (/home/hoge/.ssh/id_rsa): /home/hoge/.ssh/id_rsa_vbox_freebsd
Enter passphrase (empty for no passphrase):
Enter same passphrase again:
Your identification has been saved in /home/hoge/.ssh/id_rsa_vbox_freebsd.
Your public key has been saved in /home/hoge/.ssh/id_rsa_vbox_freebsd.pub.
The key fingerprint is:
54:f2:ce:22:c1:ca:53:da:06:5a:a1:58:a4:c7:86:e6 masaru@p183
The key's randomart image is:
+--[ RSA 2048]----+
| .o .   . .      |
| * . o   +       |
|+.= o + . .      |
|oo + * o o       |
| E. = + S o      |
|     o . .       |
|                 |
|                 |
|                 |
+-----------------+
```

### 2. 公開鍵設定

FreeBSD サーバ側で公開鍵の設定を行う。（以下、ログインしようと考えている一般ユーザで作業）

まず、公開鍵格納用ディレクトリを作成、パーミッションを変更。

``` text
$ mkdir -p ~/.ssh
$ chmod 700 ~/.ssh
```

次に、クライアント側で作成した公開鍵（”xxxx.pub”）の内容を丸ごとコピー＆ペーストして authorized_keys に保存する。

File: `~/.ssh/authorized_keys`

{% highlight bash linenos %}
ssh-rsa xxxxx・・・xxxxx
{% endhighlight %}

そして、”authorized_keys” のパーミッションを変更。

``` text
$ chmod 600 ~/.ssh/authorized_keys
```

### 3. SSH 設定ファイル編集

（以下、一般ユーザではなく root になって行う）

``` text
$ su -
Password:
```

File: `/etc/ssh/sshd_config`

{% highlight bash linenos %}
PubkeyAuthentication yes                     # <= コメント解除（公開鍵認証を有効化）

AuthorizedKeysFile     .ssh/authorized_keys  # <= コメント解除＆変更（認証キーファイル指定）

PasswordAuthentication no                    # <= 変更（パスワード認証拒否）

ChallengeResponseAuthentication no           # <= コメント解除＆変更（チャレンジレスポンス認証を無効化）
{% endhighlight %}

### 4. SSH サーバリロード

設定変更を有効にするために SSH サーバをリロード。そして、一旦ログアウト。

``` text
# /etc/rc.d/sshd reload
Performing sanity check on sshd configuration.
# exit
logout
$ exit
Connection to vbox closed.
```

### 5. リモート再接続

秘密鍵をしていして SSH 接続を行う。（以下、リモート端末側作業）  
パスワード要求されるので、SSH 鍵ファイル作成時に指定したパスワードを入力すればログインできるはず。  
（クライアント側の "known_hosts" に記録されるので、２回目以降のログインに秘密鍵ファイルの指定は不要）

``` text
$ ssh -i ~/.ssh/＜秘密鍵ファイル名＞ ＜サーバ IP アドレス or ホスト名＞ -p ＜ポート番号＞
Last login: Wed Sep 24 23:56:36 2014 from 192.168.11.13
FreeBSD 10.0-RELEASE-p9 (GENERIC) #0: Mon Sep 15 14:35:52 UTC 2014

Welcome to FreeBSD!

Before seeking technical support, please use the following resources:

o  Security advisories and updated errata information for all releases are
   at http://www.FreeBSD.org/releases/ - always consult the ERRATA section
   for your release first as it's updated frequently.

o  The Handbook and FAQ documents are at http://www.FreeBSD.org/ and,
   along with the mailing lists, can be searched by going to
   http://www.FreeBSD.org/search/.  If the doc package has been installed
   (or fetched via pkg install lang-freebsd-doc, where lang is the
   2-letter language code, e.g. en), they are also available formatted
   in /usr/local/share/doc/freebsd.

If you still have a question or problem, please take the output of
`uname -a', along with any relevant error messages, and email it
as a question to the questions@FreeBSD.org mailing list.  If you are
unfamiliar with FreeBSD's directory layout, please refer to the hier(7)
manual page.  If you are not familiar with manual pages, type `man man'.

Edit /etc/motd to change this login announcement.

$
```

---

以上。

