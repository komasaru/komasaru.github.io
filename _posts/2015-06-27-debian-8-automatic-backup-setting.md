---
layout   : single
title    : "Debian 8 (Jessie) - 自動バックアップ運用！"
published: true
date     : 2015-06-27 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
---

Debian GNU/Linux 8 (Jessie) で自動バックアップ運用する方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 8 (Jessie) での作業を想定。
* バックファイルを配置するディレクトリは "/home/backup" とする。

### 1. バックアップスクリプトの作成

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
BACKUPDIR=/home/backup
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

### 2. 実行権限の付与

``` text
# chmod 700 backup.sh
```

### 3. バックアップ対象リストの作成

バックアップするディレクトリやファイルを一覧にしたファイル "backuplist" を以下のように作成する。（内容は適宜編集する。そして、最終行で改行しないこと）

File: `backuplist`

{% highlight bash linenos %}
/home
/root
/var/www
{% endhighlight %}

### 4. バックアップ対象外リストの作成

バックアップ対象のディレクトリやファイルの中でもバックアップしたくないディレクトリやファイルを一覧にしたファイル "backupnolist" を以下のように作成する。（内容は適宜編集する。そして、最終行で改行しないこと。また、対象外にするディレクトリやファイルが無ければ作成しなくてよい）

File: `backupnolist`

{% highlight bash linenos %}
/home/hoge
/var/www/fuga
{% endhighlight %}

### 5. バックアップの実行

``` text
# ./backup.sh
```

バックアップディレクトリにアーカイブファイルが作成されるはずである。  
また、ファイルが増えれば最大８世代残すようになっている。（そういうスクリプトにしているから）

``` text
# ls -l /home/backup/
total 522
-rw-r--r-- 1 root root     84205 Apr 30 04:00 20150430backup.tar.bz2
-rw-r--r-- 1 root root     84276 May  1 04:00 20150501backup.tar.bz2
-rw-r--r-- 1 root root     84336 May  2 04:00 20150502backup.tar.bz2
-rw-r--r-- 1 root root     84133 May  3 04:00 20150503backup.tar.bz2
-rw-r--r-- 1 root root     84140 May  4 04:00 20150504backup.tar.bz2
-rw-r--r-- 1 root root     84029 May  5 04:00 20150505backup.tar.bz2
-rw-r--r-- 1 root root     84124 May  6 04:00 20150506backup.tar.bz2
-rw-r--r-- 1 root root     84128 May  7 04:00 backup.tar.bz2
```

### 6. 自動実行の設定

毎日定時に実行するよう cron 登録する。（"/etc/cron.d/backup" を以下の内容で作成する）  
以下は毎日午前４時にバックアップスクリプトを実行する例。

File: `/etc/cron.d/backup`

{% highlight bash linenos %}
0 4 * * * root /root/backup.sh
{% endhighlight %}

### 参考サイト

CentOS での自動バックアップ運用を参考にしている（流用している）。

- [自動バックアップ運用(tar+GnuPG+rsync/ftp) - CentOSで自宅サーバー構築](http://centossrv.com/backup.shtml "自動バックアップ運用(tar+GnuPG+rsync/ftp) - CentOSで自宅サーバー構築")

---

以上。

