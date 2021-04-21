---
layout   : single
title    : "Linux - OOM Killer の発動を抑制！"
published: true
date     : 2016-03-15 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
---

Linux で、大事なサービスがメモリ不足で kill されないようにするための方法についてです。

<!--more-->

### 0. 前提条件

* CentOS 6.7(32bit) での作業を想定。（他のディストリビューションでも同様のはず）

### 1. OOM Killer とは？

* 物理メモリもスワップメモリも使い尽くし Linux カーネルが新たにメモリを割り当てられなくなったとき、最も悪さをしているプロセスを停止するために発動するのが OOM Killer(Out Of Memory Killer) である。
* 「悪さ」とは、大まかには「メモリ（物理＆スワップ）を多く使用する」という意味。
* 各プロセスは oom_score_adj("/proc/oom_score_adj") という優先度を表す値を保有している。  
  - oom_score_adj の値の範囲は `-1000`～`1000` で、低い値ほど kill されにくい。
  - デフォルト値は `0` で、`-1000` だと kill されない。
* init プロセスやカーネルスレッドなどは OOM Killer 発動対象外。
* `CAP_SYS_ADMIN` というケーパビリティを持っているプロセスは優遇される（oom_score_adj が `-30`される）。

### 2. oom_score_adj 値の確認

まず、以下のような bash スクリプトを作成する。（oom_score_adj 値が `0` でないものの一覧を出力するスクリプト）

File: `check_oom_score_adj.sh`

{% highlight bash linenos %}
#! /bin/bash

for dir in /proc/[0-9]*; do
  if [ "`cat $dir/oom_score_adj`" != 0 ]; then
    echo "`cat $dir/comm` : `cat $dir/oom_score_adj`"
  fi
done | sort | uniq
{% endhighlight %}

そして、実行権限を付与して実行する。

``` text
# chmod +x check_oom_score_adj

# ./check_oom_score_adj
auditd : -1000
sshd : -1000
udevd : -1000
```

### 3. oom_score_adj 値の変更

特定のプロセス（サービス）の oom_score_adj 値を変更するには、サービス起動(init)スクリプト内を以下のように変更する。  
（以下は "/etc/rc.d/init.d/mysqld" スクリプトを編集する例で、プロセス ID が "/var/run/mysqld/mysqld.pid" に設定されていて、oom_score_adj 値を `-100` に設定する場合）

File: `/etc/rc.d/init.d/mysqld`

{% highlight bash linenos %}
# ===< 中略 >===

# 以下の4行を追加
set_oom_score_adj () {
    [ -f /var/run/mysqld/mysqld.pid ] && \
    echo -100 > /proc/`cat /var/run/mysqld/mysqld.pid`/oom_score_adj
}

# ===< 中略 >===

case "$1" in
    start)
        # ===< 中略 >===
        set_oom_score_adj  # <= 追加
        ;;

    # ===< 中略 >===

    restart)
        # ===< 中略 >===
        set_oom_score_adj  # <= 追加
        ;;

    # ===< 中略 >===

{% endhighlight %}

### 4. サービスの再起動

``` text
# /etc/rc.d/init.d/mysqld restart
```

### 5. oom_score_adj 値の再確認

再度、oom_score_adj 値を確認してみる。

``` text
# ./check_oom_score_adj.sh
auditd : -1000
mysqld : -100
sshd : -1000
udevd : -1000
```

`mysqld` の oom_score_adj 値が `-100` になっている。

### 6. その他

"/etc/sysctl.conf" に `vm.oom-kill=0` を設定後 `sysctl -p /etc/sysctl.conf` で OOM-Killer を無効にする方法も考えられる。（全てにおいて無効にするのはいかがなものかと思うが）

### 7. 参考サイト

* [OOM Killer に殺されないようにする - いますぐ実践! Linuxシステム管理 / Vol.238](http://www.usupi.org/sysad/238.html "OOM Killer に殺されないようにする - いますぐ実践! Linuxシステム管理 / Vol.238")

---

以上。

