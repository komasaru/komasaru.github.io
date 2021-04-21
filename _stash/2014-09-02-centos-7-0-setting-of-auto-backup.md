---
layout   : single
title    : "CentOS 7.0 - 自動バックアップ運用！"
published: true
date     : 2014-09-02 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
---

「CentOS 7.0 - 自動バックアップ運用」についての記録です。

（旧バージョンでの作業記録を更新しました。興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

- CentOS 7.0-1406(x86_64) を NetInstall で最小限インストールしている。
- サーバ用途なので、作業は基本的に全て一般ユーザから root になって行う。
- クライアント側は Linux Mint 17 を想定。
- バックアップ先ディレクトリは "/home/backup" を想定。
- バックアップファイルの暗号化は行わない。
- 主に「[CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")」を参照。

### 1. バックアップスクリプト作成

バックアップアーカイブファイルの暗号化を行いたければ `PASS` にパスワードを設定すればよい。

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

### 2. バックアップスクリプト権限設定

``` text
# chmod 700 backup.sh  # <= 実行権限付与
```

### 3. バックアップ対象リスト作成

バックアップの対象となるディレクトリ・ファイルをバックアップ対象リストファイルに列記する。（最終行が改行のみにならないよう注意）  
また、存在しないディレクトリ・ファイルを記載するとバックアップに失敗するので注意。（`#` などでコメント化しても効かない）  
（以下は一例）  

File: `backuplist`

{% highlight bash linenos %}
/root
/etc/cron.d
/etc/dovecot/dovecot.conf
/etc/logrotate.d
/etc/my.cnf

  :

{% endhighlight %}

### 4. バックアップ対象外リスト作成

上記のバックアップ対象ディレクトリ内で、バックアップの対象から外したいディレクトリ・ファイルがあれば、対象外リストを作成する。（最終行が改行のみにならないよう注意）（バックアップの対象から外したいディレクトリ・ファイルがなければ作成不要）  
（以下は一例）

File: `backupnolist`

{% highlight bash linenos %}
/var/www/rails/mk-mode/log/
/var/www/rails/mk-mode/public/webcam
*.sock

  :

{% endhighlight %}

### 5. バックアップ実行

``` text
# ./backup.sh
```

### 6. バックアップ確認

バックアップスクリプト内で指定したバックアップ先にアーカイブファイルができているか確認する。  
最大でバックアップスクリプトで指定した世代分アーカイブファイルが保存される。  
最新が "backup.tar.bz2" で、これ以外は "yyyymmdd" + "backu.tar.bz2" である。（暗号化した場合は末尾に ".gpg" が追加される）

``` text
# ls -lh /home/backup
合計 14G
-rw-r--r-- 1 root root 1.6G  8月  8 05:51 2014 20140808backup.tar.bz2
-rw-r--r-- 1 root root 1.6G  8月  9 05:50 2014 20140809backup.tar.bz2
-rw-r--r-- 1 root root 1.6G  8月 10 05:51 2014 20140810backup.tar.bz2
-rw-r--r-- 1 root root 1.6G  8月 11 05:58 2014 20140811backup.tar.bz2
-rw-r--r-- 1 root root 1.6G  8月 12 06:01 2014 20140812backup.tar.bz2
-rw-r--r-- 1 root root 1.6G  8月 13 06:01 2014 20140813backup.tar.bz2
-rw-r--r-- 1 root root 1.6G  8月 14 06:03 2014 20140814backup.tar.bz2
-rw-r--r-- 1 root root 1.6G  8月 15 06:12 2014 backup.tar.bz2

    :

```

### 7. バックアップ内容確認

バックアップしたディレクトリ・ファイルの一覧は以下のようにして確認できる。

``` text
# tar tjvf /home/backup/backup.tar.bz2
```

### 8 バックアップ自動化

毎日決まった時間にバックアップスクリプトが実行されるよう cron 登録（"/etc/cron.d/backup" を作成）する。

File: `/etc/cron.d/backup`

{% highlight bash linenos %}
0 5 * * * root /root/backup.sh  # <= 毎日 5:00 に自動実行
{% endhighlight %}

当方の場合は、このバックアップスクリプト以外にデータベースをダンプさせたりするスクリプト等も同じ cron に登録している。

### 9. リストア

リストアは以下のようにすればよい。  
以下は、バックアップアーカイブファイル内から "/etc/my.cnf" というファイルをリストアする例。  
`-P` オプションはファイル名の先頭から "/" を取り除かないオプションなので、同じディレクトリ構成でリストアされ、最新の実ファイルが上書きされるので注意。（特定のディレクトリ内に展開したければ、適当なディレクトリへ移動して `-P` オプションを付けずに展開する）

``` text
# tar jxvfP /home/backup/backup.tar.bz2 /etc/my.cnf
```

ちなみに、バックアップファイルを暗号化するようにしている場合は、以下のように一旦復号化してからリストアを行うことになる。

``` text
# gpg /home/backup/backup.tar.bz2.gpg
```

---

以上。

