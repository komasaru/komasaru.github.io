---
layout   : single
title    : "Debian 10 (buster) - munin 各種監視追加！"
published: true
date     : 2020-01-23 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- munin
---

Debian GNU/Linux 10 (buster) にインストールしたサーバ監視ツール munin に各種監視を追加する方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10 (buster) での作業を想定。
* サーバ監視ツール munin がインストール済み。
* ハードディスク温度の監視を追加する。
* CPU 温度・電圧・ファン回転数の監視を追加する。
* MariaDB の監視を追加する。
* Nginx の監視を追加する。
* root ユーザでの作業を想定。
* 仮想マシンの場合、センサーがないため、センサー部分が正常に機能しない（設定できない）ということに留意。

### 1. ハードディスク温度の監視追加

`smartctl` コマンドを使用するので、以下のようにしてインストールしておく。

``` text
# apt -y install smartmontools
```

以下のように設定ファイル `hddtemp_smartctl` を作成する。（`munin-node` に追記してもよい）

File: `/etc/munin/plugin-conf.d/hddtemp_smartctl`

``` text
[hddtemp_smartctl]
user root
env.drives sda                 # < = sda は監視するハードディスク
env.smartctl /usr/sbin/smartctl
env.args_sda --all -d ata
```

以下のようにしてシンボリックリンクを張る。

``` text
# ln -s /usr/share/munin/plugins/hddtemp_smartctl /etc/munin/plugins/
```

### 2. CPU 温度・電圧・ファン回転数の監視追加

まず、センサーツール `lm-sensors`、依存パッケージをインストールする。

``` text
# apt -y install lm-sensors libsensors4-dev fancontrol
```

そして、センサーを検出する。  
全て「エンター」応答で大丈夫だが、最後に `/etc/modules` へ書き込むかどうか問われたら `yes` 応答する。

``` text
# sensors-detect
```

マシンを再起動して、センサーをチェックしてみる。（当然、表示内容は環境により異なる）

``` text
# sensors
atk0110-acpi-0
Adapter: ACPI interface
Vcore Voltage:       +1.10 V  (min =  +0.80 V, max =  +1.60 V)
 +3.3 Voltage:       +3.36 V  (min =  +2.97 V, max =  +3.63 V)
 +5 Voltage:         +4.99 V  (min =  +4.50 V, max =  +5.50 V)
 +12 Voltage:       +12.26 V  (min = +10.20 V, max = +13.80 V)
CPU FAN Speed:       292 RPM  (min =  600 RPM, max = 7200 RPM)
CHASSIS1 FAN Speed:    0 RPM  (min =  600 RPM, max = 7200 RPM)
CHASSIS2 FAN Speed:  474 RPM  (min =  600 RPM, max = 7200 RPM)
CHASSIS3 FAN Speed:  602 RPM  (min =  600 RPM, max = 7200 RPM)
POWER FAN Speed:       0 RPM  (min =  600 RPM, max = 7200 RPM)
CPU Temperature:     +29.5°C  (high = +60.0°C, crit = +95.0°C)
MB Temperature:      +40.0°C  (high = +45.0°C, crit = +95.0°C)

nouveau-pci-0100
Adapter: PCI adapter
GPU core:     +1.15 V  (min =  +1.00 V, max =  +1.15 V)
temp1:        +45.0°C  (high = +95.0°C, hyst =  +3.0°C)
                       (crit = +105.0°C, hyst =  +5.0°C)
                       (emerg = +135.0°C, hyst =  +2.0°C)

coretemp-isa-0000
Adapter: ISA adapter
Core 0:       +35.0°C  (high = +78.0°C, crit = +100.0°C)
Core 1:       +38.0°C  (high = +78.0°C, crit = +100.0°C)
```

以下のように設定ファイル `sensors` を作成する。（`munin-node` に追記してもよい）

File: `/etc/munin/plugin-conf.d/sensors`

``` text
[sensors_*]
user root
```

以下のようにしてシンボリックリンクを張る。

``` text
# ln -s /usr/share/munin/plugins/sensors_ /etc/munin/plugins/sensors_volt
# ln -s /usr/share/munin/plugins/sensors_ /etc/munin/plugins/sensors_temp
# ln -s /usr/share/munin/plugins/sensors_ /etc/munin/plugins/sensors_fan
```

### 3. MariaDB の監視追加

以下のように設定ファイル `mysql` を作成する。（`munin-node` に追記してもよい）

File: `/etc/munin/plugin-conf.d/mysql`

``` text
[mysql*]
env.mysqlopts -u root -p＜root パスワード＞
env.mysqladmin /usr/local/mysql/bin/mysqladmin   # < = mysqladmin フルパス指定
```

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

Nginx の設定ファイル `nginx.conf` に以下のような記述を追加する。（`server` ディレクティブ内）

File: `/etc/nginx/conf.d/default.conf`

``` text
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
```

【注意】Nginx をソースをビルドしてインストールしている場合は、`--with-http_stub_status_module` の configure オプションを指定していないといけない。

そして、Nginx を再起動する。

``` text
# systemctl restart nginx
```

以下のように設定ファイル `nginx` を作成する。（`munin-node` に追記してもよい）

File: `/etc/munin/plugin-conf.d/nginx`

``` text
[nginx*]
env.url http://localhost/nginx_status
```

以下のようにしてシンボリックリンクを張る。

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

