---
layout   : single
title    : "MariaDB(MySQL) - シャットダウン時間の短縮！"
published: true
date     : 2015-11-10 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- MariaDB
- MySQL
---

MariaDB や MySQL をシャットダウン（or 再起動）する際に時間がかかりすぎることがあります。

バッファの内容をディスクに書き込むのに時間がかかっているからです。

今回は、そのイライラを軽減するための対処についての記録です。

<!--more-->

### 0. 前提条件

* MariaDB 10.0.21 での作業を想定（MySQL でも同様）
* ハード環境により成果は異なる、ということに留意。

### 1. シャットダウン時に行われる時間のかかる処理

* InnoDB Buffer Pool 全領域のチェックポイント。
* チェックポイントとは、ダーティページ（変更されたが、まだデータベースファイルに書き込まれていないページ）をテーブルスペースへ書き込むこと。

### 2. innodb_max_dirty_pages_pct について

* InnoDB は、ダーティページの割合（単位：%）が `innodb_max_dirty_pages_pct` の値を超えないように、バッファープールからデータをフラッシュしようとする。
* `innodb_max_dirty_pages_pct` のデフォルト値は `75`
* `innodb_max_dirty_pages_pct` の設定可能値は `0` 〜 `99.999` (MariaDB 10.0.15 以上), `0` 〜 `99` (MariaDB 10.0.15 未満).
* 書き込み回数を減らす（書き込みを遅らせる）ためにはこの値を大きくする。
* この値を小さくし過ぎると書き込みが頻発し、`innodb_buffer_pool_size` を大きく設定していても効果が小さくなる。

### 3. シャットダウン時間の短縮方法

1. MariaDB(MySQL) サーバにログインし以下の SQLを実行する。  
   `SET GLOBAL innodb_max_dirty_pages_pct = 0;`  
   （但し、環境によっては `0` を指定できないかもしれない。その場合は `1` や `0.001` 等でもよい）
2. `Value` 値が十分小さくなる（`0` に近付く）まで以下の SQL を断続的に実行して待つ。  
   `SHOW GLOBAL STATUS like 'innodb_buffer_pool_pages_dirty';`
3. サーバのシャットダウン（or 再起動）  
   - シャットダウン（or 再起動）すると、 `innodb_max_dirty_pages_pct` の値が設定値に戻る。
   - シャットダウン（or 再起動）し忘れると `innodb_max_dirty_pages_pct` の値が `0` のままで、頻繁にダーティページのテーブルスペースへの書き込みが発生してレスポンスが悪くなるので注意。

### 4. 所感

シャットダウンに時間がかかりすぎて不安に感じる際には、シャットダウン前にチェックポイントを実行してダーティページの書込状況を確認できるのでよいかもしれません。

### 5. 参考サイト

シャットダウンプロセスについては以下のサイトを参照。（但し、チェックポイントやダーティページについての記載はない）

* [MySQL :: MySQL 5.6 リファレンスマニュアル :: 5.1.12 シャットダウンプロセス](http://dev.mysql.com/doc/refman/5.6/ja/server-shutdown.html "MySQL :: MySQL 5.6 リファレンスマニュアル :: 5.1.12 シャットダウンプロセス")

---

以上。

