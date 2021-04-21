---
layout   : single
title    : "Debian 9 (Stretch) - Postfix ログ解析！"
published: true
date     : 2017-09-08 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- Postfix
---

Debian GNU/Linux 9 (Stretch) に導入した SMTP サーバ Postfix のログを解析する方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 9 (Stretch) での作業を想定。
* 接続元のマシンは LMDE2(Linux Mint Debian Edition 2)(64bit) を想定。
* SMTP サーバ Postfix を「[Debian 9 (Stretch) - SMTP サーバ Postfix 構築！](https://www.mk-mode.com/octopress/2017/08/30/debian-9-postfix-installation/ "Debian 9 (Stretch) - SMTP サーバ Postfix 構築！")」の方法で導入済み。
* ログローテート（`logrotate`）でメールログがローテーションされていることを想定。（デフォルトでなっているはず）
* root ユーザでの作業を想定。

### 1. pflogsumm のインストール

Postfix のログ解析ツールである pflogsumm を、以下のようにしてインストールする。

``` text
# apt -y install pflogsumm
```

### 2. pflogsumm 実行用スクリプトの作成

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

スクリプト内のメール送信コマンド `mail` が使用できない場合は、`mailutils` or `heirloom-mailx` or `bsd-mailx` 等をインストールする。複数ある場合は、`update-alternatives --config mailx` でデフォルト設定をする。

なお、ログローテートしていない場合は、もっと簡単なスクリプトにすることも可能であるし、`pflogsumm` コマンドを直接実行して運用してもよい。

### 3. 実行権限の付与

``` text
# chmod 700 pflogsumm_report
```

### 4. スクリプトの実行

作成したスクリプトを実行してみる。  
問題がなければ、 postmaster 宛にメールが送信されるはずである。

``` text
# ./pflogsumm_report
```

### 5. 自動実行の設定

毎日自動で実行するように cron 登録する。

``` text
# mv pflogsumm_report /etc/cron.daily/
```

---

以上。

