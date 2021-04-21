---
layout   : single
title    : "Debian 8 (Jessie) - NTP サーバ Chrony 構築！"
published: true
date     : 2015-05-31 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- NTP
---

Debian GNU/Linux 8 (Jessie) に NTP サーバ Chrony を構築する方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 8 (Jessie) での作業を想定。
* 従来からの `ntpd` ではなく `chronyd` をインストールする。
* ntpd と chronyd の違いについては、「[第13章 chrony スイートを使用した NTP 設定](https://access.redhat.com/documentation/ja-JP/Red_Hat_Enterprise_Linux/7/html/System_Administrators_Guide/ch-Configuring_NTP_Using_the_chrony_Suite.html#sect-differences_between_ntpd_and_chronyd "第13章 chrony スイートを使用した NTP 設定")」を参照。
* ローカルネットワークは `192.168.11.0/24` とする。

### 1. Chrony のインストール

``` text
# apt-get -y install chrony
```

### 2. 設定ファイルの編集

File: `/etc/chrony/chrony.conf`

{% highlight bash linenos %}
#server 0.debian.pool.ntp.org offline minpoll 8  # <= コメント化
#server 1.debian.pool.ntp.org offline minpoll 8  # <= コメント化
#server 2.debian.pool.ntp.org offline minpoll 8  # <= コメント化
#server 3.debian.pool.ntp.org offline minpoll 8  # <= コメント化
server ntp1.jst.mfeed.ad.jp           # <= 追加
server ntp2.jst.mfeed.ad.jp           # <= 追加
server ntp3.jst.mfeed.ad.jp           # <= 追加

#allow 10/8                           # <= コメント化
#allow 192.168/16                     # <= コメント化
#allow 172.16/12                      # <= コメント化
allow 192.168.11.0/24                 # <= 追加
{% endhighlight %}

（追加する NTP サーバはお好みのものを）

### 3. Chrony の再起動

インストール直後は起動した状態になっているので、変更を有効化するために再起動する。

``` text
# systemctl restart chrony
```

### 4. Chrony の自動起動設定

インストール後はデフォルトで自動起動するように設定されているはずだが、自動起動するようなっていなければ設定する。

``` text
# systemctl enable chrony
Synchronizing state for chrony.service with sysvinit using update-rc.d...
Executing /usr/sbin/update-rc.d chrony defaults
Executing /usr/sbin/update-rc.d chrony enable
```

確認してみる。（Chrony が SystemD 未対応のようなので `insserv` コマンドで確認）

``` text
# insserv -s | grep chrony
K:01:0 1 6:chrony
S:02:2 3 4 5:chrony
```

### 5. 時刻同期状況の確認

数分後くらいに同期状況を確認してみる。（従来の `ntpq -p` にあたる）

``` text
# chronyc sources
210 Number of sources = 3
MS Name/IP address         Stratum Poll Reach LastRx Last sample
===============================================================================
^+ ntp1.jst.mfeed.ad.jp          2   6   377     5  -1404us[-1404us] +/-   23ms
^* ntp2.jst.mfeed.ad.jp          2   6   377     6   +115us[ -276us] +/-   22ms
^+ ntp3.jst.mfeed.ad.jp          2   6   377     7   +206us[ -184us] +/-   23ms
```

* １カラム目の `^` は「サーバ」（他に = は「ピア」、# はローカルのハードウェアクロック）
* ２カラム目の `*` は「同期対象として採用」
* ２カラム目の `+` は「同期対象候補」
* ２カラム目の `-` は「アルゴリズムにより同期対象から除外」

---

以上。

