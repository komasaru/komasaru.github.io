---
layout   : single
title    : "CentOS 6.5 - アンチウイルスソフト（Clam AntiVirus）導入！"
published: true
date     : 2013-12-19 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- ウイルス対策
---

前回は CentOS 6.5 サーバに rootkit 検知ツール chkrootkit の導入を行いました。  
今回はアンチウイルスソフト Clam AntiVirus 導入を行います。

<!--more-->

### 0. 前提条件

- CentOS 6.5(x86_64) を Minimal で最小インストールしている。
- クライントマシンは Linux Mint 14(64bit) を想定。
- [CentOS 6.5 - 初期設定！](http://www.mk-mode.com/octopress/2013/12/13/centos-6-5-first-setting/ "CentOS 6.5 - 初期設定！") 内のとおり RPMforege リポジトリの導入を行なっている。
- 主に「[CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")」を参考にしている。  
  （実際は、過去にこのサイトを参考にして作業した際に記録していたものを参照している）

### 1. Clam AntiVirus インストール

ベースリポジトリには存在しないので、RPMforge リポジトリからインストールする。

``` text
# yum --enablerepo=rpmforge -y install clamd
```

### 2. clamd 設定ファイル編集

Clam AntiVirus 設定ファイルを以下のように編集する。

File: `/etc/clamd.conf`

{% highlight bash linenos %}
#User clamav  # <= コメント化（root権限で動作するようにする）
{% endhighlight %}

### 3. Clam AntiVirus 起動

Clam AntiVirus を起動する。

``` text
# /etc/rc.d/init.d/clamd start
Starting Clam AntiVirus Daemon:                            [  OK  ]
```

ウイルスデータベースが古い旨の警告が出力されることがあるかもしれないが、後にアップデートするので問題ない。

### 4. Clam AntiVirus 自動起動設定

マシン起動時に自動で Clam AntiVirus が起動するように設定する。

``` text
# chkconfig clamd on
# chkconfig --list clamd        # <= 2,3,4,5 が "on" であることを確認
clamd           0:off   1:off   2:on    3:on    4:on    5:on    6:off
```

### 5. Freshclam 設定ファイル編集

Freshclam 設定ファイルを以下のように編集する。（最近は、デフォルトで以下のようになっている）

File: `/etc/freshclam.conf`

{% highlight bash linenos %}
#Example    # <= コメント化（ウイルス定義ファイル更新機能の有効化）
{% endhighlight %}

### 6. ウイルス定義ファイルの最新化

ウイルス定義ファイルを以下のようにして最新化する。

``` text
# freshclam

# ===< 途中省略 >===

Clamd successfully notified about the update.
```

### 7. ウイルススキャンの実行（ウイルス無しの場合）

一旦、ウイルススキャンを実行してみる。（ウイルスが存在しない場合のテスト）

``` text
# clamscan --infected --remove --recursive

----------- SCAN SUMMARY -----------
Known viruses: 3005677
Engine version: 0.98
Scanned directories: 11
Scanned files: 12
Infected files: 0
Data scanned: 0.03 MB
Data read: 0.02 MB (ratio 1.75:1)
Time: 6.447 sec (0 m 6 s)
```

### 8. ウイルスファイルの準備

ウイルス検知のテスト用に提供されているウイルスファイルをダウンロードする。

``` text
# wget http://www.eicar.org/download/eicar.com \
http://www.eicar.org/download/eicar.com.txt \
http://www.eicar.org/download/eicar_com.zip \
http://www.eicar.org/download/eicarcom2.zip
```

### 9. ウイルススキャンの実行（ウイルス有りの場合）

再度、ウイルススキャンを実行してみる。（ウイルスが存在する場合のテスト）

``` text
# clamscan --infected --remove --recursive
/root/eicar.com.txt: Eicar-Test-Signature FOUND
/root/eicar.com.txt: Removed.
/root/eicarcom2.zip: Eicar-Test-Signature FOUND
/root/eicarcom2.zip: Removed.
/root/eicar_com.zip: Eicar-Test-Signature FOUND
/root/eicar_com.zip: Removed.
/root/eicar.com: Eicar-Test-Signature FOUND
/root/eicar.com: Removed.

----------- SCAN SUMMARY -----------
Known viruses: 3005677
Engine version: 0.98
Scanned directories: 11
Scanned files: 16
Infected files: 4
Data scanned: 0.03 MB
Data read: 0.02 MB (ratio 1.75:1)
Time: 6.394 sec (0 m 6 s)
```

### 10. 実行するクリプト作成

ウイルススキャンを実行するスクリプトを以下のように作成する。

File: `virusscan`

{% highlight bash linenos %}
#!/bin/bash

PATH=/usr/bin:/bin

# clamd update
yum -y update clamd > /dev/null 2>&1

# excludeopt setup
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

# virus scan
CLAMSCANTMP=`mktemp`
clamscan --recursive --remove ${excludeopt} / > $CLAMSCANTMP 2>&1
[ ! -z "$(grep FOUND$ $CLAMSCANTMP)" ] && \

# report mail send
grep FOUND$ $CLAMSCANTMP | mail -s "Virus Found in `hostname`" root
rm -f $CLAMSCANTMP
{% endhighlight %}

### 11. 実行スクリプト権限設定

実行スクリプトに実行権限を付与する。

``` text
# chmod +x virusscan
```

### 12. ウイルススキャン対象外設定

ウイルススキャンをしたくないディレクトリ・ファイルを設定するには以下のように "clamscan.exclude" に記載する。

File: `clamscan.exclude`

{% highlight bash linenos %}
/home/backup/
/proc/
/sys/
{% endhighlight %}

### 13. ウイルススキャン自動実行設定

ウイルススキャンが毎日自動で実行されるように、実行スクリプト cron ディレクトリに移動する。

``` text
# mv virusscan /etc/cron.daily/
```

### 参考サイト

- [CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")

---

次回は、ファイアウォール iptables の構築について紹介する予定です。

以上。

