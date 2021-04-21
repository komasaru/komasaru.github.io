---
layout   : single
title    : "Linux - ntpd でのうるう秒対策！"
published: true
date     : 2016-12-23 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- NTP
---

Linux サーバの ntpd でのうるう秒対策についての記録です。

<!--more-->

### 0. 前提条件

* CentOS 6.8(32bit), ntp 4.2.6p5-10.el6.centos.1 での作業を想定。
* **以下の作業は、うるう秒実施（挿入）時刻の24時間前までに行うこと。**  
  （うるう秒実施（挿入）の24時間前に Leap Indicator(LI) が設定されるので）

### 1. ntpd の STEP モードと SLEW モードについて

ntpd の動作モードには STEP と SLEW があり、それぞれ以下のように動作することを認識しておく。

* **STEPモード**  
  不連続に一度に時刻を調整するため、時刻がずれている場合はすぐに正しい時刻に調整されていく。  
  そのため、時間の逆行が発生する可能性があり、ソフトウェアに不具合が起きる可能性がある。
* **SLEWモード**  
  時間を逆行させることはせず、徐々に（1秒あたり0.5ミリ秒ずつ）時間をズラしていく。  
  2000秒かけて1秒のズレを解消する。

### 2. ntp のアップデート

ntp-4.2.6p5-3 より古いバージョンだと SLEW モードで動作しないバグあるようなので、古い場合はアップデートしておく。

``` text
# yum update ntp
```

### 3. ntpd の停止

``` text
# /etc/rc.d/init.d/ntpd stop
```

### 4. Leap Indicator(LI) の受信確認

既に Leap Indicatro(LI) を受信したかどうか（カーネルがLIを知ってしまったかどうか）を確認する。

``` text
# ntptime
ntp_gettime() returns code 0 (OK)
  time dbc7c8df.50003238  Sat, Nov  5 2016 11:56:31.312, (.312503378),
  maximum error 251015 us, estimated error 349 us, TAI offset 0
ntp_adjtime() returns code 0 (OK)
  modes 0x0 (),
  offset 1008.817 us, frequency -20.430 ppm, interval 1 s,
  maximum error 251015 us, estimated error 349 us,
  status 0x2001 (PLL,NANO),
  time constant 7, precision 0.001 us, tolerance 500 ppm,
```

`returns code 1 (INS)` となっていたり、`status` に `INS` が含まれていれば、既に Leap Indicator(LI) を受信済みであるということ。（上記の例では、うるう秒実施（挿入）より1日以上も前なので、まだ受信していない）

### 5. kernel ステータス・周波数オフセットのリセット

``` text
# ntptime -s 0 -f 0
```

### 6. 設定ファイルの編集

ntpd を SLEW モードで起動するよう設定ファイルを編集する。  

File: `/etc/sysconfig/ntpd`

{% highlight text linenos %}
OPTIONS="-x -u ntp:ntp -p /var/run/ntpd.pid -g"
{% endhighlight %}

（SLEW モードでの起動を意味する `-x` オプションの追加）

### 7. ntpd の起動

``` text
# /etc/rc.d/init.d/ntpd start
```

### 8. うるう秒の実施（挿入）

「うるう秒」の実施（挿入）を迎える。

そして、うるう秒実施（挿入）によるズレが解消されるまで（概ね2,000秒以上経過するまで）待機する。

### 9. 設定ファイルの再編集

SLEW モードで起動するように編集していた設定ファイルを再度編集して元に戻す。（STEP モードに戻したければ。このまま SLEW モードにしておいても問題ない）  

File: `/etc/sysconfig/ntpd`

{% highlight text linenos %}
OPTIONS="-u ntp:ntp -p /var/run/ntpd.pid -g"
{% endhighlight %}

（`-x` オプションの削除）

### 10. ntpd の再起動

``` text
# /etc/rc.d/init.d/ntpd restart
```

これで通常の STEP モード運用に戻る。

### 11. 既にうるう秒実施（挿入）まで24時間を切っている場合

上記の作業を行わずしてうるう秒実施（挿入）まで24時間を切ってしまった、かつ、うるう秒実施（挿入）時刻を過ぎていない場合、カーネルは既にうるう秒実施（挿入）を知ってしまっているので、以下のようにしてカーネルの保持時刻・周波数オフセットをリセットする必要がある。

``` text
# ntptime -s 0 -f 0
```

この後に ntpd サービスを再起動させるとよいだろう。

### 12. その他の方法

上記の 1 〜 11 の方法とは別の方法もある。（単純に、うるう秒実施（挿入）前に ntpd を停止し、うるう秒実施（挿入）後に ntpd を起動する方法）

まず、うるう秒挿入時刻の24時間前までに、 ntpd を停止する。

``` text
# /etc/rc.d/init.d/ntpd stop
```

そして、うるう秒挿入時刻を経過した後はシステム時刻が1秒未来を示しているため、以下のようにして　システム時刻を補正する。  
（なお、以下のコマンドはシステム時刻を強制的に1秒戻すため、時刻戻りの影響を受けるソフトウェアを停止してから実行すること）

``` text
# ntpdate ntp.nict.jp
```

最後に、 ntpd や時刻戻りの影響を避けるために停止させていたソフトウェアを起動する。

``` text
# service ntpd start
```

---

個人で趣味程度の運用をしているレベルでは、うるう秒実施（挿入）による障害にそれほど敏感になることもないでしょうが。

以上。

