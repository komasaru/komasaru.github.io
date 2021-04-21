---
layout   : single
title    : "CentOS - Monit でプロセス監視！"
published: true
date     : 2016-11-04 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
---

不意にサーバプロセスが落ちてしまい、さらに、落ちたことにも気付かず何日も経過してしまう、ということがないよう、プロセスを監視するツール Monit を使用します。

以下、使用方法についての簡単な記録です。

<!--more-->

### 0. 前提条件

* CentOS 6.8(32bit) での作業を想定。  
  （Debian 系はディレクトリ構成等が異なるので、適宜置き換えて考える）
* RPMForge リポジトリが導入済みである。（過去記事参照： [CentOS 6.5 - 初期設定！]({{site.baseurl}}/2013/12/13/centos-6-5-first-setting/ "CentOS 6.5 - 初期設定！") ）

### 1.  monit のインストール

CentOS のデフォルトのリポジトリには存在しないため RPMForge リポジトリを使用してインストールする。

``` text
$ yum --enablerepo=rpmforge -y install monit
```

CentOS 7 系なら標準リポジトリでインストールできる（かもしれない）。

### 2. 設定ファイル編集

設定ファイル "/etc/monit.conf" を編集する。  
以下は当方の例。

File: `/etc/monit.conf`

{% highlight bash linenos %}
set daemon 60                               # 監視間隔（秒）

set logfile /var/log/monit.log              # ログファイル

set idfile /var/monit/id                    # Monit インスタンスの ID ファイル

set statefile /var/monit/state              # Monitering ステート保存ファイル

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

include /etc/monit.d/*                      # 別の設定ファイル読み込み
{% endhighlight %}

* `set logfile /var/log/monit.log` を `set logfile syslog facility log_daemon` とすると syslog での出力となる。
* メールサーバは複数設定可能。
* メール通知先も複数設定可能。
* `set alert root@localhost only on { xxxx }` などとすれば、xxxx アクション発生時のみメール通知するようにする。
* `set alert root@localhost but not on { xxxx }` などとすれば、xxxx 以外のアクション発生時のみメール通知するようにする。
* その他の設定等については、 "monit.conf" 内のコメントや[公式ドキュメント](https://mmonit.com/monit/documentation/monit.html)を参照のこと。

### 3. アラート機能の設定

以下は MySQL サーバを監視する例。（パスは環境に合わせて適宜置き換えること）

File: `/etc/monit.d/mysqld`

{% highlight bash linenos %}
check process mysql with pidfile /var/run/mysqld/mysqld.pid
    every 2 cycle
    start program = "/etc/rc.d/init.d/mysqld start"
    stop  program = "/etc/rc.d/init.d/mysqld stop"
    if failed
        host localhost port 3306 protocol mysql
        with timeout 15 seconds for 3 times within 4 cycles
    then restart$
    if failed
        unixsocket /var/lib/mysql/mysql.sock protocol mysql
        for 3 times within 4 cycles
    then restart$
    if 5 restarts within 5 cycles then timeout
{% endhighlight %}

* "mysqld.pid" ファイルを2サイクル（今回の設定では 60秒 * 2 = 120秒）毎に監視し、存在しなければ MySQL サーバを再起動する。
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
$ monit -t
Control file syntax OK
```

### 5. Monit の起動

``` text
$ /etc/rc.d/init.d/monit start
Starting monit: Starting monit daemon with http interface at [localhost:2812]
                                                           [  OK  ]
```

### 6. 監視状況の確認

``` text
$ monit status
The Monit daemon 5.5 uptime: 5m

Process 'mysql'
  status                            Running
  monitoring status                 Monitored
  pid                               14542
  parent pid                        13372
  uptime                            9h 18m
  children                          0
  memory kilobytes                  863204
  memory kilobytes total            863204
  memory percent                    44.7%
  memory percent total              44.7%
  cpu percent                       1.3%
  cpu percent total                 1.3%
  unix socket response time         0.001s to /var/lib/mysql/mysql.sock [MYSQL]
  port response time                0.001s to localhost:3306 [MYSQL via TCP]
  data collected                    Sun, 09 Oct 2016 23:31:18

System 'foo.bar.buz'
  status                            Running
  monitoring status                 Monitored
  load average                      [0.42] [0.38] [0.38]
  cpu                               12.9%us 1.7%sy 14.2%wa
  memory usage                      1807708 kB [93.6%]
  swap usage                        889344 kB [21.2%]
  data collected                    Sun, 09 Oct 2016 23:31:18
```

`status` が `Running` であれば、「監視中」である。

`monit summary` だと `status` だけを確認できる。

### 7. 個別監視の停止・起動

個別に監視を停止・起動するには以下のようにする。

``` text
$ monit xxxx stop
$ monit xxxx start
```

### 8. グループ単位での監視の停止・起動

個別の設定ファイル内で `group xxxx` のように記述していれば、xxxx グループの単位で監視を停止・起動することができる。

``` text
$ monit -g xxxx stop
$ monit -g xxxx start
```

### 9. 参考サイト

* [Easy, proactive monitoring of processes, programs, files, directories, filesystems and hosts - Monit](https://mmonit.com/monit/ "Easy, proactive monitoring of processes, programs, files, directories, filesystems and hosts - Monit")

---

プロセスが落ちていないかをチェックするためにシェルスクリプトを作成する必要がないので、手軽で便利です。

以上。

