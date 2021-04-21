---
layout   : single
title    : "CentOS 6.5 - ファイアウォール（iptables）構築！"
published: true
date     : 2013-12-20 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- ファイアウォール
---

前回は CentOS 6.5 サーバにアンチウィルスソフト Clam AntiVirus の導入を行いました。  
今回はファイアウォール iptables の構築を行います。

<!--more-->

### 0. 前提条件

- CentOS 6.5(x86_64) を Minimal で最小インストールしている。
- クライントマシンは Linux Mint 14(64bit) を想定。
- SSH のポートはセキュリティ上デフォルトの 22 から変更している。
- 「[CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")」を参考にしている。  
  （実際は、過去にこのサイトを参考にして作業した際に記録していたものを参照している）  
  （また、最初のうちはそのままコピーさせてもらっているが、今後各種サーバを構築していくにつれポート開放部分を追加していく）

### 1. ファイアウォール設定スクリプト作成

以下のようにファイアウォール設定スクリプトを作成する。

File: `iptables.sh`

{% highlight bash linenos %}
#!/bin/bash

#---------------------------------------#
# 設定開始                              #
#---------------------------------------#

# インタフェース名定義
LAN=eth0

#---------------------------------------#
# 設定終了                              #
#---------------------------------------#

# 内部ネットワークのネットマスク取得
LOCALNET_MASK=`ifconfig $LAN|sed -e 's/^.*Mask:\([^ ]*\)$/\1/p' -e d`

# 内部ネットワークアドレス取得
LOCALNET_ADDR=`netstat -rn|grep $LAN|grep $LOCALNET_MASK|cut -f1 -d' '`
LOCALNET=$LOCALNET_ADDR/$LOCALNET_MASK

# ファイアウォール停止(すべてのルールをクリア)
/etc/rc.d/init.d/iptables stop

# デフォルトルール(以降のルールにマッチしなかった場合に適用するルール)設定
iptables -P INPUT   DROP   # 受信はすべて破棄
iptables -P OUTPUT  ACCEPT # 送信はすべて許可
iptables -P FORWARD DROP   # 通過はすべて破棄

# 自ホストからのアクセスをすべて許可
iptables -A INPUT -i lo -j ACCEPT

# 内部からのアクセスをすべて許可
iptables -A INPUT -s $LOCALNET -j ACCEPT

# 内部から行ったアクセスに対する外部からの返答アクセスを許可
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# SYN Cookiesを有効にする
# ※TCP SYN Flood攻撃対策
sysctl -w net.ipv4.tcp_syncookies=1 > /dev/null
sed -i '/net.ipv4.tcp_syncookies/d' /etc/sysctl.conf
echo "net.ipv4.tcp_syncookies=1" >> /etc/sysctl.conf

# ブロードキャストアドレス宛pingには応答しない
# ※Smurf攻撃対策
sysctl -w net.ipv4.icmp_echo_ignore_broadcasts=1 > /dev/null
sed -i '/net.ipv4.icmp_echo_ignore_broadcasts/d' /etc/sysctl.conf
echo "net.ipv4.icmp_echo_ignore_broadcasts=1" >> /etc/sysctl.conf

# ICMP Redirectパケットは拒否
sed -i '/net.ipv4.conf.*.accept_redirects/d' /etc/sysctl.conf
for dev in `ls /proc/sys/net/ipv4/conf/`
do
    sysctl -w net.ipv4.conf.$dev.accept_redirects=0 > /dev/null
    echo "net.ipv4.conf.$dev.accept_redirects=0" >> /etc/sysctl.conf
done

# Source Routedパケットは拒否
sed -i '/net.ipv4.conf.*.accept_source_route/d' /etc/sysctl.conf
for dev in `ls /proc/sys/net/ipv4/conf/`
do
    sysctl -w net.ipv4.conf.$dev.accept_source_route=0 > /dev/null
    echo "net.ipv4.conf.$dev.accept_source_route=0" >> /etc/sysctl.conf
done

# フラグメント化されたパケットはログを記録して破棄
iptables -A INPUT -f -j LOG --log-prefix '[IPTABLES FRAGMENT] : '
iptables -A INPUT -f -j DROP

# 外部とのNetBIOS関連のアクセスはログを記録せずに破棄
# ※不要ログ記録防止
iptables -A INPUT ! -s $LOCALNET -p tcp -m multiport --dports 135,137,138,139,445 -j DROP
iptables -A INPUT ! -s $LOCALNET -p udp -m multiport --dports 135,137,138,139,445 -j DROP
iptables -A OUTPUT ! -d $LOCALNET -p tcp -m multiport --sports 135,137,138,139,445 -j DROP
iptables -A OUTPUT ! -d $LOCALNET -p udp -m multiport --sports 135,137,138,139,445 -j DROP

# 1秒間に4回を超えるpingはログを記録して破棄
# ※Ping of Death攻撃対策
iptables -N LOG_PINGDEATH
iptables -A LOG_PINGDEATH -m limit --limit 1/s --limit-burst 4 -j ACCEPT
iptables -A LOG_PINGDEATH -j LOG --log-prefix '[IPTABLES PINGDEATH] : '
iptables -A LOG_PINGDEATH -j DROP
iptables -A INPUT -p icmp --icmp-type echo-request -j LOG_PINGDEATH

# 全ホスト(ブロードキャストアドレス、マルチキャストアドレス)宛パケットはログを記録せずに破棄
# ※不要ログ記録防止
iptables -A INPUT -d 255.255.255.255 -j DROP
iptables -A INPUT -d 224.0.0.1 -j DROP

# 113番ポート(IDENT)へのアクセスには拒否応答
# ※メールサーバ等のレスポンス低下防止
iptables -A INPUT -p tcp --dport 113 -j REJECT --reject-with tcp-reset

# ACCEPT_COUNTRY_MAKE関数定義
# 指定された国のIPアドレスからのアクセスを許可するユーザ定義チェイン作成
ACCEPT_COUNTRY_MAKE(){
    for addr in `cat /tmp/cidr.txt|grep ^$1|awk '{print $2}'`
    do
        iptables -A ACCEPT_COUNTRY -s $addr -j ACCEPT
    done
}

# DROP_COUNTRY_MAKE関数定義
# 指定された国のIPアドレスからのアクセスを破棄するユーザ定義チェイン作成
DROP_COUNTRY_MAKE(){
    for addr in `cat /tmp/cidr.txt|grep ^$1|awk '{print $2}'`
    do
        iptables -A DROP_COUNTRY -s $addr -m limit --limit 1/s -j LOG --log-prefix '[IPTABLES DENY_COUNTRY] : '
        iptables -A DROP_COUNTRY -s $addr -j DROP
    done
}

# IPアドレスリスト取得
. /root/iptables_functions
IPLISTGET

# 日本からのアクセスを許可するユーザ定義チェインACCEPT_COUNTRY作成
iptables -N ACCEPT_COUNTRY
ACCEPT_COUNTRY_MAKE JP
# 以降,日本からのみアクセスを許可したい場合はACCEPTのかわりにACCEPT_COUNTRYを指定する

# 中国・イラン・韓国※からのアクセスをログを記録して破棄
# ※全国警察施設への攻撃元上位３カ国(日本・アメリカを除く)
# http://www.cyberpolice.go.jp/detect/observation.htmlより
iptables -N DROP_COUNTRY
DROP_COUNTRY_MAKE CN
DROP_COUNTRY_MAKE IR
DROP_COUNTRY_MAKE KR
iptables -A INPUT -j DROP_COUNTRY

#----------------------------------------------------------#
# 各種サービスを公開する場合の設定(ここから)               #
#----------------------------------------------------------#

# 外部からのTCP22番ポート(SSH)へのアクセスを日本からのみ許可
# ※SSHサーバーを公開する場合のみ
iptables -A INPUT -p tcp --dport 22 -j ACCEPT_COUNTRY

# 外部からのTCP/UDP53番ポート(DNS)へのアクセスを許可
# ※外部向けDNSサーバーを運用する場合のみ
iptables -A INPUT -p tcp --dport 53 -j ACCEPT
iptables -A INPUT -p udp --dport 53 -j ACCEPT

# 外部からのTCP80番ポート(HTTP)へのアクセスを許可
# ※Webサーバーを公開する場合のみ
iptables -A INPUT -p tcp --dport 80 -j ACCEPT

# 外部からのTCP443番ポート(HTTPS)へのアクセスを許可
# ※Webサーバーを公開する場合のみ
iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# 外部からのTCP21番ポート(FTP)へのアクセスを日本からのみ許可
# ※FTPサーバーを公開する場合のみ
iptables -A INPUT -p tcp --dport 21 -j ACCEPT_COUNTRY

# 外部からのPASV用ポート(FTP-DATA)へのアクセスを日本からのみ許可
# ※FTPサーバーを公開する場合のみ
# ※PASV用ポート60000:60030は当サイトの設定例
iptables -A INPUT -p tcp --dport 60000:60030 -j ACCEPT_COUNTRY

# 外部からのTCP25番ポート(SMTP)へのアクセスを許可
# ※SMTPサーバーを公開する場合のみ
iptables -A INPUT -p tcp --dport 25 -j ACCEPT

# 外部からのTCP465番ポート(SMTPS)へのアクセスを日本からのみ許可
# ※SMTPSサーバーを公開する場合のみ
iptables -A INPUT -p tcp --dport 465 -j ACCEPT_COUNTRY

# 外部からのTCP110番ポート(POP3)へのアクセスを日本からのみ許可
# ※POP3サーバーを公開する場合のみ
iptables -A INPUT -p tcp --dport 110 -j ACCEPT_COUNTRY

# 外部からのTCP995番ポート(POP3S)へのアクセスを日本からのみ許可
# ※POP3Sサーバーを公開する場合のみ
iptables -A INPUT -p tcp --dport 995 -j ACCEPT_COUNTRY

# 外部からのTCP143番ポート(IMAP)へのアクセスを日本からのみ許可
# ※IMAPサーバーを公開する場合のみ
iptables -A INPUT -p tcp --dport 143 -j ACCEPT_COUNTRY

# 外部からのTCP993番ポート(IMAPS)へのアクセスを日本からのみ許可
# ※IMAPSサーバーを公開する場合のみ
iptables -A INPUT -p tcp --dport 993 -j ACCEPT_COUNTRY

# 外部からのUDP1194番ポート(OpenVPN)へのアクセスを日本からのみ許可
# ※OpenVPNサーバーを公開する場合のみ
iptables -A INPUT -p udp --dport 1194 -j ACCEPT_COUNTRY

# VPNインタフェース用ファイアウォール設定
# ※OpenVPNサーバーを公開する場合のみ
[ -f /etc/openvpn/openvpn-startup ] && /etc/openvpn/openvpn-startup

#----------------------------------------------------------#
# 各種サービスを公開する場合の設定(ここまで)               #
#----------------------------------------------------------#

# 拒否IPアドレスからのアクセスはログを記録せずに破棄
# ※拒否IPアドレスは/root/deny_ipに1行ごとに記述しておくこと
# (/root/deny_ipがなければなにもしない)
if [ -s /root/deny_ip ]; then
    for ip in `cat /root/deny_ip`
    do
        iptables -I INPUT -s $ip -j DROP
    done
fi

# 上記のルールにマッチしなかったアクセスはログを記録して破棄
iptables -A INPUT -m limit --limit 1/s -j LOG --log-prefix '[IPTABLES INPUT] : '
iptables -A INPUT -j DROP
iptables -A FORWARD -m limit --limit 1/s -j LOG --log-prefix '[IPTABLES FORWARD] : '
iptables -A FORWARD -j DROP

# サーバー再起動時にも上記設定が有効となるようにルールを保存
/etc/rc.d/init.d/iptables save

# ファイアウォール起動
/etc/rc.d/init.d/iptables start
{% endhighlight %}

### 2. ファイアウォール設定スクリプト外部関数作成

ファイアウォール設定スクリプト内で使用する外部関数用ファイルを以下のように作成する。

File: `iptables_functions`

{% highlight bash linenos %}
# IPアドレスリスト取得関数定義
IPLISTGET(){
    # http://nami.jp/ipv4bycc/から最新版IPアドレスリストを取得する
    wget -q http://nami.jp/ipv4bycc/cidr.txt.gz
    gunzip cidr.txt.gz
    # 最新版IPアドレスリストが取得できなかった場合
    if [ ! -f cidr.txt ]; then
        if [ -f /tmp/cidr.txt ]; then
            # バックアップがある場合はその旨をroot宛にメール通知して処理を打ち切る
            echo cidr.txt was read from the backup! | mail -s $0 root
            return
        else
            # バックアップがない場合はその旨をroot宛にメール通知して処理を打ち切る
            echo cidr.txt not found!|mail -s $0 root
            exit 1
        fi
    fi
    # 最新版IPアドレスリストを /tmpへバックアップする
    /bin/mv cidr.txt /tmp/cidr.txt
}
{% endhighlight %}

### 3. IP アドレスリストチェックスクリプト作成

IP アドレスリストチェックスクリプトを以下のように作成する。

File: `/etc/cron.daily/iplist_check.sh`

{% highlight bash linenos %}
#!/bin/bash

PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin

# 新旧IPLIST差分チェック件数(0を指定するとチェックしない)
# ※新旧IPLIST差分がSABUN_CHKで指定した件数を越える場合はiptables設定スクリプトを実行しない
# ※新旧IPLIST差分チェック理由はhttp://centossrv.com/bbshtml/webpatio/1592.shtmlを参照
SABUN_CHK=9999
[ $# -ne 0 ] && SABUN_CHK=${1}

# チェック国コード
COUNTRY_CODE='JP CN TW RU'

# iptables設定スクリプトパス
IPTABLES=/root/iptables.sh

# iptables設定スクリプト外部関数取り込み
. /root/iptables_functions

# IPアドレスリスト最新化
rm -f IPLIST.new
IPLISTGET
for country in $COUNTRY_CODE
do
    if [ -f /tmp/cidr.txt ]; then
        grep ^$country /tmp/cidr.txt >> IPLIST.new
    else
        grep ^$country /tmp/IPLIST >> IPLIST.new
    fi
done
[ ! -f /tmp/IPLIST ] && cp IPLIST.new /tmp/IPLIST

# IPアドレスリスト更新チェック
diff -q /tmp/IPLIST IPLIST.new > /dev/null 2>&1
if [ $? -ne 0 ]; then
    if [ ${SABUN_CHK} -ne 0 ]; then
        if [ $(diff /tmp/IPLIST IPLIST.new | egrep -c '<|>') -gt ${SABUN_CHK} ]; then
            (
             diff /tmp/IPLIST IPLIST.new
             echo
             echo "$IPTABLES not executed."
            ) | mail -s 'IPLIST UPDATE' root
            rm -f IPLIST.new
            exit
        fi
    fi
    /bin/mv IPLIST.new /tmp/IPLIST
    sh $IPTABLES > /dev/null
else
    rm -f IPLIST.new
fi
{% endhighlight %}

### 4. IP アドレスリストチェックスクリプト権限設定

IP アドレスリストチェックスクリプトに実行権限を付与する。

``` text
# chmod +x /etc/cron.daily/iplist_check.sh
```

### 5. iptables 起動

以下のようにして iptables を起動する。

``` text
# sh iptables.sh
iptables: ファイアウォールのルールを /etc/sysconfig/iptable[  OK  ]中:
iptables: ファイアウォールルールを適用中:                  [  OK  ]
```

### 6. iptables 自動起動設定

マシン起動時に iptables が自動で起動するよう設定する。

``` text
# chkconfig iptables on
# chkconfig --list iptables     # <= 2,3,4,5 が "on" であることを確認
iptables        0:off   1:off   2:on    3:on    4:on    5:on    6:off
```

### 参考サイト

- [CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")

---

次回は、DNS サーバ BIND の構築について紹介する予定です。

以上。

