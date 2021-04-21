---
layout   : single
title    : "Debian 8 (Jessie) - Monit でプロセス監視！"
published: true
date     : 2017-01-30 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- Debian
---

プロセスを監視するツール Monit を Debian 8 (Jessie) に導入する方法についての簡単な記録です。

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 8 (Jessie) での作業を想定。
  （RedHat 系はディレクトリ構成等が異なるので、適宜置き換えて考える。もしくは、過去記事「[CentOS - Monit でプロセス監視]({{site.baseurl}}/2016/11/04/centos-monit-monitoring "CentOS - Monit でプロセス監視")」を参照）

### 1.  monit のインストール

``` text
# apt install -y monit
```

### 2. 設定ファイル編集

設定ファイル "/etc/monit/monitrc" を編集する。  
以下は当方の例。

File: `/etc/monit/monitrc`

{% highlight bash linenos %}
set daemon 120                              # 監視間隔（秒）

set logfile /var/log/monit.log              # ログファイル

set idfile /var/lib/monit/id                # Monit インスタンスの ID ファイル

set statefile /var/lib/monit/state          # Monitering ステート保存ファイル

set mailserver localhost                    # メールサーバ

set mail-format {                           # メール書式
     from: monit@$HOST
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

set httpd port 2812                         # コメント解除
  allow localhost                           # コメント解除

include /etc/monit/conf.d/*                 # 別の設定ファイル読み込み
{% endhighlight %}

* `set logfile /var/log/monit.log` を `set logfile syslog facility log_daemon` とすると syslog での出力となる。
* メールサーバは複数設定可能。
* メール通知先も複数設定可能。
* `set alert root@localhost only on { xxxx }` などとすれば、xxxx アクション発生時のみメール通知するようにする。
* `set alert root@localhost but not on { xxxx }` などとすれば、xxxx 以外のアクション発生時のみメール通知するようにする。
* その他の設定等については、 "monit.conf" 内のコメントや[公式ドキュメント](https://mmonit.com/monit/documentation/monit.html)を参照のこと。

### 3. アラート機能の設定

以下は MySQL サーバを監視する例。（パスは環境に合わせて適宜置き換えること）

File: `/etc/monit/conf.d/mysqld`

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

* "mysqld.pid" ファイルを1サイクル（今回の設定では 120秒 * 1 = 60秒）毎に監視し、存在しなければ MySQL サーバを再起動する。
* TCP ポート 3306 への接続が4回中3回15秒のタイムアウトで失敗する場合は、 MySQL サーバを再起動する。
* Unix ソケットへの接続が4回中3回失敗する場合は、 MySQL サーバを再起動する。
* 5回中5回再起動となる場合は、タイムアウトする。
* `group xxxx` としてグループ単位で監視の制御をすることも可能。
* CPU 使用量やメモリ使用量等を監視することも可能。

PID ファイルの存在を監視するのではなく、プロセス自体の存在を監視したければ、１行目を以下のようにする。（以下は、プロセス名に `hoge` を含むプロセスを監視する例で、正規表現で指定する）

File: `/etc/monit.d/hoge`

{% highlight bash linenos %}
check process hoge matching "hoge"
{% endhighlight %}

### 4. 構文チェック

予め設定ファイルの構文をチェックすることができる。

``` text
# monit -t
Control file syntax OK
```

### 5. Monit の再起動

``` text
# systemctl restart monit
```

### 6. 監視状況の確認

``` text
# monit status
The Monit daemon 5.9 uptime: 1m

Process 'mysqld'
  status                            Running
  monitoring status                 Monitored
  pid                               5258
  parent pid                        4953
  uid                               999
  effective uid                     999
  gid                               1001
  uptime                            32m
  children                          0
  memory kilobytes                  157.3 MB
  memory kilobytes total            157.3 MB
  memory percent                    7.8%
  memory percent total              7.8%
  cpu percent                       0.0%
  cpu percent total                 0.0%
  unix socket response time         0.000s to /var/run/mysqld/mysqld.sock [MYSQL]
  port response time                0.001s to localhost:3306 [MYSQL via TCP]
  data collected                    Wed, 21 Dec 2016 22:05:55

System 'foo.bar.com'
  status                            Running
  monitoring status                 Monitored
  load average                      [0.63] [0.31] [0.24]
  cpu                               0.0%us 0.0%sy 0.0%wa
  memory usage                      663.4 MB [33.2%]
  swap usage                        0.0 B [0.0%]
  data collected                    Wed, 21 Dec 2016 22:05:55

```

`status` が `Running` であれば、「監視中」である。

`monit summary` だと `status` だけを確認できる。

### 7. 個別監視の停止・起動

個別に監視を停止・起動するには以下のようにする。

``` text
# monit stop xxxx
# monit start xxxx
```

### 8. グループ単位での監視の停止・起動

個別の設定ファイル内で `group xxxx` のように記述していれば、xxxx グループの単位で監視を停止・起動することができる。

``` text
# monit -g xxxx stop
# monit -g xxxx start
```

### 9. 参考サイト

* [Easy, proactive monitoring of processes, programs, files, directories, filesystems and hosts - Monit](https://mmonit.com/monit/ "Easy, proactive monitoring of processes, programs, files, directories, filesystems and hosts - Monit")

---

プロセスが落ちていないかをチェックするためにシェルスクリプトを作成する必要がないので、手軽で便利です。

以上。

