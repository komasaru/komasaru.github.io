---
layout   : single
title    : "Linux - MTU 最適値の導出！"
published: true
date     : 2015-11-26 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
---

Linux で最適な MTU 値を導出する方法についての備忘録です。

<!--more-->

### 1. MTU について

MTU とは Maximum Transmission Unit の略で、ネットワーク上において１フレーム（１回の転送）で送信可能な IP パケットの最大サイズのこと。  
（このサイズは IP ヘッダ ＋ ICMP ヘッダ ＋ データのサイズ）

### 2. MTU 現在値の確認

``` text
$ ifconfig
ifconfig
eth0      Link encap:イーサネット  ハードウェアアドレス XX:XX:XX:XX:XX:XX
          inetアドレス:192.168.XXX.XXX  ブロードキャスト:192.168.XXX.255  マスク:255.255.255.0
          UP BROADCAST RUNNING MULTICAST  MTU:1500  メトリック:1
          RXパケット:49793411 エラー:0 損失:0 オーバラン:0 フレーム:0
          TXパケット:30012458 エラー:0 損失:0 オーバラン:0 キャリア:0
          衝突(Collisions):0 TXキュー長:1000
          RXバイト:23207684202 (23.2 GB)  TXバイト:21221894153 (21.2 GB)
          割り込み:17

lo        Link encap:ローカルループバック
          inetアドレス:127.0.0.1  マスク:255.0.0.0
          UP LOOPBACK RUNNING  MTU:65536  メトリック:1
          RXパケット:27117491 エラー:0 損失:0 オーバラン:0 フレーム:0
          TXパケット:27117491 エラー:0 損失:0 オーバラン:0 キャリア:0
          衝突(Collisions):0 TXキュー長:0
          RXバイト:32672340989 (32.6 GB)  TXバイト:32672340989 (32.6 GB)
```

eth0 の MTU 値が `1500` となっている。

### 3. MTU 最適値の導出

要は、様々なサイズのパケット（データ）を断片化せずに送信してみてロスしない最大値を求めればよい。  
但し、「IP ヘッダ ＋ ICMP ヘッダ」が「28 バイト」あるので、 MTU に設定する値は +28 したものになる。
（送信先は存在する URL ならどこでもよい）

では、実際に導出作業を行なってみる。（大体の目星をつけて作業を行うとよいだろう）

以下では `ping` コマンドを使用するがオプションは次のとおり。

* `-c 1` は、リクエスト回数を１回に設定するオプション
* `-s 9999` は、送信パケットサイズを 9999 に設定するオプション
* `-M do` は、パケットの断片化を行わないオプション

まず、パケットサイズ 1400 バイトで送信してみる。

``` text
# ping -c 1 -s 1400 -M do www.linuxmint.com
PING www.linuxmint.com (213.175.215.218) 1400(1428) bytes of data.
1408 bytes from forums.linuxmint.com (213.175.215.218): icmp_seq=1 ttl=49 time=308 ms

--- www.linuxmint.com ping statistics ---
1 packets transmitted, 1 received, 0% packet loss, time 0ms
rtt min/avg/max/mdev = 308.674/308.674/308.674/0.000 ms
```

`1 received, 0% packet loss` なので、正常に送信できているということ。

次に、パケットサイズ 1500 バイトで送信してみる。

``` text
$ ping -c 1 -s 1500 -M do www.linuxmint.com
PING www.linuxmint.com (213.175.215.218) 1500(1528) bytes of data.
ping: local error: Message too long, mtu=1454

--- www.linuxmint.com ping statistics ---
1 packets transmitted, 0 received, +1 errors, 100% packet loss, time 0ms
```

`0 received, +1 errors, 100% packet loss` なので、送信に失敗しているということ。

このように、パケットサイズを変更しながら絞り込んでいく。

今回の当方の環境の場合、パケットサイズ「1426 バイト」が正常に送信できる最大値であった。

よって、 MTU 値は IP ヘッダ ＋ ICMP ヘッダの 28 バイトをプラスした「1454 バイト」となる。  
（ちなみに、この値は今回の当方の環境ではよく知られている最適な MTU 値）

### 4. MTU 値の変更

後は、MTU 値を前項で導出した値に変更すればよい。

``` text
$ ifconfig eth0 mtu 1454
```

但し、この設定は一時的なものなのでマシンを再起動すると元に戻ってしまう。

恒久的に変更するには、ネットワーク接続の編集の画面で MTU 値を「自動（もしくは、何らかの数値）」から変更、もしくは設定ファイル "/etc/NetworkManager/system-connections/Wired\ connection\ 1" 等を編集し、再起動（ネットワーク再接続）する。（Linux Mint 等の場合）

ちなみに、 CentOS の CUI ベースなら "/etc/sysconfig/network-scripts/ifcfg-eth0" 等を編集して再起動する。

---

それほどネットワーク周りが改善されたと体感できないかもしれませんが、最適化しないよりはした方がよいでしょう。

以上。

