---
layout   : single
title    : "Bash - プロセス起動中・CPU 時間チェック！"
published: true
date     : 2014-12-11 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- シェル
- bash
---

Linux 上で指定のプロセスが起動中か否か、CPU 時間が指定の時間を超えているか否かをチェックする Bash スクリプトの紹介です。

Linux サーバ上で短い間隔で cron 起動する場合に、前に起動したプロセスが終了しないうちに同じプロセスが二重に起動すると困る。  
また、何らかの理由でプロセスが終了せずに永遠と残り続けていないかのチェックも行いたい。

そんな場合に使えるかと思います。（以下で紹介するスクリプトはシンプルなものにです。実際は応用を効かせてください）

<!--more-->

### 0. 前提条件

* Linux Mint 17(64bit), CentOS 6.6, 7.0 での動作を想定。
* Bash 4.3.11(Linux Mint 17), 4.1.2(CentOS 6.6), 4.2.45(CentOS 7.0) を想定。

### 1. 作成する Bash スクリプトの概要

1. プロセス起動個数取得。
2. 起動プロセス個数別に処理。
   * 起動プロセス数が 0 個なら、リターンコードを `0` にして終了。
   * 起動プロセス数が 1 個なら、CPU 時間取得。
     - CPU 時間 ＜ 指定値 なら、リターンコードを `1` にして終了。
     - CPU 時間 ≧ 指定値 なら、リターンコードを `2` にして終了。
   * 起動プロセス数が 2 個以上なら、リターンコードを `3` にして終了。

また、

* Bash スクリプト中で Linux コマンドの `ps`, `grep`, `wc`, `awk` を使用している。
* `ps` コマンドのオプションは Linux オプションである（BSD オプションとは異なる）ことに注意。
* `ps -ef` で取得される結果の７番目に CPU 時間が `HH:MM:SS` の書式で格納されていることを認識しておく。

### 2. Bash スクリプトの作成

File: `ps_check.sh`

{% highlight bash linenos %}
#!/bin/bash
# ------------------------------------------------------------
# Bash script to check processes.
# ------------------------------------------------------------
# RETURN CODE
#    0: processes are not running.
#    1: one process is running. (CPU time <  configured value)
#    2: one process is running. (CPU time >= configured value)
#    3: more than two processes are running.
# ------------------------------------------------------------
#
PS_NAME="<process_name>"
CPU_MAX=000100  # Format: `HHMMSS`

# Process counts
CNT=`ps -ef | grep -e "$PS_NAME" | grep -v grep | wc -l`

if [ $CNT -eq 0 ]; then
    echo "[RET-CODE:0] processes are not running."
    exit 0
elif [ $CNT -eq 1 ]; then
    # CPU time
    TM=`ps -ef | grep -e "$PS_NAME" | grep -v grep | awk '{ print $7 }'`
    TM=${TM:0:2}${TM:3:2}${TM:6:2}

    if [ $TM -lt $CPU_MAX ]; then
        echo "[RET-CODE:1] one process is running. (CPU time <  configured value)"
        exit 1
    else
        echo "[RET-CODE:2] one process is running. (CPU time >= configured value)"
        exit 2
    fi
else
    echo "[RET-CODE:3] more than two processes are running."
    exit 3
fi
{% endhighlight %}

* [Gist - Bash script to check processes.](https://gist.github.com/komasaru/b2d309df2e7da7702fc0 "Gits - Bash script to check processes.")

### 3. Bash スクリプトの実行

``` text
$ ./ps_check.sh
[RET-CODE:2] one process is running. (CPU time >= configured value)
```

---

当方の場合、実際の Bash スクリプト内で、指定プロセスの CPU 時間が長過ぎるような場合に root 宛にメール送信するなどしています。

以上。

