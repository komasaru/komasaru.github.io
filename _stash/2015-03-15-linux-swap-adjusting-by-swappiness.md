---
layout   : single
title    : "Linux - swappiness でスワップ処理調整！"
published: true
date     : 2015-03-15 00:20:00 +0900
comments : true
categories:
- PC_Tips
- サーバ構築
tags:
- Linux
---
こんにちは。

swappiness というカーネルパラメータを使用してスワップ処理を調整する方法についての備忘録です。

物理メモリに余裕があるにも関わらず頻繁にスワップしてしまうことがあるので、対策したかったからです。（特に DB サーバマシンで）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 7.8.0(64bit) (Kernel: 3.2.0-4-amd64),  
  CentOS 6.6(32bit) (Kernel: 2.6.32-504.3.3.el6.i686) での作業を想定。
* Kernel 2.6 系以上なら同様のはず。

### 1. swappiness パラメータの概要

* このパラメータには設定する値は `0` ～ `100` で、デフォルトは `60` である。
* 値が大きいほどページのスワップ処理が増える。
* `0` だと、物理メモリを完全に使いきるまでスワップ処理は行われない。

### 2. 現在値の確認

``` text
# cat /proc/sys/vm/swappiness
60
```

### 3. 設定値の変更（次回マシンを再起動するまでの暫定的な設定）

以下は `10` に設定する例。

``` text
# sysctl -w vm.swappiness=10
vm.swappiness = 10
```

もしくは、以下のようにしても同じ効果を得られる。

``` text
echo 10 > /proc/sys/vm/swappiness
```

### 4. 設定値の変更（恒久的な設定）

前項の方法ではマシンを再起動するとデフォルト値に戻ってしまうので、恒久的に設定したければ次のようにする。

まず、 "/etc/sysctl.conf" に以下のように追記する。

File: `/etc/sysctl.conf`

{% highlight text linenos %}
vm.swappiness=10
{% endhighlight %}

そして、反映（もしくはマシン再起動）。

``` text
# sysctl -p
vm.swappiness = 10
```

### 5. 設定値の確認

設定変更が反映されたか確認しておく。

``` text
# cat /proc/sys/vm/swappiness
10
```

### 6. その他

可能なら、swappiness 設定変更後に Swap 領域をクリアしておくとよいだろう。

``` text
# cat /proc/swaps      # <= Swap デバイスの確認
Filename                                Type            Size    Used    Priority
/dev/sda5                               partition       1951740 407036  -1

# swapoff /dev/sda5    # <= Swap 領域の無効化

# swapon -a            # <= Swap 領域の有効化

```

* `-a` は "/etc/fstab" で Swap 領域に指定されているデバイスと "/proc/swaps" で認識されている領域全てを指定するオプション。  
  （Swap 領域が１個だけなら `swapoff` でも `swapoff -a` のように指定してもよいだろう）
* `swapoff` は単に無効化するのではなく、Swap 領域のデータを物理メモリに戻してから無効化する。
* `swapoff` に失敗する場合は、「物理メモリの空き容量 < Swap使用量」が影響していることも考えられるので、メモリ使用量の多いプロセスや使用していないプロセスを終了させるなどしてから `swapoff` する。  
  （個人的には「物理メモリの空き容量 < Swap使用量」でも失敗することはなかったが）

---

設定値を低めにすることで無用な Swap が発生しなくなりました。

以上。

