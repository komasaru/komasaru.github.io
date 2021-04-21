---
layout   : single
title    : "CentOS 6.5 - メール自動返信機能（Vacation）導入！"
published: true
date     : 2014-01-02 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- Postfix
---

前回は CentOS 6.5 サーバ上の Postfix + SpamAssassin でスパムメール誤認識対策を行いました。  
今回はメール自動返信機能 Vacation の導入を行います。

<!--more-->

### 0. 前提条件

- CentOS 6.5(x86_64) を Minimal で最小インストールしている。
- クライントマシンは Linux Mint 14(64bit) を想定。
- 送信メールサーバ Postfix、受信メールサーバ Dovecot 構築済みであること。
- 主に「[CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")」を参考にしている。  
  （実際は、過去にこのサイトを参考にして作業した際に記録していたものを参照している）

### 1. 必要パッケージインストール

Vacation のインストールに必要な gdbm-devel がインストールされていなれば、インストールしておく。

``` text
# yum -y install gdbm-devel
```

### 2. アーカイブファイルダウンロード＆展開

``` text
# wget "http://downloads.sourceforge.net/project/vacation/vacation/1.2.7.1/vacation-1.2.7.1.tar.gz?r=http%3A%2F%2Fsourceforge.net%2Fprojects%2Fvacation%2Ffiles%2F&ts=1325220962&use_mirror=jaist"
    
# tar zxvf vacation-1.2.7.1.tar.gz
```

### 3. Makefile 編集

インストール前に Makefile を編集する。

``` text
# cd vacation-1.2.7.1
```

File: `Makefile`

{% highlight bash linenos %}
MANDIR          = $(PREFIX)/share/man/man  # <= 変更
{% endhighlight %}

### 4. Vacation インストール

``` text
# make install
```

### 5. 後始末

``` text
# cd
# rm -rf vacation-1.2.7.1
# rm -f vacation-1.2.7.1.tar.gz
```

### 6. メール自動返信設定

対象のユーザになって ".forward" を編集・権限設定する。

File: `.forward`

{% highlight bash linenos %}
\\$USER, \"|/usr/bin/vacation $USER\"
{% endhighlight %}

``` text
    $ chmod 600 .forward
```

### 7. 自動返信メール作成

自動返信するメールを以下のように作成する。

File: `.vacation.msg.org`

{% highlight bash linenos %}
Subject: 自動返信メール件名
From: hoge@mk-mode.com

自動返信メール本文
{% endhighlight %}

### 8. 自動返信メール文字コード設定

作成した自動返信メールは JIS ではない（UTF） なので、文字化けしないよう変換しておく。

``` text
$ nkf -j .vacation.msg.org > .vacation.msg
```

### 9. 動作確認

対象のユーザ宛にメールを送信してみて、自動で返信されることを確認する。

### 10. メール自動返信設定解除

メール自動返信設定を解除する場合は、.forwardファイルを削除すればよい。

``` text
$ rm -f .forward
```

### 参考サイト

- [CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")

---

次回は、Postfix ログ解析ツール pflogsumm の導入について紹介する予定です。

以上。

