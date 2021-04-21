---
layout   : single
title    : "CentOS 7.0 - Postfix ログ解析ツール pflogsumm 導入！"
published: true
date     : 2014-08-26 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- Postfix
---

「CentOS 7.0 - Postfix ログ解析ツール pflogsumm 導入」についての記録です。

（旧バージョンでの作業記録を更新しました。興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

- CentOS 7.0-1406(x86_64) を NetInstall で最小限インストールしている。
- サーバ用途なので、作業は基本的に全て一般ユーザから root になって行う。
- クライアント側は Linux Mint 17 を想定。
- メールサーバ Postfix 構築済みであること。
- 主に「[CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")」を参照。

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

``` text
# mv pflogsumm_report /etc/cron.daily/
```

---

以上。

