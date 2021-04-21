---
layout   : single
title    : "Debian 7 Wheezy - NTP サーバ構築！"
published: true
date     : 2013-10-13 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- NTP
---

Debian GNU/Linux 7.1.0 に NTP サーバを構築する方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。

<!--more-->

### 0. 前提条件

- 「[Debian 7 Wheezy - インストール（サーバ用途・最小構成）！]({{site.baseurl}}/2013/10/09/debian-7-install-for-small-server "Debian 7 Wheezy - インストール（サーバ用途・最小構成）！")」の方法でインストールが完了していることを想定。
- 「[Debian 7 Wheezy - サーバ初期設定！]({{site.baseurl}}/2013/10/10/debian-7-setting "Debian 7 Wheezy - サーバ初期設定")」の方法で初期設定が完了していることを想定。
- ファイルの内容を編集する際、`vi` コマンドを入力する部分については省略。ファイルの内容を表示するのみとする。
- ローカルネットワークは `192.168.11.0/24` とする。

### 1. NTP サーバインストール

よくある方法だが、以下のようにして NTP サーバをインストールする。

``` text 
# aptitude -y install ntp
```

### 2. 設定ファイル編集

以下のようにして、設定ファイルを編集する。

File: `/etc/ntp.conf`

{% highlight bash linenos %} 
# 時刻同期先 NTP サーバを日本国内の主要な NTP サーバに変更
# server 0.debian.pool.ntp.org iburst
# server 1.debian.pool.ntp.org iburst
# server 2.debian.pool.ntp.org iburst
# server 3.debian.pool.ntp.org iburst
server ntp1.jst.mfeed.ad.jp
server ntp2.jst.mfeed.ad.jp
server ntp3.jst.mfeed.ad.jp

# 時刻同期を許可する内部範囲を追加
restrict 192.168.11.0 mask 255.255.255.0 nomodify notrap
{% endhighlight %}

### 3. NTP サーバの再起動

NTP サーバインストール直後は起動した状態になっているので、変更を有効化するために再起動する。

``` text 
# /etc/init.d/ntp restart
[ ok ] Stopping NTP server: ntpd.
[ ok ] Starting NTP server: ntpd.
```

### 4. NTP サーバ同期確認

構築した NTP サーバが正常に同期できているか、確認する。

``` text 
# ntpq -p
     remote           refid      st t when poll reach   delay   offset  jitter
==============================================================================
 ntp1.jst.mfeed. 172.29.2.50      2 u   34   64    1   34.190    1.750   0.000
 ntp2.jst.mfeed. 172.29.3.50      2 u   34   64    1   32.861    1.491   0.000
 ntp3.jst.mfeed. 172.29.3.50      2 u   33   64    1   32.629    1.961   0.000
```

再起動直後は同期できていないので、約10分後に再度確認してみる。

``` text 
# ntpq -p
     remote           refid      st t when poll reach   delay   offset  jitter
==============================================================================
*ntp1.jst.mfeed. 172.29.2.50      2 u   23   64  377   32.706    1.747   0.347
 ntp2.jst.mfeed. 172.29.3.50      2 u   23   64  377   32.481    1.566   0.729
 ntp3.jst.mfeed. 172.29.3.50      2 u   22   64  377   32.528    1.827   0.541
```

行頭に、"*"（同期中であると宣言されたサーバ）か "+"（接続テストに合格し、いつでも参照可能なサーバ）が付いていればよい。

---

以上。

