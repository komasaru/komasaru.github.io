---
layout   : single
title    : "Linux - ionice でディスクI/Oによる負荷を調整！"
published: true
date     : 2015-07-12 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
---

ご存知のとおり、プロセス実行優先度の管理は `nice` コマンドで行います。

今回は、ディスク I/O 優先度の管理を行う `ionice` についての備忘録です。

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 8 Jessie での作業を想定。

### 1. 使用方法

``` text
$ ionice --help

ionice - sets or gets process io scheduling class and priority.

Usage:
  ionice [OPTION] -p PID [PID...]
  ionice [OPTION] COMMAND

Options:
  -c, --class <class>   scheduling class name or number
                           0: none, 1: realtime, 2: best-effort, 3: idle
  -n, --classdata <num> scheduling class data
                           0-7 for realtime and best-effort classes
  -p, --pid=PID         view or modify already running process
  -t, --ignore          ignore failures
  -V, --version         output version information and exit
  -h, --help            display this help and exit
```

* スケジューリングクラス(`-c`)について
  - `1`(RealTime) ... 最も優先度が高い。
  - `2`(Best-Effort) ... `1`(RealTime) と `3`(Idle) の間。
  - `3`(Idle)  ... 最も優先度が低い。
* プライオリティ(`-n`)について
  - スケジューリングクラス `1`(RealTime) と `2`(Best-Effort) にのみ使用可能。
  - `0` 〜 `7` ... 値が小さいほど優先度が高い。

### 2. 使用例

以下は、コマンド `cmd` をディスク I/O 優先度を最高にして実行する例。

``` text
$ ionice -c 1 cmd
```

以下は、コマンド `cmd` をディスク I/O 優先度を最低にして実行する例。

``` text
$ ionice -c 3 cmd
```

以下は、コマンド `cmd` をディスク I/O 優先度をベストエフォート（優先度最低）にして実行する例。

``` text
$ ionice -c 2 -n 7 cmd
```

以下は、プロセス番号 `1234` で実行中のプロセスのディスク I/O 優先度を確認する例。

``` text
$ ionice -p 1234
```

以下は、プロセス番号 `1234` で実行中のプロセスのディスク I/O 優先度を最低に変更する例。

``` text
$ ionice -c 3 -p 1234
```

以下は、コマンド `cmd` をプロセス優先度を最低、ディスク I/O 優先度も最低にして実行する例。（マシンに最も負荷をかけない方法）

``` text
$ nice -n 19 ionice -c 3 cmd
```

---

非力なマシンで作業を行うことの多い当方にとっては、非常によく使用するコマンドです。

当然ながら、ディスク I/O の負荷が低く抑えられる代わりに処理に時間がかかります。

以上。

