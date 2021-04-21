---
layout   : single
title    : "Debian 10 (buster) - Monit でプロセス監視（ソースビルド）！"
published: true
date     : 2020-01-26 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- munin
---

Debian GNU/Linux 10 (buster) にプロセス監視ツール monit をインストールする方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10 (buster) での作業を想定。
* root ユーザでの作業を想定。
* Debian 9 (stretch) にはパッケージが存在したが、 10 (buster) には存在しないため、ソースをビルドしてインストール必要がある。
* 当記事執筆時点で最新の 5.26.0 をインストールする。


### 1. アーカイブファイルのダウンロード＆展開

``` text
# cd /usr/local/src
# wget https://mmonit.com/monit/dist/monit-5.26.0.tar.gz
# tar zxvf monit-5.26.0.tar.gz
```

### 2. ビルド＆インストール

``` text
# cd monit-5.26.0
# ./configure
# make
# make install
```

### 3. インストールの確認

``` text
# monit -V
This is Monit version 5.26.0
Built with ssl, with ipv6, with compression, with pam and with large files
Copyright (C) 2001-2019 Tildeslash Ltd. All Rights Reserved.
```

### 4. 起動ファイルの作成

起動ファイル(Systemd)を作成する。

File: `/lib/systemd/system/monit.service`

{% highlight bash linenos %}
# This file is systemd template for monit service. To
# register monit with systemd, place the monit.service file
# to the /lib/systemd/system/ directory and then start it
# using systemctl (see bellow).
#
# Enable monit to start on boot: 
#         systemctl enable monit.service
#
# Start monit immediately: 
#         systemctl start monit.service
#
# Stop monit:
#         systemctl stop monit.service
#
# Status:
#         systemctl status monit.service

[Unit]
Description=Pro-active monitoring utility for unix systems
After=network.target
Documentation=man:monit(1) https://mmonit.com/wiki/Monit/HowTo 

[Service]
Type=simple
KillMode=process
ExecStart=/usr/local/bin/monit -I
ExecStop=/usr/local/bin/monit quit
ExecReload=/usr/local/bin/monit reload
Restart = on-abnormal
StandardOutput=null

[Install]
WantedBy=multi-user.target
{% endhighlight %}

### 5. 設定ファイル作成

まず、ソースディレクトリ内の既存の設定ファイルを複製。（設定ファイルは `~/.monitrc`, `/etc/monitrc`, `/usr/local/etc/monitrc`, `/usr/local/etc/monitrc`, `./monitrc` のいずれかで行なう）  
当方は `/etc/monitrc` とした。

``` text
# cp monitrc /etc/
```

そして、編集。（以下は当方の例。他はデフォルト）

File: `/etc/monitrc`

{% highlight bash %}
  set daemon 120                              # 監視間隔（秒）

  set mailserver localhost                    # メールサーバ

  set mail-format {                           # メール書式
    from:    Monit <monit@$HOST>
    subject: monit alert --  $EVENT $SERVICE
    message: $EVENT Service $SERVICE
                  Date:        $DATE
                  Action:      $ACTION
                  Host:        $HOST
                  Description: $DESCRIPTION

             Your faithful employee,
             Monit
  }

  set alert root@localhost                    # 通知先メールアドレス

  include /etc/monit.d/*                    # 別の設定ファイル読み込み
{% endhighlight %}

* メールサーバは複数設定可能。
* メール通知先も複数設定可能。
* `set alert root@localhost only on { xxxx }` などとすれば、xxxx アクション発生時のみメール通知するようにする。
* `set alert root@localhost but not on { xxxx }` などとすれば、xxxx 以外のアクション発生時のみメール通知するようにする。
* その他の設定等については、 "monit.conf" 内のコメントや[公式ドキュメント](https://mmonit.com/monit/documentation/monit.html)を参照のこと。

### 6. アラート機能の設定

以下は MySQL サーバを監視する例。（パスは環境に合わせて適宜置き換えること）

File: `/etc/monit.d/mysqld`

{% highlight bash linenos %}
check process mysql with pidfile /var/run/mysqld/mysqld.pid
    every 1 cycle
    start program = "/etc/rc.d/init.d/mysqld start"
    stop  program = "/etc/rc.d/init.d/mysqld stop"
    if failed
        host localhost port 3306 protocol mysql
        with timeout 15 seconds for 3 times within 4 cycles
    then restart$
    if failed
        unixsocket /var/run/mysqld/mysqld.sock protocol mysql
        for 3 times within 4 cycles
    then restart$
    if 5 restarts within 5 cycles then timeout
{% endhighlight %}

* `mysqld.pid` ファイルを1サイクル（今回の設定では 120秒）毎に監視し、存在しなければ MySQL サーバを再起動する。
* TCP ポート `3306` への接続が4回中3回15秒のタイムアウトで失敗する場合は、 MySQL サーバを再起動する。
* Unix ソケットへの接続が4回中3回失敗する場合は、 MySQL サーバを再起動する。
* 5回中5回再起動となる場合は、タイムアウトする。
* `group xxxx` としてグループ単位で監視の制御をすることも可能。
* CPU 使用量やメモリ使用量等を監視することも可能。

PID ファイルの存在を監視するのではなく、プロセス自体の存在を監視したければ、１行目を以下のようにする。（以下は、プロセス名に `hoge` を含むプロセスを監視する例で、正規表現で指定する）

File: `/etc/monit.d/hoge`

{% highlight bash %}
check process hoge matching "hoge"
{% endhighlight %}

### 7. 構文チェック

予め設定ファイルの構文をチェックすることができる。

``` text
# monit -t
Control file syntax OK
```

### 8. monit の起動

``` text
# systemctl start monit
```

### 9. 自動起動の設定

``` text
# systemctl enable monit
Created symlink /etc/systemd/system/multi-user.target.wants/monit.service→ /lib/systemd/system/monit.service.

# systemctl is-enabled monit
enabled
```

### 10. 監視状況の確認

``` text
# monit status
Monit 5.26.0 uptime: 4m

System 'noah'
  status                       OK
  monitoring status            Monitored
  monitoring mode              active
  on reboot                    start
  load average                 [0.04] [0.16] [0.34]
  cpu                          0.0%us 0.1%sy 1.1%wa
  memory usage                 1.2 GB [60.7%]
  swap usage                   12.8 MB [0.3%]
  uptime                       54m
  boot time                    Sun, 29 Sep 2019 10:24:29
  data collected               Sun, 29 Sep 2019 11:19:12

```

* `monit summary` だと `status` だけを確認できる。
* アラートの設定をしていれば、アラートの状況も出力される。

### 11. 個別監視の停止・起動

個別に監視を停止・起動するには以下のようにする。

``` text
# monit stop xxxx
# monit start xxxx
```

### 12. グループ単位での監視の停止・起動

個別の設定ファイル内で `group xxxx` のように記述していれば、xxxx グループの単位で監視を停止・起動することができる。

``` text
# monit -g xxxx stop
# monit -g xxxx start
```

### 13. 参考サイト

* [Easy, proactive monitoring of processes, programs, files, directories, filesystems and hosts - Monit](https://mmonit.com/monit/ "Easy, proactive monitoring of processes, programs, files, directories, filesystems and hosts - Monit")

インストールや Systemd の設定は以下。

* [M/Monit - Wiki](https://mmonit.com/wiki/Monit/Systemd "M/Monit - Wiki")

---

以上。

