---
layout   : single
title: 'LMDE2 - NetworkManager を使用しないネットワーク設定！'
published: true
date     : 2017-07-14 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- LMDE2
- LinuxMint
---

通常、 LMDE2 (Linux Mint Debian Edition 2) をインストールすると、 NetworkManager もデフォルトで起動するようになっているはずです。（他の Linux ディストリビューションの GUI 環境も同様のはず）

サーバ用途で使用したい場合など、 NetworkManager でなく `/etc/network/interfaces` でネットワーク設定したいことがあると思います。

以下、その方法についての記録です。

<!--more-->

### 0. 前提条件

* LMDE2 (Linux Mint Debian Edition 2; 64bit) での作業を想定。

### 1. 設定ファイルの編集

これまでずっと NetworkManager で管理していた場合は "/etc/network/interfaces" ファイルに詳細な設定が記述されてないはずなので、以下のように記述を追加する。（以下は一例）

File: `/etc/network/interfaces`

{% highlight bash linenos %}
# interfaces(5) file used by ifup(8) and ifdown(8)
# Include files from /etc/network/interfaces.d:
source-directory /etc/network/interfaces.d

# ==========
# 以下を追加
# ==========

# The loopback network interface
auto lo
iface lo inet loopback

# The primary network interface
auto eth0

iface eth0 inet static
    address         192.168.1.3    # マシンのIPアドレス
    network         192.168.1.0    # ネットワークアドレス
    netmask         255.255.255.0  # ネットマスク
    broadcast       192.168.1.255  # ブロードキャストアドレス
    gateway         192.168.1.1    # ゲートウェイ（通常、ルータのIPアドレス）
    dns-nameservers 192.168.1.2    # DNS サーバの IP アドレス（手前にDNSサーバがなければルータのIPアドレス）
    dns-search      foo-bar.com    # DNS 検索（１個だけなら dns-domain でもよい）
    mtu             1454           # MTU 値（必要であれば）
{% endhighlight %}

IPv6 を使用しないのであれば、 "/etc/sysctl.conf" に以下の記述を追加する。

File: `/etc/sysctl.conf`

{% highlight bash linenos %}
net.ipv6.conf.all.disable_ipv6 = 1  # <= 最終行に追加
{% endhighlight %}

### 2. NetworkManager の停止

``` text
$ sudo service network-manager stop
```

### 3. NetworkManager 自動起動の停止

``` text
$ sudo update-rc.d -f network-manager remove
```

### 4. ネットワークの起動

``` text
$ sudo service networking start
```

起動時に以下のようなエラーになる場合は、

``` text
Configuring network interfaces...RTNETLINK answers: File exists
Failed to bring up eth0.
done.
```

一旦、以下を実行してから、再度ネットワークの起動を試みる。

``` text
$ sudo ip addr flush dev eth0
```

さらに、起動時に以下のような警告が出力される場合は、

``` text
Configuring network interfaces.../etc/resolvconf/update.d/libc: Warning: /etc/resolv.conf is not a symbolic link to /etc/resolvconf/run/resolv.conf
done.
```

シンボリックリンクが指定のものと異なることが原因なので、以下を実行してから、再度ネットワークの起動を試みる。（当方は、 `/run/resolvconf/resolv.conf` にリンクが張られていた）

``` text
$ sudo rm -f /etc/resolv.conf
$ sudo ln -s /etc/resolvconf/run/resolv.conf /etc/resolv.conf
$ sudo resolvconf -u
```

### 5. タスクアイコンの非表示

NetworkManager を起動しなくしても、 NetworkManager アプレットがタスクアイコンを表示してしまうので、「自動起動するアプリの設定」で「ネットワーク（ネットワーク接続を管理）」のチェックを外す。

これで、次回システム起動（ログイン）時からタスクアイコンも表示されなくなる。（すぐに非表示にしたければ、 `nm-applet` プロセスを KILL すればよい）

### 6. 確認

`ifconfig` コマンド（もしくは `ip a`）で確認してみる。  
その他、正常に通信できるか確認してみる。（`ping` してみたり、 Web ブラウザでページを表示してみたり）

``` text
$ ifconfig
eth0      Link encap:イーサネット  ハードウェアアドレス 00:23:54:7f:20:31
          inetアドレス:192.168.1.3 ブロードキャスト:192.168.1.255  マスク:255.255.255.0
          UP BROADCAST RUNNING MULTICAST  MTU:1454  メトリック:1
          RXパケット:382933 エラー:0 損失:0 オーバラン:0 フレーム:0
          TXパケット:379079 エラー:0 損失:0 オーバラン:0 キャリア:0
      衝突(Collisions):0 TXキュー長:1000
          RXバイト:41541136 (39.6 MiB)  TXバイト:26349142 (25.1 MiB)
          割り込み:17

lo        Link encap:ローカルループバック
          inetアドレス:127.0.0.1 マスク:255.0.0.0
          UP LOOPBACK RUNNING  MTU:65536  メトリック:1
          RXパケット:4368 エラー:0 損失:0 オーバラン:0 フレーム:0
          TXパケット:4368 エラー:0 損失:0 オーバラン:0 キャリア:0
      衝突(Collisions):0 TXキュー長:0
          RXバイト:365949 (357.3 KiB)  TXバイト:365949 (357.3 KiB)
```

---

以上。

