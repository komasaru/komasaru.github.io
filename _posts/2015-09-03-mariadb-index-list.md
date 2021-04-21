---
layout   : single
title    : "MariaDB(MySQL) - インデックス名一覧取得！"
published: true
date     : 2015-09-03 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- MariaDB
- MySQL
---

MariaDB(MySQL) で作成済みのインデックスの名称を確認したい場合、 `SHOW INDEX FROM table_name` を使用することが多いと思います。

しかし、一度に多数のテーブルについて確認したい場合に、テーブル単位で `SHOW INDEX FROM table_name` を実行するのは大変面倒です。

以下で、指定データベース内の全テーブルに作成済みのインデックスを一覧表示する SQL 等を紹介します。

<!--more-->

### 0. 前提条件

* MariaDB 10.0.21 での作業を想定。（MySQL でも同様のはず）

### 1. SQL 作成

``` sql
  SELECT DISTINCT TABLE_SCHEMA, TABLE_NAME, INDEX_NAME
    FROM information_schema.STATISTICS
   WHERE TABLE_SCHEMA = 'scheme_name' -- <= 対象のデータベース名
     AND INDEX_NAME <> 'PRIMARY'
ORDER BY TABLE_SCHEMA, TABLE_NAME, INDEX_NAME;
```

ちなみに、インデックスに設定されているカラム名やその順番も確認したければ、以下のような SQL となる。

``` sql
  SELECT TABLE_SCHEMA, TABLE_NAME, INDEX_NAME, COLUMN_NAME, SEQ_IN_INDEX
    FROM information_schema.STATISTICS
   WHERE TABLE_SCHEMA = 'scheme_name' -- <= 対象のデータベース名
     AND INDEX_NAME <> 'PRIMARY'
ORDER BY TABLE_SCHEMA, TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;
```

### 2. 応用

参考までに、前項で紹介した SQL を利用して、データベース内の全テーブルの全インデックス（プライマリキーを除く）を削除するストアドプロシージャを作成する。  
※当方が過去に必要に迫られて作成したストアドプロシージャで、実際はこのストアドプロシージャ実行後にインデックスを一括作成するストアドプロシージャも実行している。

``` sql
CREATE DEFINER=`root`@`localhost` PROCEDURE `del_index_all`()
BEGIN
    -- 変数宣言
    DECLARE v_tbl_name VARCHAR(50) DEFAULT '';
    DECLARE v_idx_name VARCHAR(50) DEFAULT '';
    DECLARE v_done INT DEFAULT 0;
    -- カーソル宣言
    DECLARE v_cur CURSOR FOR
        SELECT
            DISTINCT TABLE_NAME, INDEX_NAME
        FROM
            information_schema.STATISTICS
        WHERE
            TABLE_SCHEMA = 'jmx'
        AND INDEX_NAME <> 'PRIMARY'
        ORDER BY
            TABLE_SCHEMA, TABLE_NAME, INDEX_NAME;
    -- 終了ステータス宣言
    DECLARE EXIT HANDLER FOR NOT FOUND SET v_done = 1;

    -- カーソル OPEN
    OPEN v_cur;

    -- LOOP 処理
    WHILE v_done != 1 DO
        -- カーソル FETCH
        FETCH v_cur INTO v_tbl_name, v_idx_name;

        -- 動的 SQL 実行
        SET @s = CONCAT('ALTER TABLE ', v_tbl_name, ' DROP INDEX ', v_idx_name);
        PREPARE stmt FROM @s;
        EXECUTE stmt;
    END WHILE;

    -- PREPARED STATEMENT 解放
    DEALLOCATE PREPARE stmt;

    -- カーソル CLOSE
    CLOSE v_cur;
END
```

本当は、動的に SQL を実行する(PREPARED STATEMENT)部分を以下のようにしたかったが、 `?` は MariaDB のストアドではサポートされてない模様。（[参考](https://mariadb.com/kb/en/mariadb/prepare-statement/ "PREPARE Statement - MariaDB Knowledge Base")）

``` sql
    --  :
    -- 省略
    --  :

    SET @s = 'ALTER TABLE ? DROP INDEX ?';
    PREPARE stmt FROM @s;

    OPEN v_cur;

    WHILE v_done != 1 DO
        FETCH v_cur INTO v_tbl_name, v_idx_name;

        SET @tbl_name = v_tbl_name;
        SET @idx_name = v_idx_name;

        EXECUTE stmt USING @tbl_name, @idx_name;
    END WHILE;

    DEALLOCATE PREPARE stmt;

    CLOSE v_cur;
```

---

普段はあまり使用する機会はありませんが、大量のテーブルを再設計する際には有益でしょう。

以上。

