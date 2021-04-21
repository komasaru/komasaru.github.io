---
layout   : single
title    : "LMDE2 - 起動時の時刻調整について！"
published: true
date     : 2017-02-07 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- LMDE2
- NTP
---

LMDE2 (Linux Mint Debian Edition 2) をインストールした直後の状態では、デフォルトの `0.debian.pool.ntp.org` 等の NTP サーバを使用して時刻調整するようになっています。

以下、起動時の時刻調整の仕組みと設定変更方法についての記録です。

<!--more-->

### 0. 前提条件

* LMDE2 (Linux Mint Debian Edition 2) での作業を想定。  
  （Debian GNU/Linux 系 Linux ディストリビューションなら同じはず）
* `ntpdate`(`ntpdate-debian`) コマンドが導入済みであること。  
  OS がデスクトップ用途でインストールされているのなら、このコマンドは利用可能になっているはず。  
  OS がサーバ用途でインストールされている場合、 ntp サーバを構築してそちらで運用することが多いので、 `ntpdate` コマンドでの時刻調整はしないだろう。 ntp サーバを構築せず、 ntpdate コマンドを cron で定期実行する方法をとっているのなら、以下の記事のとおりにすればよい。

### 1. 時刻調整の流れ

LMDE2 等のデスクトップ環境の場合、以下の流れで時刻調整が行われる。（設定をカスタマイズしていない場合）

1.  マシン起動（ネットワーク確立）時に "/etc/network/if-up.d/ntpdate" により "/usr/sbin/ntpdate-debian" というラッパースクリプトが自動的に実行される。
2.  ラッパースクリプト "/usr/sbin/ntpdate-debian" 内で "/etc/default/ntpdate" の設定を読み込んだ上に "/usr/sbin/ntpdate" というスクリプトが実行されて、時刻調整が行われる。

但し、デフォルトでは "ntp.conf"（厳密には "/var/lib/ntp/ntp.conf.dhcp", "/etc/ntp.conf", "/etc/openntpd/ntpd.conf" のどれか）の NTP サーバ設定を読み込んで時刻調整をするようになっているため、 NTP サーバを構築していないような環境では "ntp.conf" が存在せず、 "/etc/default/ntpdate" に記述されている NTP サーバが使用されて時刻調整が行われる。

### 2. 時刻調整設定の編集

マシン起動時に "ntp.conf" ではなく "/etc/default/ntpdate" で設定した NTP サーバを使用して時刻調整を行いたければ、設定ファイルを以下のように編集する。

File: `/etc/default/ntpdate`

{% highlight bash linenos %}
NTPDATE_USE_NTP_CONF=no

NTPSERVERS="ntp1.jst.mfeed.ad.jp ntp2.jst.mfeed.ad.jp ntp3.jst.mfeed.ad.jp"

NTPOPTIONS="-s -b -u"
{% endhighlight %}

* `NTPDATE_USE_NTP_CONF`  
   ... `yes` で "ntp.conf" の設定を読み込み、 `no` で `NTPSERVERS` に記述されているの NTP サーバを使用する。
* `NTPSERVERS`  
   ... `NTPDATE_USE_NTP_CONF=no` の場合に使用される NTP サーバを記述する。
* `NTPOPTIONS`  
  ... `ntpdate` コマンド実行時のオプション。（必要であれば、設定する）  
  - `-s` は、実行結果を syslog に出力する。
  - `-b` は、時刻ずれの大きさにかかわらず強制的に STEP モードで時刻を合わせる。
  - `-u` は、パケットを非特権モードで出力する。

### 3. 実行テスト

試しに、手動でコマンドを実行してみる。

``` text
# sudo ntpdate-debian
```

syslog にログが記録されていることを確認する。

File: `/var/log/syslog`

{% highlight text linenos %}
Dec 28 22:49:40 hostname ntpdate[20138]: step time server 210.173.160.57 offset 0.141388 sec
Dec 28 22:49:40 hostname systemd[1364]: Time has been changed
{% endhighlight %}

これで、マシン起動時に時刻調整が行われるようになる。

### 4. その他

* マシン起動時のみでなく、定期的に時刻調整を行いたければ、 cron に登録するとよい。
* ちなみに、システムシャットダウン時にシステムクロックがハードウェアクロックに同期される。※Linux の場合

---

以上、

