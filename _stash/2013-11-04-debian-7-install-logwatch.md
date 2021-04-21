---
layout   : single
title    : "Debian 7 Wheezy - ログ解析ツール logwatch インストール！"
published: true
date     : 2013-11-04 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
---

Debian GNU/Linux 7.1.0 サーバにログ解析ツール logwatch を導入する方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。

<!--more-->

### 0. 前提条件

- Debian GNU/Linux 7.1.0 での作業を想定。

### 1. logwatch インストール

以下のようにして logwatch をインストールする。

``` text 
# aptitude -y install logwatch
```

### 2. logwatch 設定ファイル編集

まず、デフォルトの設定ファイルを複製する。

``` text 
# cp /usr/share/logwatch/default.conf/logwatch.conf /etc/logwatch/conf/
```

デフォルトの設定で充分であるが、必要なら編集する。  
メールの送信先等を変更するなら以下のようにする。

File: `/etc/logwatch/conf/logwatch.conf`

{% highlight bash linenos %} 
MailTo = hoge@xxxx.com  # < = メール送信先
Detail = High           # < = ログの詳細レベル (Low(0), Med(5), High(10) か 1～10 の整数)
{% endhighlight %}

### 3. ディレクトリ作成

キャッシュで使用するディレクトリが無いので作成しておく。

``` text 
# mkdir /var/cache/logwatch
```

### 4. 動作確認

logwatch をインストールするとデフォルトで cron 登録されるので、毎日レポートメールが届くはずである。後はそのメール内容をチェックする。  
今すぐに確認したければ、以下のようにする。

``` text 
# /etc/cron.daily/00logwatch
```

以下のような内容のメールが届くはずである。

File: `メール内容抜粋`

{% highlight bash linenos %} 
 ################### Logwatch 7.4.0 (05/02/12) ####################
        Processing Initiated: Mon Oct  7 23:02:20 2013
        Date Range Processed: yesterday
                              ( 2013-Oct-06 )
                              Period is day.
        Detail Level of Output: 0
        Type of Output/Format: mail / text
        Logfiles for Host: vbox
 ##################################################################

 --------------------- Amavisd-new Begin ------------------------

        2   Total messages scanned ------------------  100.00%
    1.027K  Total bytes scanned                          1,052
 ========   ==================================================

        2   Passed ----------------------------------  100.00%
        2     Clean passed                             100.00%
 ========   ==================================================

        2   Ham -------------------------------------  100.00%
        2     Clean passed                             100.00%
 ========   ==================================================

 **Unmatched Entries**
        3   Deleting db files __db.001,__db.004,__db.002,__db.003,nanny.db,snmp.db in /var/lib/amavis/db
        1   Deleting db files  in /var/lib/amavis/db

 ---------------------- Amavisd-new End -------------------------

         :
====< 以下省略 >====
         :
{% endhighlight %}

---

以上。

