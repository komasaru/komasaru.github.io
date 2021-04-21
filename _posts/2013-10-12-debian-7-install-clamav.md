---
layout   : single
title    : "Debian 7 Wheezy - アンチウイルスソフト導入！"
published: true
date     : 2013-10-12 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- ウイルス対策
---

Debian GNU/Linux 7.1.0 サーバにアンチウイルスソフト ClamAV を導入する方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。

<!--more-->

### 0. 前提条件

- 「[Debian GNU/Linux 7.1.0 - インストール（サーバ用途・最小構成）！]({{site.baseurl}}/2013/10/09/debian-7-install-for-small-server "Debian GNU/Linux 7.1.0 - インストール（サーバ用途・最小構成）！")」の方法でインストールが完了していることを想定。
- 「[Debian GNU/Linux 7.1.0 - サーバ初期設定！]({{site.baseurl}}/2013/10/10/debian-7-setting "Debian GNU/Linux 7.1.0 - サーバ初期設定")」の方法で初期設定が完了していることを想定。
- 毎日自動でウイルススキャンを実行するようにする。

### 1. ClamAV インストール

以下のようにして、アンチウイルスソフト ClamAV をインストールする。

``` text 
# aptitude -y install clamav
```

### 2. ウイルス定義ァイル最新化

以下のようにして、ウイルス定義ファイルを最新に更新する。  
インストールした ClamAV のバージョンが古い場合に警告メッセージが出力されるが、特に問題はないの無視してよい。

``` text 
# freshclam
```

### 3. ウイルススキャンテスト（ウイルス無しの場合）

以下のようにして、ウイルススキャンを行ってみる。  
（スキャンするディレクトリを指定するなら、最後にディレクトリを指定する）

``` text 
# clamscan --infected --remove --recursive

----------- SCAN SUMMARY -----------
Known viruses: 2806400
Engine version: 0.97.8
Scanned directories: 2
Scanned files: 5
Infected files: 0
Data scanned: 0.02 MB
Data read: 0.02 MB (ratio 1.00:1)
Time: 11.119 sec (0 m 11 s)
```

### 4. ウイルススキャンテスト（ウイルス有りの場合）

ウイルスが有る場合に正常に機能するかをテストするために、まずテスト用ウイルスを用意する。  
今回は以下の４つのテストウイルスをダウンロードしてみた。

``` text 
# wget http://www.eicar.org/download/eicar.com
# wget http://www.eicar.org/download/eicar.com.txt
# wget http://www.eicar.org/download/eicar_com.zip
# wget http://www.eicar.org/download/eicarcom2.zip
```

そして、ウイルススキャンを行ってみる。  
４つとも検知し削除されているのが分かる。

``` text 
# clamscan --infected --remove --recursive
/root/eicarcom2.zip: Eicar-Test-Signature FOUND
/root/eicarcom2.zip: Removed.
/root/eicar.com.txt: Eicar-Test-Signature FOUND
/root/eicar.com.txt: Removed.
/root/eicar_com.zip: Eicar-Test-Signature FOUND
/root/eicar_com.zip: Removed.
/root/eicar.com: Eicar-Test-Signature FOUND
/root/eicar.com: Removed.

----------- SCAN SUMMARY -----------
Known viruses: 2806400
Engine version: 0.97.8
Scanned directories: 2
Scanned files: 9
Infected files: 4
Data scanned: 0.02 MB
Data read: 0.02 MB (ratio 1.00:1)
Time: 6.063 sec (0 m 6 s)
```

### 5. ウイルススキャン実行スクリプト作成

ウイルススキャン実行用のスクリプトを作成する。

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

### 6. ウイルススキャン実行スクリプト実行権限付与

ウイルススキャン実行スクリプトに実行権限を付与する。

``` text 
# chmod +x clamscan
```

### 7. スキャン対象外ファイル編集

ウイルススキャンを行わないディレクトリがあれば、 "clamscan.exclude" ファイルに記述する。

``` text 
# echo "/proc/" >> clamscan.exclude  # <= "proc" ディレクトリをスキャン対象外にする場合
# echo "/sys/" >> clamscan.exclude   # <= "sys"  ディレクトリをスキャン対象外にする場合
```

### 8. スクリプト実行

作成したウイルススキャン実行スクリプトが正常に実行されるか試しに動かしてみる。

``` text 
# ./clamscan
```

### 9. 自動実行設定

ウイルススキャン実行スクリプトに問題がなければ、毎日自動で実行させるために cron ディレクトリへ移動する。

``` text 
# mv clamscan /etc/cron.daily/
```

---

以上。

