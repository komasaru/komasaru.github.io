---
layout   : single
title    : "CentOS 6.5 - Postfix ログ解析ツール（pflogsumm）導入！"
published: true
date     : 2014-01-03 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- Postfix
---

前回は CentOS 6.5 サーバにメール自動返信機能 Vacation の導入を行いました。  
今回は Postfix ログ解析ツール pflogsumm の導入を行います。

<!--more-->

### 0. 前提条件

- CentOS 6.5(x86_64) を Minimal で最小インストールしている。
- クライントマシンは Linux Mint 14(64bit) を想定。
- メールサーバ Postfix 構築済みであること。
- 主に「[CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")」を参考にしている。  
  （実際は、過去にこのサイトを参考にして作業した際に記録していたものを参照している）

### 1. pflogsumm インストール

``` text
# yum -y install postfix-pflogsumm
```

### 2. pflogsumm 実行スクリプト作成

File: `pflogsumm_report`

{% highlight bash linenos %}
#!/bin/bash

MAILLOG=`mktemp`
for log in `ls /var/log/maillog-*|sort`
do
    cat $log >> $MAILLOG
done
cat /var/log/maillog >> $MAILLOG
REPORT=`mktemp`
pflogsumm --problems_first --verbose_msg_detail --mailq -d yesterday $MAILLOG > $REPORT
cat $REPORT | mail -s "`head -1 $REPORT` in `uname -n`" postmaster
rm -f $MAILLOG $REPORT
{% endhighlight %}

### 3. pflogsumm 実行スクリプト権限設定

pflogsumm 実行スクリプトに実行権限を付与する。

``` text
# chmod 700 pflogsumm_report
```

### 4. pflogsumm 実行スクリプト実行

``` text
# ./pflogsumm_report
```

### 5. 動作確認

postmaster 宛にログサマリが送信されるので確認する。  
デフォルトで postmaster 宛メールは root に転送されるようになっているので、root 宛メールを一般ユーザ宛に転送するようにしていれば、一般ユーザ宛にもメールが届くはずである。

### 6. pflogsumm 定期自動実行設定

毎日時自動で実行されるよう cron ディレクトリへ移動する。

``` text
# mv pflogsumm_report /etc/cron.daily/
```

### 参考サイト

- [CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")

---

次回は、Fetchmail による複数ドメイン宛メールの集約について紹介する予定です。

以上。

