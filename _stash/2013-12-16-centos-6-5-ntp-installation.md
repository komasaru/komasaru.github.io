---
layout   : single
title    : "CentOS 6.5 - NTP サーバ構築！"
published: true
date     : 2013-12-16 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- NTP
---

前回は CentOS 6.5 サーバに SSH サーバ OpenSSH をインストールしました。  
今回は NTP サーバのインストールを行います。

<!--more-->

### 0. 前提条件

- CentOS 6.5(x86_64) を Minimal で最小インストールしている。
- クライントマシンは Linux Mint 14(64bit) を想定。
- 主に「[CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")」を参考にしている。  
  （実際は、過去にこのサイトを参考にして作業した際に記録していたものを参照している）

### 1. NTP サーバインストール

NTP サーバをインストールする。（最近はデフォルトでインストールされている）

``` text
# yum -y install ntp
```

### 2. NTP サーバ設定ファイル編集

以下のように編集する。（同期するサーバは適宜変更）

File: `/etc/ntp.conf`

{% highlight bash linenos %}
# Hosts on local network are less restricted.
#restrict 192.168.1.0 mask 255.255.255.0 nomodify notrap
restrict 192.168.11.0 mask 255.255.255.0 nomodify notrap  # <= 追加（内部からの時刻同期を許可）

# Use public servers from the pool.ntp.org project.
# Please consider joining the pool (http://www.pool.ntp.org/join.html).
#server 0.rhel.pool.ntp.org
#server 1.rhel.pool.ntp.org
#server 2.rhel.pool.ntp.org
server ntp1.jst.mfeed.ad.jp  # <= 追加
server ntp2.jst.mfeed.ad.jp  # <= 追加
server ntp3.jst.mfeed.ad.jp  # <= 追加
{% endhighlight %}

### 3. 手動時刻調整

NTP サーバ起動時に大幅に時刻がずれていると、NTP サーバの起動に失敗するので、一度手動で時刻を調整する。

``` text
# ntpdate ntp.nict.jp
 7 Dec 21:55:01 ntpdate[4287]: step time server 133.243.238.244 offset 32402.306325 sec
```

### 4. NTP サーバ軌道

``` text
# /etc/rc.d/init.d/ntpd start
ntpd を起動中:                                             [  OK  ]
```

### 5. NTP サーバ自動起動設定

``` text
# chkconfig ntpd on
# chkconfig --list ntpd  # <= 2,3,4,5 が "on" であることを確認
ntpd            0:off   1:off   2:on    3:on    4:on    5:on    6:off
```

### 6. 時刻同期状態確認

NTP サーバ起動後10分くらいしてから、時刻が同期されているか確認してみる。

``` text
# ntpq -p
     remote           refid      st t when poll reach   delay   offset  jitter
==============================================================================
+ntp1.jst.mfeed. 172.29.2.50      2 u   43   64  377   32.406   51.093  25.477
*ntp2.jst.mfeed. 172.29.2.50      2 u   50   64  377   32.075   35.960   8.336
+ntp3.jst.mfeed. 172.29.3.50      2 u   49   64  377   32.716   27.615  14.455
```

- 行頭の `+` は、接続テストに合格し、いつでも参照可能なサーバ。
- 行頭の `+` は、同期中であると宣言されたサーバ。

### 参考サイト

- [CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")

---

次回は、ファイル改ざん検知システム Tripwire 導入について紹介する予定です。

以上。

