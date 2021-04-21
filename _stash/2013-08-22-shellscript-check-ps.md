---
layout   : single
title    : "シェルスクリプト - サービス起動確認！"
published: true
date     : 2013-08-22 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- シェル
- bash
---

Linux 上シェルスクリプト内でサービス（プロセス）が起動しているかどうかを確認する方法についての備忘録です。

プロセス確認でよく使用するのは `ps aux` や `top` コマンドですが、`ps` コマンドに `grep` コマンド等をパイプして起動中のプロセス数を取得し、その数で起動しているか停止しているかを判定します。（当方は、シェルスクリプト内でよく使用します）

<!--more-->

### 0. 前提条件

- Linux Mint 14 (64bit) での作業を想定。
- `ps`（`procps-ng`）のバージョンは 3.3.3 を想定。
- `ps` コマンドは BSD 系 Unix の `ps` コマンドと似ているが若干異なる。  
  BSD 系 Unix 由来のオプションには `-` を付与しないことに注意。

### 1. 方法・その１

#### 1-1. コマンド

``` bash 
$ ps -ef | grep mysqld | grep -v grep | wc -l
```

1. `ps -ef` : 現在起動中のプロセスの一覧を出力。  
   - `-e` : 全プロセスの情報を表示するオプション。（= `-A`）
   - `-f` : ユーザごとのプロセス詳細情報を表示するオプション。
2. `grep mysqld` : "mysqld" という文字列を含むものを抽出。
3. `grep -v grep` : `ps -ef` の結果には `grep mysqld` コマンドも含まれるので、それ（"grep" 文字列にマッチする行）は除く。
   - `-v` : マッチしない行を検索結果として表示するオプション。
4. `wc -l` : 行数を出力。
   - `-l` : 行数だけを出力するオプション。

#### 1-2. 実行例

以下は、mysqld サーバ（プロセス）停止時の、コマンド実行例。

``` bash 
$ ps -ef | grep mysqld | grep -v grep | wc -l
0
```

以下は、mysqld サーバ（プロセス）起動中の、コマンド実行例。

``` bash 
$ ps -ef | grep mysqld | grep -v grep | wc -l
2
```

### 2. 方法・その２

#### 2-1. コマンド

``` bash 
$ ps cax | grep mysqld | wc -l
```

1. `ps cax` : システム上の全てのプロセスを出力。
   - `c` : 実行コマンド名で表示するオプション。
   - `a` : ユーザーのプロセスを全て表示するオプション。
   - `x` : 制御端末のないプロセスの情報を表示するオプション。
2. `grep mysqld` : "mysqld" という文字列を含むものを抽出。
3. `wc -l` : 行数を出力。
   - `-l` : 行数だけを出力するオプション。

#### 2-2. 実行例

以下は、mysqld サーバ（プロセス）停止時の、コマンド実行例。

``` bash 
$ ps cax | grep mysqld | wc -l
0
```

以下は、mysqld サーバ（プロセス）起動中の、コマンド実行例。

``` bash 
$ ps cax | grep mysqld | wc -l
2
```

### 3. 応用

#### 3-1. シェルスクリプト作成

以下のようなシェルスクリプトを作成してみる。（コマンド実行後、"0" が返る場合とそれ以外で場合分けできる例）

File: `test_ps.sh`

{% highlight bash linenos %}
#! /bin/bash

count=`ps -ef | grep mysqld | grep -v grep | wc -l`
#count=`ps cax | grep mysqld | wc -l`
if [ $count = 0 ]; then
    echo "The process is dead."
else
    echo "The process is alive."
fi
{% endhighlight %}

実行権限も付与しておく。

``` bash 
$ chmod +x test_ps.sh
```

#### 3.2. 実行例

以下は、mysqld サーバ（プロセス）停止時の、シェルスクリプト実行例。

``` bash 
$ ./test_ps.sh
The process is dead.
```

以下は、mysqld サーバ（プロセス）起動中の、シェルスクリプト実行例。

``` bash 
$ ./test_ps.sh
The process is alive.
```

---

簡単な例で説明しましたが、実際にはもっと有効に利用できます。  

当方は MySQL サーバが起動していないと正常動作しないシェルスクリプトの中で、

- シェルスクリプト起動時に MySQL サーバが未起動なら、  
  MySQL サーバを起動し、  
  シェルスクリプト終了時に元に戻す（MySQL サーバを停止する）。
- シェルスクリプト起動時に MySQL サーバが既に起動中なら、  
  MySQL サーバの起動作業はせず、  
  シェルスクリプト終了時にも MySQL サーバを停止させない。

というような処理を実装しています。

以上。

