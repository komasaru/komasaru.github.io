---
layout   : single
title    : "Debian 8 (Jessie) - アンチウイルスソフト導入！"
published: true
date     : 2015-05-29 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- ウイルス対策
---

Debian GNU/Linux 8 (Jessie) にウイルス対策ソフト ClamAV をインストールする方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

> 【2016-12-26 追記】  
> 当記事の改訂版を公開しました。  
> 「[Debian 8 (Jessie) - アンチウィルスソフト導入（改訂）！]({{site.baseurl}}/2017/02/03/debian-8-clamav-installation "Debian 8 (Jessie) - アンチウィルスソフト導入（改訂）！")」の方をご参照ください。  
> 【追記ここまで】

### 0. 前提条件

* Debian GNU/Linux 8 (Jessie) での作業を想定。
* Debian GNU/Linux 8 (Jessie) はサーバ用途としてインストールし、GUI 環境は非整備。
* Apt でインストールする。（但し、Apt のパッケージはバージョンが古い。最新版が良ければ、[こちら](http://sourceforge.net/projects/clamav/files/clamav/ "")からダウンロードしてビルドするとよい）
* 毎日自動でウイルススキャンを実行するようにする。

### 1. ClamAV のインストール

以下のようにして、アンチウイルスソフト ClamAV, ClamAV Daemon をインストールする。

``` text
# apt-get -y install clamav clamav-daemon
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
ClamAV update process started at Fri May  1 10:19:59 2015
WARNING: Your ClamAV installation is OUTDATED!
WARNING: Local version: 0.98.6 Recommended version: 0.98.7
DON'T PANIC! Read http://www.clamav.net/support/faq
main.cvd is up to date (version: 55, sigs: 2424225, f-level: 60, builder: neo)
daily.cvd is up to date (version: 20401, sigs: 1380355, f-level: 63, builder: neo)
bytecode.cvd is up to date (version: 254, sigs: 45, f-level: 63, builder: anvilleg)
```

（インストールした ClamAV のバージョンが古い場合に警告メッセージが出力されるが、特に問題はないの無視してよい）

### 3. ウイルススキャンのテスト（ウイルス無しの場合）

以下のようにして、ウイルススキャンを行ってみる。  
（スキャンするディレクトリを指定するなら、最後にディレクトリを指定する）

``` text
# clamscan --infected --remove --recursive

----------- SCAN SUMMARY -----------
Known viruses: 3799051
Engine version: 0.98.6
Scanned directories: 1
Scanned files: 4
Infected files: 0
Data scanned: 0.01 MB
Data read: 0.00 MB (ratio 2.00:1)
Time: 10.693 sec (0 m 10 s)
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
/root/eicar_com.zip: Eicar-Test-Signature FOUND
/root/eicar_com.zip: Removed.
/root/eicar.com.txt: Eicar-Test-Signature FOUND
/root/eicar.com.txt: Removed.
/root/eicar.com: Eicar-Test-Signature FOUND
/root/eicar.com: Removed.
/root/eicarcom2.zip: Eicar-Test-Signature FOUND
/root/eicarcom2.zip: Removed.

----------- SCAN SUMMARY -----------
Known viruses: 3799051
Engine version: 0.98.6
Scanned directories: 1
Scanned files: 8
Infected files: 4
Data scanned: 0.01 MB
Data read: 0.00 MB (ratio 2.00:1)
Time: 10.229 sec (0 m 10 s)
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

ClamAV-Daemon を導入した環境なら、上記の `clamscan` を `clamdscan` に置き換えると処理が軽くなって良いだろう。

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

### 8. スクリプトの実行

作成したウイルススキャン実行スクリプトが正常に実行されるか試しに動かしてみる。

``` text
# ./clamscan
```

### 9. 自動実行の設定

ウイルススキャン実行スクリプトに問題がなければ、毎日自動で実行させるために cron ディレクトリへ移動する。

``` text
# mv clamscan /etc/cron.daily/
```

---

以上。

