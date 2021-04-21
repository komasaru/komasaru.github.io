---
layout   : single
title    : "LMDE 3 - Redis のインストール（ソースビルド）！"
published: true
date     : 2019-04-14 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- LMDE3
- Redis
---

LMDE 3 (Linux Mint Debian Edition 3) にインメモリデータベースシステム [Redis](https://redis.io/ "Redis") をソースをビルドしてインストールする方法についての記録です。

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* Redis 5.0.3 をインストールする。

### 1. アーカイブの取得

アーカイブを取得して、展開。

``` text
$ wget http://download.redis.io/releases/redis-5.0.3.tar.gz
$ tar xzf redis-5.0.3.tar.gz
```

### 2. ビルド＆インストール

``` text
$ cd redis-5.0.3
$ make
$ make test
$ sudo make install
```

* インストール前に `make test` で問題がないことを確認した方がよいが、しなくても（大抵の場合は）問題ない。
* `/usr/local/bin` ディレクトリにインストールされる。  
  別のディレクトリにインストールしたければ、 `sudo make install PREFIX=...` で指定する。

### 3. 初期設定

シェルスクリプトを実行すると色々と質問されるが、全てデフォルト（空エンタ）で問題ない。

``` text
$ cd utils
$ sudo ./install_server.sh
Welcome to the redis service installer
This script will help you easily set up a running redis server

Please select the redis port for this instance: [6379]
Selecting default: 6379
Please select the redis config file name [/etc/redis/6379.conf]
Selected default - /etc/redis/6379.conf
Please select the redis log file name [/var/log/redis_6379.log]
Selected default - /var/log/redis_6379.log
Please select the data directory for this instance [/var/lib/redis/6379]
Selected default - /var/lib/redis/6379
Please select the redis executable path [/usr/local/bin/redis-server]
Selected config:
Port           : 6379
Config file    : /etc/redis/6379.conf
Log file       : /var/log/redis_6379.log
Data dir       : /var/lib/redis/6379
Executable     : /usr/local/bin/redis-server
Cli Executable : /usr/local/bin/redis-cli
Is this ok? Then press ENTER to go on or Ctrl-C to abort.
Copied /tmp/6379.conf => /etc/init.d/redis_6379
Installing service...
Success!
Starting Redis server...
Installation successful!
```

* （今回の場合）設定は `/etc/redis/6379.conf` に記述されているので、変更が必要なった場合はこのファイルを編集する。

### 4. Redis サーバの起動・停止等

``` text
$ sudo service redis_6379 start|stop|restart|status
```

以下でもよい。

``` text
$ sudo /etc/init.d/redis_6379 start|stop|restart|status
```

OS を再起動すれば、以下のように `systemctl` も使えるようになる。

``` text
$ sudo systemctl start|stop|restart|status redis_6379
```

### 5. Redis サーバの自動起動の設定

インストール直後は自動起動するようになっているはず。  
必要に応じて、設定する。（以下の設定では `sysv-rc-conf` コマンドを使用するので、未インストールならインストールする）

以下は、自動起動するような設定。

``` text
$ sudo sysv-rc-conf redis_6379 on
$ sysv-rc-conf --list | grep redis
redis_6379   0:off      1:off   2:on    3:on    4:on    5:on    6:off
```

以下は、自動起動しないような設定。

``` text
$ sudo sysv-rc-conf redis_6379 off
$ sysv-rc-conf --list | grep redis
redis_6379   0:off      1:off   2:off   3:off   4:off   5:off   6:off
```

`systemctl` が使えるなら、以下のようにしてもよい。

``` text
$ sudo systemctl enable redis_6379
redis_6379.service is not a native service, redirecting to systemd-sysv-install.
Executing: /lib/systemd/systemd-sysv-install enable redis_6379

$ sudo systemctl is-enabled redis_6379
redis_6379.service is not a native service, redirecting to systemd-sysv-install.
Executing: /lib/systemd/systemd-sysv-install is-enabled redis_6379
enabled
```

``` text
$ sudo systemctl disable redis_6379
redis_6379.service is not a native service, redirecting to systemd-sysv-install.
Executing: /lib/systemd/systemd-sysv-install disable redis_6379
insserv: warning: current start runlevel(s) (empty) of script `redis_6379' overrides LSB defaults (2 3 4 5).
insserv: warning: current stop runlevel(s) (0 1 2 3 4 5 6) of script `redis_6379' overrides LSB defaults (0 1 6).

$ sudo systemctl is-enabled redis_6379
redis_6379.service is not a native service, redirecting to systemd-sysv-install.
Executing: /lib/systemd/systemd-sysv-install is-enabled redis_6379
disabled
```

### 6. 動作確認

（`systemctl status redis_6379` 等でサービス(redis-server)が起動していることを確認してから）

``` text
$ redis-cli set name foo
OK

$ redis-cli mset address "Shimane pref." age 88
OK

$ redis-cli get name
"foo"

$ redis-cli mget address age
1) "Shimane pref."
2) "88"

$ redis-cli keys "*"
1) "age"
2) "address"
3) "name"

$ redis-cli flushall
OK

$ redis-cli keys "*"
(empty list or set)
```

* その他、他のコマンドやデータ構造等も確認してみる。（今回は環境構築がメインなので、ここでは詳細に説明しない）

### 7. その他

* サービスを停止すると、 `/var/lib/redis/6379` にダンプファイルが `dump.rdb` 作成される。  
  次のサービス起動時にこのダンプファイルからデータが読み込まれる。

### 8. 参考

* [Redis](https://redis.io/ "Redis")

---

Redis でジョブキューサーバの運用をと考えたが、自作 Ruby ツールで賄えているので、今のところは Redis を使用したいと感じる状況にない。

今回、後学のために Redis に触れてみた次第。

以上。

