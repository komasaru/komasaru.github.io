---
layout   : single
title    : "MariaDB(MySQL) - クエリキャッシュヒット率の計算！"
published: true
date     : 2015-03-18 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- MariaDB
- MySQL
---
こんにちは。

MariaDB(MySQL) サーバをチューニングする際によく使用する計算式についてに備忘録です。

<!--more-->

### 0. 前提条件

* MySQL 5.6.23, MariaDB 10.0.15, MariaDB 5.5.42 での作業を想定。
* クエリキャッシュ機能を有効にしている。  
  (`query_cache_type` が `0` 以外、`query_cache_size` が `0` 以外)

### 1. クエリキャッシュ情報の出力

コマンドラインで以下のように実行する。

``` text
# mysqladmin -u root -p extended-status | grep Qcache
Enter password:
| Qcache_free_blocks                            | 3314        |
| Qcache_free_memory                            | 12395448    |
| Qcache_hits                                   | 823407      |
| Qcache_inserts                                | 843700      |
| Qcache_lowmem_prunes                          | 273787      |
| Qcache_not_cached                             | 28499       |
| Qcache_queries_in_cache                       | 50239       |
| Qcache_total_blocks                           | 103836      |
```

もしくは、MariaDB(MySQL) サーバに root でログイン後に以下のように実行してもよい。

``` text
> show global status like 'Qcache%';
```

### 2. クエリキャッシュヒット率の計算

クエリキャッシュのヒット率は以下のような式で計算する。

``` text
Qcache ヒット率 = Qcache_hits / (Qcache_hits + Qcache_inserts + Qcache_not_cached) * 100 [%]
```

前項の出力例で計算してみると、次のようになる。

``` text
Qcache ヒット率 = 823407 / (823407 + 843700 + 28499) * 100
                = 48.56 [%]
```

### 3. クエリキャッシュヒット率計算用 SQL

参考までに、クエリキャッシュヒット率計算用 SQL をご紹介。

``` sql
SELECT (SELECT VARIABLE_VALUE
          FROM INFORMATION_SCHEMA.GLOBAL_STATUS
         WHERE VARIABLE_NAME = 'QCACHE_HITS')
     / (SELECT SUM(VARIABLE_VALUE)
          FROM INFORMATION_SCHEMA.GLOBAL_STATUS
         WHERE VARIABLE_NAME IN ('QCACHE_HITS', 'QCACHE_INSERTS', 'QCACHE_NOT_CACHED'))
     * 100 AS QCACHE_HIT_RATIO;
```

---

以上。

