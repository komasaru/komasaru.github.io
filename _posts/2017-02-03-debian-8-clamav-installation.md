---
layout   : single
title    : "Debian 8 (Jessie) - アンチウイルスソフト導入（改訂）！"
published: true
date     : 2017-02-03 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- ウイルス対策
---

以前、 Debian GNU/Linux 8 (Jessie) でのアンチウイルスソフトの導入について記事にしました。

* [Debian 8 (Jessie) - アンチウイルスソフト導入！]({{site.baseurl}}/2015/05/29/debian-8-anti-virus-installation "Debian 8 (Jessie) - アンチウイルスソフト導入！")

しかし、`clamscan` コマンドの代替として `clamdscan` を使用することについて詳細に説明していなかったり、ログファイルの所有権限に関するエラーの対策について記述していなかったので、今回改めて記事にしました。

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 8 (Jessie) での作業を想定。
* Debian GNU/Linux 8 (Jessie) はサーバ用途としてインストールし、GUI 環境は非整備。
* Apt でインストールする。（但し、Apt のパッケージはバージョンが古い。最新版が良ければ、[こちら](http://sourceforge.net/projects/clamav/files/clamav/ "")からダウンロードしてビルドするとよい）
* 毎日自動でウイルススキャンを実行するようにする。

### 1. ClamAV のインストール

以下のようにして、アンチウイルスソフト ClamAV, ClamAV Daemon をインストールする。

``` text
# apt install -y clamav clamav-daemon
```

### 2. ウイルス定義ファイルの最新化

`freshclam` コマンドでウイルス定義ファイルを最新に更新する。

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
ClamAV update process started at Wed Dec 14 12:04:35 2016
Downloading main.cvd [100%]
main.cvd updated (version: 57, sigs: 4218790, f-level: 60, builder: amishhammer)
Downloading daily.cvd [100%]
daily.cvd updated (version: 22711, sigs: 1030980, f-level: 63, builder: neo)
bytecode.cvd is up to date (version: 285, sigs: 57, f-level: 63, builder: bbaker)
Database updated (5249827 signatures) from db.local.clamav.net (IP: 203.212.42.128)
WARNING: Clamd was NOT notified: Can't connect to clamd through /var/run/clamav/clamd.ctl: No such file or directory
```

（インストールした ClamAV のバージョンが古い場合に警告メッセージが出力されるが、特に問題はないので無視してよい）


### 3. ウイルススキャンのテスト（ウイルス無しの場合）

以下のようにして、ウイルススキャンを行ってみる。  
（スキャンするディレクトリを指定するなら、最後にディレクトリを指定する）

``` text
# clamscan --infected --remove --recursive

----------- SCAN SUMMARY -----------
Known viruses: 5244385
Engine version: 0.99.2
Scanned directories: 1
Scanned files: 4
Infected files: 0
Data scanned: 0.01 MB
Data read: 0.00 MB (ratio 2.00:1)
Time: 12.161 sec (0 m 12 s)
```

### 4. ウイルススキャンのテスト（ウイルス有りの場合）

ウイルスが有る場合に正常に機能するかをテストするために、まずテスト用ウイルスを用意する。  
今回は以下の４つのテストウイルスをダウンロードしてみた。

``` text
# wget http://www.eicar.org/download/eicar.com \
http://www.eicar.org/download/eicar.com.txt \
http://www.eicar.org/download/eicar_com.zip \
http://www.eicar.org/download/eicarcom2.zip
```

そして、ウイルススキャンを行ってみる。  
４つとも検知し削除されているのが分かる。

``` text
# clamscan --infected --remove --recursive
/root/eicar.com: Eicar-Test-Signature FOUND
/root/eicar.com: Removed.
/root/eicarcom2.zip: Eicar-Test-Signature FOUND
/root/eicarcom2.zip: Removed.
/root/eicar.com.txt: Eicar-Test-Signature FOUND
/root/eicar.com.txt: Removed.
/root/eicar_com.zip: Eicar-Test-Signature FOUND
/root/eicar_com.zip: Removed.

----------- SCAN SUMMARY -----------
Known viruses: 5244385
Engine version: 0.99.2
Scanned directories: 1
Scanned files: 8
Infected files: 4
Data scanned: 0.01 MB
Data read: 0.00 MB (ratio 2.00:1)
Time: 12.471 sec (0 m 12 s)
```

### 5. ウイルススキャン実行用スクリプトの作成

File: `clamscan`

{% highlight bash linenos %}
#!/bin/bash

PATH=/usr/bin:/bin

# スキャン除外設定
excludelist=/root/clamscan.exclude
if [ -s $excludelist ]; then
    for i in `cat $excludelist`
    do
        if [ $(echo "$i"|grep \/$) ]; then
            i=`echo $i|sed -e 's/^\([^ ]*\)\/$/\1/p' -e d`
            excludeopt="${excludeopt} --exclude-dir=^$i"
        else
            excludeopt="${excludeopt} --exclude=^$i"
        fi
    done
fi
# ウイルス定義ファイル最新化
freshclam > /dev/null

# ウイルススキャン
CLAMSCANTMP=`mktemp`
clamscan --recursive --remove ${excludeopt} / > $CLAMSCANTMP 2>&1
[ ! -z "$(grep FOUND$ $CLAMSCANTMP)" ] && \

# レポートのメール送信
grep FOUND$ $CLAMSCANTMP | mail -s "Virus Found in `hostname`" root
rm -f $CLAMSCANTMP
{% endhighlight %}

### 6. ウイルススキャン実行用スクリプトに実行権限付与

``` text
# chmod 700 clamscan
```

### 7. スキャン対象外ファイルの編集

ウイルススキャンを行わないディレクトリがあれば、 "clamscan.exclude" ファイルに記述する。

File: `clamscan.exclude`

{% highlight text linenos %}
/dev/   # <= "dev"  ディレクトリをスキャン対象外にする場合
/proc/  # <= "proc" ディレクトリをスキャン対象外にする場合
/sys/   # <= "sys"  ディレクトリをスキャン対象外にする場合
{% endhighlight %}

### 8. clamscan の代わりに clamdscan を使用する場合

ClamAV-Daemon を導入した環境なら、上記の `clamscan` を `clamdscan` に置き換えると処理が軽くなって良いだろう。

但し、 `clamdscan` では `--recursive` `--exclude` `--exclude-dir` オプションが使用できない。  
`clamscan` コマンドでなく `clamdscan` コマンドを使用したい場合は、まず、上記 5 で作成したスクリプトの

``` text
clamscan --recursive --remove ${excludeopt} / > $CLAMSCANTMP 2>&1
```

の行を

``` text
clamdscan --remove / > $CLAMSCANTMP 2>&1
```

とし、

"/etc/clamav/clamd.conf" の最終行に除外設定を記述する。（以下は、一例）

File: `/etc/clamav/clamd.conf`

{% highlight bash linenos %}
ExcludePath ^/dev/   # <= "dev"  ディレクトリをスキャン対象外にする場合
ExcludePath ^/proc/  # <= "proc" ディレクトリをスキャン対象外にする場合
ExcludePath ^/sys/   # <= "sys"  ディレクトリをスキャン対象外にする場合
{% endhighlight %}

### 9. freshclam 所有者・権限の変更

デフォルトのままだとウイルススキャン実行時やログローテート時に以下のようなエラーが出力されるかもしれない。

``` text
ERROR: Problem with internal logger (UpdateLogFile = /var/log/clamav/freshclam.log).
```

ログの所有者・権限が適切でないことが原因。

まず、ログファイルの権限を `640` に変更する。  
また、所有者・所有グループが `clamav:clamav` でなければ変更する。  
さらに、定義ファイルディレクトリ "/var/lib/clamav" 内のファイルの所有者・所有グループが `clamav:clamav` でなければ変更する。

``` text
# chmod 640 /var/log/clamav/freshclam.log
# chown clamav:clamav /var/log/clamav/freshclam.log
# chown -R clamav:clamav /var/lib/clamav
```

そして、ログローテート設定ファイルの所有者設定部分を編集する。

File: `/etc/logrotate.d/clamav-freshclam`

{% highlight bash linenos %}
/var/log/clamav/freshclam.log {
     rotate 12
     weekly
     compress
     delaycompress
     missingok
     #create 640  clamav adm    # <= コメントアウト
     create 640  clamav clamav  # <= 追加
     postrotate
     if [ -d /run/systemd/system ]; then
         systemctl -q is-active clamav-freshclam && systemctl kill --signal=SIGHUP clamav-freshclam || true
     else
         /etc/init.d/clamav-freshclam reload-log > /dev/null || true
     fi
     endscript
}
{% endhighlight %}

### 10. スクリプトの実行

作成したウイルススキャン実行スクリプトが正常に実行されるか試しに動かしてみる。

``` text
# ./clamscan
```

### 11. 自動実行の設定

ウイルススキャン実行スクリプトに問題がなければ、毎日自動で実行させるために "cron.daily" ディレクトリへ移動する。（場合によっては "cron.weekly" や "cron.monthly" でも）

``` text
# mv clamscan /etc/cron.daily/
```

---

以上。

