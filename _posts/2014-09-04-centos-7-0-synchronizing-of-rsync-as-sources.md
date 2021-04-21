---
layout   : single
title    : "CentOS 7.0 - rsync でファイル・ディレクトリ同期（同期元として）！"
published: true
date     : 2014-09-04 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- rsync
---

「CentOS 7.0 - rsync でファイル・ディレクトリ同期（同期元として）」についての記録です。

（旧バージョンでの作業記録を更新しました。興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

- CentOS 7.0-1406(x86_64) を NetInstall で最小限インストールしている。
- サーバ用途なので、作業は基本的に全て一般ユーザから root になって行う。
- クライアント側は Linux Mint 17 を想定。
- サーバマシン（CentOS 7.0）からローカルマシン（Linux Mint 17）へ同期することを想定。
- サーバ側のバックアップ用ディレクトリは “/home/backup/rsync/” とする。
- 同期元（サーバマシン）の IP アドレスは 192.168.11.11 を想定。
- 同期先（クライアントマシン）の IP アドレスは 192.168.11.102 を想定。
- クライアント側から同期要求があった場合にのみ rsync を起動させるために、 xined を使用する。
- 以下の記事内では、サーバ側の設定とクライアント側の設定を記述しているので混同しないこと。

### 1. 同期先（Linux Mint）側

#### 1-1. 【クライアント側】rsync インストール

``` text
# apt-get -y install rsync
```

#### 1-2. 【クライアント側】同期先ディレクトリ作成

``` text
# mkdir /home/backup/rsync
```

#### 1-3. 【クライアント側】rsync 設定ファイル作成

File: `/etc/rsyncd.conf`

{% highlight bash linenos %}
# rsync 実行時に使用する名前
[masaru]                        # <= この同期処理に対する名前を適当に
path = /home/backup/rsync     # <= 同期先
hosts allow = 192.168.11.102  # <= 同期元許可
hosts deny = *                # <= 許可同期元以外拒否
list = true                   # <= クライアントへのモジュールリスト表示を許可
uid = root                    # <= ユーザID（root 固定）
gid = root                    # <= グループID（root 固定）
read only = false             # <= 書き込み可
{% endhighlight %}

#### 1-4. 【クライアント側】xinetd インストール

``` text
# apt-get -y install xinetd
```

#### 1-5. 【クライアント側】xinetd 設定ファイル作成

File: `/etc/xinetd.d/rsync`

{% highlight bash linenos %}
service rsync
{
        disable         = no          # <= 変更
        flags           = IPv6
        socket_type     = stream
        wait            = no
        user            = root
        server          = /usr/bin/rsync
        server_args     = --daemon
        log_on_failure  += USERID
}
{% endhighlight %}

#### 1-6. xinetd 自動起動設定

``` text
# update-rc.d xinetd defaults
```

### 2. 同期元（CentOS）側

#### 2-1. 【サーバ側】rsync インストール

``` text
# yum -y install rsync
```

#### 2-2. 【サーバ側】同期除外ファイル指定

同期元の対象ディレクトリ内から同期を除外するファイル/ディレクトリのリスト（ファイル名は任意）を作成する。  
除外するファイル・ディレクトリがなければこの作業は不要。（ファイル名は “/etc/rsync_exclude.lst” を想定）

File: `/etc/rsync_exclude.lst`

{% highlight bash linenos %}
masaru.txt
fuga.txt
{% endhighlight %}

#### 2-3. 【サーバ側】同期の実行

除外ファイルが無ければ `--exclude-from` は不要。

``` text
# rsync -avz --delete --exclude-from=/etc/rsync_exclude.lst /home/backup/rsync 192.168.11.11::masaru
```

#### 2-4. 【サーバ側】自動実行用シェルスクリプト

以下は、除外ファイル無しの例。

File: `/root/rsync_backup_to_client.sh`

{% highlight bash linenos %}
#!/bin/bash
rsync -av --delete /home/backup/rsync 192.168.11.11::masaru
{% endhighlight %}

#### 2-5. 【サーバ側】自動実行用シェルスクリプト権限設定

``` text
# chmod 700 /root/rsync_backup_to_client.sh
```

#### 2-6. 【サーバ側】自動実行設定

以下は、毎時55分に CentOS サーバから Linux Mint マシンに同期する例。

File: `/etc/cron.d/rsync_backup_to_client`

{% highlight bash linenos %}
# エラーが発生しようがしまいがメールは送信しない。
55 * * * * root /root/rsync_backup_to_client.sh > /dev/null 2>&1
{% endhighlight %}

### 参考サイト

- [rsync](http://rsync.samba.org/ "rsync")

---

以上。

