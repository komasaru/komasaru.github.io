---
layout   : single
title    : "MariaDB - レプリケーション設定（GTID 使用）！"
published: true
date     : 2015-07-18 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- MariaDB
- Linux
---

従来からあるレプリケーションとは異なる GTID(Global Transaction ID) を使用したレプリケーション設定の記録です。

MySQL とは実装自体が異なるため、MySQL と若干設定の異なる部分もあります。

<!--more-->

### 0. 前提条件

* Master 側、Slave 側ともに MariaDB 10.0.20 を想定。
* Master 側は既存のサーバ、Slave 側は今回新規に構築したばかりのサーバを想定。  
  （Slave 側も既存のサーバの場合は、 "ibdata1", "ib_logfile0", "ib_logfile1" ファイルを削除(DISCARD)する作業が必要かも）
* レプリケーション用のユーザは "repl" を想定。
* ストレージエンジンは InnoDB を想定。
* GTID(Global Transaction ID) がどんなものであるかは、ここでは説明しない。
* 以下の説明で出現する設定ファイルは、環境によりパスやファイル名が異なるかもしれないので、適宜置き換えること。

### 1. [Master] 設定ファイルの編集

MariaDB 設定ファイル "/etc/mysql/conf.d/mariadb.cnf" を編集する。

File: `/etc/mysql/conf.d/mariadb.cnf`

{% highlight bash linenos %}
server-id = 1           # <= ネットワーク内で重複しないよに設定
log-bin = mariadb-bin   # <= バイナリログを設定（名前は任意）
bind-address = 0.0.0.0  # <= 変更（Slave 側からもアクセスできるようにする）
                        #    もしくは、`::`
                        #    もしくは、コメントアウト
{% endhighlight %}

### 2. [Master] MariaDB サーバの再起動

``` text
# systemctl restart mysql
```

### 3. [Master] レプリケーション用ユーザの作成

MariaDB サーバに root でログインし、レプリケーション用（Slave 側から Master 側にログインするための）ユーザを作成する。

``` text
> GRANT REPLICATION SLAVE ON *.* TO repl@'Slave 側のホスト名 or IP アドレス' IDENTIFIED BY 'repl のパスワード';
> FLUSH PRIVILEGES;
```

### 4. [Master] DB ダンプファイルの出力

全データベースのダンプファイルを出力する。

``` text
# mysqldump -u root -p --all-databases --single-transaction --master-data=2 > master.sql
```

`--master-data=2` は、ダンプファイルに `-- CHANGE MASTER TO MASTER_LOG_FILE=...` を出力するオプション。

### 5. [Master] GTID の取得

前項で取得したダンプファイルの `-- CHANGE MASTER TO MASTER_LOG_FILE=...` を確認し、バイナリログファイル名とポジションを控える。（ダンプファイルのサイズが大きい場合は、テキストエディタで開くのに注意！）

``` text
# head -n 30 master.sql | grep MASTER_LOG_FILE
-- CHANGE MASTER TO MASTER_LOG_FILE='mariadb-bin.000009', MASTER_LOG_POS=330;
```

そして、MariaDB サーバに root でログイン後に以下を実行して GTID ポジションを取得し、控えておく。

``` text
> SELECT BINLOG_GTID_POS('mariadb-bin.000009', 330);
+--------------------------------------------+
| BINLOG_GTID_POS('mariadb-bin.000009', 330) |
+--------------------------------------------+
| 0-2-10521                                  |
+--------------------------------------------+
1 row in set (0.03 sec)
```

### 6. [Slave] DB ダンプファイルのリストア

Master 側で出力した DB ダンプファイルを何かしらの方法で Slave 側へ移動し、リストアする。

``` text
# mysql -u root -p < master.sql
```

### 7. [Slave] 設定ファイルの編集

MariaDB 設定ファイル "/etc/mysql/conf.d/mariadb.cnf" を編集する。

File: `/etc/mysql/conf.d/mariadb.cnf`

{% highlight text linenos %}
server-id = 2          # <= ネットワーク内で重複しないように設定
log-bin = mariadb-bin  # <= バイナリログを設定（名前は任意）
{% endhighlight %}

### 8. [Slave] MariaDB サーバの再起動

``` text
# systemctl restart mysql
```

### 9. [Slave] レプリケーションの設定

MariaDB サーバに root でログインし、以下のように実行する。

``` sql
> SET GLOBAL gtid_slave_pos = '0-2-10521';  # <= 3 で取得した GTID を指定
Query OK, 0 rows affected (0.32 sec)

> CHANGE MASTER TO
    -> master_host = 'Master 側のホスト名 or IPアドレス',
    -> master_user = 'repl',
    -> master_password = 'repl のパスワード',
    -> master_use_gtid = slave_pos;
Query OK, 0 rows affected (0.23 sec)
```

### 10. [Slave] レプリケーションの開始

続けて、以下のように実行する。

``` text
> START SLAVE;
Query OK, 0 rows affected (0.18 sec)
```

ちなみに、レプリケーションを停止するには、以下のように実行する。

``` text
> STOP SLAVE;
```

ステータスは以下で確認できる。

``` text
> SHOW SLAVE STATUS\G
```

### 11. 動作確認

Master 側への INSERT, UPDATE, DELETE 等が Slave 側にも反映されることを確認する。

### 12. レプリケーションの完全停止設定

レプリケーションの完全に停止（一時的な停止でなく、機能そのものを削除）するには、 Slave 側で以下を実行後に MariaDB サーバを再起動すればよい。

``` text
> STOP SLAVE;
> RESET SLAVE ALL;
```

（`RESET SLAVE` だと HOST, USER, PASSWORD はリセットされない）

ちなみに、MySQL の古いバージョンだと、以下を実行後に MariaDB サーバを再起動すればよい。（当方、未確認）

``` text
> STOP SLAVE;
> RESET SLAVE;
> CHANGE MASTER TO MASTER_HOST='';
```

また、このレプリケーション停止設定をしなければ、 `STOP SLAVE` をしても MariaDB サーバ再起動時に Slave が開始されてしまう。

### 13. 参考サイト

* [Standard Replication - MariaDB Knowledge Base](https://mariadb.com/kb/en/mariadb/standard-replication/ "Standard Replication - MariaDB Knowledge Base")

---

GTID を使用したレプリケーションにはメリット・デメリットがあります。  
よく理解した上で運用すると、サーバ運用が効率化されるのではないでしょうか。

以上。

