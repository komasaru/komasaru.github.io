---
layout   : single
title    : "FreeBSD 10.0 - NTP サーバ ntpd 設定！"
published: true
date     : 2014-10-26 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- FreeBSD
- NTP
---

「FreeBSD 10.0 - NTP サーバ 設定」についての記録です。

（旧バージョンでの個人の作業記録を更新しました。興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* 以下の作業は、リモート接続して行う。（リモートから `ssh vbox` で接続）
* リモート端末は、 Linux Mint 17 マシンを想定しているが、 Unix 系 OS なら同じ。
* 設定ファイル等のテキストファイルの編集には `vi` コマンドを使用。
* 作業はリモート接続で一般ユーザから root になって行う。
* 主に[FreeBSDサーバー構築マニュアル](http://freebsd.server-manual.com/ "FreeBSDサーバー構築マニュアル")を参照。

### 1. 設定ファイル編集

念の為、オリジナルの設定ファイルを退避。

``` text
# cp /etc/ntp.conf /etc/ntp.conf.org
```

そして、編集。

File: `/etc/ntp.conf`

{% highlight bash linenos %}
#server 0.freebsd.pool.ntp.org iburst  # <= コメント化
#server 1.freebsd.pool.ntp.org iburst  # <= コメント化
#server 2.freebsd.pool.ntp.org iburst  # <= コメント化
#server 3.freebsd.pool.ntp.org iburst  # <= コメント化
server ntp1.jst.mfeed.ad.jp            # <= 追加
server ntp2.jst.mfeed.ad.jp            # <= 追加
server ntp3.jst.mfeed.ad.jp            # <= 追加
{% endhighlight %}

### 2. 時刻調整

一旦、 `ntpdate` コマンドでマシンの時刻を手動調整。（マシンの時刻が大幅に狂っていると `ntpd` が正常に作動しないため）

``` text
# ntpdate -u ntp1.jst.mfeed.ad.jp
 8 Oct 23:27:48 ntpdate[897]: no server suitable for synchronization found
```

### 3. 自動起動設定

File: `/etc/rc.conf`

{% highlight bash linenos %}
ntpd_enable="YES"  # <= 追加
{% endhighlight %}

### 4. NTPd 起動

（ファイアウォール設定で外部 NTP からの戻りパケットを許可するようにしていることを確認して）

``` text
# /etc/rc.d/ntpd start
Starting ntpd.
```

### 5. 同期確認

しばらく（5〜10分くらい）待ってから、時刻が同期されているか確認。

``` text
# ntpq -p
     remote           refid      st t when poll reach   delay   offset  jitter
==============================================================================
*ntp1.jst.mfeed. 172.29.2.50      2 u   29   64  377   35.445    2.034  55.150
+ntp2.jst.mfeed. 172.29.3.60      2 u   28   64  377   35.945    2.540  39.235
+ntp3.jst.mfeed. 172.16.177.60    2 u   28   64  377   36.618    2.861  17.223
```

各行１カラム目について、

* `*` 同期中であると宣言されたサーバ
* `+` 接続テストに合格し、いつでも参照可能なサーバ
* `-` クラスタリング検査で捨てられたサーバ
* ` ` 距離が遠くて捨てられたサーバ
* etc.

---

以上。

