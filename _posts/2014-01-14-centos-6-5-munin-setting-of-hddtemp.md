---
layout   : single
title    : "CentOS 6.5 - サーバ監視ツール（munin）でハードディスク温度監視！"
published: true
date     : 2014-01-14 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- munin
---

前回は CentOS 6.5 サーバでサーバ監視ツール munin の導入を行いました。  
今回はサーバ監視ツール munin でハードディスク温度監視の設定を行います。

<!--more-->

### 0. 前提条件

- CentOS 6.5(x86_64) を Minimal で最小インストールしている。
- クライントマシンは Linux Mint 14(64bit) を想定。
- 閲覧に使用する Web(HTTP) サーバは Nginx を想定。
- ハードディスク温度取得には `smartctl` を使用する。インストール済みであること。  
  （`hddtemp` コマンドインストールして監視する方法もある）

### 1. munin-node 設定ファイル編集

File: `/etc/munin/plugin-conf.d/hddtemp_smartctl`

{% highlight bash linenos %}
[hddtemp_smartctl]
user root
env.drives sda                   # <= 追加（"sda" は監視するハードディスク）
env.smartctl /usr/sbin/smartctl  # <= 追加
env.args_sda --all -d ata        # <= 追加
{% endhighlight %}

### 2. シンボリックリンク設定

``` text
# ln -s /usr/share/munin/plugins/hddtemp_smartctl /etc/munin/plugins
```

### 3. munin-node 再起動

``` text
# /etc/rc.d/init.d/munin-node start
Stopping Munin Node agents:                                [  OK  ]
Starting Munin Node:                                       [  OK  ]
```

### 4. 動作確認

５分ほど待ってブラウザから `http://＜サーバ名orIPアドレス＞/munin` にアクセスして、"sensor" に "HDD temperature" が追加されていることを確認する。  
当然ながら、マシンが仮想マシンなら値は取得できないので、ご注意を！

以下は、実運用中サーバでの例。

![CENTOS_6-5_MUNIN_HDDTEMP]({{site.baseurl}}/images/2014/01/14/CENTOS_6-5_MUNIN_HDDTEMP.png "CENTOS_6-5_MUNIN_HDDTEMP")

---

次回は、サーバ監視ツール munin で CPU 温度・電圧・ファン回転数を監視するに設定ついて紹介する予定です。

以上。

