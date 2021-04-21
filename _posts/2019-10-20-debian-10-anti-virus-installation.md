---
layout   : single
title    : "Debian 10 (buster) - アンチウィルスソフト導入！"
published: true
date     : 2019-10-20 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- ウイルス対策
---

Debian GNU/Linux 10 (buster) にウイルス対策ソフト ClamAV をインストールする方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10 (buster) での作業を想定。
* Apt でインストールする。
* 毎日自動でウィルススキャンを実行するようにする。
* root ユーザでの作業を想定。

### 1. ClamAV のインストール

以下のようにして、アンチウィルスソフト ClamAV, ClamAV Daemon をインストールする。

``` text
# apt -y install clamav clamav-daemon
```

### 2. ウィルス定義ファイルの最新化

`freshclam` コマンドでウィルス定義ファイルを最新に更新する。

しかし、デフォルトの状態では以下のようになってしまう。（以前はこのような事態にはならなかったが）

``` text
# freshclam
ERROR: /var/log/clamav/freshclam.log is locked by another process
ERROR: Problem with internal logger (UpdateLogFile = /var/log/clamav/freshclam.log).
```

そこで、 `/var/log/clamav/freshclam.log` を作り直す。  
（`clamav:adm` となっている所有者・グループを `clamav:clamav` に変更するだけはうまく行かない）

``` text
# rm -f /var/log/clamav/freshclam.log
# touch /var/log/clamav/freshclam.log
# chown clamav:clamav /var/log/clamav/freshclam.log
```

そして、 freshclam を実行

``` text
# freshclam
Mon Sep 23 10:18:04 2019 -> ClamAV update process started at Mon Sep 23 10:18:04 2019
Mon Sep 23 10:30:15 2019 -> Downloading main.cvd [100%]
Mon Sep 23 10:30:29 2019 -> main.cvd updated (version: 58, sigs: 4566249,f-level: 60, builder: sigmgr)
Mon Sep 23 10:30:30 2019 -> *Can't query main.58.105.1.0.6810DA54.ping.clamav.net
Mon Sep 23 10:34:42 2019 -> Downloading daily.cvd [100%]
Mon Sep 23 10:37:10 2019 -> daily.cvd updated (version: 25580, sigs: 1775120, f-level: 63, builder: raynman)
Mon Sep 23 10:37:11 2019 -> *Can't query daily.25580.105.1.0.6810DA54.ping.clamav.net
Mon Sep 23 10:37:11 2019 -> bytecode.cvd is up to date (version: 331, sigs: 94, f-level: 63, builder: anvilleg)
Mon Sep 23 10:37:16 2019 -> Database updated (6341463 signatures) from db.local.clamav.net (IP: 104.16.218.84)
Mon Sep 23 10:37:16 2019 -> ^Clamd was NOT notified: Can't connect to clamd through /var/run/clamav/clamd.ctl: No such file or directory
```

（インストールした ClamAV のバージョンが古い場合に警告メッセージが出力されるかもしれないが、特に問題はないので無視してよい）

### 3. ウィルススキャンのテスト（ウィルス無しの場合）

以下のようにして、ウィルススキャンを行ってみる。  
（スキャンするディレクトリを指定するなら、最後にディレクトリを指定する）

``` text
# clamscan --infected --remove --recursive

----------- SCAN SUMMARY -----------
Known viruses: 6222754
Engine version: 0.101.2
Scanned directories: 6
Scanned files: 4
Infected files: 0
Data scanned: 0.02 MB
Data read: 0.01 MB (ratio 1.67:1)
Time: 56.347 sec (0 m 56 s)
```

### 4. ウィルススキャンのテスト（ウィルス有りの場合）

ウィルスが有る場合に正常に機能するかをテストするために、まずテスト用ウィルスを用意する。  
今回は以下の４つのテストウィルスをダウンロードしてみた。

``` text
# wget http://www.eicar.org/download/eicar.com \
http://www.eicar.org/download/eicar.com.txt \
http://www.eicar.org/download/eicar_com.zip \
http://www.eicar.org/download/eicarcom2.zip
```

そして、ウィルススキャンを行ってみる。  
４つとも検知し削除されているのが分かる。

``` text
# clamscan --infected --remove --recursive
/root/eicar.com.txt: Eicar-Test-Signature FOUND
/root/eicar.com.txt: Removed.
/root/eicar.com: Eicar-Test-Signature FOUND
/root/eicar.com: Removed.
/root/eicarcom2.zip: Eicar-Test-Signature FOUND
/root/eicarcom2.zip: Removed.
/root/eicar_com.zip: Eicar-Test-Signature FOUND
/root/eicar_com.zip: Removed.

----------- SCAN SUMMARY -----------
Known viruses: 6222754
Engine version: 0.101.2
Scanned directories: 6
Scanned files: 8
Infected files: 4
Data scanned: 0.02 MB
Data read: 0.01 MB (ratio 1.67:1)
Time: 57.301 sec (0 m 57 s)
```

### 5. ウィルススキャン実行用スクリプトの作成

File: `clamscan`

{% highlight bash linenos %}
#!/bin/bash

PATH=/usr/bin:/bin

# スキャン除外設定
# （clamdscan でなく clamscan を使用する場合はコメント解除）
#excludelist=/root/clamscan.exclude
#if [ -s $excludelist ]; then
#    for i in `cat $excludelist`
#    do
#        if [ $(echo "$i"|grep \/$) ]; then
#            i=`echo $i|sed -e 's/^\([^ ]*\)\/$/\1/p' -e d`
#            excludeopt="${excludeopt} --exclude-dir=^$i"
#        else
#            excludeopt="${excludeopt} --exclude=^$i"
#        fi
#    done
#fi
# ウィルス定義ファイル最新化
freshclam > /dev/null

# ウィルススキャン
CLAMSCANTMP=`mktemp`
# （clamdscan では --remove オプションが使用できない）
#clamscan --recursive --remove ${excludeopt} / > $CLAMSCANTMP 2>&1
clamdscan --recursive / > $CLAMSCANTMP 2>&1
[ ! -z "$(grep FOUND$ $CLAMSCANTMP)" ] && \

# レポートのメール送信
grep FOUND$ $CLAMSCANTMP | mail -s "Virus Found in `hostname`" root
rm -f $CLAMSCANTMP
{% endhighlight %}

### 6. ウィルススキャン実行用スクリプトに実行権限付与

``` text
# chmod +x clamscan
```

### 7. スキャン対象外ファイルの編集

ウィルススキャンを行わないディレクトリがあれば、 `clamscan.exclude` ファイルに記述する。（但し、 `clamscan` コマンドを使用する場合）

File: `clamscan.exclude`

``` text
/dev/   # <= "dev"  ディレクトリをスキャン対象外にする場合
/proc/  # <= "proc" ディレクトリをスキャン対象外にする場合
/sys/   # <= "sys"  ディレクトリをスキャン対象外にする場合
```

ウィルススキャン実行用スクリプト内で `clamscan` コマンドでなく `clamdscan` コマンドを使用するようにしている場合は、 `clamscan.exclude` を作成せず、 `/etc/clamav/clamd.conf` に以下のように追記する。

File: `/etc/clamav/clamd.conf`

{% highlight text linenos %}
ExcludePath ^/dev/
ExcludePath ^/proc/
ExcludePath ^/sys/
{% endhighlight %}

### 8. スクリプトの実行

作成したウィルススキャン実行スクリプトが正常に実行されるか試しに動かしてみる。

``` text
# ./clamscan
```

### 9. 自動実行の設定

ウィルススキャン実行スクリプトに問題がなければ、毎日自動で実行させるために `cron` ディレクトリへ移動する。（`daily` でなく `weekly` や `monthly` でもよい。好みの問題）

``` text
# mv clamscan /etc/cron.daily/
```

---

以上。

