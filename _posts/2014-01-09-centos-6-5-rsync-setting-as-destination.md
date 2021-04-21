---
layout   : single
title    : "CentOS 6.5 - rsync でファイル・ディレクトリ同期（同期先として）！"
published: true
date     : 2014-01-09 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- rsync
---

前回は CentOS 6.5 サーバで自動バックアップ運用の設定を行いました。  
今回は rsync で CentOS サーバを同期先としてファイル・ディレクトリの同期を行います。

<!--more-->

### 0. 前提条件

- CentOS 6.5(x86_64) を Minimal で最小インストールしている。
- クライントマシンは Linux Mint 14(64bit) を想定。
- ローカルマシン（Linux Mint 14）からサーバマシン（CentOS 6.5）へ同期することを想定。
- サーバ側のバックアップ用ディレクトリは “/home/backup/rsync/” とする。
- 同期元（クライアントマシン）の IP アドレスは 192.168.11.11 を想定。
- 同期先（サーバマシン）の IP アドレスは 192.168.11.102 を想定。
- クライアント側から同期要求があった場合にのみ rsync を起動させるために、 xined を使用する。
- 以下の記事内では、サーバ側の設定とクライアント側の設定を記述しているので混同しないこと。

### 1. 同期先（CentOS）側

#### 1-1. 【サーバ側】rsync, xinetd インストール

``` text
# yum -y install rsync xinetd
```

#### 1-2. 【サーバ側】xinetd 設定ファイル編集

File: `/etc/xinetd.d/rsync`

{% highlight bash linenos %}
# default: off
# description: The rsync server is a good addition to an ftp server, as it \
#       allows crc checksumming etc.
service rsync
{
        disable = no             # <= 変更
        flags           = IPv6
        socket_type     = stream
        wait            = no
        user            = root
        server          = /usr/bin/rsync
        server_args     = --daemon
        log_on_failure  += USERID
}
{% endhighlight %}

#### 1-3. 【サーバ側】xinetd 起動

``` text
# /etc/rc.d/init.d/xinetd start
```

#### 1-4. 【サーバ側】xinetd 自動起動設定

``` text
# chkconfig xinetd on
# chkconfig --list xinetd  # <= 2,3,4,5 が "on" であることを確認
xinetd          0:off   1:off   2:on    3:on    4:on    5:on    6:off
```

#### 1-5. 【サーバ側】同期先ディレクトリ作成

``` text
# mkdir /home/backup/rsync
```

#### 1-6. 【サーバ側】rsync 設定ファイル編集

File: `/etc/rsyncd.conf`

{% highlight bash linenos %}
[hoge]                       # <= この同期処理に対する名前を適当に
path = /home/backup/rsync    # <= 同期先
hosts allow = 192.168.11.13  # <= 同期元許可
hosts deny = *               # <= 許可同期元以外拒否
list = true                  # <= クライアントへのモジュールリスト表示を許可
uid = root                   # <= ユーザID（root 固定）
gid = root                   # <= グループID（root 固定）
read only = false            # <= 書き込み可
{% endhighlight %}

### 2. 同期元（Linux Mint）側

#### 2-1. 【クライアント側】rsync インストール

``` text
# aptitude -y install rsync
```

#### 2-2. 【クライアント側】同期除外ファイル指定

同期元の対象ディレクトリ内から同期を除外するファイル/ディレクトリのリスト（ファイル名は任意）を作成する。  
除外するファイル・ディレクトリがなければこの作業は不要。（ファイル名は “/etc/rsync_exclude.lst” を想定）

File: `/etc/rsync_exclude.lst`

{% highlight bash linenos %}
hoge.txt
fuga.txt
{% endhighlight %}

#### 2-3. 【クライアント側】同期の実行

``` text
# rsync -avz --delete --exclude-from=/etc/rsync_exclude.lst /home/backup/rsync 192.168.11.102::hoge
```

`-a` はアーカイブモード、`-v` は転送の詳細情報を表示、`-z` は圧縮転送するオプション。 `--delete` は同期元から削除されたら同期先も削除するオプション。除外するファイル/ディレクトリが無いのなら、`--exclude-from=/etc/rsync_exclude.lst` のオプションは不要。

### 参考サイト

- [rsync](http://rsync.samba.org/ "rsync")

---

次回は、今回と逆の rsync で CentOS サーバを同期元としてファイル・ディレクトリを同期する方法について紹介する予定です。

以上。

