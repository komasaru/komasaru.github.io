---
layout   : single
title    : "CentOS 6.5 - ログ解析ツール（LogWatch）導入！"
published: true
date     : 2014-01-12 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
---

前回は CentOS 6.5 サーバに Git サーバの構築を行いました。  
今回はログ解析ツール LogWatch の導入を行います。

<!--more-->

### 0. 前提条件

- CentOS 6.5(x86_64) を Minimal で最小インストールしている。
- クライントマシンは Linux Mint 14(64bit) を想定。

### 1. インストール

``` text
# yum -y install logwatch
```

### 2. 設定編集

File: `/etc/logwatch/conf/logwatch.conf`

{% highlight bash linenos %}
MailTo = root
Detail = High
LogDir = /var/log
{% endhighlight %}

### 3. 動作確認

結果を端末に表示してみる。

``` text
# logwatch --print

 ################### Logwatch 7.3.6 (05/19/07) ####################
        Processing Initiated: Fri Dec 20 21:02:42 2013
        Date Range Processed: yesterday
                              ( 2013-Dec-19 )
                              Period is day.
      Detail Level of Output: 10
              Type of Output: unformatted
           Logfiles for Host: vbox.mk-mode.com
  ##################################################################

 --------------------- clam-update Begin ------------------------

 No updates detected in the log for the freshclam daemon (the
 ClamAV update process).  If the freshclam daemon is not running,
 you may need to restart it.  Other options:

 A. If you no longer wish to run freshclam, deleting the log file
    (default is freshclam.log) will suppress this error message.

 B. If you use a different log file, update the appropriate
    configuration file.  For example:
       echo "LogFile = log_file" >> /etc/logwatch/conf/logfiles/clam-update.conf
    where log_file is the filename of the freshclam log file.

 C. If you are logging using syslog, you need to indicate that your
    log file uses the syslog format.  For example:
       echo "*OnlyService = freshclam" >> /etc/logwatch/conf/logfiles/clam-update.conf
       echo "*RemoveHeaders" >> /etc/logwatch/conf/logfiles/clam-update.conf

 ---------------------- clam-update End -------------------------

 --------------------- Disk Space Begin ------------------------

 Filesystem                   Size  Used Avail Use% Mounted on
 /dev/mapper/vg_vbox-lv_root   18G  5.7G   11G  35% /
 /dev/sda1                    485M   32M  428M   7% /boot

 ---------------------- Disk Space End -------------------------

 ###################### Logwatch End #########################
```

結果を root にメール送信してみる。

``` text
# logwatch --mailto root
```

### 4. 自動実行確認

LogWatch インストール後は、デフォルトで "/etc/cron.daily/" ディレクトリに "0logwatch" というファイルが作成され、毎日自動実行されるようになっている。    
ちなみに、"/etc/anacrontab" の設定によると、24時間運用している場合は 3:06 〜 3:50 の範囲でランダムに実行されるようになっている。  
`RANDOM_DELAY=45`, `START_HOURS_RANGE=3-22` で `delay in minutes` が `5` なので、「3時以降22時未満の間」に「5分の遅延」があってから「0〜44のランダム」数後に「1分間隔」で anacron によって実行される。（仮に、24時間運用ではなく夜9時にマシンが起動した場合は、21:06 〜 21:50 の範囲でランダムに実行される）

---

次回は、サーバ監視ツール munin の導入について紹介する予定です。

以上。

