---
layout   : single
title    : "CentOS 7.0 - 複数ドメイン宛メールの集約 Fetchmail！"
published: true
date     : 2014-08-27 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- Postfix
- Dovecot
---

「CentOS 7.0 - 複数ドメイン宛メールの集約 Fetchmail」についての記録です。

（旧バージョンでの作業記録を更新しました。興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

- CentOS 7.0-1406(x86_64) を NetInstall で最小限インストールしている。
- サーバ用途なので、作業は基本的に全て一般ユーザから root になって行う。
- クライアント側は Linux Mint 17 を想定。
- メールサーバ構築済みであること。
- 例として、@nifty 宛メールと YahooMail 宛メール、POP3S の場合のメールを集約する。
- メール転送先は "hoge@mk-mode.com" を想定。
- 主に「[CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")」を参照。

### 1. Fetchmail インストール

``` text
# yum -y install fetchmail
```

### 2. Fetchmail 設定ファイル作成

対象のユーザになって作業を行なう。

File: `.fetchmailrc`

{% highlight bash linenos %}
# 共通設定
set daemon 300 # 300秒間隔でメールチェックを行なう
set postmaster root # 最終的なメールの送信先
set no bouncemail # エラーメールをpostmasterに送る
set syslog # ログを/var/log/maillogに記録する

# 全サーバー共通デフォルト設定
defaults
  protocol auto
  no mimedecode
  no fetchall # 未読メールのみ取り込む
  #fetchall   # 既読・未読にかかわらず全てのメールを取り込む
  #no keep    # 取り込んだメールをサーバー上から削除する
  keep        # 取り込んだメールをサーバー上に残す

# @nifty アカウント宛メール取り込み設定
poll pop.nifty.com                           # <= @nifty 受信メールサーバ名
  username "XXX99999"                        # <= @nifty ユーザ名
  password "xxxxxxxx"                        # <= @nifty パスワード
  mda "/usr/sbin/sendmail hoge@mk-mode.com"  # <= 転送先メールアドレス

# YahooMail アカウント宛メール取り込み設定
poll pop.mail.yahoo.co.jp                    # <= YahooMail 受信メールサーバ名
  user "XXXXX999999"                         # <= YahooMail ユーザ名
  pass "xxxxxxxx"                            # <= YahooMail パスワード
  mda "/usr/sbin/sendmail hoge@mk-mode.com"  # <= 転送先メールアドレス

# POP3S が提供されているプロバイダの場合
poll xxxxxxxx                                # <= プロバイダ受信メールサーバー名
  protocol pop3                              # <= プロトコル
  port 995                                   # <= ポート
  username "xxxxxxxx"                        # <= プロバイダユーザ名
  password "xxxxxxxx"                        # <= プロバイダパスワード
  ssl                                        # <= SSL
  mda "/usr/sbin/sendmail hoge@mk-mode.com"  # <= 転送先メールアドレス
{% endhighlight %}

### 3. Fetchmail 設定ファイル権限設定

所有者以外参照できないように Fetchmail 設定ファイルに権限を設定する。

``` text
$ chmod 600 .fetchmailrc
```

### 4. Fetchmail 起動用 systemd テンプレート作成

ここからは root ユーザになって作業を行う。

File: `/lib/systemd/system/fetchmail@.service`

{% highlight bash linenos %}
[Unit]
Description=A remote-mail retrieval utility
After=network.target postfix.service

[Service]
User=%I
ExecStart=/usr/bin/fetchmail
RestartSec=1

[Install]
WantedBy=multi-user.target
{% endhighlight %}

### 5. Fetchmail 起動スクリプト作成

File: `fetchmail-start.sh`

{% highlight bash linenos %}
#!/bin/sh

for user in `ls /home/`
do
    if [ -f /home/$user/.fetchmailrc ]; then
        echo "fetchmail for $user starting..."
        systemctl start fetchmail@$user
    fi
done
{% endhighlight %}

### 6. Fetchmail 起動用 systemd 設定ファイル作成（全ユーザ用）

File: `/lib/systemd/system/fetchmail-start.service`

{% highlight bash linenos %}
[Unit]
Description=Fetchmail Auto Start
After=network.target postfix.service

[Service]
Type=oneshot
ExecStart=/bin/sh /root/fetchmail-start.sh
RestartSec=1

[Install]
WantedBy=multi-user.target
{% endhighlight %}

### 7. Fetchmail 起動

``` text
# systemctl start fetchmail-start
```

### 8. Fetchmail 自動実行設定

``` text
# systemctl enable fetchmail-start
# systemctl list-unit-files -t service | grep fetchmail-start
fetchmail-start.service                     enabled  # <= enabled であることを確認
```

### 9. 動作確認

転送元宛のメールが転送先に届くか確認する。（上記の設定では 300 秒（５分）間隔で転送される）

---

以上。

