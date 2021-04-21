---
layout   : single
title    : "Bash - バックアップスクリプト（年月日別ディレクトリ）！"
published: true
date     : 2014-02-08 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- シェル
---

年別・月別・日別にディレクトリがあり、日別ディレクトリ内に多数のファイルが保存されているとした場合に、日単位や月単位でファイルを圧縮保存したいことがあると思います。（当方はあります）

以下、当方が使用しているシェルスクリプトの紹介です。

<!--more-->

### 0. 前提知識

- GNU bash 4.1.2 での作業を想定。
- CentOS 6.5, Linux Mint 14 で動作を確認。

### 1. バックアップ仕様

バックアップ元は下図のように年別・月別・日別ディレクトリに該当日のファイルが保存されているものとする。  
年は半角数字４文字、月・日は半角数字２文字であるものとするが、ファイル名は任意でよい。

``` text
path
   +-- to
   |   +-- src
   |   |   +-- 2013
   |   |   |   +-- 11
   |   |   |   |   +-- 01
   |   |   |   |   |   +-- aaaaaaaa.txt
   |   |   |   |   |   +-- bbbbbbbb.txt
   |   |   |   |   |          :
   |   |   |   |   |   :
   |   |   |   |   +-- 30
   |   |   |   |   |   +-- cccccccc.txt
   |   |   |   |   |   +-- dddddddd.txt
   |   |   |   |   |          :
   |   |   |   +-- 12
   |   |   |   |   +-- 01
   |   |   |   |   |   +-- eeeeeeee.txt
   |   |   |   |   |   +-- ffffffff.txt
   |   |   |   |   |          :
   |   |   |   |   |   :
   |   |   |   |   +-- 31
   |   |   |   |   |   +-- gggggggg.txt
   |   |   |   |   |   +-- hhhhhhhh.txt
   |   |   |   |   |          :
   |   |   +-- 2014
   |   |   |   +-- 01
   |   |   |   |   +-- 01
   |   |   |   |   |   +-- iiiiiiii.txt
   |   |   |   |   |   +-- jjjjjjjj.txt
   |   |   |   |   |          :
   |   |   |   |   |   :
   |   |   |   |   +-- 31
   |   |   |   |   |   +-- kkkkkkkk.txt
   |   |   |   |   |   +-- llllllll.txt
   |   |   |   |   |          :
   :   :   :   :   :      :
```

そして、バックアップ先は下図のように年別・月別ディレクトリに日別に圧縮したアーカイブファイルを保存するものとする。

``` text
path
 +-- to
 |   +-- bak
 |   |   +-- 2013
 |   |   |   +-- 11
 |   |   |   |   +-- 20131101.tar.gz
 |   |   |   |          :
 |   |   |   |   +-- 20131130.tar.gz
 |   |   |   +-- 12
 |   |   |   |   +-- 20131201.tar.gz
 |   |   |   |          :
 |   |   |   |   +-- 20131231.tar.gz
 |   |   +-- 2014
 |   |   |   +-- 01
 |   |   |   |   +-- 20140101.tar.gz
 |   |   |   |          :
 |   |   |   |   +-- 20140131.tar.gz
 :   :   :   :   :      :
```

そして、バックアップ実行は、１日１回前日以前のディレクトリに対して、未バックアップの日に対してのみ行う。

### 2. バックアップスクリプト

仕様通りにバックアップするために以下のように Bash スクリプトを作成した。

File: `backup_daily.sh`

{% highlight bash linenos %}
#! /bin/bash

# バックアップ元・バックアップ先
SRC_DIR_TOP="/path/to/src"
DST_DIR_TOP="/path/to/bak"

# 今日
TODAY=`date +%Y%m%d`

# バックアップ元の日付別ディレクトリ毎に処理
cd $SRC_DIR_TOP
for DIR in `ls -df */*`
do
    # 保存先ディレクトリパス設定
    if [[ "$DIR" =~ ^([0-9]{4})\/([0-9]{2})$ ]] ; then
        YEAR=${BASH_REMATCH[1]}
        MONTH=${BASH_REMATCH[2]}
    fi
    DST_DIR="$DST_DIR_TOP/$YEAR$MONTH"

    # 保存先ディレクトリが存在しなければ作成
    if [ ! -e $DST_DIR ]; then
        mkdir $DST_DIR
    fi

    # 日別ディレクトリ毎に処理
    for DIR_D in `ls -df $YEAR/$MONTH/*/`
    do
        # 保存ファイル名設定
        if [[ "$DIR_D" =~ \/([0-9]{2})\/$ ]] ; then
            DAY=${BASH_REMATCH[1]}
        fi
        DST_FILE="$YEAR$MONTH$DAY.tar.gz"

        # 今日でなく、日別アーカイブが存在しなれば、
        # アーカイブを作成して保存
        if [[ ! "$DST_FILE" =~ $TODAY ]]; then
            if [ ! -f $DST_DIR/$DST_FILE ]; then
                echo $DST_DIR/$DST_FILE
                tar zcvf $DST_DIR/$DST_FILE $DIR_D 2>&1 1>/dev/null
            fi
        fi
    done
done
{% endhighlight %}

---

色々と応用できるでしょう。

以上。

