---
layout   : single
title    : "MySQL - Mroonga でメモリマッピングエラー！"
published: true
date     : 2016-10-02 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- MySQL
- Mroonga
---

Mroonga は、全文検索エンジン Groonga をベースとした MySQL のストレージエンジンです。

Mroonga を利用した自作ツールを実行した際に、メモリマッピングに関するエラーが発生するようになったので、その対処方法について記録しておきます。

<!--more-->

### 0. 前提条件

* CentOS 6.8(32bit)
* MySQL 5.7.14 （Mroonga プラグイン有効）
  - データベースの総容量は 42GB 程度
* Mroonga にそれほど長けている訳でもないので、以下の記述に誤りがあるかもしれない。

### 1. 現象

MySQL を使用した自作ツールを実行すると、以下のようなエラーが発生することがある。

``` text
mmap(262144,444,66883584)=Cannot allocate memory <306810880>
```

メモリのマッピングに失敗しているようだ。

### 2. 原因

大きなデータベースを扱うための Groonga のパラメータが適切に設定されていないため。（おそらく）

### 3. 対策

「[7.22. チューニング — Groonga v6.0.7ドキュメント](http://groonga.org/ja/docs/reference/tuning.html#vm-overcommit-memory "7.22. チューニング — Groonga v6.0.7ドキュメント")」を参考に、 "/etc/sysctl.conf" に `vm.overcommit_memory` と `vm.max_map_count` の設定を記述する。

まず、現在値を確認してみる。

``` text
# sysctl -a | grep overcommit_memory

# sysctl -a | grep max_map_count
vm.max_map_count = 262144
```

`vm.overcommit_memory` は未設定で、 `vm.max_map_count` には `262144` が設定されている。

Groonga は一度に 256KiB ずつメモリー上にマップするようなので、上記の場合は、 262,144 * 256(KiB) = 67,108,864(KiB) = 65536(MiB) = 64(GiB) となり、データベースのサイズが 64GiB までは問題ないはず。

`vm.overcommit_memory` が未設定なのが問題のようなので、設定しておく。

File: `/etc/sysctl.conf`

{% highlight bash linenos %}
vm.overcommit_memory = 1
vm.max_map_count = 266144
{% endhighlight %}

逆に、`vm.overcommit_memory` が設定済みにも関わらずエラーとなる場合は、 `vm.max_map_count` の値を確認してみる。

"/etc/sysctl.conf" を編集し終えたら、以下を実行して設定を有効化する。

``` text
# sysctl -p
      :
===< 中略 >===
      :
vm.overcommit_memory = 1
vm.max_map_count = 262144
```

これで、様子を見てみる。

### 4. 参考サイト

* [7.22. チューニング — Groonga v6.0.7ドキュメント](http://groonga.org/ja/docs/reference/tuning.html#vm-overcommit-memory "7.22. チューニング — Groonga v6.0.7ドキュメント")

---

Mroonga 導入後に忘れがちな作業なので、記録しておいた次第です。

以上。

