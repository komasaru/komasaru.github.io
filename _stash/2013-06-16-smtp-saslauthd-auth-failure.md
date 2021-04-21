---
layout   : single
title    : "SMTP サーバ - saslauthd: do_auth : auth failure について！"
published: true
date     : 2013-06-16 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- CentOS
- Mail
- SMTP
---

先日、当方の CentOS サーバのログを確認していたところ、メールサーバに関して少し気になるメッセージが出力されていました。

調べてみました。以下、現象・原因・対策についての記録です。

<!--more-->

#### 0. 前提条件

- サーバ OS は CentOS 6.4
- SMTP（メール送信）サーバは Postfix 2.6.6
- SMTP-Auth 機能が有効になっていて（`saslauthd` が起動していて）、適切に設定されている。

#### 1. 現象

"/var/log/messages" に出力されていたメッセージの内容。

File: `/var/log/messages`

{% highlight text linenos %}
May 29 02:58:51 hoge saslauthd[2212]: do_request      : NULL password received
May 29 02:58:58 hoge saslauthd[2213]: do_auth         : auth failure: [user=Debbie] [service=smtp] [realm=mail.mk-mode.com] [mech=pam] [reason=PAM auth error]
May 29 02:59:02 hoge saslauthd[2211]: do_auth         : auth failure: [user=Debbie] [service=smtp] [realm=mail.mk-mode.com] [mech=pam] [reason=PAM auth error]
May 29 02:59:06 hoge saslauthd[2210]: do_auth         : auth failure: [user=Debbie] [service=smtp] [realm=mail.mk-mode.com] [mech=pam] [reason=PAM auth error]
May 29 02:59:10 hoge saslauthd[2208]: do_auth         : auth failure: [user=Debbie] [service=smtp] [realm=mail.mk-mode.com] [mech=pam] [reason=PAM auth error]
May 29 02:59:14 hoge saslauthd[2212]: do_auth         : auth failure: [user=Debbie] [service=smtp] [realm=mail.mk-mode.com] [mech=pam] [reason=PAM auth error]
May 29 02:59:17 hoge saslauthd[2213]: do_auth         : auth failure: [user=Debbie] [service=smtp] [realm=mail.mk-mode.com] [mech=pam] [reason=PAM auth error]
May 29 02:59:22 hoge saslauthd[2211]: do_auth         : auth failure: [user=Debbie] [service=smtp] [realm=mail.mk-mode.com] [mech=pam] [reason=PAM auth error]
May 29 02:59:25 hoge saslauthd[2210]: do_auth         : auth failure: [user=Debbie] [service=smtp] [realm=mail.mk-mode.com] [mech=pam] [reason=PAM auth error]
May 29 02:59:28 hoge saslauthd[2208]: do_auth         : auth failure: [user=Debbie] [service=smtp] [realm=mail.mk-mode.com] [mech=pam] [reason=PAM auth error]
{% endhighlight %}

同じ時間帯の "/bar/log/maillog" に出力されていた内容。

File: `/var/log/messages`

{% highlight text linenos %}
May 29 02:58:50 hoge postfix/smtpd[13613]: warning: XXX.XXX.XXX.XXX: address not listed for hostname xxxxxxxxxx
May 29 02:58:50 hoge postfix/smtpd[13613]: connect from unknown[XXX.XXX.XXX.XXX]
May 29 02:58:51 hoge postfix/smtpd[13613]: warning: unknown[XXX.XXX.XXX.XXX]: SASL LOGIN authentication failed: authentication failure
May 29 02:58:58 hoge postfix/smtpd[13613]: warning: unknown[XXX.XXX.XXX.XXX]: SASL LOGIN authentication failed: authentication failure
May 29 02:59:02 hoge postfix/smtpd[13613]: warning: unknown[XXX.XXX.XXX.XXX]: SASL LOGIN authentication failed: authentication failure
May 29 02:59:06 hoge postfix/smtpd[13613]: warning: unknown[XXX.XXX.XXX.XXX]: SASL LOGIN authentication failed: authentication failure
May 29 02:59:10 hoge postfix/smtpd[13613]: warning: unknown[XXX.XXX.XXX.XXX]: SASL LOGIN authentication failed: authentication failure
May 29 02:59:14 hoge postfix/smtpd[13613]: warning: unknown[XXX.XXX.XXX.XXX]: SASL LOGIN authentication failed: authentication failure
May 29 02:59:17 hoge postfix/smtpd[13613]: warning: unknown[XXX.XXX.XXX.XXX]: SASL LOGIN authentication failed: authentication failure
May 29 02:59:22 hoge postfix/smtpd[13613]: warning: unknown[XXX.XXX.XXX.XXX]: SASL LOGIN authentication failed: authentication failure
May 29 02:59:25 hoge postfix/smtpd[13613]: warning: unknown[XXX.XXX.XXX.XXX]: SASL LOGIN authentication failed: authentication failure
May 29 02:59:28 hoge postfix/smtpd[13613]: warning: unknown[XXX.XXX.XXX.XXX]: SASL LOGIN authentication failed: authentication failure
May 29 02:59:39 hoge postfix/smtpd[13613]: warning: unknown[XXX.XXX.XXX.XXX]: SASL LOGIN authentication failed: bad protocol / cancel
May 29 02:59:41 hoge postfix/smtpd[13613]: warning: unknown[XXX.XXX.XXX.XXX]: SASL LOGIN authentication failed: bad protocol / cancel
May 29 02:59:43 hoge postfix/smtpd[13613]: warning: unknown[XXX.XXX.XXX.XXX]: SASL LOGIN authentication failed: bad protocol / cancel
May 29 02:59:45 hoge postfix/smtpd[13613]: warning: unknown[XXX.XXX.XXX.XXX]: SASL LOGIN authentication failed: bad protocol / cancel
May 29 02:59:47 hoge postfix/smtpd[13613]: warning: unknown[XXX.XXX.XXX.XXX]: SASL LOGIN authentication failed: bad protocol / cancel
May 29 02:59:51 hoge postfix/smtpd[13613]: lost connection after UNKNOWN from unknown[XXX.XXX.XXX.XXX]
May 29 02:59:51 hoge postfix/smtpd[13613]: disconnect from unknown[XXX.XXX.XXX.XXX]
{% endhighlight %}

#### 2. 原因

外部からSMTPサーバに見知らぬユーザ（この例では "Debbie"）＆パスワード無しでログインしようとしたが、サーバ側でSMTP-Auth機能が有効になっているのでアクセスを拒否したという意味である。

ちなみに、"/var/log/maillog" の "warning: XXX.XXX.XXX.XXX: address not listed for hostname xxxxxxxxxx" は正引きと逆引きの結果に相違があるということ。  
つまり、Postfix が SMTP クライアントのホスト名を SMTP クライアントの IP アドレスで検索する際には、SMTP クライアントのホスト名にリストされているかもチェックするが、これがリストされていないということ。  
「なぜ SMTP クライアントがジャンクメールもしくはメールリレーチェックで止められたか、もしくは止めなかったか」が分かるようにログに記録されるようだ。  
不正なホストだからリストされていないのだろう。

#### 3. 対策

SMTP-Auth 機能が正常には働いているということなので、特に対策する必要はない。

---

これで、ログを見ても慌てなくてよくなります。

以上。

