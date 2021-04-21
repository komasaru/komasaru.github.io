---
layout   : single
title    : "CentOS 7.0 - NTP サーバ Chrony 設定！"
published: true
date     : 2014-08-11 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- NTP
---

「CentOS 7.0 - NTP サーバ Chrony 設定」についての記録です。

（旧バージョンでの作業記録を更新しました。興味がなければスルーしてください）

<!--more-->

時刻同期に関して、CentOS 7 からは NTP の代替として Chrony が採用されてデフォルトでインストール・起動しています。

### 0. 前提条件

- CentOS 7.0-1406(x86_64) を NetInstall で最小限インストールしている。
- サーバ用途なので、作業は基本的に全て一般ユーザから root になって行う。
- ローカルネットワークは `192.168.11.0/24` を想定。
- 従来からの NTP は使用しないことを想定。

### 1. NTP サーバ停止

従来の NTP サーバをインストール・起動している場合は停止する。

``` text
# systemctl stop ntpd
# systemctl disable ntpd
rm '/etc/systemd/system/multi-user.target.wants/ntpd.service'
# systemctl list-unit-files -t service | grep ntpd
ntpd.service                                disabled  # <= disabled であることを確認
ntpdate.service                             disabled
```

### 2. Chrony サーバインストール

デフォルトでインストールされているはずだが、インストールされていなければインストールする。

``` text
# yum -y install chrony
```

### 3. Chrony サーバ設定ファイル編集

以下のように編集する。（同期するサーバは適宜変更）

File: `/etc/chrony.conf`

{% highlight bash linenos %}
# Use public servers from the pool.ntp.org project.
# Please consider joining the pool (http://www.pool.ntp.org/join.html).
#server 0.centos.pool.ntp.org iburst  # <= コメント化
#server 1.centos.pool.ntp.org iburst  # <= コメント化
#server 2.centos.pool.ntp.org iburst  # <= コメント化
#server 3.centos.pool.ntp.org iburst  # <= コメント化
server ntp1.jst.mfeed.ad.jp iburst    # <= 追加
server ntp2.jst.mfeed.ad.jp iburst    # <= 追加
server ntp3.jst.mfeed.ad.jp iburst    # <= 追加

# Allow NTP client access from local network.
#allow 192.168/16
allow 192.168.11/24  # <= 追加
{% endhighlight %}

（`iburst` は時刻同期が早くするための設定（起動直後にサーバに4回連続的に問い合わせを行う））

### 4. IPv4 設定

今回 IPv6 は使用しないので、デフォルトでは起動時に以下のような警告が出力されてしまう。

``` text
Could not open IPv6 NTP socket : Address family not supported by protocol
Could not open IPv6 command socket : Address family not supported by protocol
```

警告されるだけなので無視してもよいが、気になるようなら起動時に IPv4 のみを指定するように設定する。

まず、サービス起動ファイル "/usr/lib/systemd/system/chronyd.service" を確認してみる。

File: `/usr/lib/systemd/system/chronyd.service`

{% highlight bash linenos %}
[Service]
Type=forking
EnvironmentFile=-/etc/sysconfig/chronyd
ExecStart=/usr/sbin/chronyd -u chrony $OPTIONS
ExecStartPost=/usr/libexec/chrony-helper add-dhclient-servers
{% endhighlight %}

すると、 "/etc/sysconfig/chronyd" に環境変数 `OPTIONS` を指定すればよいだろうと推測される。（起動オプションについては「[User guide for the chrony suite](http://chrony.tuxfamily.org/manual.html "User guide for the chrony suite")」を参照）

File: `/etc/sysconfig/chronyd`

{% highlight text linenos %}
OPTIONS="-4"
{% endhighlight %}

### 5. Chrony サーバ再起動

``` text
# systemctl restart chronyd
```

### 6. Chrony サーバ自動起動設定

デフォルトで自動起動するようになっているはずだが、インストールし直した場合は自動起動するよう設定する。

``` text
# systemctl enable chronyd
ln -s '/usr/lib/systemd/system/chronyd.service' '/etc/systemd/system/multi-user.target.wants/chronyd.service'
# systemctl list-unit-files -t service | grep chronyd
chronyd.service                             enabled  # <= enabled であることを確認
```

### 7. 時刻同期状態確認

数分後くらいに同期状況を確認してみる。（従来の `ntpq -p` にあたる）

``` text
# chronyc sources
210 Number of sources = 3
MS Name/IP address         Stratum Poll Reach LastRx Last sample
===============================================================================
^+ ntp1.jst.mfeed.ad.jp          2   6     7    60    +70us[  -14ms] +/-   44ms
^- ntp2.jst.mfeed.ad.jp          2   6     7    59   -109ms[ -124ms] +/-  150ms
^* ntp3.jst.mfeed.ad.jp          2   6     7    59    -47us[  -14ms] +/-   27ms
```

- １カラム目の `^` は「サーバ」（他に `=` は「ピア」、`#` はローカルのハードウェアクロック）
- ２カラム目の `*` は「同期対象として採用」
- ２カラム目の `+` は「同期対象候補」
- ２カラム目の `-` は「アルゴリズムにより同期対象から除外」

### 8. その他

従来の NTP を使用することも可能だが、その場合は Chrony を停止させること。

### 参考サイト

- [User guide for the chrony suite](http://chrony.tuxfamily.org/manual.html "User guide for the chrony suite")

---

以上。

