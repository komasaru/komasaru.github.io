---
layout   : single
title    : "Debian 10 (buster) - ログ解析ツール logwatch インストール！"
published: true
date     : 2020-01-08 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
---

Debian GNU/Linux 10 (buster) にログ監視ツール LogWatch をインストールする方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10 (buster) での作業を想定。
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

{% highlight bash %}
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

以下のような内容のメールが届くはずである。（抜粋）

``` text

 ################### Logwatch 7.4.3 (04/27/16) ####################
        Processing Initiated: Tue Oct  1 15:13:53 2019
        Date Range Processed: yesterday
                              ( 2019-Sep-30 )
                              Period is day.
        Detail Level of Output: 0
        Type of Output/Format: mail / text
        Logfiles for Host: vbox
 ##################################################################

         :
====< 以下省略 >====
         :
```

---

以上。

