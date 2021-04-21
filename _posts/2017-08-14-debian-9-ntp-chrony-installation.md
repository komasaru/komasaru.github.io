---
layout   : single
title    : "Debian 9 (Stretch) - NTP サーバ Chrony 構築！"
published: true
date     : 2017-08-14 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- NTP
---

Debian GNU/Linux 9 (Stretch) に NTP サーバ Chrony を構築する方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 9 (Stretch) での作業を想定。
* 従来からの `ntpd` ではなく `chronyd` をインストールする。
* ntpd と chronyd の違いについては、「[第13章 chrony スイートを使用した NTP 設定](https://access.redhat.com/documentation/ja-JP/Red_Hat_Enterprise_Linux/7/html/System_Administrators_Guide/ch-Configuring_NTP_Using_the_chrony_Suite.html#sect-differences_between_ntpd_and_chronyd "第13章 chrony スイートを使用した NTP 設定")」を参照。
* ローカルネットワークは `192.168.11.0/24` とする。
* root ユーザでの作業を想定。

### 1. Chrony のインストール

``` text
# apt -y install chrony
```

### 2. 設定ファイルの編集

File: `/etc/chrony/chrony.conf`

{% highlight bash linenos %}
server ntp.nict.jp iburst           # <= 追加
server ntp1.jst.mfeed.ad.jp iburst  # <= 追加
server ntp2.jst.mfeed.ad.jp iburst  # <= 追加
server ntp3.jst.mfeed.ad.jp iburst  # <= 追加

allow 192.168.11.0/24               # <= 追加
{% endhighlight %}

うるう秒にも対応させるには、以下のような記述も追記する。（参考： [chrony - Manual for version 2.3](https://chrony.tuxfamily.org/manual.html "chrony - Manual for version 2.3")）  
（うるう秒対策時のみでもよいだろう）

File: `/etc/chrony/chrony.conf`

{% highlight bash linenos %}
leapsecmode slew
maxslewrate 1000
smoothtime 400 0.001 leaponly
{% endhighlight %}

### 3. Chrony の再起動

インストール直後は起動した状態になっているので、前述の変更を有効化するために再起動する。

``` text
# systemctl restart chrony
```

### 4. Chrony の自動起動設定

インストール後はデフォルトで自動起動するように設定されているはずだが、自動起動するようなっていなければ設定する。

``` text
# systemctl enable chrony
Synchronizing state of chrony.service with SysV service script with /lib/systemd/systemd-sysv-install.
Executing: /lib/systemd/systemd-sysv-install enable chrony
Created symlink /etc/systemd/system/chronyd.service → /lib/systemd/system/chrony.service.
```

確認してみる。

``` text
# systemctl is-enabled chrony
enabled
```

以下のようにして、確認してもよい。

``` text
# systemctl list-unit-files -t service | grep chrony
chrony.service                         enabled
chronyd.service                        enabled
```

### 5. 時刻同期状況の確認

数分後くらいに同期状況を確認してみる。（ntpd の `ntpq -p` にあたる）

``` text
# chronyc sources
210 Number of sources = 8
MS Name/IP address         Stratum Poll Reach LastRx Last sample
===============================================================================
^- chobi.paina.net               2   6    17    61    -21ms[  -19ms] +/-   59ms
^+ einzbern.turenar.xyz          2   6    17    60   +971us[ +971us] +/-   43ms
^- 153-128-30-125.compute.j>     2   6    17    62    -33ms[  -30ms] +/-   87ms
^- timpany.srv.jre655.com        2   6    17    62    -16ms[-7474us] +/-   36ms
^* ntp-b2.nict.go.jp             1   6    17    61  +1099us[+3546us] +/-   17ms
^- ntp1.jst.mfeed.ad.jp          2   6    17    61   +215us[+2662us] +/-   90ms
^- ntp2.jst.mfeed.ad.jp          2   6    17    62    -39ms[  -31ms] +/-  134ms
^- ntp3.jst.mfeed.ad.jp          2   6    17    60   +981us[ +981us] +/-  120ms
```

* １カラム目の `^` は「サーバ」（他に = は「ピア」、# はローカルのハードウェアクロック）
* ２カラム目の `*` は「同期対象として採用」
* ２カラム目の `+` は「同期対象候補」
* ２カラム目の `-` は「アルゴリズムにより同期対象から除外」

---

以上。

