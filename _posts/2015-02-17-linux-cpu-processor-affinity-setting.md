---
layout   : single
title    : "Linux - CPU プロセッサアフィニティ（親和性）の設定！"
published: true
date     : 2015-02-17 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
---
こんにちは。

Linux 上で、実行中のプロセス（コマンド）が複数あるどの CPU プロセッサと親和性があるのか確認したり、親和性をとる CPU プロセッサを指定する方法についての記録です。

「CPU プロセッサアフィニティ」は、簡単に説明すると「あるプロセスがどの CPU プロセッサで実行されるか」ということです。  
「アフィニティ(affinity)」は、 「親和性」、「関係」、「有縁性」などと呼ばれることもあります。

注意するのは、「CPU コア」ではなく「CPU プロセッサ」であるということです。  
ここでの「プロセッサ」とは、物理的な CPU ではなく `cat /proc/cpuinfo` で出力されるプロセッサや `lscpu` コマンドで出力される `CPU(s)` のことで、いわゆる「論理 CPU」のことです。  
ちなみに、「CPU コア数」はプロセッサ（ソケット）当たりのコア数のことです。  
（例えば、 "Intel Atom 230" などは CPU コア数は 1 だが、プロセッサ数は 2 ）

以下では、デフォルトでインストール済みの `taskset` コマンドの使用方法について記録しています。

<!--more-->

### 0. 前提条件

* Linux Mint 17.1(64bit), CentOS 6.6(32bit), Debian GNU/Linux 7.8.0(64bit) で動作確認済み。

### 1. 使用方法

``` text
$ taskset [options] [mask | cpu-list] [pid|cmd [args...]]
```

詳細は `taskset --help` or `man taskset` で確認可。

### 2. 親和性確認

実行中のプロセスがどの CPU と親和性があるか確認するには、以下のように実行する。  
（直接 PID を指定するか、 `pgrep` コマンド等で検索して指定する）

以下は、プロセッサ数２個の CPU で親和性を CPU マスクを表示して確認する例。

``` text
$ taskset -p `pgrep -f hoge`
pid 19329's current affinity mask: 3
```

ここの `3` は CPU-0 と CPU-1 が有効になっていることを表す二進数 `00000011` を16進変換されたもの。  
CPU-1 のみが有効になっている場合は `00000010` を16進変換して `2` となる。

同じことを CPU リストを表示して確認する場合は `-c` オプションを使用する。

``` text
$ taskset -p -c `pgrep -f hoge`
pid 11338's current affinity list: 0,1
```

### 3. CPU 割り当ての変更

実行中のプロセスの親和性を切り替える（特定の CPU プロセッサのみで実行されるように変更する）には、以下のように実行する。  
（直接 PID を指定するか、 `pgrep` コマンド等で検索して指定する）

以下は、プロセッサ数２個の CPU で CPU-0, CPU-1 に親和性があるプロセスを CPU-0 のみに変更する例。

``` text
$ taskset -p -c 0 `pgrep -f hoge`
pid 11338's current affinity list: 0,1
pid 11338's new affinity list: 0
```

以下は、プロセッサ数２個の CPU で CPU-0 のみに親和性があるプロセスを CPU-0, CPU-1 に変更する例。

``` text
$ taskset -p -c 0,1 `pgrep -f hoge`
pid 19329's current affinity list: 0
pid 19329's new affinity list: 0,1
```

CPU リスト（`-c` オプション）を使用せず CPU マスクを使用して変更する場合は以下のようにする。（CPU-1 のみに変更する例）

``` text
$ taskset -p 0x2 `pgrep -f hoge`
```

他に、CPU-0 〜 CPU-3 の全てを指定するなら `0-3` のように指定することも可能。

### 4. プロセス（コマンド）実行時の指定

プロセス（コマンド）実行に親和性をとる CPU プロセッサを指定（特定の CPU プロセッサのみで実行されるよう指定）するには、以下のように実行する。

以下は、プロセッサ数２個の CPU で CPU-0 に親和性をとって実行する（CPU リストを使用した）例。

``` text
$ taskset -c 0 hoge
```

CPU リストで指定せず CPU マスクで指定する場合は以下のようになる。

``` text
$ taskset 0x1 hoge
```

### 5. 注意

* `pgrep` コマンドでの検索結果が複数にならないよう（検索文字列の指定が**拡張正規表現**であること）に注意。（`pgrep -f hoge` だと `hoge` も `hogexxx` も `xxxhoge` 等もマッチしてしまうということ）  
  厳密に指定するなら `pgrep -f ^hoge$` のように指定するとよいだろう。
* オプション指定の順序は問わない。（`-c -p` でも `-p -c` でもよい）
* オプション指定はまとめることも可能。（`-cp` や `-pc` のように）

### 6. 参考サイト

* [taskset](http://linuxcommand.org/man_pages/taskset1.html "taskset")

---

他に CPU プロセッサ・アフィニティを設定しているアプリケーションがある場合には、 CPU 負荷を分散させる意味で `taskset` コマンドを使用するとよいでしょう。（体感できるほど効果はあまり感じませんが）

以上。

