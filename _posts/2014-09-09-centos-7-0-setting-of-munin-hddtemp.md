---
layout   : single
title    : "CentOS 7.0 - サーバ監視ツール Munin でハードディスク温度監視！"
published: true
date     : 2014-09-09 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- munin
---

「CentOS 7.0 - サーバ監視ツール Munin でハードディスク温度監視」についての記録です。

（旧バージョンでの作業記録を更新しました。興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

- CentOS 7.0-1406(x86_64) を NetInstall で最小限インストールしている。
- サーバ用途なので、作業は基本的に全て一般ユーザから root になって行う。
- クライアント側は Linux Mint 17 を想定。
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
# systemctl restart munin-node
```

### 4. 動作確認

５分ほど待ってブラウザから `http://＜サーバ名orIPアドレス＞/munin` にアクセスして、"sensor" に "HDD temperature" が追加されていることを確認する。  
当然ながら、マシンが仮想マシンなら値は取得できないので、ご注意を！

以下は、実運用中（CentOS）サーバでの例。

![CENTOS_7-0_MUNIN_HDDTEMP]({{site.baseurl}}/images/2014/09/09/CENTOS_7-0_MUNIN_HDDTEMP.png "CENTOS_7-0_MUNIN_HDDTEMP")

---

以上。

