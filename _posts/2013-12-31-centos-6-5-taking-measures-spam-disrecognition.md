---
layout   : single
title    : "CentOS 6.5 - スパムメール誤認識対策（Postfix + SpamAssassin）！"
published: true
date     : 2013-12-31 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- Postfix
- スパム対策
---

本年最後の投稿です。

前回は CentOS 6.5 サーバ上のメールサーバ Postfix でスパムチェックを行いました。  
今回は Postfix + SpamAssassin でのスパムメール誤認識対策を行います。

<!--more-->

### 0. 前提条件

- CentOS 6.5(x86_64) を Minimal で最小インストールしている。
- クライントマシンは Linux Mint 14(64bit) を想定。
- 送信メールサーバ Postfix 構築済みであること。
- スパム対策として、 Postfix と SpamAssassin を amavisd-new で連携している。

### 1. スパムと誤認識する場合の対処方法。

"/etc/mail/spamassassin/local.cf" を直接編集しても、spamassassin-update が cron.daily により毎日自動起動して "/etc/mail/spamassassin/local.cf" が上書きされてしまうので、以下のようにする。

#### 1-1. ホワイトリストファイル新規作成

（以下は一例）

File: `/root/whitelist`

{% highlight bash linenos %}
whitelist_from admin@dreammail.ne.jp
whitelist_from magsta@dreammail.jp
whitelist_from mikopi@mail.anshin-m.net
whitelist_from n-link_owners@nissan.co.jp
{% endhighlight %}

#### 1-2. spamassassin-update 編集

File: `/etc/cron.daily/spamassassin-update`

{% highlight bash linenos %}
cp user_prefs local.cf
cat /root/whitelist >> local.cf  # <= 追加
{% endhighlight %}

#### 1-3. 動作確認

今すぐテストしてみかったら、一旦 "/etc/mail/spamassassin/user_prefs" を削除後に "spamassassin-update" を実行する。

``` text
# rm -f /etc/mail/spamassassin/user_prefs
# /etc/cron.daily/spamassassin-update
```

### 2. スパムと認識されない場合の対処方法。

"/etc/mail/spamassassin/local.cf" を直接編集しても、spamassassin-update が cron.daily により毎日自動起動して "/etc/mail/spamassassin/local.cf" が上書きされてしまうので、以下のようにする。

#### 2-1. ブラックリストファイル新規作成

（以下は一例）

File: `/root/blacklist`

{% highlight bash linenos %}
blacklist_from gonyou6613@yahoo.co.jp
blacklist_from hirosimakino@livedoor.co.jp
blacklist_from hirosiokazaki@hotmail.co.jp
blacklist_from info_mitui_trust@yahoo.co.jp
blacklist_from info@kurokage-keiba.com
{% endhighlight %}

#### 2-2. spamassassin-update 編集

File: `/etc/cron.daily/spamassassin-update`

{% highlight bash linenos %}
cp user_prefs local.cf
cat /root/whitelist >> local.cf
cat /root/blacklist >> local.cf  # <= 追加
{% endhighlight %}

#### 2-3. 動作確認

今すぐテストしてみかったら、一旦 "/etc/mail/spamassassin/user_prefs" を削除後に "spamassassin-update" を実行する。

``` text
# rm -f /etc/mail/spamassassin/user_prefs
# /etc/cron.daily/spamassassin-update
```

---

次回は、１月２日にメール自動返信機能 Vacation の導入について紹介する予定です。

そして、来年もよろしく願いいたします。  
それでは、よいお年をお迎えください。

以上。

