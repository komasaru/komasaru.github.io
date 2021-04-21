---
layout   : single
title    : "Debian 9 (Stretch) - NFS サーバのポート固定！"
published: true
date     : 2017-08-28 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- NFS
---

Debian GNU/Linux 9 (Stretch) に NFS サーバで使用するポートを固定化する方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 9 (Stretch) での作業を想定。
* 接続元のマシンは LMDE2(Linux Mint Debian Edition 2)(64bit) を想定。
* NFS サーバ構築済み。  
  （参照：「[Debian 9 (Stretch) - NFS サーバ構築！](https://www.mk-mode.com/octopress/2017/08/26/debian-9-nfs-installation/ "Debian 9 (Stretch) - NFS サーバ構築！")」）
* ファイアウォール iptables が構築済み。  
  （参照：「[Debian 9 (Stretch) - ファイアウォール設定！](https://www.mk-mode.com/octopress/2017/08/16/debian-9-firewall-setting/ "Debian 9 (Stretch) - ファイアウォール設定！")」）
* 以下で設定するポート番号は[参考サイト](https://wiki.debian.org/SecuringNFS "SecuringNFS - Debian Wiki")によるものであり、実際は任意に設定可能。
* quota は使用していないので、[参考サイト](https://wiki.debian.org/SecuringNFS "SecuringNFS - Debian Wiki")にある quota の設定はしない。
* root ユーザでの作業を想定。

### 1. 前提知識

NFS サーバが使用するポートは以下のとおり。

``` text
portmapper => TCP: 111, UDP: 111
nfs        => TCP:2049, UDP:2049
statd      => TCP:不定, UDP:不定
mountd     => TCP:不定, UDP:不定
nlockmgrq  => TCP:不定, UDP:不定
```

### 2. statd 用ポートの固定

statd のポートを固定するには "/etc/default/nfs-common" を以下のようにする。

File: `/etc/default/nfs-common`

{% highlight bash linenos %}
STATDOPTS="--port 32765 --outgoing-port 32766"
{% endhighlight %}

### 3. mountd 用ポートの固定

mountd のポートを固定するには "/etc/default/nfs-kernel-server" を以下のようにする。

File: `/etc/default/nfs-kernel-server`

{% highlight bash linenos %}
RPCMOUNTDOPTS="--manage-gids -p 32767"
{% endhighlight %}

### 4. lockd モジュールの設定

オプション付き lockd モジュールを提供するために、以下のように "/etc/modprobe.d/local.conf" を作成する。

File: `/etc/modprobe.d/local.conf`

{% highlight bash linenos %}
options lockd nlm_udpport=32768 nlm_tcpport=32768
options nfs callback_tcpport=32764
{% endhighlight %}

### 5. マシンの再起動

設定を反映させるため、マシンを再起動する。

``` text
# systemctl reboot
```

### 6. 設定の確認

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
    100005    1   udp  32767  mountd
    100005    1   tcp  32767  mountd
    100005    2   udp  32767  mountd
    100005    2   tcp  32767  mountd
    100005    3   udp  32767  mountd
    100005    3   tcp  32767  mountd
    100003    3   tcp   2049  nfs
    100003    4   tcp   2049  nfs
    100227    3   tcp   2049
    100003    3   udp   2049  nfs
    100003    4   udp   2049  nfs
    100227    3   udp   2049
    100021    1   udp  32768  nlockmgr
    100021    3   udp  32768  nlockmgr
    100021    4   udp  32768  nlockmgr
    100021    1   tcp  32768  nlockmgr
    100021    3   tcp  32768  nlockmgr
    100021    4   tcp  32768  nlockmgr
```

### 7. ファイアウォール(ufw)の設定

NFS サーバが使用するポートが固定されたので、ufw でファイアウォールの設定を行う。（以下はローカルネットワーク内からのみアクセス可能にする例）

``` text
# ufw allow proto tcp from 192.168.11.0/24 to any port 111,2049,32765,32767,32768
Rule added
# ufw allow proto udp from 192.168.11.0/24 to any port 111,2049,32765,32767,32768
Rule added
```

確認。

``` text
# ufw status
Status: active

To                         Action      From
--                         ------      ----
3701/tcp                   ALLOW       192.168.11.0/24
53                         ALLOW       Anywhere
21                         ALLOW       Anywhere
111,2049,32765,32767,32768/tcp ALLOW       192.168.11.0/24
111,2049,32765,32767,32768/udp ALLOW       192.168.11.0/24
```

### 8. 動作確認

クライアントマシンでマウントして接続できることも確認しておく。

### 9. 参考サイト

* [SecuringNFS - Debian Wiki](https://wiki.debian.org/SecuringNFS "SecuringNFS - Debian Wiki")

---

以上。

