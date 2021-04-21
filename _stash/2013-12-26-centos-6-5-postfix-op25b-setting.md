---
layout   : single
title    : "CentOS 6.5 - Postfix の OP25B 対策！"
published: true
date     : 2013-12-26 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- Postfix
---

前回は CentOS 6.5 サーバに送信メールサーバ Postfix の構築を行いました。  
今回は Postfix の OP25B 対策を行います。

自宅サーバであるとは言っても、Postfix でメールを送信する際にはプロバイダを経由することになる。  
プロバイダが OP25B(Outbound Port 25 Blocking)対策していて自宅サーバからメールが送信できない場合は、OP25B 対策の影響を受けることになるので対策を施す必要がある。

<!--more-->

### 0. 前提条件

- CentOS 6.5(x86_64) を Minimal で最小インストールしている。
- クライントマシンは Linux Mint 14(64bit) を想定。
- プロバイダは @nifty を想定。
- メールサーバは Postfix を想定。（Sendmail 等については各自お調べください）
- 主に「[CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")」を参考にしている。  
  （実際は、過去にこのサイトを参考にして作業した際に記録していたものを参照している）

### 1. メールサーバ名確認

クライアントマシンから `nslookup` コマンドでプロバイダに接続し、メールサーバ名を確認する。

``` text
# nslookup -type=mx nifty.com
Server:         127.0.1.1
Address:        127.0.1.1#53

Non-authoritative answer:
nifty.com       mail exchanger = 10 smmx.nifty.com.

Authoritative answers can be found from:
nifty.com       nameserver = ons0.nifty.ad.jp.
nifty.com       nameserver = ons1.nifty.ad.jp.
smmx.nifty.com  internet address = 210.131.4.177
ons0.nifty.ad.jp        internet address = 202.248.37.77
ons1.nifty.ad.jp        internet address = 202.248.20.156
```

メールサーバ名は "smmx.nifty.com" のようだ。

### 2. OP25B 影響確認

クライアントマシンから `telnet` コマンドでプロバイダのメールサーバへ接続できるかどうか確認する。

``` text
# telnet smmx.nifty.com 25
Trying 210.131.4.177...
Connected to smmx.nifty.com.
Escape character is '^]'.
220 conmx502.nifty.com ESMTP Nifty Mail Server   # <= 接続成功
quit                                             # <= 入力（終了）
221 2.0.0 conmx502.nifty.com closing connection
Connection closed by foreign host.
```

"220"（指定されたサーバーの準備完了）が帰ってきたので接続は成功している。

接続に成功した場合は OP25B の影響は受けないということなので、以降の作業は不要である。（当方は行っていない）  
「ホストへ接続できませんでした。 ポート番号 25: 接続に失敗しました」と出力される場合は、以降の OP25B 対策が必要である。

### 3. Postfix 設定ファイル編集

Postfix 設定ファイル "main.cf" を以下のように編集する。（該当箇所のみ抜粋）

File: `/etc/postfix/main.cf`

{% highlight bash linenos %}
#relayhost = $mydomain
#relayhost = [gateway.my.domain]
#relayhost = [mailserver.isp.tld]
#relayhost = uucphost
#relayhost = [an.ip.add.ress]
relayhost = [プロバイダのSMTPサーバ名]:587  # <= プロバイダの SMTP サーバを指定
{% endhighlight %}

### 4. 認証方式の確認

以下のようにして、プロバイダの SMTP サーバが対応している認証方式を確認する。

``` text
# telnet プロバイダのSMTPサーバ名 25または587
Trying XXX.XXX.XXX.XXX...
Connected to プロバイダのSMTPサーバー名 (XXX.XXX.XXX.XXX).
Escape character is '^]'.
220 プロバイダのSMTPサーバー名 ESMTP
ehlo localhost                 # <= "ehlo localhost" と入力
250-プロバイダのSMTPサーバー名
250-AUTH LOGIN CRAM-MD5 PLAIN  # <= プロバイダの SMTPサーバが対応している認証方式
250-AUTH=LOGIN CRAM-MD5 PLAIN
250-PIPELINING
250 8BITMIME
quit                           # <= 入力（終了）
221 プロバイダのSMTPサーバー名
Connection closed by foreign host.
```

### 5. Postfix 設定ファイル編集

Postfix 設定ファイル "main.cf" の最終行に以下の記述を追加する。  
（以下の「認証方式」は、前項で確認したプロバイダのSMTPサーバが対応している認証方式のこと）

File: `/etc/postfix/main.cf`

{% highlight bash linenos %}
smtp_sasl_auth_enable = yes
smtp_sasl_password_maps = hash:/etc/postfix/authinfo
smtp_sasl_security_options = noanonymous
smtp_sasl_mechanism_filter = 認証方式
{% endhighlight %}

### 6. SMTP 認証情報設定

SMTP 認証情報を以下のようにして設定する。  
（SMTP サーバ名、ユーザ名、パスワードは全て、自宅サーバではなくプロバイダの SMTP サーバの情報であることに注意）

File: `/etc/postfix/authinfo`

{% highlight bash linenos %}
[SMTPサーバ名]:587 ユーザ名:パスワード
{% endhighlight %}

### 7. SMTP 認証情報ファイル権限設定

作成した "authinfo" ファイルの権限を以下のように設定する。

``` text
# chmod 640 /etc/postfix/authinfo
```

### 7. データベース作成

以下のようにして、Postfix データベースファイルを作成する。

``` text
# postmap /etc/postfix/authinfo
```

### 8. Postfix リロード

設定を反映させるために、Postfix をリロードする。（再起動でもよい）

``` text
# /etc/rc.d/init.d/postfix reload
```

### 参考サイト

- [CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")
- [迷惑メール相談センター｜4　迷惑メール対策技術｜4-1-1 OP25B実施状況｜JADAC](http://www.dekyo.or.jp/soudan/taisaku/i2.html#isplist "迷惑メール相談センター｜4　迷惑メール対策技術｜4-1-1 OP25B実施状況｜JADAC")

---

次回は、受信メールサーバ Dovecot の構築について紹介する予定です。

以上。

