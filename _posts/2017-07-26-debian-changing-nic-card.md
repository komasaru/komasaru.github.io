---
layout   : single
title: 'Debian - LANカード(NIC)の増設＆変更！'
published: true
date     : 2017-07-26 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
- Debian
---

Debian GNU/Linux 8 系がインストールされたマシンに LAN カード (NIC) を増設し、これまで使用していたオンボードの LAN カードから変更する方法についてです。

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 8.6 Jessie (64bit) での作業を想定。（Debian 系は同様のはず）
* オンボード LAN 搭載のマザーボードに別の LAN カードを増設済み。
* NIC をオンボードから増設済みのものに変更することを想定。
* Debian 9 Stretch を新規にインストールした場合は、ネットワークの設定方法や NIC インタフェースの命名仕様が異なるので注意。  
  （Debian 9 Stretch にアップグレードした場合は、それまでのネットワーク設定方法等が引き継がれる。そして、 Debian 10 ではその方法も廃止される）

### 1. 設定のバックアップ

必要であれば、既存の設定ファイルをバックアップしておく。

``` text
# cp -i /etc/network/interfaces{,.bak}
# cp -i /etc/udev/rules.d/70-persistent-net.rules{,.bak}
```

### 2. MAC アドレスの確認

ここで増設した LAN カードが表示されない場合、 LAN カードが認識されていない可能性があるので、別途認識させる作業を行う必要がある。（ここでは説明しない）

``` text
# env LANG=C ifconfig -a | grep HWaddr
eth0      Link encap:Ethernet  HWaddr 00:1c:c1:55:af:6d
eth1      Link encap:Ethernet  HWaddr 00:1d:74:88:be:e0
```

* `eth0` が既存のオンボード LAN, `eth1` が増設した LAN カード。
* 上記の MAC アドレスはダミー。（セキュリティの関係）

### 3. 設定ファイルの編集

今回は eth0 を eth1 に変更するので、 "/etc/network/interfaces" は `eth0` を `eth1` に変更するだけ。（以下は一例）

File: `/etc/network/interfaces`

{% highlight text linenos %}
# This file describes the network interfaces available on your system
# and how to activate them. For more information, see interfaces(5).

source /etc/network/interfaces.d/*

# The loopback network interface
auto lo
iface lo inet loopback

# The primary network interface
allow-hotplug eth1
iface eth1 inet static
    address 192.168.1.3
    netmask 255.255.255.0
    network 192.168.1.0
    broadcast 192.168.1.255
    gateway 192.168.1.1
    dns-nameservers 192.168.1.2
    dns-search mk-mode.com
{% endhighlight %}

"/etc/udev/rules.d/70-persistent-net.rules" は ATTR を eth1 の MAC アドレスに、 NAME を `eth1` に変更する。

File: `/etc/udev/rules.d/70-persistent-net.rules`

{% highlight text linenos %}
#SUBSYSTEM=="net", ACTION=="add", DRIVERS=="?*", ATTR{address}=="00:1c:c1:55:af:6d", ATTR{dev_id}=="0x0", ATTR{type}=="1", KERNEL=="eth*", NAME="eth0"
SUBSYSTEM=="net", ACTION=="add", DRIVERS=="?*", ATTR{address}=="00:1d:74:88:be:e0", ATTR{dev_id}=="0x0", ATTR{type}=="1", KERNEL=="eth*", NAME="eth1"
{% endhighlight %}

### 4. システムの再起動

設定変更を反映させるためにシステムを再起動する。

### 5. ネットワークの確認

``` text
# ip addr show
```

（`ip addr show` は `ip a` でもよい。※もはや、 `ifconfig` コマンドは非推奨）

---

以上。

