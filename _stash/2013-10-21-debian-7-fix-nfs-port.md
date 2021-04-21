---
layout   : single
title    : "Debian 7 Wheezy - NFS サーバのポート固定！"
published: true
date     : 2013-10-21 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- NFS
---

Debian GNU/Linux 7.1.0 サーバに構築した NFS サーバのポートを固定する方法についての記録です。

NFS サーバは接続の都度ポート番号が変わる仕様になっており、ファイアウォールを運用している場合に都合が悪いからです。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。

<!--more-->

### 0. 前提条件

- Debian GNU/Linux 7.1.0 での作業を想定。
- 接続元のマシンは Linux Mint 14(64bit) を想定。
- NFS サーバ構築済み。  
  （参照：「[Debian 7 Wheezy - NFS サーバ構築！]({{site.baseurl}}/2013/10/20/debian-7-install-nfs "Debian GNU/Linux 7.1.0 - NFS サーバ構築！")」）
- ファイアウォール iptables が構築済み。
  （参照：「[Debian 7 Wheezy - ファイアウォール設定！]({{site.baseurl}}/2013/10/15/debian-7-setting-iptables "Debian GNU/Linux 7.1.0 - ファイアウォール設定！")」）
- 以下で設定するポート番号は[参考サイト](https://wiki.debian.org/SecuringNFS "SecuringNFS - Debian Wiki")によるもであり、任意に設定可能。
- quota は使用していないので、[参考サイト](https://wiki.debian.org/SecuringNFS "SecuringNFS - Debian Wiki")にある quota の設定はしない。

### 1. 前提知識

NFS サーバが使用するポートは以下のとおり。

``` text 
portmapper => TCP: 111, UDP: 111
nfs        => TCP:2049, UDP:2049
statd      => TCP:不定, UDP:不定
mountd     => TCP:不定, UDP:不定
nlockmgrq  => TCP:不定, UDP:不定
```

### 2. statd のポートを固定

statd のポートを固定するには "/etc/default/nfs-common" を以下のようにする。

File: `/etc/default/nfs-common`

{% highlight bash linenos %} 
STATDOPTS="--port 32765 --outgoing-port 32766"
{% endhighlight %}

### 3. mountd のポートを固定

mountd のポートを固定するには "/etc/default/nfs-kernel-server" を以下のようにする。

File: `/etc/default/nfs-kernel-server`

{% highlight bash linenos %} 
RPCMOUNTDOPTS="-p 32767"
{% endhighlight %}

### 4. lockd モジュールの設定

オプション付き lockd モジュールを提供するために、以下のように "/etc/modprobe.d/local.conf" を作成する。

File: `/etc/modprobe.d/local.conf`

{% highlight bash linenos %} 
options lockd nlm_udpport=32768 nlm_tcpport=32768
options nfs callback_tcpport=32764
{% endhighlight %}

### 5. マシン再起動

設定を反映させるため、マシンを再起動する。

``` text 
# shutdown -r now
```

### 6. 設定確認

以下のようにして、RPC 情報（ポートの設定）を確認してみる。

``` text 
# rpcinfo -p
   program vers proto   port  service
    100000    4   tcp    111  portmapper
    100000    3   tcp    111  portmapper
    100000    2   tcp    111  portmapper
    100000    4   udp    111  portmapper
    100000    3   udp    111  portmapper
    100000    2   udp    111  portmapper
    100024    1   udp  32765  status
    100024    1   tcp  32765  status
    100003    2   tcp   2049  nfs
    100003    3   tcp   2049  nfs
    100003    4   tcp   2049  nfs
    100227    2   tcp   2049
    100227    3   tcp   2049
    100003    2   udp   2049  nfs
    100003    3   udp   2049  nfs
    100003    4   udp   2049  nfs
    100227    2   udp   2049
    100227    3   udp   2049
    100021    1   udp  32768  nlockmgr
    100021    3   udp  32768  nlockmgr
    100021    4   udp  32768  nlockmgr
    100021    1   tcp  32768  nlockmgr
    100021    3   tcp  32768  nlockmgr
    100021    4   tcp  32768  nlockmgr
    100005    1   udp  32767  mountd
    100005    1   tcp  32767  mountd
    100005    2   udp  32767  mountd
    100005    2   tcp  32767  mountd
    100005    3   udp  32767  mountd
    100005    3   tcp  32767  mountd
```

### 7. iptables 設定

NFS サーバが使用するポートが固定されたので、iptables でファイアウォールの設定を行う。  
実際には、以下のような記述を "/etc/iptables/rules.v4" に追加する。（当然 reject 設定より上位に）

File: `/etc/iptables/rules.v4`

{% highlight bash linenos %} 
# Allow nfs mounts to local network
-A INPUT -p tcp -m state --state NEW -m multiport --dports 111,2049,32764:32768 -j ACCEPT
-A INPUT -p udp -m state --state NEW -m multiport --dports 111,2049,32764:32768 -j ACCEPT
{% endhighlight %}

### 8. iptables-persistent 再起動

iptables の設定を反映させるために、iptables-persistent を再起動する。  
（IPv6 を無効にしている場合、IPv6 はスキップされる）

``` text 
# /etc/init.d/iptables-persistent restart
Loading iptables rules... IPv4... skipping IPv6 (no rules to load)...done.
```

### 9. 設定確認

設定した内容が反映されているか確認してみる。

``` text 
# iptables -L
Chain INPUT (policy ACCEPT)
target     prot opt source               destination
ACCEPT     all  --  anywhere             anywhere
REJECT     all  --  anywhere             loopback/8           reject-with icmp-port-unreachable
ACCEPT     all  --  anywhere             anywhere             state RELATED,ESTABLISHED
ACCEPT     tcp  --  anywhere             anywhere             tcp dpt:http
ACCEPT     tcp  --  anywhere             anywhere             tcp dpt:https
ACCEPT     tcp  --  anywhere             anywhere             state NEW tcp dpt:9999
ACCEPT     icmp --  anywhere             anywhere             icmp echo-request
LOG        all  --  anywhere             anywhere             limit: avg 5/min burst 5 LOG level debug prefix "iptables denied: "
ACCEPT     tcp  --  anywhere             anywhere             state NEW multiport dports sunrpc,nfs,32764:32768
ACCEPT     udp  --  anywhere             anywhere             state NEW multiport dports sunrpc,nfs,32764:32768
REJECT     all  --  anywhere             anywhere             reject-with icmp-port-unreachable

Chain FORWARD (policy ACCEPT)
target     prot opt source               destination
REJECT     all  --  anywhere             anywhere             reject-with icmp-port-unreachable

Chain OUTPUT (policy ACCEPT)
target     prot opt source               destination
ACCEPT     all  --  anywhere             anywhere
```

また、クライアントマシンでマウントして接続できることも確認しておく。

### 参考サイト

- [SecuringNFS - Debian Wiki](https://wiki.debian.org/SecuringNFS "SecuringNFS - Debian Wiki")

---

以上。

