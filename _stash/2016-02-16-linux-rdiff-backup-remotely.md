---
layout   : single
title    : "Linux - rdiff-backup コマンドでリモートバックアップ！"
published: true
date     : 2016-02-16 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
---

手軽にバックアップ作業の行える rdiff-backup コマンドについての記録です。

<!--more-->

### 0. 前提条件

* 以下の環境を想定。（他の環境でも同様）
  - バックアップ元：Linux Mint 17.2（一般ユーザでの作業）
  - バックアップ先：CentOS 6.7（root ユーザでの作業）  
    （RPMForge リポジトリを使用するので、導入済みであること。参考：[CentOS 6.5 - 初期設定！]({{site.baseurl}}/2013/12/13/centos-6-5-first-setting/ "CentOS 6.5 - 初期設定！")）
  - リモート接続に SSH 鍵認証を使用している。（参考：[CentOS 6.5 - SSH サーバ 鍵認証接続！]({{site.baseurl}}/2013/12/15/centos-6-5-ssh-connection-by-key-certificate/ "CentOS 6.5 - SSH サーバ 鍵認証接続！")）  
    （SSH 鍵認証でないのなら、以下に登場する `--remote-schema` オプションを無視して考えればよい）

### 1. rdiff-backup コマンドのインストール

バックアップ元(Linux Mint)側で以下を実行。

``` text
$ sudo apt-get install rdiff-backup
```

バックアップ先(CentOS)側で以下を実行。  
（標準リポジトリには存在しないので、RPMForge リポジトリを使用）

``` text
# yum --enablerepo=rpmforge install rdiff-backup
```

### 2. バックアップ除外リストの作成

バックアップ対象のディレクトリ内から除外したいファイルやディレクトリがあれば、それ用の一覧ファイルを作成する。（以下は一例）

File: `/path/to/exclude.lst`

{% highlight bash linenos %}
/home/hoge/path/to/data
/home/hoge/path/to/log
{% endhighlight %}

### 3. リモートバックアップの実行

以下のように実行する。  
最初は SSH のパスワードを問われるので、応答する。（２回目以降は問われない）

``` text
$ rdiff-backup \
--remote-schema 'ssh -i $HOME/.ssh/id_rsa -p 9999 -C %s rdiff-backup --server' \
--exclude-filelist exclude.lst \
--print \
$HOME/path/to/source_dir 192.168.11.102::$HOME/path/to/remote_dir

--------------[ Session statistics ]--------------
StartTime 1452147922.00 (Thu Jan  7 23:25:22 2016)
EndTime 1452147923.72 (Thu Jan  7 23:25:23 2016)
ElapsedTime 1.72 (1.72 seconds)
SourceFiles 285
SourceFileSize 1610709 (1.54 MB)
MirrorFiles 1
MirrorFileSize 0 (0 bytes)
NewFiles 284
NewFileSize 1610709 (1.54 MB)
DeletedFiles 0
DeletedFileSize 0 (0 bytes)
ChangedFiles 1
ChangedSourceSize 0 (0 bytes)
ChangedMirrorSize 0 (0 bytes)
IncrementFiles 0
IncrementFileSize 0 (0 bytes)
TotalDestinationSizeChange 1610709 (1.54 MB)
Errors 0
--------------------------------------------------
```

* SSH 鍵ファイルが `$HOME/.ssh/id_rsa` で、バックアップ先の SSH ポートが `9999` であることを想定。
* 除外リストを使用しないのなら `--exclude-filelist exclude.lst` は不要。
* 除外したいファイルやディレクトリが少ないのなら、`--exclude-filelist` オプションを使用せずに `--exclude xxxx` で１つずつ指定してもよい。
* `--print` は処理終了時に結果を出力するオプション。

バックアップが成功すると、バックアップ先にはコピーされたファイル・ディレクトリとは別に "rdiff-backup-data" というバックアップ履歴管理のディレクトリも作成される。

### 4. バックアップの自動化

このバックアップを自動化したければ、シェルスクリプトを作成して cron 登録すればよい。

まず、前項のコマンドをシェルスクリプトにする。（`--print` オプションは不要なので削除）

File: `/home/hoge/rdiff_test.sh`

{% highlight bash linenos %}
#!/bin/bash
rdiff-backup \
--remote-schema 'ssh -i $HOME/.ssh/id_rsa -p 9999 -C %s rdiff-backup --server' \
--exclude-filelist exclude.lst \
$HOME/path/to/source_dir 192.168.11.102::$HOME/path/to/remote_dir
{% endhighlight %}

そして、実行権限を付与する。

``` text
$ sudo chmod +x rdiff_test.sh
```

最後に cron に登録する。（以下は毎日午前２時に実行する例（エラー以外メール送信しない））

File: `/etc/cron.d/rdiff_test`

{% highlight bash linenos %}
0 2 * * * root /home/hoge/rdiff_test.sh > /dev/null
{% endhighlight %}

### 5. リストアの実行

最新の状態にリストアするなら以下のように `-r now` オプションを使用する。  
（バックアップ時とディレクトリ指定の順番が逆であること、既存のディレクトリをリストア先に指定できないことに注意）

``` bash
$ rdiff-backup \
--remote-schema 'ssh -i $HOME/.ssh/id_rsa -p 9999 -C %s rdiff-backup --server' \
--exclude-filelist exclude.lst \
-r now \
192.168.11.102::$HOME/path/to/remote_dir $HOME/path/to/restore_dir
```

特定の時点の状態にリストアするなら、まず以下のように `-l` で確認する。

``` text
$ rdiff-backup \
--remote-schema 'ssh -i $HOME/.ssh/id_rsa -p 9999 -C %s rdiff-backup --server' \
-l \
192.168.11.102::$HOME/work/disaster

Found 1 increments:
    increments.2016-01-07T23:25:22+09:00.dir   Thu Jan  7 23:25:22 2016
Current mirror: Thu Jan  7 23:48:57 2016
```

最新のバックアップが `Thu Jan  7 23:48:57 2016` で１つ前のバックアップが `Thu Jan  7 23:25:22 2016` であることが分かるので、以下のようにすることで１つ前の状態にリストアできる。

``` bash
$ rdiff-backup \
--remote-schema 'ssh -i $HOME/.ssh/id_rsa -p 9999 -C %s rdiff-backup --server' \
--exclude-filelist exclude.lst \
-r 2016-01-07T23:25:22+09:00 \
192.168.11.102::$HOME/path/to/remote_dir $HOME/path/to/restore_dir2
```

### 6. 古いバックアップの削除

古いバックアップを削除するには以下のようにする。（以下は１ケ月より古い履歴を削除する例。 単位は `s`, `m`, `h`, `D`, `W`, `M`, `Y` が指定可）

``` text
$ rdiff-backup \
--remote-schema 'ssh -i $HOME/.ssh/id_rsa -p 9999 -C %s rdiff-backup --server' \
--remove-older-than 1M 192.168.11.102::$HOME/path/to/remote_dir
```

`--remove-older-than 2016-01-07T23:25:22+09:00` のように指定することも可能。

### 7. 参考サイト

* [rdiff-backup](http://www.nongnu.org/rdiff-backup/ "rdiff-backup")

---

以上。

