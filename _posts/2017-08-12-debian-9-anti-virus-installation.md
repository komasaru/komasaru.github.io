---
layout   : single
title    : "Debian 9 (Stretch) - アンチウィルスソフト導入！"
published: true
date     : 2017-08-12 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- ウイルス対策
---

Debian GNU/Linux 9 (Stretch) にウイルス対策ソフト ClamAV をインストールする方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 9 (Stretch) での作業を想定。
* Apt でインストールする。（但し、Apt のパッケージはバージョンが古い。最新版が良ければ、[こちら](http://sourceforge.net/projects/clamav/files/clamav/ "")からダウンロードしてビルドするとよい）
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

そこで、"/var/log/clamav/freshclam.log" を作り直す。  
（`clamav:adm` となっている所有者・グループを `clamav:clamav` に変更するだけはうまく行かない）

``` text
# rm -f /var/log/clamav/freshclam.log
# touch /var/log/clamav/freshclam.log
# chown clamav:clamav /var/log/clamav/freshclam.log
```

そして、 freshclam を実行

``` text
# freshclam
ClamAV update process started at Thu Jul 13 23:18:54 2017
Downloading main.cvd [100%]
main.cvd updated (version: 58, sigs: 4566249, f-level: 60, builder: sigmgr)
Downloading daily.cvd [100%]
daily.cvd updated (version: 23558, sigs: 1739580, f-level: 63, builder: neo)
Downloading bytecode.cvd [100%]
bytecode.cvd updated (version: 306, sigs: 65, f-level: 63, builder: raynman)
Database updated (6305894 signatures) from db.local.clamav.net (IP: 27.96.54.66)
WARNING: Clamd was NOT notified: Can't connect to clamd through /var/run/clamav/clamd.ctl: No such file or directory
```

（インストールした ClamAV のバージョンが古い場合に警告メッセージが出力されるが、特に問題はないので無視してよい）

### 3. ウィルススキャンのテスト（ウィルス無しの場合）

以下のようにして、ウィルススキャンを行ってみる。  
（スキャンするディレクトリを指定するなら、最後にディレクトリを指定する）

``` text
# clamscan --infected --remove --recursive

----------- SCAN SUMMARY -----------
Known viruses: 6300327
Engine version: 0.99.2
Scanned directories: 2
Scanned files: 4
Infected files: 0
Data scanned: 0.02 MB
Data read: 0.01 MB (ratio 2.00:1)
Time: 49.131 sec (0 m 49 s)
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
/root/eicar_com.zip: Eicar-Test-Signature FOUND
/root/eicar_com.zip: Removed.
/root/eicar.com: Eicar-Test-Signature FOUND
/root/eicar.com: Removed.
/root/eicarcom2.zip: Eicar-Test-Signature FOUND
/root/eicarcom2.zip: Removed.
/root/eicar.com.txt: Eicar-Test-Signature FOUND
/root/eicar.com.txt: Removed.

----------- SCAN SUMMARY -----------
Known viruses: 6300327
Engine version: 0.99.2
Scanned directories: 2
Scanned files: 8
Infected files: 4
Data scanned: 0.02 MB
Data read: 0.01 MB (ratio 2.00:1)
Time: 49.038 sec (0 m 49 s)
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

ウィルススキャンを行わないディレクトリがあれば、 "clamscan.exclude" ファイルに記述する。

File: `clamscan.exclude`

{% highlight text linenos %}
/dev/   # <= "dev"  ディレクトリをスキャン対象外にする場合
/proc/  # <= "proc" ディレクトリをスキャン対象外にする場合
/sys/   # <= "sys"  ディレクトリをスキャン対象外にする場合
{% endhighlight %}

ウィルススキャン実行用スクリプト内で `clamscan` でなく `clamdscan` を使用するようにしている場合は、 "clamscan.exclude" を作成せず、 "/etc/clamav/clamd.conf" に以下のように追記する。

File: `/etc/clamav/clamd.conf`

{% highlight bash linenos %}
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

ウィルススキャン実行スクリプトに問題がなければ、毎日自動で実行させるために cron ディレクトリへ移動する。（`daily` でなく `weekly` や `monthly` でもよい。好みの問題）

``` text
# mv clamscan /etc/cron.daily/
```

---

以上。

