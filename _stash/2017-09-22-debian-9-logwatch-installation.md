---
layout   : single
title    : "Debian 9 (Stretch) - ログ解析ツール logwatch インストール！"
published: true
date     : 2017-09-22 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
---

Debian GNU/Linux 9 (Stretch) にログ監視ツール LogWatch をインストールする方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 9 (Stretch) での作業を想定。
* root ユーザでの作業を想定。

### 1. logwatch のインストール

``` text
# apt -y install logwatch
```

### 2. logwatch 設定ファイルの編集

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

### 3. ディレクトリの作成

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
 ################### Logwatch 7.4.3 (12/07/16) ####################
        Processing Initiated: Fri Jul 14 16:09:33 2017
        Date Range Processed: yesterday
                              ( 2017-Jul-13 )
                              Period is day.
        Detail Level of Output: 0
        Type of Output/Format: mail / text
        Logfiles for Host: noah
 ##################################################################

         :
====< 以下省略 >====
         :
{% endhighlight %}

---

以上。

