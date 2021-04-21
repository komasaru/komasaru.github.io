---
layout   : single
title    : "Debian 7 Wheezy - Postfix ログ解析！"
published: true
date     : 2013-10-27 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
---

Debian GNU/Linux 7 Wheezy サーバに構築したメールサーバ Postfix のログを pflogsumm で解析する方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。

<!--more-->

### 0. 前提条件

- Debian GNU/Linux 7.1.0 での作業を想定。
- 接続元のマシンは Linux Mint 14(64bit) を想定。
- SMTP サーバ Postfix 導入済み。
- ログローテート（`logrotate`）でメールログがローテーションされていることを想定。

### 1. pflogsumm インストール

Postfix のログ解析ツールである pflogsumm を、以下のようにしてインストールする。

``` text 
# aptitude -y install pflogsumm
```

### 2. pflogsumm 実行スクリプト作成

pflogsumm を実行するスクリプト "pflogsumm_report" を以下のように作成する。  
単純に `pflogsumm` コマンドを実行するだけでもレポートはできるが、それだとログローテートしている場合に正常に取得できない部分も発生する可能性があるので、それを考慮している。  
また、以下のスクリプトでは前日のメールログを解析し、結果を postmaster 宛にメール送信している。

File: `pflogsumm_report`

{% highlight bash linenos %} 
#!/bin/bash

LANG=C
MAILLOG='mktemp'
for log in `ls /var/log/mail.log*|sort -r`
do
    cat $log >> $MAILLOG
done
REPORT=`mktemp`
pflogsumm --problems_first --verbose_msg_detail --mailq -d yesterday $MAILLOG > $REPORT
cat $REPORT | mail -s "`head -1 $REPORT` in `uname -n`" postmaster
rm -f $MAILLOG $REPORT

exit
{% endhighlight %}

スクリプト内のメール送信コマンド `mail` が使用できない場合は、`mailutils` or `heirloom-mailx` or `bsd-mailx` 等をインストールする。複数ある場合は、`update-alternatives --config mailx` でデフォルト設定をする。（ちなみに当方は、 `mailutils` ではドメインを指定しないとメール送信ができないので、 `heirloom-mailx` をインストールして使用している）

なお、ログローテートしていない場合は、もっと簡単なスクリプトにすることも可能であるし、`pflogsumm` コマンドを直接実行して運用してもよい。

### 3. 実行権限付与

スクリプトを作成したら、実行権限を付与しておく。

``` text 
# chmod 700 pflogsumm_report
```

### 4. スクリプト実行

作成したスクリプトを実行してみる。  
問題がなければ、 postmaster 宛にメールが送信されるはずである。

``` text 
# ./pflogsumm_report
```

### 5. 自動実行設定

毎日自動で実行するように cron 登録する。

``` text 
# mv pflogsumm_report /etc/cron.daily/
```

---

以上。

