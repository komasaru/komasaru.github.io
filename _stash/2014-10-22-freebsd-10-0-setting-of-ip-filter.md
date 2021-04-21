---
layout   : single
title    : "FreeBSD 10.0 - ファイアウォール IP Filter 設定！"
published: true
date     : 2014-10-22 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- FreeBSD
- ファイアウォール
---

「FreeBSD 10.0 - ファイアウォール IP Filter 設定」についての記録です。

（旧バージョンでの個人の作業記録を更新しました。興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* 以下の作業は、リモート接続して行う。（リモートから `ssh vbox` で接続）
* リモート端末は、 Linux Mint 17 マシンを想定しているが、 Unix 系 OS なら同じ。
* 設定ファイル等のテキストファイルの編集には `vi` コマンドを使用。
* 作業はリモート接続で一般ユーザから root になって行う。
* マシンのローカル IP アドレスは 192.168.11.102, ネットマスクは 255.255.255.0 を想定。
* 参考までに、FreeBSD には IP Filter `ipf` の他に IP Firewall `ipfw` 等のファイウォール（パケットフィルタリング）もある。
* 主に[FreeBSDサーバー構築マニュアル](http://freebsd.server-manual.com/ "FreeBSDサーバー構築マニュアル")を参照。

### 1. ipl モジュールのロード

ipl モジュールをロード。

``` text
# kldload ipl
```

ipl モジュールが有効になっている（"ipl.ko" が存在する）ことを確認。

``` text
# kldstat
Id Refs Address            Size     Name
 1    3 0xffffffff80200000 15f0430  kernel
 2    1 0xffffffff81a12000 4cc39    ipl.ko
```

起動時に有効化するよう設定。（以下を追記）

File: `/boot/loader.conf`

{% highlight bash linenos %}
ipl_load="YES"
{% endhighlight %}

### 2. IP Filter 有効化

マシン起動時に IP Filter が有効化するよう設定。（以下を追記）

File: `/etc/rc.conf`

{% highlight bash linenos %}
ipfilter_enable="YES"             # <= IP Filter の有効化
ipfilter_rules="/etc/ipf.rules"   # <= IP Filter ルール設定ファイルの指定
ipfilter_flags=""                 # <= IP Filter 実行時オプションの指定
ipmon_enable="YES"                # <= IP Filter ログ機能の有効化
ipmon_flags="-D /var/log/ipflog"  # <= IP Filter ログ機能実行時オプションの指定
{% endhighlight %}

### 3. 最小フィルタルールセット生成

フィルタリングルールの作成の参考にするためのルールセットを用意されている作成例から生成。  
（IPv6 を使用しないので `grep -v inet6` でその部分は除外）

``` text
# perl /usr/share/examples/ipfilter/mkfilters | grep -v inet6 > /etc/ipf.rules.sample
```

ファイルの内容を確認。

File: `/etc/ipf.rules.sample`

{% highlight bash linenos %}
#
# The following routes should be configured, if not already:
#
#
block in log quick from any to any with ipopts
block in log quick proto tcp from any to any with short
pass out on em0 all head 150
block out from 127.0.0.0/8 to any group 150
block out from any to 127.0.0.0/8 group 150
pass in on em0 all head 100
block in from 127.0.0.0/8 to any group 100
{% endhighlight %}

### 4. フィルタリングルール設定

前項のフィルタルールセットを参考にフィルタリングルールを作成。  
（以下は一例であり、実際にはサーバを公開する際に公開するものだけを指定するようにする）

File: `/etc/ipf.rules`

{% highlight bash linenos %}
#
# The following routes should be configured, if not already:
#
#

# 不正なIPパケットを全て拒否してログに記録
block in log quick from any to any with ipopts
block in log quick proto tcp from any to any with short

# ========================================
# 外部 => 内部 (Group: 100)
# ----------------------------------------
pass in on em0 all head 100

# アドレス偽装防止
block in from 127.0.0.0/8 to any group 100
block in from 192.168.11.102/32 to any group 100

# UDP パケットはデフォルトで拒否
block in proto udp all group 100

# 接続が確立されたパケットの通過を許可
pass in quick proto tcp all flags A/A group 100

# IDENT には答えない
block return-rst in quick proto tcp from any to any port = 113 group 100

# FTP (20, 21) を公開する場合
pass in quick proto tcp from any to any port = 20 flags S/SA keep state group 100
pass in quick proto tcp from any to any port = 21 flags S/SA keep state group 100

# SSH (22) を公開する場合
pass in quick proto tcp from any to any port = 22 flags S/SA group 100

# SMTP (25) を公開する場合
pass in quick proto tcp from any to any port = 25 flags S/SA group 100

# DNS (53) を公開する場合
pass in quick proto tcp from any to any port = 53 flags S/SA group 100
pass in quick proto udp from any to any port = 53 group 100

# HTTP (80) を公開する場合
pass in quick proto tcp from any to any port = 80 flags S/SA group 100

# POP3 (110) を公開する場合
pass in quick proto tcp from any to any port = 110 flags S/SA group 100

# IMAP (143) を公開する場合
pass in quick proto tcp from any to any port = 143 flags S/SA group 100

# HTTPS (443) を公開する場合
pass in quick proto tcp from any to any port = 443 flags S/SA group 100

# SMTPS (465) を公開する場合
pass in quick proto tcp from any to any port = 465 flags S/SA group 100

# IMAPS (993) を公開する場合
pass in quick proto tcp from any to any port = 993 flags S/SA group 100

# POP3S (995) を公開する場合
pass in quick proto tcp from any to any port = 995 flags S/SA group 100

# FTP PASV (4000 - 4005) を公開する場合
pass in quick proto tcp from any to any port 4000 >< 4005 flags S/SA keep state group 100

# その他の外部からの TCP 接続を拒否＆ログ出力
block in log quick proto tcp all flags S/SA group 100

# DNS (53)  - 外部 DNS からの戻りパケット
pass in proto udp from any port = 53 to any group 100

# NTP (123) - 外部 NTP からの戻りパケット
pass in proto udp from any port = 123 to any group 100

# 内部 => 外部 ping を許可
block in log quick proto icmp all group 100
pass in log quick proto icmp all icmp-type 0 group 100

# RFC2979
pass in proto icmp all icmp-type 3 group 100

# ========================================
# 内部 => 外部 (Group: 150)
# ----------------------------------------
pass out on em0 all head 150

# アドレス偽装防止
block out from 127.0.0.0/8 to any group 150
block out from any to 127.0.0.0/8 group 150
block out from any to 192.168.11.102/32 group 150

# ========================================
# Loopback (Group: 0)
# ----------------------------------------
pass in quick on lo0 all
pass out quick on lo0 all
{% endhighlight %}

### 5. 設定反映

``` text
# ipf -Fa -Z -f /etc/ipf.rules
bad packets:            in 0    out 0
 input packets:         blocked 2 passed 639 nomatch 1 counted 0
output packets:         blocked 0 passed 376 nomatch 1 counted 0
 input packets logged:  blocked 0 passed 0
output packets logged:  blocked 0 passed 0
```

### 6. フィルタリングルール確認

`-io` は入出力全てを確認するオプション。入力だけなら `-i`、出力だけなら `-o` とする。

``` text
# ipfstat -io
pass out on em0 all head 150
pass out quick on lo0 all
block out inet from 127.0.0.0/8 to any group 150
block out inet from any to 127.0.0.0/8 group 150
block out inet from any to 192.168.11.102/32 group 150
block in log quick from any to any with ipopts
block in log quick proto tcp from any to any with short
pass in on em0 all head 100
pass in quick on lo0 all
block in inet from 127.0.0.0/8 to any group 100
block in inet from 192.168.11.102/32 to any group 100
block in proto udp from any to any group 100
pass in quick proto tcp from any to any flags A/A group 100
block return-rst in quick proto tcp from any to any port = auth group 100
pass in quick proto tcp from any to any port = ftp-data flags S/SA keep state group 100
pass in quick proto tcp from any to any port = ftp flags S/SA keep state group 100
pass in quick proto tcp from any to any port = 22 flags S/SA group 100
pass in quick proto tcp from any to any port = smtp flags S/SA group 100
pass in quick proto tcp from any to any port = domain flags S/SA group 100
pass in quick proto udp from any to any port = domain group 100
pass in quick proto tcp from any to any port = http flags S/SA group 100
pass in quick proto tcp from any to any port = pop3 flags S/SA group 100
pass in quick proto tcp from any to any port = imap flags S/SA group 100
pass in quick proto tcp from any to any port = https flags S/SA group 100
pass in quick proto tcp from any to any port = smtps flags S/SA group 100
pass in quick proto tcp from any to any port = imaps flags S/SA group 100
pass in quick proto tcp from any to any port = pop3s flags S/SA group 100
pass in quick proto tcp from any to any port 4000 >< 4005 flags S/SA keep state group 100
block in log quick proto tcp from any to any flags S/SA group 100
pass in proto udp from any port = domain to any group 100
pass in proto udp from any port = ntp to any group 100
block in log quick proto icmp from any to any group 100
pass in log quick inet proto icmp from any to any icmp-type echorep group 100
pass in inet proto icmp from any to any icmp-type unreach group 100
```

### 7. フィルタリングルールを削除する場合

``` text
# ipf -Fa
# ipfstat -io
# empty list for ipfilter(out)
# empty list for ipfilter(in)
```

---

以上。

