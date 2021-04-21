---
layout   : single
title    : "Linux - tc コマンドで帯域制限！"
published: true
date     : 2017-10-26 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
- Debian
---

Linux でアウトバウンド（送信）についての帯域制限を行う方法についての記録です。

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 8.6 (64bit) での作業を想定。（他の Linux ディストリビューションも同様のはず）
* tc コマンドには qdisc, class, filter という概念があるが、その違いについては説明しない。  
  （今回は qdisc(queue discipline) を使用する）
* TBF(Token Bucket Filter; Classless な QDISC) を使用する。

### 1. 帯域制限の設定

（以下は一例）

``` text
# tc qdisc add dev eth0 root tbf limit 200Kb buffer 100Kb rate 200Kbps
```

* `limit 500Kb` ... データキューのサイズを 200KByte に設定。
* `buffer 100Kb` ... パケットのサイズを 100KByte に設定。  
  （`100Kb/8` を付与するよう説明しているサイトもあるが、付与してもしなくても変わらない）
* `rate 500Kbps` ... 帯域幅を 200KBps に設定。
* tc での `b` は「ビット」ではなく「バイト」であることに注意。

### 2. 状態の確認

``` text
# tc -s qdisc show dev eth0
qdisc tbf 800f: dev eth0 root refcnt 6 rate 1600Kbit burst 100Kb lat 512.0ms
 Sent 254778 bytes 214 pkt (dropped 0, overlimits 0 requeues 0)
 backlog 0b 0p requeues 0
```

* 設定（上記の1行目のみ）の確認なら、 `-s` を付与しない。
* `dev eth0` を付与しない場合、全ての NIC カードについて表示される。  
  さらにこの場合は、 `show` も省略可能で、 `tc -s qdisc` とできる。  
  よって、全ての NIC カードについての設定のみの確認なら `tc qdisc` とできる。

その他、 dstat コマンドや iftop コマンド等をインストールするなどして確認してみるのもよいだろう。

### 3. 帯域制限の設定解除

``` text
# tc qdisc del dev eth0 root
```

### 4. 帯域制限の設定変更

設定時の `add` を `change` に変更の上、値を変更すればよい。

``` text
# tc qdisc change dev eth0 root tbf limit 500Kb buffer 200Kb rate 500Kbps
```

### 5. その他

tc コマンドは奥が深い。当方も理解しきれていない。  
詳細は `man tc` などで確認のこと。

---

当方、実際にはポート毎に帯域保証／制限を行って運用している。（Classful QDISC の HTB(Hierarchy Token Bucket) と Filter を使用して）

以上。

