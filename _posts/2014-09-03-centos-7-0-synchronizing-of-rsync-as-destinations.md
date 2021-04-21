---
layout   : single
title    : "CentOS 7.0 - rsync でファイル・ディレクトリ同期（同期先として）！"
published: true
date     : 2014-09-03 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- rsync
---

「CentOS 7.0 - rsync でファイル・ディレクトリ同期（同期先として）」についての記録です。

（旧バージョンでの作業記録を更新しました。興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

- CentOS 7.0-1406(x86_64) を NetInstall で最小限インストールしている。
- サーバ用途なので、作業は基本的に全て一般ユーザから root になって行う。
- クライアント側は Linux Mint 17 を想定。
- ローカルマシン（Linux Mint 17）からサーバマシン（CentOS 7.0）へ同期することを想定。
- サーバ側のバックアップ用ディレクトリは “/home/backup/rsync/” とする。
- 同期元（クライアントマシン）の IP アドレスは 192.168.11.11 を想定。
- 同期先（サーバマシン）の IP アドレスは 192.168.11.102 を想定。
- クライアント側から同期要求があった場合にのみ rsync を起動させるために、 xined を使用する。
- 以下の記事内では、サーバ側の設定とクライアント側の設定を記述しているので混同しないこと。

### 1. 同期先（CentOS）側

#### 1-1. 【サーバ側】rsync, xinetd インストール

デフォルトでは rsync, xinetd はインストールされているが、未インストールならインストールする。

``` text
# yum -y install rsync xinetd
```

#### 1-2. 【サーバ側】xinetd 設定ファイル編集

以下のように編集する。ファイルがなければ作成する。（最近はデフォルトでは無いファイルなので作成しなければならない）

File: `/etc/xinetd.d/rsync`

{% highlight bash linenos %}
# default: off
# description: The rsync server is a good addition to an ftp server, as it \
#       allows crc checksumming etc.
service rsync
{
        disable         = no   # <= 変更
        flags           = IPv6
        socket_type     = stream
        wait            = no
        user            = root
        server          = /usr/bin/rsync
        server_args     = --daemon
        log_on_failure  += USERID
}
{% endhighlight %}

#### 1-3. 【サーバ側】xinetd 再起動

再起動する（未起動なら起動する）。

``` text
# systemctl restart xinetd
```

#### 1-4. 【サーバ側】xinetd 自動起動設定

デフォルトで自動起動するようになっているはずだが、そうでなければ自動起動するよう設定する。

``` text
# systemctl enable xinetd
# systemctl list-unit-files -t service | grep xinetd
xinetd.service                              enabled  # <= enabled であることを確認
```

#### 1-5. 【サーバ側】同期先ディレクトリ作成

``` text
# mkdir /home/backup/rsync
```

#### 1-6. 【サーバ側】rsync 設定ファイル編集

File: `/etc/rsyncd.conf`

{% highlight bash linenos %}
[masaru]                       # <= この同期処理に対する名前を適当に
path = /home/backup/rsync    # <= 同期先
hosts allow = 192.168.11.11  # <= 同期元許可
hosts deny = *               # <= 許可同期元以外拒否
list = true                  # <= クライアントへのモジュールリスト表示を許可
uid = root                   # <= ユーザID（root 固定）
gid = root                   # <= グループID（root 固定）
read only = false            # <= 書き込み可
{% endhighlight %}

#### 1-7. ファイアウォール設定

ポート TCP:873 を開放する。

``` text
# firewall-cmd --add-port=873/tcp
success
# firewall-cmd --add-port=873/tcp --permanent
success
# firewall-cmd --list-ports
110/tcp 465/tcp 873/tcp 4000-4005/tcp
```

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
masaru.txt
fuga.txt
{% endhighlight %}

#### 2-3. 【クライアント側】同期の実行

``` text
# rsync -avz --delete --exclude-from=/etc/rsync_exclude.lst /home/backup/rsync 192.168.11.102::masaru
```

`-a` はアーカイブモード、`-v` は転送の詳細情報を表示、`-z` は圧縮転送するオプション。 `--delete` は同期元から削除されたら同期先も削除するオプション。除外するファイル/ディレクトリが無いのなら、`--exclude-from=/etc/rsync_exclude.lst` のオプションは不要。

### 参考サイト

- [rsync](http://rsync.samba.org/ "rsync")

---

以上。

