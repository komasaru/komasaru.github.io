---
layout   : single
title    : "MySQL(MariaDB) - AUTO INCREMENT のリナンバリング！"
published: true
date     : 2014-07-07 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- MariaDB
- MySQL
---

MySQL(MariaDB) で AUTO INCREMENT のカラムを設定している場合、レコードの削除を行なうと当然ながら番号が歯抜けになります。

それほど問題に感じることでもありませんが、気にならないこともないです。

以下、リナンバリング（再採番）する方法についての記録です。

<!--more-->

### 0. 前提条件

- MySQL 5.6.16 サーバでの作業を想定。（MySQL 5.5 系や MariaDB でも同じ）
- ストレージエンジンが InnoDB であるデータベースでの作業を想定。（MyISAM も同様のはず（未確認））

### 1. SQL 作成＆実行

以下のような SQL を作成して実行する。

手順としては、まずユーザ変数を利用してリナンバリングする。  
そして、リナンバリングしただけでは次回レコード挿入時の番号はリナンバリングする前のままであるので、 `AUTO_INCREMENT` の設定値を最大番号＋１に設定する（プリペアドステートメントを実行する）。（**かなり重要**）

``` sql
-- Auto Increment リナンバリング
SET @new_id := 0;
UPDATE table_name
   SET id = @new_id := @new_id + 1
 ORDER BY id;

-- Prepared Statement 生成
SET @next_id := (SELECT MAX(id) FROM table_name) + 1;
SET @sql := CONCAT('ALTER TABLE table_name AUTO_INCREMENT = ', @next_id);
PREPARE reset_id FROM @sql;

-- Prepared Statement 実行
EXECUTE reset_id;

-- Prepared Statement 解放
DEALLOCATE PREPARE reset_id;
```

上記 SQL の簡単な説明。

- ユーザ変数名の先頭には `@` マークを付加する。
- ユーザ変数への `SET` での値の設定は `=` または `:=` を使用する。（`SET` 以外では `:=`）
- `ALTER TABLE ...` は DDL(Data Definition Language, データ定義言語)なので、プリペアドステートメントで動的に実行する。
- 後続処理があるのなら、メモリ節約のためにプリペアドステートメントを解放しておくとよい。

### 2. その他

上記の方法以外に、AUTO INCREMENT を設定しているカラムを一旦削除して再度 AUTO INCREMENT 属性のカラムを追加することでもリナンバリングされるが、これだと row_id 順にナンバリングされてしまう。それでも構わない場合はそれでよい。

---

これで AUTO-INCREMENT の歯抜けがスッキリと連番になります。気になる場合は是非お試しを。

以上。

