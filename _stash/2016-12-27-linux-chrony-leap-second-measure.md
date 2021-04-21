---
layout   : single
title    : "Linux - chrony でのうるう秒対策！"
published: true
date     : 2016-12-27 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- NTP
---

Linux サーバの chrony でのうるう秒対策についての記録です。

chrony が基本的に SLEW モードで動作しているとは言っても、対策しなければ、うるう秒挿入時に STEP モードのごとくカーネル通知して1秒がそのまま挿入されてしまいます。（**「SLEW モードだから問題ない」とよく勘違いされる**）

以下で、[chrony](https://chrony.tuxfamily.org/manual.html "chrony") 推奨の対策方法を紹介します。

<!--more-->

### 0. 前提条件

* NTP サーバに ntpd ではなく chrony を使用している。
* 以下では、 CentOS 7.3 での作業を想定している。  
  **ちなみに、Debian GNU/Linux 8.6 (Jessie) の apt でインストールされる古いバージョン（1.30-2）には対応していない。**

### 1. 設定ファイルの編集

設定ファイルの最終行あたりに以下の記述を追加する。

File: `/etc/chrony/chrony.conf`

{% highlight bash linenos %}
leapsecmode slew
maxslewrate 1000
smoothtime 400 0.001 leaponly
{% endhighlight %}

* `leapsecmode` はうるう秒モード。
* `maxslewrate` は SLEW 調整の最大速度で、単位は ppm.  
  `1000` だと、 1秒に 1,000 / 1,000,000 = 1 / 1,000 秒ずつ調整される。  
  `500` だと、 1秒に 500 / 1,000,000 = 1 / 2000 秒ずつ調整される。
* `smoothtime` は client への調整設定（長時間未調整だった後でもスムーズな時刻調整を行う）  
  第1引数が1,000,000回当たりの最大回数(?)で、第2引数が1秒当たりに許容される最大頻度(?)  
  第3引数の `leaponly` はうるう秒の時だけ適用するオプション。
* **ちなみに、Debian GNU/Linux 8.6 (Jessie) の apt でインストールされる古いバージョン（1.30-2）には対応していない。**

### 2. chrony の再起動

``` text
# systemctl restart chrony
```

### 3. 確認

``` text
chronyc tracking
Reference ID    : 210.173.160.57 (ntp2.jst.mfeed.ad.jp)
Stratum         : 3
Ref time (UTC)  : Mon Dec 26 01:34:58 2016
System time     : 0.000666547 seconds slow of NTP time
Last offset     : +0.000648887 seconds
RMS offset      : 0.000648887 seconds
Frequency       : 41.236 ppm fast
Residual freq   : +44.558 ppm
Skew            : 0.021 ppm
Root delay      : 0.084496 seconds
Root dispersion : 0.058610 seconds
Update interval : 2.1 seconds
Leap status     : Normal
```

うるう秒挿入まで24時間を切ってから確認すると、 `Leap status` の値が `Insert second` になるはず。

### 4. 既にうるう秒実施（挿入）まで24を切っている場合

上記の作業を行わずしてうるう秒実施（挿入）まで24時間を切ってしまった、かつ、うるう秒実施（挿入）時刻を過ぎていない場合、カーネルは既にうるう秒実施（挿入）を知ってしまっているので、以下のようにしてカーネルの保持時刻・周波数オフセットをリセットする必要がある。（要 ntptime コマンド）

``` text
# ntptime -s 0 -f 0
```

この後に chrony サービスを再起動させるとよいだろう。

### 5. その他の方法

上記 1 〜 3 の方法を使用しない場合、以下のような方法もあるだろう。（当方、未確認）

1. うるう秒実施（挿入）の24時間前までに chrony サービスを停止
2. （うるう秒実施（挿入）を迎える）
3. うるう秒実施（挿入）後に chrony サービスを起動

### 6. 参考サイト

* [chrony - Manual for version 2.3](https://chrony.tuxfamily.org/manual.html "chrony - Manual for version 2.3")

---

個人で趣味程度の運用をしているレベルでは、うるう秒実施（挿入）による障害にそれほど敏感になることもないでしょうが。

以上。

