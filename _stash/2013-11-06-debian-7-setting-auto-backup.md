---
layout   : single
title    : "Debian 7 Wheezy - 自動バックアップ運用！"
published: true
date     : 2013-11-06 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
---

Debian GNU/Linux 7.1.0 サーバに自動バックアップ運用を行う方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。

<!--more-->

### 0. 前提条件

- Debian GNU/Linux 7.1.0 での作業を想定。
- バックファイルを配置するディレクトリは "/home/bak" とする。

### 1. バックアップスクリプト作成

以下のような内容でバックアップスクリプト "backup.sh" を作成する。

File: `backup.sh`

{% highlight bash linenos %} 
#!/bin/bash

#
# ローカル内でバックアップ
#

LANG=C

#
# 設定開始
#

# バックアップ対象リスト名
# ※バックアップ対象をフルパスで記述したリスト
BACKUPLIST=/root/backuplist
[ ! -s $BACKUPLIST ] && echo "$BACKUPLIST is not found" && error_exit

# バックアップ対象外リスト名
# ※バックアップ対象外をフルパスで記述したリスト
BACKUPNOLIST=/root/backupnolist

# バックアップ先ディレクトリ名
BACKUPDIR=/home/bak
mkdir -p $BACKUPDIR

# バックアップ保存世代数
# ※当日分を含めた過去分バックアップを保存する世代数
# ※過去分バックアップを保存しない場合は1を指定する
BACKUPGEN=8

# 暗号化・復号化パスフレーズ
# ※指定がないときは暗号化しない
PASS=''

# バックアップログファイル名
BACKUPLOG=/var/log/backup.log

#
# 設定終了
#

# 異常終了処理関数定義
error_exit () {
    rm -f $TMPBACKUPNOLIST
    exit 1
}

# バックアップファイルをバックアップ対象外リストに追加
# ※バックアップ先ファイルをバックアップしないようにする
TMPBACKUPNOLIST=`mktemp`
[ -s $BACKUPNOLIST ] && cat $BACKUPNOLIST > $TMPBACKUPNOLIST
echo "$BACKUPDIR/*backup.tar.bz2" >> $TMPBACKUPNOLIST

# 前回バックアップをリネーム
cd $BACKUPDIR
OLDBACKUPFILE=`ls backup.tar.bz2* 2>/dev/null`
if [ -f $OLDBACKUPFILE ]; then
    TIMESTAMP=`ls --full-time $OLDBACKUPFILE|awk '{print $6}'|tr -d -`
    mv $BACKUPDIR/$OLDBACKUPFILE $BACKUPDIR/${TIMESTAMP}$OLDBACKUPFILE > /dev/null 2>&1
fi

# バックアップログファイル作成
rm -f $BACKUPLOG
touch $BACKUPLOG
chmod 400 $BACKUPLOG

# バックアップ実行
echo "`date` backup start" >> $BACKUPLOG
tar cjvfP $BACKUPDIR/backup.tar.bz2 -T $BACKUPLIST -X $TMPBACKUPNOLIST >> $BACKUPLOG 2>&1
code=$?
if [ $code -ne 0 ]; then
    cat $BACKUPLOG | mail -s "BACKUP NG CODE IS $code" root
    rm -f $BACKUPDIR/backup.tar.bz2
    error_exit
fi
echo "`date` backup end" >> $BACKUPLOG

# バックアップ暗号化(暗号化・復号化パスフレーズ指定時のみ)
if [ ! -z $PASS ]; then
    echo "`date` encrypt start" >> $BACKUPLOG
    mkdir -p $HOME/.gnupg
    echo $PASS|gpg --passphrase-fd 0 --batch -c $BACKUPDIR/backup.tar.bz2 > /dev/null 2>&1
	code=$?
	if [ $code -ne 0 ]; then
	    cat $BACKUPLOG | mail -s "BACKUP NG CODE IS $code" root
	    rm -f $BACKUPDIR/backup.tar.bz2*
	    error_exit
	fi
    rm -f $BACKUPDIR/backup.tar.bz2
    echo "`date` encrypt end" >> $BACKUPLOG
fi

# バックアップ保存世代を超えた古いバックアップを削除
if [ $(ls $BACKUPDIR/*backup.tar.bz2*|wc -l) -gt $BACKUPGEN ]; then
    OLDBACKUPCNT=`expr $(ls $BACKUPDIR/*backup.tar.bz2*|wc -l) - $BACKUPGEN`
    for file in `ls -t $BACKUPDIR/*backup.tar.bz2*|tail -n $OLDBACKUPCNT`
    do
        rm -f $file
    done
fi

# バックアップ対象外リスト削除
rm -f $TMPBACKUPNOLIST
{% endhighlight %}

### 2. 実行権限付与

作成したスクリプトファイルに実行権限を付与する。

``` text 
# chmod +x backup.sh
```

### 3. バックアップ対象リスト作成

バックアップするディレクトリやファイルを一覧にしたファイル "backuplist" を以下のように作成する。（内容は適宜編集する。そして、最終行で改行しないこと）

File: `backuplist`

{% highlight bash linenos %} 
/home
/root
/var/www
{% endhighlight %}

### 4. バックアップ対象外リスト作成

バックアップ対象のディレクトリやファイルの中でもバックアップしたくないディレクトリやファイルを一覧にしたファイル "backupnolist" を以下のように作成する。（内容は適宜編集する。そして、最終行で改行しないこと。また、対象外にするディレクトリやファイルが無ければ作成しなくてよい）

File: `backupnolist`

{% highlight bash linenos %} 
/home/hoge
/var/www/fuga
{% endhighlight %}

### 5. バックアップ実行

以下のようにしてバックアップを実行する。

``` text 
# ./backup.sh
```

バックアップディレクトリにアーカイブファイルが作成されるはずである。  
また、ファイルが増えれば最大８世代残すようになっている。（そういうスクリプトにしているから）

``` text 
# ls -l /home/bak/
-rw-r--r-- 1 root root 410671605  9月 30 05:16 2013 20130930backup.tar.bz2
-rw-r--r-- 1 root root 425441694 10月  1 05:14 2013 20131001backup.tar.bz2
-rw-r--r-- 1 root root 427763272 10月  2 05:16 2013 20131002backup.tar.bz2
-rw-r--r-- 1 root root 427990094 10月  3 05:15 2013 20131003backup.tar.bz2
-rw-r--r-- 1 root root 442118583 10月  4 05:17 2013 20131004backup.tar.bz2
-rw-r--r-- 1 root root 442686574 10月  5 05:13 2013 20131005backup.tar.bz2
-rw-r--r-- 1 root root 456433706 10月  6 05:16 2013 20131006backup.tar.bz2
-rw-r--r-- 1 root root 471558945 10月  7 05:15 2013 backup.tar.bz2
```

### 6. 自動実行設定

毎日定時に実行するよう cron 登録する。（"/etc/cron.d/backup" を以下の内容で作成する）  
以下は毎日午前５時にバックアップスクリプトを実行する例。

File: `/etc/cron.d/backup`

{% highlight bash linenos %} 
0 5 * * * root /root/backup.sh
{% endhighlight %}

### 参考サイト

CentOS での自動バックアップ運用を参考にしている（流用している）。

- [自動バックアップ運用(tar+GnuPG+rsync/ftp) - CentOSで自宅サーバー構築](http://centossrv.com/backup.shtml "自動バックアップ運用(tar+GnuPG+rsync/ftp) - CentOSで自宅サーバー構築")

---

以上。

