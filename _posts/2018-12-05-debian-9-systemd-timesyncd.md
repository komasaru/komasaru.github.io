---
layout   : single
title    : "Debian 9 (Stretch) - 時刻同期設定(systemd-timesyncd)！"
published: true
date     : 2018-12-05 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- Debian
---

Debian GNU/Linux 9 (Stretch) 上で systemd-timesyncd サービスを使用して時刻同期する設定についての記録です。

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 9 (Stretch) での作業を想定。
* `ntpd` や `chronyd` は使用しない。
* root ユーザでの作業を想定。

### 1. ntpd, chronyd の停止

ntpd や chronyd は不要なので、サービスが起動していれば停止し、自動起動もしないように設定しておく。（以下のようなコマンドで）  
ちなみに、 OS インストール直後は ntpd も chronyd も起動してなく、 systemd-timesyncd が起動しているはず。

``` text
# systemctl status chronyd
# systemctl stop chronyd
# systemctl disable chronyd
# systemctl is-enabled chronyd
```

### 2. NTP 機能の有効化

まず、現状の NTP の設定状況を確認する。

``` text
# timedatectl status
      Local time: 月 2018-09-17 17:25:26 JST
  Universal time: 月 2018-09-17 08:25:26 UTC
        RTC time: 月 2018-09-17 08:25:24
       Time zone: Asia/Tokyo (JST, +0900)
 Network time on: yes
NTP synchronized: yes
 RTC in local TZ: no
```

`Network time on` が `yes` になっていれば、 NTP 機能は有効になっているということ。（次項 3 へ）

`Network time on` が `no` になっていれば、 NTP 機能が無効になっているということなので、以下を実行して NTP 機能を有効化する。

``` text
# timedatectl set-ntp true
```

### 3. NTP サーバの設定

以下は当方の例。

File: `/etc/systemd/timesyncd.conf`

{% highlight bash linenos %}
[Time]
NTP=ntp.nict.jp
FallbackNTP=ntp1.jst.mfeed.ad.jp ntp2.jst.mfeed.ad.jp ntp3.jst.mfeed.ad.jp
{% endhighlight %}

* `NTP` がメイン、 `FallbackNTP` が予備。
* 複数のサーバを設定する場合は半角スペースで区切る。

### 4. 時刻同期デーモンの再起動

設定を有効化するために時刻同期デーモン systemd-timesyncd を再起動する。

``` text
# systemctl restart systemd-timesyncd
```

* 元々 ntpd や chronyd を起動していた場合は systemd-timesyncd は起動していなかったであろうから、 `restart` でなく `start` とする。

### 5. 時刻同期デーモン自動起動の設定

元々 ntpd や chronyd を起動していなかった場合は systemd-timesyncd は自動起動する設定になっているはず。

自動起動する設定になっていなかった場合は、設定しておく。

``` text
# systemctl enable systemd-timesyncd
# systemctl is-enabled systemd-timesyncd
```

---

以上。

