---
layout   : single
title    : "CentOS 6.5 - 複数ドメイン宛メールの集約（Fetchmail）！"
published: true
date     : 2014-01-04 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- Postfix
---

前回は CentOS 6.5 サーバに Postfix ログ解析ツール pflogsumm の導入を行いました。  
今回は Fetchmail による複数ドメイン宛メールの集約を行います。

<!--more-->

### 0. 前提条件

- CentOS 6.5(x86_64) を Minimal で最小インストールしている。
- クライントマシンは Linux Mint 14(64bit) を想定。
- メールサーバ構築済みであること。
- 例として、@nifty 宛メールと YahooMail 宛メール、POP3S の場合のメールを集約する。
- メール転送先は "hoge@mk-mode.com" を想定。
- 主に「[CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")」を参考にしている。  
  （実際は、過去にこのサイトを参考にして作業した際に記録していたものを参照している）

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

### 4. Fetchmail 起動

該当のユーザで Fetchmail を起動する。

``` text
$ fetchmail
```

### 5. Fetchmail 動作確認

転送元宛のメールが転送先に届くか確認する。（上記の設定では 300 秒（５分）間隔で転送される）

### 6. Fetchmail 起動スクリプト作成

ここからは root ユーザになって作業を行う。

File: `/etc/rc.d/init.d/fetchmail`

{% highlight bash linenos %}
#!/bin/bash
#
# Fetchmail
#
# chkconfig: - 99 20
# description: Fetchmail auto start script

# Source function library.
. /etc/rc.d/init.d/functions

start() {
    # Start daemons.
    for user in `ls /home/`
    do
        if [ -f /home/$user/.fetchmailrc ]; then
            if [ ! -f /home/$user/.fetchmail.pid ]; then
                echo "fetchmail for $user starting..."
                su $user -s "/bin/bash" -c "/usr/bin/fetchmail"
            else
                PID=`cat /home/$user/.fetchmail.pid|cut -d " " -f 1`
                ps $PID>/dev/null
                if [ $? = 0 ]; then
                    echo "fetchmail for $user is already started..."
                else
                    echo "fetchmail for $user is restartng..."
                    su $user -s "/bin/bash" -c "/usr/bin/fetchmail"
                fi
            fi
        fi
    done

    if [ -f /root/.fetchmailrc ]; then
        if [ ! -f /var/run/fetchmail.pid ]; then
            echo "fetchmail for root starting..."
            /usr/bin/fetchmail
        else
            PID=`cat /var/run/fetchmail.pid|cut -d " " -f 1`
            ps $PID>/dev/null
            if [ $? = 0 ]; then
                echo "fetchmail for root is already started..."
            else
                echo "fetchmail for root is restartng..."
                /usr/bin/fetchmail
            fi
        fi
    fi
}

stop() {
    # Stop daemons.
    if [ -f /var/run/fetchmail.pid ]; then
        echo "fetchmail for root stoping..."
        /usr/bin/fetchmail --quit
    fi

    for user in `ls /home/`
    do
        if [ -f /home/$user/.fetchmail.pid ]; then
            echo "fetchmail for $user stoping..."
            su $user -s "/bin/bash" -c "/usr/bin/fetchmail --quit"
        fi
    done
}

# See how we were called.
case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        stop
        start
        ;;
    status)
        run="0"

        if [ -f /var/run/fetchmail.pid ]; then
            PID=`cat /var/run/fetchmail.pid|cut -d " " -f 1`
            ps $PID>/dev/null
            if [ $? = 0 ]; then
                run="1"
                echo "fetchmail for root is running..."
            fi
        fi

        for user in `ls /home/`
        do
            if [ -f /home/$user/.fetchmail.pid ]; then
                PID=`cat /home/$user/.fetchmail.pid|cut -d " " -f 1`
                ps $PID>/dev/null
                if [ $? = 0 ]; then
                    run="1"
                    echo "fetchmail for $user is running..."
                fi
            fi
        done

        if [ $run == "0" ]; then
            echo "fetchmail is not running"
            exit 1
        fi
        ;;
    *)
        echo "Usage: fetchmail {start|stop|restart|status}"
        exit 1
esac

exit $?
{% endhighlight %}

### 7. Fetchmail 起動スクリプト権限設定

Fetchmail 起動スクリプトへ実行権限を付与する。

``` text
# chmod +x /etc/rc.d/init.d/fetchmail
```

### 8. Fetchmail 起動

root として Fetchmail を起動する。（一般ユーザで起動した状態なら、以下のようなメッセージが出力される）

``` text
# /etc/rc.d/init.d/fetchmail start
fetchmail for hoge starting...
```

一般ユーザで起動した状態なら、以下のようなメッセージが出力される。

``` text
# /etc/rc.d/init.d/fetchmail start
fetchmail for hoge is already started...
```

### 9. Fetchmail 自動実行設定

``` text
# chkconfig --add fetchmail  # <= Fetchmail 起動スクリプトを chkconfig 登録

# chkconfig fetchmail on
# chkconfig --list fetchmail  # <= 2,3,4,5 が "on" であることを確認
fetchmail       0:off   1:off   2:on    3:on    4:on    5:on    6:off
```

### 参考サイト

- [CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")

---

次回は、Web サーバ Nginx の構築について紹介する予定です。

以上。

