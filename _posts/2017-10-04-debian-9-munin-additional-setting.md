---
layout   : single
title    : "Debian 9 (Stretch) - munin 各種監視追加！"
published: true
date     : 2017-10-04 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- munin
---

Debian GNU/Linux 9 (Stretch) にインストールしたサーバ監視ツール munin に各種監視を追加する方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 9 (Stretch) での作業を想定。
* サーバ監視ツール munin がインストール済み。
* ハードディスク温度の監視を追加する。
* CPU 温度・電圧・ファン回転数の監視を追加する。
* MariaDB の監視を追加する。
* Nginx の監視を追加する。
* root ユーザでの作業を想定。

### 1. ハードディスク温度の監視追加

`smartctl` コマンドを使用するので、以下のようにしてインストールしておく。

``` text
# apt -y install smartmontools
```

以下のように設定ファイル "hddtemp_smartctl" を作成する。（"munin-node" に追記してもよい）

File: `/etc/munin/plugin-conf.d/hddtemp_smartctl`

{% highlight bash linenos %}
[hddtemp_smartctl]
user root
env.drives sda                 # < = sda は監視するハードディスク
env.smartctl /usr/sbin/smartctl
env.args_sda --all -d ata
{% endhighlight %}

以下のようにしてシンボリックリンクを張る。

``` text
# ln -s /usr/share/munin/plugins/hddtemp_smartctl /etc/munin/plugins/
```

### 2. CPU 温度・電圧・ファン回転数の監視追加

まず、センサーツール `lm-sensors`、依存パッケージをインストールする。

``` text
# apt -y install lm-sensors libsensors4 libsensors4-dev fancontrol
```

そして、センサーを検出する。  
全て「エンター」応答で大丈夫だが、最後に "/etc/modules" へ書き込むかどうか問われたら `yes` 応答する。

``` text
# sensors-detect
```

マシンを再起動して、センサーをチェックしてみる。（当然、表示内容は環境により異なる）

``` text
# sensors
smsc47m192-i2c-0-2d
Adapter: SMBus I801 adapter at 3000
in0:          +2.50 V  (min =  +0.00 V, max =  +3.32 V)
Vcore:        +1.15 V  (min =  +0.00 V, max =  +2.99 V)
+3.3V:        +3.28 V  (min =  +2.97 V, max =  +3.63 V)
+5V:          +4.95 V  (min =  +4.50 V, max =  +5.50 V)
+12V:        +11.88 V  (min = +10.81 V, max = +13.19 V)
VCC:          +3.28 V  (min =  +2.97 V, max =  +3.63 V)
in6:          +1.55 V  (min =  +0.00 V, max =  +1.99 V)
in7:          +1.76 V  (min =  +0.00 V, max =  +2.39 V)
SIO Temp:     +39.0°C  (low  = -127.0°C, high = +127.0°C)
temp2:        +51.0°C  (low  = -127.0°C, high = +127.0°C)
temp3:        +43.0°C  (low  = -127.0°C, high = +127.0°C)
cpu0_vid:    +0.000 V

coretemp-isa-0000
Adapter: ISA adapter
Core 0:       +18.0°C  (crit = +100.0°C)

smsc47m1-isa-0680
Adapter: ISA adapter
fan1:           0 RPM  (min = 1280 RPM, div = 4)  ALARM
fan2:        1755 RPM  (min = 1280 RPM, div = 4)
```

以下のように設定ファイル "sensors" を作成する。（"munin-node" に追記してもよい）

File: `/etc/munin/plugin-conf.d/sensors`

{% highlight bash linenos %}
[sensors_*]
user root
{% endhighlight %}

以下のようにしてシンボリックリンクを張る。

``` text
# ln -s /usr/share/munin/plugins/sensors_ /etc/munin/plugins/sensors_volt
# ln -s /usr/share/munin/plugins/sensors_ /etc/munin/plugins/sensors_temp
# ln -s /usr/share/munin/plugins/sensors_ /etc/munin/plugins/sensors_fan
```

### 3. MariaDB の監視追加

以下のように設定ファイル "mysql" を作成する。（"munin-node" に追記してもよい）

File: `/etc/munin/plugin-conf.d/mysql`

{% highlight bash linenos %}
[mysql*]
env.mysqlopts -u root -p＜root パスワード＞
env.mysqladmin /usr/bin/mysqladmin   # < = mysqladmin フルパス指定
{% endhighlight %}

以下のようにしてシンボリックリンクを張る。

``` text
# ln -s /usr/share/munin/plugins/mysql_bytes /etc/munin/plugins/mysql_bytes
# ln -s /usr/share/munin/plugins/mysql_innodb /etc/munin/plugins/mysql_innodb
# ln -s /usr/share/munin/plugins/mysql_isam_space_ /etc/munin/plugins/mysql_isam_space_  # <= MyISAM 不使用なら不要
# ln -s /usr/share/munin/plugins/mysql_queries /etc/munin/plugins/mysql_queries
# ln -s /usr/share/munin/plugins/mysql_slowqueries /etc/munin/plugins/mysql_slowqueries
# ln -s /usr/share/munin/plugins/mysql_threads /etc/munin/plugins/mysql_threads
```

### 4. Nginx の監視追加

Nginx の設定ファイル "nginx.conf" に以下のような記述を追加する。（server ディレクティブ内）

File: `/etc/nginx/conf.d/default.conf`

{% highlight bash linenos %}
server {

    # munin
    location /nginx_status {
        stub_status on;
        access_log off;
        allow 127.0.0.1;
        allow 192.168.11.0/24;  # <= 内部からのアクセスのみ許可
        deny all;
    }

}
{% endhighlight %}

【注意】Nginx をソースをビルドしてインストールしている場合は、 configure 時に `--with-http_stub_status_module` のオプションを指定していないといけない。

そして、Nginx を再起動する。

``` text
# systemctl restart nginx
```

以下のように設定ファイル "nginx" を作成する。（"munin-node" に追記してもよい）

File: `/etc/munin/plugin-conf.d/nginx`

{% highlight bash linenos %}
[nginx*]
env.url http://localhost/nginx_status
{% endhighlight %}

以下のようにしてシンボリックリンクを張る。（既に存在しているかもしれない）

``` text
# ln -s /usr/share/munin/plugins/nginx_request /etc/munin/plugins/nginx_request
# ln -s /usr/share/munin/plugins/nginx_status /etc/munin/plugins/nginx_status
```

ちなみに、上記以外のプラグインを使用するなら以下のようにする。

``` text
# cd /usr/local/share
# mkdir munin
# cd munin
# git clone https://github.com/munin-monitoring/contrib.git
# ln -s /usr/local/share/munin/contrib/plugins/nginx/nginx_connection_request /etc/munin/plugins/nginx_connection_request
# ln -s /usr/local/share/munin/contrib/plugins/nginx/nginx-combined /etc/munin/plugins/nginx-combined
# ln -s /usr/local/share/munin/contrib/plugins/nginx/nginx_memory /etc/munin/plugins/nginx_memory
# ln -s /usr/local/share/munin/contrib/plugins/nginx/nginx_vhost_traffic /etc/munin/plugins/nginx_vhost_traffic

etc...
```

### 5. munin-node の再起動

``` text
# systemctl restart munin-node
```

### 6. 動作確認

ブラウザで `http://＜Webサーバのホスト名 or IP アドレス＞/munin` にアクセスし、表示されることを確認する。

---

以上。

