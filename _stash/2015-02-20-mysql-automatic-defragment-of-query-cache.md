---
layout   : single
title    : "MariaDB(MySQL) - クエリキャッシュの自動デフラグメント！"
published: true
date     : 2015-02-20 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- MySQL
- MariaDB
---
こんにちは。

MariaDB(MySQL) で、自動でクエリキャッシュのメモリ領域をデフラグメントして使用効率を向上させる方法についての記録です。

<!--more-->

### 0. 前提条件

* MariaDB 10.0.15, MySQL 5.6.23 サーバでの作業を想定。
* クエリキャッシュ機能を有効にしていること。  
  "my.cnf" で `query_cache_size` を `0` 以外、`query_cache_type` を `0`(OFF) 以外に設定している。  
  （設定確認は `SHOW VARIABLES LIKE 'have_query_cache';`, `SHOW VARIABLES LIKE 'query_cache_%';` で）
* MariaDB(MySQL) のイベントスケジューラを使用し自動で処理することを想定。

### 1. クエリキャッシュのデフラグメント

手動でクエリキャッシュのデフラグメントするには、MariaDB(MySQL) サーバに root（or RELOAD 権限を保有しているユーザ）でログインして以下を実行する。

``` text
> FLUSH QUERY CACHE
```

### 2. イベントスケジューラの有効化

自動化するには、イベントスケジューラの機能を使用する。

MariaDB(MySQL) のイベントスケジューラが有効になっていなければ、以下のように "my.cnf" の `[mysqld]` に追記後 MariaDB(MySQL) を再起動する。

File: `my.cnf`

{% highlight bash linenos %}
[mysqld]
event-scheculer = 1
{% endhighlight %}

MariaDB(MySQL) サーバを再起動させたくなければ、 root でログイン後に以下のように実行すればよい。（ただし、当然ながら再起動時には元に戻ってしまうので、この場合も "my.cnf" は設定しておく）

``` text
SET GLOBAL event_scheduler=1;
```

### 3. イベントスケジューラ有効化の確認

イベントスケジューラが有効になっているか確認する。

``` text
> SHOW VARIABLES LIKE 'event_scheduler';
+-----------------+-------+
| Variable_name   | Value |
+-----------------+-------+
| event_scheduler | ON    |
+-----------------+-------+
1 row in set (0.00 sec)
```

プロセスリストでも確認してみる。（`event_scheduler` ユーザ分が存在するか確認）

``` text
MariaDB [(none)]> show processlist\G
*************************** 1. row ***************************
      Id: 1
    User: event_scheduler
    Host: localhost
      db: NULL
 Command: Daemon
    Time: 541
   State: Waiting on empty queue
    Info: NULL
Progress: 0.000
*************************** 2. row ***************************
      Id: 4
    User: root
    Host: localhost
      db: NULL
 Command: Query
    Time: 0
   State: NULL
    Info: show processlist
Progress: 0.000
2 rows in set (0.00 sec)
```

### 4. イベントスケジュールの登録

まず、データベースを選択する。（今回の処理は特定のデータベースに依存しないので、どのデータベースを選択してもよいだろう）

``` text
MariaDB [(none)]> use hoge
Database changed
```

そして、以下のように実行する。（2015-02-10 の午前1時から毎日実行する例）  

``` text
MariaDB [hoge]> CREATE EVENT flush_query_cache
    -> ON SCHEDULE EVERY 1 DAY STARTS '2015-02-10 01:00:00'
    -> ENABLE
    -> DO
    -> FLUSH QUERY CACHE;
Query OK, 0 rows affected (0.15 sec)
```

### 5. イベントスケジュールの確認

登録したイベントスケジュールを確認してみる。

``` text
MariaDB [hoge]> SHOW EVENTS\G
*************************** 1. row ***************************
                  Db: hoge
                Name: flush_query_cache
             Definer: root@localhost
           Time zone: SYSTEM
                Type: RECURRING
          Execute at: NULL
      Interval value: 1
      Interval field: DAY
              Starts: 2015-02-10 01:00:00
                Ends: NULL
              Status: ENABLED
          Originator: 1
character_set_client: utf8mb4
collation_connection: utf8mb4_general_ci
  Database Collation: utf8mb4_general_ci
1 row in set (0.00 sec)
```

より詳細に確認するには以下のようにする。

``` text
MariaDB [hoge]> SELECT * FROM information_schema.EVENTS\G
*************************** 1. row ***************************
       EVENT_CATALOG: def
        EVENT_SCHEMA: hoge
          EVENT_NAME: flush_query_cache
             DEFINER: root@localhost
           TIME_ZONE: SYSTEM
          EVENT_BODY: SQL
    EVENT_DEFINITION: FLUSH QUERY CACHE
          EVENT_TYPE: RECURRING
          EXECUTE_AT: NULL
      INTERVAL_VALUE: 1
      INTERVAL_FIELD: DAY
            SQL_MODE: STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION
              STARTS: 2015-02-10 01:00:00
                ENDS: NULL
              STATUS: ENABLED
       ON_COMPLETION: NOT PRESERVE
             CREATED: 2015-02-09 11:34:38
        LAST_ALTERED: 2015-02-09 11:34:38
       LAST_EXECUTED: NULL
       EVENT_COMMENT:
          ORIGINATOR: 1
CHARACTER_SET_CLIENT: utf8mb4
COLLATION_CONNECTION: utf8mb4_general_ci
  DATABASE_COLLATION: utf8mb4_general_ci
1 row in set (0.05 sec)
```

### 6. クエリキャッシュの状態確認

参考までに、クエリキャッシュの状態を確認するには以下のようにする。  
`FLUSH QUERY CACHE` の実行前と実行後で比較してみるよいだろう。（デフラグメントされたかどうかは分かりにくいかも知れないが・・・）

``` text
MariaDB [mkmode]> SHOW STATUS LIKE 'Qcache%';
+-------------------------+----------+
| Variable_name           | Value    |
+-------------------------+----------+
| Qcache_free_blocks      | 1        |
| Qcache_free_memory      | 10665872 |
| Qcache_hits             | 3258     |
| Qcache_inserts          | 8406     |
| Qcache_lowmem_prunes    | 0        |
| Qcache_not_cached       | 5        |
| Qcache_queries_in_cache | 3284     |
| Qcache_total_blocks     | 11000    |
+-------------------------+----------+
8 rows in set (0.11 sec)
```

### 7. 参考サイト

* [MySQL :: MySQL 5.6 Reference Manual :: 13.7.6.3 FLUSH Syntax](http://dev.mysql.com/doc/refman/5.6/en/flush.html "MySQL :: MySQL 5.6 Reference Manual :: 13.7.6.3 FLUSH Syntax")
* [MySQL :: MySQL 5.6 Reference Manual :: 20.4 Using the Event Scheduler](http://dev.mysql.com/doc/refman/5.6/en/events.html "MySQL :: MySQL 5.6 Reference Manual :: 20.4 Using the Event Scheduler")

---

フラグメントの効果は体感できないほど小さいですが、気分的にやらないよりはやった方がよいかと感じて試行した次第です。

以上。

