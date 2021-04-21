---
layout   : single
title    : "FreeBSD 10.0 - 初期設定！"
published: true
date     : 2014-10-17 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- FreeBSD
---

「FreeBSD 10.0 - 初期設定」についての記録です。

（旧バージョンでの個人の作業記録を更新しました。興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* インストール作業時に SSH サーバをインストールを行っている。
* インストール作業に一般ユーザを作成している。(wheel グループ設定もしている）
* 以下の作業は、リモート接続して行う。（リモートから `ssh vbox` で接続）
* リモート端末は、 Linux Mint 17 マシンを想定しているが、 Unix 系 OS なら同じ。
* 設定ファイル等のテキストファイルの編集には `vi` コマンドを使用。
* 作業はリモート接続で一般ユーザから root になって行う。
* 主に[FreeBSDサーバー構築マニュアル](http://freebsd.server-manual.com/ "FreeBSDサーバー構築マニュアル")を参照。

### 1. プロンプト表示変更

File: `~/.cshrc`

{% highlight bash linenos %}
        #set prompt = "%N@%m:%~ %# "
        set prompt = "[%n@%m %c]# "   # <= 変更
{% endhighlight %}

``` text
# source ~/.cshrc
[root@vbox ~]#                        # <= 変更されたことを確認
```

（以降、説明上プロンプトは `#` or `$` のみの簡略表示とする）

### 2. ports ツリー更新

``` text
# portsnap fetch    # <= ports ツリーの圧縮されたスナップショットを取得
# portsnap extract  # <= 抽出
```

crontab に登録して、自動で ports ツリー更新を行うようにする。（最終行に以下の記述を追記）

File: `/etc/crontab`

{% highlight bash linenos %}
0       3       *       *       *       root    /usr/sbin/portsnap cron && portsnap update > /dev/null
{% endhighlight %}

### 3. portupgrade インストール

インストールした ports のアップグレードを簡単に行なうためのユーティリティ portupgrade をインストールする。

``` text
# cd /usr/ports/ports-mgmt/portupgrade/
# make BATCH=yes install clean
# rehash
# cd
```

### 4. portupgrade 設定

`make` 実行時に常時設定するパラメータを設定しておく。

``` text
# chmod 640 /usr/local/etc/pkgtools.conf
```

File: `/usr/local/etc/pkgtools.conf`

{% highlight bash linenos %}
  MAKE_ARGS = {
    # ====[追加]===>
    '*' => [
      'WITH_BDB_VER=53',
      'WITHOUT_IPV6=yes',
      'WITHOUT_X11=yes',
      'WITHOUT_GUI=yes',
    ],
    # <===[追加]====
  }
{% endhighlight %}

* `WITH_BDB_VER=53` は、 BerkeleyDB のバージョンを5.3に統一する設定。  
  （インストールされている BerkeleyDB のバージョンに合わせる。 `pkg info | grep db` 等で確認可）
* `WITHOUT_IPV6=yes` は、 IPv6 関連をインストールしない設定。
* `WITHOUT_X11=yes` は、 X11 関連をインストールしない設定。
* `WITHOUT_GUI=yes` は、 GUI 関連をインストールしない設定。

### 5. FreeBSD Update (セキュリティアップデート機能)

``` text
# freebsd-update fetch
# freebsd-update install
```

crontab に登録して、自動で FreeBSD Update を行うようにする。（最終行に以下の記述を追記）

File: `/etc/crontab`

{% highlight bash linenos %}
0       4       *       *       *       root    /usr/sbin/freebsd-update cron
{% endhighlight %}

### 6. TCP Wrapper設定

``` text
# mv /etc/hosts.allow /etc/hosts.allow.org  # <= 念の為オリジナルファイルを退避
```

File: `/etc/hosts.allow`

{% highlight bash linenos %}
sshd: ALL    # <= 追加
{% endhighlight %}

File: `/etc/hosts.deny`

{% highlight bash linenos %}
ALL: ALL     # <= 追加
{% endhighlight %}

### 7. SSH 設定ファイル編集

今回は、取り急ぎパスワード認証による SSH 接続とする。（公開鍵認証による SSH 接続はあらためて行う）

File: `/etc/ssh/sshd_config`

{% highlight bash linenos %}
Port 9999                    # <= コメント解除＆変更（セキュリティ上、デフォルトから任意の値に変更）

Protocol 2                   # <= コメント解除（SSH version 2プロトコルを利用）

PermitRootLogin no           # <= コメント解除（root でのログインを拒否）

PasswordAuthentication yes   # <= コメント解除＆変更（パスワード認証でのログインを許可）

PermitEmptyPasswords no      # <= コメント解除（空パスワードでのログインを拒否）

AllowUsers masaru            # <= 追加（ログインを許可するユーザ）
{% endhighlight %}

### 8. SSH サーバ再起動

``` text
# /etc/rc.d/sshd restart
Performing sanity check on sshd configuration.
Stopping sshd.
Waiting for PIDS: 801.
Performing sanity check on sshd configuration.
Starting sshd.
```

### 9. SSH 再接続

一旦リモート接続を切断し、再度リモート端末からポートを指定して SSH 接続する。  
（最初は接続確認後にパスワード要求が行われるが、2回目以降は接続確認は省略される）

``` text
$ ssh vbox -p 9999
Warning: the ECDSA host key for '[vbox.mk-mode.com]:9999' differs from the key for the IP address '[192.168.11.102]:9999'
Offending key for IP in /home/masaru/.ssh/known_hosts:10
Matching host key in /home/masaru/.ssh/known_hosts:18
Are you sure you want to continue connecting (yes/no)? yes
Password for masaru@vbox.mk-mode.com:
Last login: Mon Sep 22 10:53:24 2014 from 192.168.11.13
FreeBSD 10.0-RELEASE (GENERIC) #0 r260789: Thu Jan 16 22:34:59 UTC 2014

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

### 10. その他の設定

以下は、必要に応じて行う。

#### 10-1. （その他） freebsd-update ミラーサイト変更

File: `/etc/freebsd-update.conf`

{% highlight bash linenos %}
#ServerName update.FreeBSD.org
ServerName update1.FreeBSD.org  # <= 変更
{% endhighlight %}

#### 10-2. （その他）ユーザ追加

``` text
# mkdir /usr/share/skel/public_html
# pw useradd user_name -m -d /home/user_name
# passwd user_name
Changing local password for user_name
New Password:user_pass         # <= パスワード入力
Retype New Password:user_pass  # <= パスワード確認入力
# chmod 701 /home/user_name
```

#### 10-3. （その他）一般ユーザの su 化を許可

File: `/etc/group`

{% highlight bash linenos %}
#wheel:*:0:root
wheel:*:0:root,user_name  # <= 変更（一般ユーザ名を wheel グループに所属させる）
{% endhighlight %}

#### 10-4. （その他）ホスト名変更

``` text
# hostname hoge.mk-mode.com  # <= ホストネーム変更（FQDN を指定）
# hostname                   # <= ホストネーム確認
hoge.mk-mode.com
```

恒久的に変更するには以下のようにする。

File: `/etc/hosts`

{% highlight bash linenos %}
#127.0.0.1       localhost localhost.my.domain
127.0.0.1       localhost hoge.mk-mode.com      # <= 変更（FQDN を指定）
{% endhighlight %}

---

以上。

