---
layout   : single
title    : "MariaDB(MySQL) - ibd ファイルの移行！"
published: true
date     : 2015-03-09 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- MariaDB
- MySQL
---
こんにちは。

MariaDB(MySQL) でテーブルデータを別のサーバへ移行する際に、大抵の場合は移行元でダンプエクスポートしてから移行先でダンプインポートすると思います。（当然、高速化のためにログやキャッシュ等の設定を一時的に変更して）

しかし、ダンプファイルが数GBもあったり、数千万レコード以上あったりすると、場合によっては（非力なマシン等では）半日に経ってもインポートが終了しないことがあります。

以下、ダンプファイルをエクスポート＆インポートせずに ibd ファイル（テーブルスペース）を丸ごと移行する方法についての記録です。

<!--more-->

### 0. 前提条件

* InnoDBのデータ領域（テーブルスペース）をテーブル単位で運用している。（"my.cnf" に `innodb_file_per_table` を記述している）
* 移行元・移行先ともに MySQL 5.6.23 という環境で動作確認済み。
* 移行元・移行先ともに MariaDB 10.0.15 という環境で動作確認済み。
* 移行元 MySQL 5.6.23, 移行先 MariaDB 10.0.15 という環境では、エラー（後述）が発生して移行不可能。（逆は未確認）

### 1. 移行元サーバ

#### 1-1. cfg ファイルの作成

``` text
> FLUSH TABLE tbl_name FOR EXPORT;
```

#### 1-2. ibd, cfg ファイルの退避

ibd ファイルと前項で作成された cfg ファイルを適当なディレクトリに退避（複製）する。  
（クライアントを閉じると cfg ファイルが消えてしまうので注意）

#### 1-3. ロック解除

cfg ファイル作成時にテーブルロックされるので、以下のコマンドでテーブルロックを解除する。

``` text
> UNLOCK TABLES;
```

### 2. 移行先サーバ

#### 2-1. テーブル作成

移行元と同じテーブル定義でテーブルを作成する。

#### 2-2. ibd ファイルの廃棄

前項のテーブル作成時に作成された ibd ファイルは不要なので廃棄する。

``` text
> ALTER TABLE tbl_name DISCARD TABLESPACE;
```

#### 2-3. ibd ファイルの配置

移行元の ibd, cfg ファイルをデータディレクトリ内に配置する。（当然、ファイルパーミッション等に注意）

#### 2-4. データのインポート

以下のコマンドでデータをインポートする。

``` text
> ALTER TABLE tbl_name IMPORT TABLESPACE;
```

### 3. MySQL 5.6 系から MariaDB 10.0 系への移行について

移行元を MySQL 5.6.23, 移行先を MariaDB 10.0.15 として上記の処理を行うと、2-4 のインポート処理時に以下のエラーとなる。

``` text
ERROR 1808 (HY000): Schema mismatch (Column d precise type mismatch.)
```

どうやら、バグがあるようだ。（MariaDB 10.1 系では Fix されているようだが、当方 MariaDB 10.1 系環境がないので未確認）

* [［MDEV-6389］ DATETIME w/ transportable tablespaces from MySQL 5.6 to MariaDB 10.0 gives "precise type mismatch" error. - JIRA](https://mariadb.atlassian.net/browse/MDEV-6389 "[MDEV-6389] DATETIME w/ transportable tablespaces from MySQL 5.6 to MariaDB 10.0 gives 'precise type mismatch' error. - JIRA")

---

ダンプファイルをインポートするのに膨大に時間がかかるような場合にこの方法を使用するとかなり効果があります。（非力なマシンで数GBのダンプファイルをインポートするのに（設定・オプションを駆使しても）半日以上かかっていたものが、数分の作業で完了しました）

また、移行元と移行先を別々のターミナルで操作すると若干効率が良くなると思います。

ただ、面倒な作業ですので、当方はどうしても必要な場合に限定しています。  
この作業を応用して大量のテーブルデータを自動で処理（シェル化）できればよいのですが、テーブルロック＆解除のタイミングの問題があり実現は難しそうですし。

以上。

