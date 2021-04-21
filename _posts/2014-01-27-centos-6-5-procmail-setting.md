---
layout   : single
title    : "CentOS 6.5 - Procmail によるメール転送設定！"
published: true
date     : 2014-01-27 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
---

前回は CentOS 6.5 サーバ上で Web カメラの構築（USB カメラによる静止画自動保存）を行いました。  
今回はメール転送（振り分け）システム Procmail でのメール転送設定を行います。

<!--more-->

### 0. 前提条件

- CentOS 6.5(x86_64) を Minimal で最小インストールしている。
- クライントマシンは Linux Mint 14(64bit) を想定。
- メールサーバ構築済み。
- 複雑な設定も可能であるが、今回は単純な転送設定についてのみ。
- 過去にこのサイトを参考にして作業した際に記録していたものを参照している。

### 1. Procmail インストール

Procmail がインストールされていなければインストールする。

``` text
# yum -y install procmail
```

### 2. メール転送設定

以下の作業は転送設定したいユーザになって行う。  

ユーザルートの ".forward" を以下のように編集（無ければ作成）する。

File: `.forward`

{% highlight bash linenos %}
"|IFS=' ' && exec /usr/bin/procmail -f- || exit 75 #masaru"
{% endhighlight %}

ユーザルートの ".procmailrc" を以下のように編集（無ければ作成）する。
（以下は単純な転送の一例）

File: `.procmailrc`

{% highlight bash linenos %}
PATH=/bin:/usr/bin:/usr/sbin    # procmailが使用するパス
LOGFILE=$HOME/procmail.log      # ログファイル名
LOCKFILE=$HOME/.lockfile        # ロックファイル名
MAILDIR=$HOME/Maildir/          # メール格納場所
DEFAULT=$MAILDIR                # レシピにマッチしなかった場合の格納場所

:0 c                            # <= "c" はメッセージのコピーを残す
* ^Subject:.*＜件名＞           # <= 指定の件名のメールを転送する場合
* ^From:.*＜メールアドレス＞    # <= 指定の差出人からのメールを転送する場合
* ^To:.*＜メールアドレス＞      # <= 指定の宛先のメールを転送する場合
! ＜転送先メールアドレス＞      # <= 転送先（指定のメールアドレスへ転送する場合）
{% endhighlight %}

＜件名＞や＜メールアドレス＞等の設定は正規表現。

### 参考サイト

以下のサイトやその他のサイト等でより詳細な設定方法を確認できる。

- [procmail](http://www.procmail.org "procmail")
- [PROCMAIL](http://www.jaist.ac.jp/~fjt/procmail.html "PROCMAIL")

---

これまで多くの内容を紹介してきましたが、次回の記事で総括し、この CentOS 6.5 サーバ構築についてのシリーズは終了します。

以上。

