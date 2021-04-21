---
layout   : single
title    : "CentOS 6.5 - ログ監視ツール SWATCH 導入！"
published: true
date     : 2014-01-24 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
---

前回は CentOS 6.5 サーバ上で Web メールシステム SquirrelMail の導入を行いました。  
今回はログ監視ツール SWATCH の導入を行います。

<!--more-->

### 0. 前提条件

- CentOS 6.5(x86_64) を Minimal で最小インストールしている。
- クライントマシンは Linux Mint 14(64bit) を想定。
- DNS サーバ BIND 構築済み。（監視する場合）
- SSH サーバ構築済み。（監視する場合）
- FTP サーバ vsftp 構築済み。（監視する場合）
- 「[CentOS 6.5 - 初期設定！](2013-12-13-centos-6-5-first-setting "CentOS 6.5 - 初期設定！")」内のとおり EPEL リポジトリの導入を行なっている。
- 主に「[CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")」を参考にしている。  
  （実際は、過去にこのサイトを参考にして作業した際に記録していたものを参照している）

### 1. SWATCH インストール

``` text
# yum --enablerepo=epel -y install swatch
```

### 2. SWATCH アクションスクリプト作成

File: `/usr/local/bin/swatch_action.sh`

{% highlight bash linenos %}
#!/bin/bash

PATH=/bin:/sbin:/usr/bin
LANG=C

# 規制IPアドレス情報メール通知先設定
# ※メール通知しない場合は下記をコメントアウト
mail=root

# ログを標準入力から取得
read LOG

# ログからIPアドレスを抽出
IPADDR=`echo $LOG|cut -d " " -f $1`
echo "$IPADDR"|grep "^[0-9]*\." > /dev/null 2>&1
if [ $? -eq 0 ]; then
    # IPアドレスから始まる場合
    IPADDR=`echo "$IPADDR"|sed -e 's/\([0-9]*\.[0-9]*\.[0-9]*\.[0-9]*\).*/\1/p' -e d`
else
    # IPアドレス以外から始まる場合
    IPADDR=`echo "$IPADDR"|sed -e 's/.*[^0-9]\([0-9]*\.[0-9]*\.[0-9]*\.[0-9]*\).*/\1/p' -e d`
fi

# IPアドレスをピリオドで分割
addr1=`echo $IPADDR|cut -d . -f 1`
addr2=`echo $IPADDR|cut -d . -f 2`
addr3=`echo $IPADDR|cut -d . -f 3`
addr4=`echo $IPADDR|cut -d . -f 4`

# IPアドレスがプライベートIPアドレスの場合は終了
if [ "$IPADDR" = "127.0.0.1" ]; then
    exit
elif [ $addr1 -eq 10 ]; then
    exit
elif [ $addr1 -eq 172 ] && [ $addr2 -ge 16 ] && [ $addr2 -le 31 ]; then
    exit
elif [ $addr1 -eq 192 ] && [ $addr2 -eq 168 ]; then
    exit
fi

# 不正アクセスログメッセージをIPアドレス別ログファイルに記録
echo $LOG >> /var/log/swatch/$IPADDR

# IPアドレス別ログファイルから累積不正アクセス数取得
cnt=`cat /var/log/swatch/$IPADDR | wc -l`

# 該当IPアドレスからの累積不正アクセス数が3以上の場合または
# 引数でlockと指定された場合アクセス規制
if [ $cnt -ge 3 ] || [ $# -eq 2 -a  "$2" = "lock" ]; then
    # 該当IPアドレスからのアクセスを拒否するルールを挿入
    iptables -I INPUT -s $IPADDR -j DROP

    # 上記ルールを24時間後に削除するスケジュールを登録
    echo "iptables -D INPUT -s $IPADDR -j DROP > /dev/null 2>&1" | \
    at now+24hour > /dev/null 2>&1

    # アクセス規制IPアドレス情報をメール通知
    [ "$mail" != "" ] && (cat /var/log/swatch/$IPADDR ; \
                          echo ; whois $IPADDR) | \
                          mail -s "$IPADDR $cnt lock!" $mail

    echo "`date` $IPADDR $cnt lock!"
else
    echo "`date` $IPADDR $cnt"
fi
{% endhighlight %}

### 3. SWATCH アクションスクリプト権限設定

``` text
# chmod 700 /usr/local/bin/swatch_action.sh
```

### 4. SWATCH 設定ファイル格納ディレクトリ作成

``` text
# mkdir /etc/swatch
```

### 5. ログローテーション設定

File: `/etc/logrotate.d/swatch`

{% highlight bash linenos %}
/var/log/swatch/swatch.log {
    missingok
    notifempty
    sharedscripts
    postrotate
        /etc/rc.d/init.d/swatch restart > /dev/null || true
    endscript
}
{% endhighlight %}

### 6. /var/log/messages 監視設定（DNS サーバ BIND 構築済みの場合）

BIND のバージョン照会を検知したり、アクセス無許可ホストからの DNS 使用を検知したら、該当ホストからのアクセスを24時間規制するよう設定ファイルを作成する。

File: `/etc/swatch/messages.conf`

{% highlight bash linenos %}
# logfile /var/log/messages

# BINDのバージョン照会を検知したら該当ホストからのアクセスを24時間規制
watchfor /query \'VERSION\.BIND\/TXT\/CH\' denied/
    pipe "/usr/local/bin/swatch_action.sh 7 lock"
    throttle=00:00:10

# アクセス無許可ホストからのDNS使用を検知したら該当ホストからのアクセスを24時間規制
watchfor /named.*client.*query.*denied/
    pipe "/usr/local/bin/swatch_action.sh 7 lock"
{% endhighlight %}

### 7. /var/log/secure 監視設定（SSH サーバ構築済みの場合）

アクセス無許可ホストからの SSH ログイン失敗を検知したり、アクセス許可ホストからの SSH ログイン失敗を3回以上検知したら、該当ホストからのアクセスを24時間規制するよう設定ファイルを作成する。

File: `/etc/swatch/secure.conf`

{% highlight bash linenos %}
# logfile /var/log/secure

# アクセス無許可ホストからのSSHログイン失敗を検知したら該当ホストからのアクセスを24時間規制
# ※/etc/hosts.deny、/etc/hosts.allowでアクセス許可ホストを制限していることが前提
watchfor /sshd.*refused/
    pipe "/usr/local/bin/swatch_action.sh 10 lock"
    throttle=00:00:10

# アクセス許可ホストからのSSHログイン失敗を3回以上検知したら該当ホストからのアクセスを24時間規制
watchfor /sshd.*Invalid user/
    pipe "/usr/local/bin/swatch_action.sh 10"
    throttle=00:00:10
{% endhighlight %}

### 8. /var/log/vsftpd.log 監視設定（FTPサーバー vsftpd 構築済みの場合）

アクセス無許可ホストからの FTP ログイン失敗を検知したり、アクセス許可ホストからの FTP ログイン失敗を3回以上検知したら該当ホストからのアクセスを24時間規制するよう設定ファイルを作成する。

File: `/etc/swatch/vsftpd.conf`

{% highlight bash linenos %}
# logfile /var/log/vsftpd.log

# アクセス無許可ホストからのFTPログイン失敗を検知したら該当ホストからのアクセスを24時間規制
# ※/etc/hosts.deny、/etc/hosts.allowでアクセス許可ホストを制限していることが前提
watchfor /Connection refused: tcp_wrappers denial/
    pipe "/usr/local/bin/swatch_action.sh 10 lock"
    throttle=00:00:10

# アクセス許可ホストからのFTPログイン失敗を3回以上検知したら該当ホストからのアクセスを24時間規制
watchfor /FAIL LOGIN/
    pipe "/usr/local/bin/swatch_action.sh 12"
    throttle=00:00:10
{% endhighlight %}

### 9. SWATCH 起動スクリプト作成

File: `/etc/rc.d/init.d/swatch`

{% highlight bash linenos %}
#!/bin/bash
#
# swatch
#
# chkconfig: 2345 90 35
# description: swatch start/stop script

# Source function library.
. /etc/rc.d/init.d/functions

PATH=/sbin:/usr/local/bin:/bin:/usr/bin

mkdir -p /var/log/swatch

start() {
    # Start daemons.
    ls /var/run/swatch_*.pid > /dev/null 2>&1
    if [ $? -ne 0 ]; then
        echo -n "Starting swatch"
        pno=0
        for conf in /etc/swatch/*.conf
        do
            pno=`expr $pno + 1`
            WATCHLOG=`grep "^# logfile" $conf | awk '{ print $3 }'`
            swatch --config-file $conf --tail-file $WATCHLOG \
            --script-dir=/tmp --awk-field-syntax --use-cpan-file-tail --daemon \
            --pid-file /var/run/swatch_$pno.pid \
            >> /var/log/swatch/swatch.log 2>&1
            RETVAL=$?
            [ $RETVAL != 0 ] && return $RETVAL
        done
        echo
        [ $RETVAL = 0 ] && touch /var/lock/subsys/swatch
        return $RETVAL
    else
        echo "swatch is already started"
    fi
}

stop() {
    # Stop daemons.
    ls /var/run/swatch_*.pid > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo -n "Shutting down swatch"
        for pid in /var/run/swatch_*.pid
        do
           kill $(cat $pid)
           rm -f $pid
        done
        echo
        rm -f /var/lock/subsys/swatch /tmp/.swatch_script.*
    else
        echo "swatch is not running"
    fi
}

status() {
    ls /var/run/swatch_*.pid > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo -n "swatch (pid"
        for pid in /var/run/swatch_*.pid
        do
           echo -n " `cat $pid`"
        done
        echo ") is running..."
    else
        echo "swatch is stopped"
    fi
}

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
        status
        ;;
   *)
        echo "Usage: swatch {start|stop|restart|status}"
        exit 1
esac

exit $RETVAL
{% endhighlight %}

### 10. SWATCH 起動スクリプト権限設定

``` text
# chmod +x /etc/rc.d/init.d/swatch
```

### 11. SWATCH 起動

``` text
# /etc/rc.d/init.d/swatch start
Starting swatch
```

### 12. SWATCH 自動起動設定

``` text
# chkconfig --add swatch   # <= chkconfig へ登録
# chkconfig swatch on      # <= 自動起動設定
# chkconfig --list swatch  # <= 2,3,4,5 が on であることを確認
swatch          0:off   1:off   2:on    3:on    4:on    5:on    6:off
```

### 13. 動作確認

不正アクセスを検知し該当ホストからのアクセスを24時間規制した場合、該当IPアドレスの whois 情報がメールで送信されるので確認する。（その時にならないと確認できない）

また、`iptables` による受信拒否ルールを照会するには次のようにする。

``` text
# iptables -L INPUT -n|grep DROP
Chain INPUT (policy DROP)
DROP       all  -f  0.0.0.0/0            0.0.0.0/0
DROP       tcp  -- !192.168.11.0/24      0.0.0.0/0           multiport dports 135,137,138,139,445
DROP       udp  -- !192.168.11.0/24      0.0.0.0/0           multiport dports 135,137,138,139,445
DROP       all  --  0.0.0.0/0            255.255.255.255
DROP       all  --  0.0.0.0/0            224.0.0.1
DROP_COUNTRY  all  --  0.0.0.0/0            0.0.0.0/0
DROP       all  --  0.0.0.0/0            0.0.0.0/0
```

`at` コマンドにより予約されているキューを照会するには次のようにする。

``` text
# atq | sort
100     2014-01-21 21:49 a root
101     2006-01-21 21:50 a root
```

`at` コマンドにより予約されている処理を照会するには次のようにする。（以下の `100` は、上記 `atq | sort` で表示されたキュー番号）

``` text
# at -c 100 | tail -2
iptables -D INPUT -s XXX.XXX.XXX.XXX -j DROP > /dev/null 2>&1

```

---

次回は、プログラミング言語 Python をソースをビルドしてインストールする方法について紹介する予定です。

以上。

