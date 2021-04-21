---
layout   : single
title    : "CentOS 7.0 - アンチウイルスソフト Clam AntiVirus 導入！"
published: true
date     : 2014-08-08 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- ウイルス対策
---

「CentOS 7.0 - アンチウイルスソフト Clam AntiVirus 導入」についての記録です。

（旧バージョンでの作業記録を更新しました。興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

- CentOS 7.0-1406(x86_64) を NetInstall で最小限インストールしている。
- サーバ用途なので、作業は基本的に全て一般ユーザから root になって行う。
- RPMforge リポジトリ導入済み。（[CentOS 7.0 - リポジトリ追加]({{site.baseurl}}/2014/08/06/centos-7-0-addition-of-repository/ "CentOS 7.0 - リポジトリ追加")）
- 主に「[CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")」を参照。

### 1. Clam AntiVirus インストール

ベースリポジトリには存在しないので、RPMforge リポジトリからインストールされる。

``` text
# yum -y install clamd
```

### 2. clamd 設定ファイル編集

Clam AntiVirus 設定ファイルを以下のように編集する。

File: `/etc/clamd.conf`

{% highlight bash linenos %}
#User clamav  # <= コメント化（root権限で動作するようにする）

SelfCheck 0   # <= コメント解除＆変更（セルフチェック無効化）
{% endhighlight %}

ここでセルフチェックを無効化するのは、処理が頻繁に作動すると重くなってしまうため。ウイルスチェックは後述の viruscan で行う。

### 3. Clam AntiVirus 起動

Clam AntiVirus を起動する。

``` text
# systemctl start clamd
```

ウイルスデータベースが古い旨の警告が出力されることがあるかもしれないが、後にアップデートするので問題ない。

### 4. Clam AntiVirus 自動起動設定

マシン起動時に自動で Clam AntiVirus が起動するように設定する。（ネイティブなサービスではないので `systemctl` ではなく `chkconfig` を使用する）

``` text
# chkconfig clamd on
# chkconfig --list clamd  #<= 2,3,4,5 が on であることを確認
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

        :
===< 途中省略 >===
        :

Clamd successfully notified about the update.
```

### 7. ウイルススキャンの実行（ウイルス無しの場合）

一旦、ウイルススキャンを実行してみる。（ウイルスが存在しない場合のテスト）

``` text
# clamscan --infected --remove --recursive

----------- SCAN SUMMARY -----------
Known viruses: 3502932
Engine version: 0.98.4
Scanned directories: 5
Scanned files: 9
Infected files: 0
Data scanned: 0.00 MB
Data read: 0.00 MB (ratio 1.00:1)
Time: 12.412 sec (0 m 12 s)
```

`Infected files: 0` がウイルスが存在しないという意味。

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
/root/eicar.com: Eicar-Test-Signature FOUND
/root/eicar.com: Removed.
/root/eicar.com.txt: Eicar-Test-Signature FOUND
/root/eicar.com.txt: Removed.
/root/eicar_com.zip: Eicar-Test-Signature FOUND
/root/eicar_com.zip: Removed.
/root/eicarcom2.zip: Eicar-Test-Signature FOUND
/root/eicarcom2.zip: Removed.

----------- SCAN SUMMARY -----------
Known viruses: 3502932
Engine version: 0.98.4
Scanned directories: 5
Scanned files: 13
Infected files: 4
Data scanned: 0.00 MB
Data read: 0.00 MB (ratio 1.00:1)
Time: 8.116 sec (0 m 8 s)
```

ウイルスファイルが全て検知され削除された。

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
/dev/
/proc/
/sys/
{% endhighlight %}

### 13. ウイルススキャン自動実行設定

ウイルススキャンが毎日自動で実行されるように、実行スクリプト cron ディレクトリに移動する。

``` text
# mv virusscan /etc/cron.daily/
```

### 14. ソケットファイル作成の設定

clamd は、シャットダウン時にソケットファイルを削除するようになっていて、かつ、起動時に自動で作成しない。  
そのため、起動時に以下のようなソケットファルが見つからない旨のエラーが発生する。。  

``` text
LOCAL: Socket file /var/run/clamav/clamd.sock could not be bound: No such file or directory
Can't unlink the socket file /var/run/clamav/clamd.sock
Starting Clam AntiVirus Daemon: ERROR: LOCAL: Socket file /var/run/clamav/clamd.sock could not be bound: No such file or directory
ERROR: Can't unlink the socket file /var/run/clamav/clamd.sock
[失敗]
clamd.service: control process exited, code=exited status=1
Failed to start SYSV: Clam AntiVirus Daemon is a TCP/IP or socket protocol server..
Unit clamd.service entered failed state.
```

エラー回避のため、起動時にソケットファイルを作成するよう以下のように設定する。

File: `/etc/tmpfiles.d/clamd.conf`

{% highlight bash linenos %}
D /var/run/clamav 0755 root root -
{% endhighlight %}

---

以上。

