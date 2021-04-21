---
layout   : single
title    : "CentOS 7.0 - サーバ監視ツール Munin でCPU温度・電圧・ファン回転数測定！"
published: true
date     : 2014-09-10 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- munin
---

「CentOS 7.0 - サーバ監視ツール Munin でCPU温度・電圧・ファン回転数測定」についての記録です。

（旧バージョンでの作業記録を更新しました。興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

- CentOS 7.0-1406(x86_64) を NetInstall で最小限インストールしている。
- サーバ用途なので、作業は基本的に全て一般ユーザから root になって行う。
- クライアント側は Linux Mint 17 を想定。
- 閲覧に使用する Web(HTTP) サーバは Nginx を想定。

### 1. lm_sensors インストール

ハードウェア状況を取得するのに必要な `lm_sensors` をインストールして、ハードウェアを検出する。

``` text
# yum -y install lm_sensors
```

### 2. lm_sensors でハードウェア検出

`lm_sensors` インストール後は、ハードを検出する。途中の質問は全てデフォルト応答でよい。  
（当然ながら、仮想マシンの場合は正常にハードが検出されないのでご注意を！）

``` text
# sensors-detect
```

### 3. lm_sensors 動作確認

実際にハードウェアの状況が取得できるか確認してみる。（以下は運用中のマシンの例）  
（当然ながら、仮想マシンの場合は正常にハードが検出されないのでご注意を！）

``` text
# sensors
acpitz-virtual-0
Adapter: Virtual device
temp1:       +31.0°C  (crit = +60.0°C)

it8712-isa-0290
Adapter: ISA adapter
in0:         +0.98 V  (min =  +0.00 V, max =  +0.00 V)   ALARM
in1:         +1.04 V  (min =  +0.51 V, max =  +0.03 V)   ALARM
in2:         +3.30 V  (min =  +0.26 V, max =  +0.00 V)   ALARM
in3:         +3.06 V  (min =  +0.00 V, max =  +0.13 V)   ALARM
in4:         +3.04 V  (min =  +0.00 V, max =  +0.13 V)   ALARM
in5:         +2.24 V  (min =  +0.00 V, max =  +0.00 V)   ALARM
in6:         +1.78 V  (min =  +0.00 V, max =  +0.00 V)   ALARM
in7:         +3.06 V  (min =  +0.00 V, max =  +0.00 V)   ALARM
Vbat:        +3.20 V
fan1:          0 RPM  (min = 10546 RPM, div = 8)
fan2:          0 RPM  (min = 2636 RPM, div = 8)
fan3:          0 RPM  (min = 5273 RPM, div = 8)
temp1:       +31.0°C  (low  = +36.0°C, high =  +0.0°C)  ALARM  sensor = thermistor
temp2:       +33.0°C  (low  =  +2.0°C, high =  +0.0°C)  sensor = thermistor
temp3:       +39.0°C  (low  =  +0.0°C, high =  +0.0°C)  sensor = thermistor
cpu0_vid:   +1.196 V

```

### 2. シンボリックリンク作成

``` text
# ln -s /usr/share/munin/plugins/sensors_ /etc/munin/plugins/sensors_volt
# ln -s /usr/share/munin/plugins/sensors_ /etc/munin/plugins/sensors_temp
# ln -s /usr/share/munin/plugins/sensors_ /etc/munin/plugins/sensors_fan
```

### 3. munin-node 設定ファイル編集

File: `/etc/munin/plugin-conf.d/munin-node`

{% highlight bash linenos %}
 [sensors_*]  # <= 追加
 user root    # <= 追加
{% endhighlight %}

### 4. munin-node 再起動

``` text
# systemctl restart munin-node
```

### 5. 動作確認

５分ほど待ってブラウザから `http://＜サーバ名orIPアドレス＞/munin` にアクセスして、"sensor" に各種追加されていることを確認する。  
当然ながら、マシンが仮想マシンなら値は取得できないので、ご注意を！

以下は、実運用中（CentOS 6.5）サーバでの例。

![CENTOS_7-0_MUNIN_CPU]({{site.baseurl}}/images/2014/09/10/CENTOS_7-0_MUNIN_CPU.png "CENTOS_7-0_MUNIN_CPU")

---

以上。

