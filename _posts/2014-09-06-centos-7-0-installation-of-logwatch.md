---
layout   : single
title    : "CentOS 7.0 - ログ解析ツール LogWatch 導入！"
published: true
date     : 2014-09-06 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
---

「CentOS 7.0 - ログ解析ツール LogWatch 導入」についての記録です。

（旧バージョンでの作業記録を更新しました。興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

- CentOS 7.0-1406(x86_64) を NetInstall で最小限インストールしている。
- サーバ用途なので、作業は基本的に全て一般ユーザから root になって行う。
- クライアント側は Linux Mint 17 を想定。

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
# logwatch --output stdout

 ################### Logwatch 7.4.0 (03/01/11) ####################
        Processing Initiated: Sun Aug  3 10:14:45 2014
        Date Range Processed: yesterday
                              ( 2014-Aug-02 )
                              Period is day.
        Detail Level of Output: 10
        Type of Output/Format: stdout / text
        Logfiles for Host: vbox.mk-mode.com
 ##################################################################

 --------------------- Kernel Audit Begin ------------------------

  Number of audit daemon starts: 1

  Number of audit initializations: 1

 ---------------------- Kernel Audit End -------------------------

         :
 ===< 途中省略 >===
         :

 --------------------- Disk Space Begin ------------------------

 Filesystem                    Size  Used Avail Use% Mounted on
 /dev/mapper/centos_vbox-root   18G  5.5G   13G  32% /
 devtmpfs                      492M     0  492M   0% /dev
 /dev/sda1                     497M  131M  366M  27% /boot

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
`RANDOM_DELAY=45`, `START_HOURS_RANGE=3-22` で `delay in minutes` が `5` なので、「3時以降22時未満の間」に「5分の遅延」があってから「0〜44のランダム」数後に「1分間隔」で anacron によって実行されるので。（仮に、24時間運用ではなく夜9時にマシンが起動した場合は、21:06 〜 21:50 の範囲でランダムに実行される）

---

以上。

