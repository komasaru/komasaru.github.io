---
layout   : single
title    : "SMTP サーバ - 不正中継拒否のログ！"
published: true
date     : 2013-06-17 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- CentOS
- Mail
- SMTP
---

当方の CentOS サーバの SMTP サーバのログについての記録です。

問題無いログなのですが、どういう意味のログなのかについて記録しておく。

<!--more-->

#### 0. 前提条件

- サーバ OS は CentOS 6.4
- SMTP（メール送信）サーバは Postfix 2.6.6
- SMTP-Auth 機能が有効になっていて（`saslauthd` が起動していて）、適切に設定されている。

#### 1. 現象

"/var/log/maillog" に出力されていたメッセージの内容。  

File: `/var/log/maillog`

{% highlight text linenos %}
May 30 00:16:31 sd11g5 postfix/smtpd[4656]: connect from unknown[AAA.AAA.AAA.AAA]
May 30 00:16:33 sd11g5 postfix/smtpd[4656]: NOQUEUE: reject: RCPT from unknown[AAA.AAA.AAA.AAA]: 554 5.7.1 <hoge@hogehoge.ne.jp>: Relay access denied; from=<fuga@fugafuga.jp> to=<hoge@hogehoge.ne.jp> proto=SMTP helo=<XXX.XXX.XXX.XXX>
May 30 00:16:34 sd11g5 postfix/smtpd[4656]: NOQUEUE: reject: RCPT from unknown[AAA.AAA.AAA.AAA]: 554 5.7.1 <hoge@hogehoge.ne.jp>: Relay access denied; from=<fuga@fugafuga.jp> to=<hoge@hogehoge.ne.jp> proto=SMTP helo=<XXX.XXX.XXX.XXX>
May 30 00:16:34 sd11g5 postfix/smtpd[4656]: NOQUEUE: reject: RCPT from unknown[AAA.AAA.AAA.AAA]: 554 5.7.1 <hoge@hogehoge.ne.jp>: Relay access denied; from=<fuga@fugafuga.jp> to=<hoge@hogehoge.ne.jp> proto=SMTP helo=<XXX.XXX.XXX.XXX>
May 30 00:16:35 sd11g5 postfix/smtpd[4656]: NOQUEUE: reject: RCPT from unknown[AAA.AAA.AAA.AAA]: 554 5.7.1 <hoge@hogehoge.ne.jp>: Relay access denied; from=<fuga@fugafuga.jp> to=<hoge@hogehoge.ne.jp> proto=SMTP helo=<XXX.XXX.XXX.XXX>
May 30 00:16:36 sd11g5 postfix/smtpd[4656]: NOQUEUE: reject: RCPT from unknown[AAA.AAA.AAA.AAA]: 554 5.7.1 <hoge@hogehoge.ne.jp>: Relay access denied; from=<fuga@fugafuga.jp> to=<hoge@hogehoge.ne.jp> proto=SMTP helo=<XXX.XXX.XXX.XXX>
May 30 00:16:36 sd11g5 postfix/smtpd[4656]: NOQUEUE: reject: RCPT from unknown[AAA.AAA.AAA.AAA]: 554 5.7.1 <hoge@hogehoge.ne.jp>: Relay access denied; from=<fuga@fugafuga.jp> to=<hoge@hogehoge.ne.jp> proto=SMTP helo=<XXX.XXX.XXX.XXX>
May 30 00:16:37 sd11g5 postfix/smtpd[4656]: NOQUEUE: reject: RCPT from unknown[AAA.AAA.AAA.AAA]: 554 5.7.1 <hoge@hogehoge.ne.jp>: Relay access denied; from=<fuga@fugafuga.jp> to=<hoge@hogehoge.ne.jp> proto=SMTP helo=<XXX.XXX.XXX.XXX>
May 30 00:16:38 sd11g5 postfix/smtpd[4656]: NOQUEUE: reject: RCPT from unknown[AAA.AAA.AAA.AAA]: 554 5.7.1 <hoge@hogehoge.ne.jp>: Relay access denied; from=<fuga@fugafuga.jp> to=<hoge@hogehoge.ne.jp> proto=SMTP helo=<XXX.XXX.XXX.XXX>
May 30 00:16:38 sd11g5 postfix/smtpd[4656]: NOQUEUE: reject: RCPT from unknown[AAA.AAA.AAA.AAA]: 554 5.7.1 <hoge@hogehoge.ne.jp>: Relay access denied; from=<fuga@fugafuga.jp> to=<hoge@hogehoge.ne.jp> proto=SMTP helo=<XXX.XXX.XXX.XXX>
May 30 00:16:39 sd11g5 postfix/smtpd[4656]: NOQUEUE: reject: RCPT from unknown[AAA.AAA.AAA.AAA]: 554 5.7.1 <hoge@hogehoge.ne.jp>: Relay access denied; from=<fuga@fugafuga.jp> to=<hoge@hogehoge.ne.jp> proto=SMTP helo=<XXX.XXX.XXX.XXX>
May 30 00:16:40 sd11g5 postfix/smtpd[4656]: NOQUEUE: reject: RCPT from unknown[AAA.AAA.AAA.AAA]: 554 5.7.1 <hoge@hogehoge.ne.jp>: Relay access denied; from=<fuga@fugafuga.jp> to=<hoge@hogehoge.ne.jp> proto=SMTP helo=<XXX.XXX.XXX.XXX>
May 30 00:16:41 sd11g5 postfix/smtpd[4656]: NOQUEUE: reject: RCPT from unknown[AAA.AAA.AAA.AAA]: 554 5.7.1 <hoge@hogehoge.ne.jp>: Relay access denied; from=<fuga@fugafuga.jp> to=<hoge@hogehoge.ne.jp> proto=SMTP helo=<XXX.XXX.XXX.XXX>
May 30 00:16:43 sd11g5 postfix/smtpd[4656]: NOQUEUE: reject: RCPT from unknown[AAA.AAA.AAA.AAA]: 554 5.7.1 <hoge@hogehoge.ne.jp>: Relay access denied; from=<fuga@fugafuga.jp> to=<hoge@hogehoge.ne.jp> proto=SMTP helo=<XXX.XXX.XXX.XXX>
May 30 00:16:44 sd11g5 postfix/smtpd[4656]: NOQUEUE: reject: RCPT from unknown[AAA.AAA.AAA.AAA]: 554 5.7.1 <hoge@hogehoge.ne.jp>: Relay access denied; from=<fuga@fugafuga.jp> to=<hoge@hogehoge.ne.jp> proto=SMTP helo=<XXX.XXX.XXX.XXX>
May 30 00:16:46 sd11g5 postfix/smtpd[4656]: NOQUEUE: reject: RCPT from unknown[AAA.AAA.AAA.AAA]: 554 5.7.1 <hoge@hogehoge.ne.jp>: Relay access denied; from=<fuga@fugafuga.jp> to=<hoge@hogehoge.ne.jp> proto=SMTP helo=<XXX.XXX.XXX.XXX>
May 30 00:16:48 sd11g5 postfix/smtpd[4656]: NOQUEUE: reject: RCPT from unknown[AAA.AAA.AAA.AAA]: 554 5.7.1 <hoge@hogehoge.ne.jp>: Relay access denied; from=<fuga@fugafuga.jp> to=<hoge@hogehoge.ne.jp> proto=SMTP helo=<XXX.XXX.XXX.XXX>
May 30 00:16:49 sd11g5 postfix/smtpd[4656]: NOQUEUE: reject: RCPT from unknown[AAA.AAA.AAA.AAA]: 554 5.7.1 <hoge@hogehoge.ne.jp>: Relay access denied; from=<fuga@fugafuga.jp> to=<hoge@hogehoge.ne.jp> proto=SMTP helo=<XXX.XXX.XXX.XXX>
May 30 00:16:51 sd11g5 postfix/smtpd[4656]: NOQUEUE: reject: RCPT from unknown[AAA.AAA.AAA.AAA]: 554 5.7.1 <hoge@hogehoge.ne.jp>: Relay access denied; from=<fuga@fugafuga.jp> to=<hoge@hogehoge.ne.jp> proto=SMTP helo=<XXX.XXX.XXX.XXX>
May 30 00:16:53 sd11g5 postfix/smtpd[4656]: NOQUEUE: reject: RCPT from unknown[AAA.AAA.AAA.AAA]: 554 5.7.1 <hoge@hogehoge.ne.jp>: Relay access denied; from=<fuga@fugafuga.jp> to=<hoge@hogehoge.ne.jp> proto=SMTP helo=<XXX.XXX.XXX.XXX>
May 30 00:16:54 sd11g5 postfix/smtpd[4656]: NOQUEUE: reject: RCPT from unknown[AAA.AAA.AAA.AAA]: 554 5.7.1 <hoge@hogehoge.ne.jp>: Relay access denied; from=<fuga@fugafuga.jp> to=<hoge@hogehoge.ne.jp> proto=SMTP helo=<XXX.XXX.XXX.XXX>
May 30 00:16:56 sd11g5 postfix/smtpd[4656]: too many errors after RCPT from unknown[AAA.AAA.AAA.AAA]
{% endhighlight %}

一部ふせているが、

- `AAA.AAA.AAA.AAA` はある外国（今回はパキスタンだった）のサーバのグローバルIPアドレス
- `XXX.XXX.XXX.XXX` は当方のグローバルIPアドレス
- `fuga@fugafuga.jp` はある日本のドメインのメールアドレス
- `hoge@hogehoge.ne.jp` はある日本のメール転送サービスのドメインのメールアドレスでユーザ名は全部異なる

である。

#### 2. 原因

`AAA.AAA.AAA.AAA` のサーバが当方のサーバを経由して `fuga@fugafuga.jp` からのメールをよそおって `hoge@hogehoge.ne.jp`（今回の場合は１度に20個の宛先） へメールを送信しようと試みたものの、当方の SMTP サーバの SMTP-Auth 設定により拒否されたからメッセージが出力されている。

ちなみに、SMTP サーバ(Postfix)の設定ファイル "/etc/postfix/main.cf" には以下の記述を追加している。（よくある設定）

File: `/etc/postfix/main.cf`

{% highlight text linenos %}
smtpd_sasl_auth_enable = yes
smtpd_sasl_local_domain = $myhostname
smtpd_recipient_restrictions =
    permit_mynetworks
    permit_sasl_authenticated
    reject_unauth_destination
{% endhighlight %}

#### 3. 対策

SMTP-Auth 機能が正常には働いているということなので、特に対策する必要はない。  

---

これで、ログを見ても慌てなくてよくなります。

以上。

