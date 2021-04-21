---
layout   : single
title    : "Linux - サービスの init.d 起動と service 起動の違い！"
published: true
date     : 2014-04-08 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- Ubuntu
---

Linux 上でサービス起動・停止等の操作を行う際に、`/etc/init.d/xxxx [start|stop|...]` や `service xxxx [start|stop|...]` とコマンドを入力すると思います。

一見全く同じ挙動するように思うかも知れませんが、厳密には異なります（場合によっては異なる挙動をします）。

以下、それについての備忘録です。

<!--more-->

### 1. init.d 起動と service 起動の違い

`init.d` 起動、つまり以下のように実行してサービスを起動する場合は、

``` text
# /etc/init.d/xxxx start
```

環境変数全てこのコマンド実行時のまま引き継がれて、サービス起動作業に移る。

一方、`service` 起動、つまり以下のように実行してサービスを起動する場合は、

``` text
# service xxxx start
```

環境変数 `PATH` と `TERM` のみが引き継がれて、サービスの起動作業に移る。  
※但し、CentOS 6 系の場合。CentOS 5 や Ubuntu 系だと `LANG` も引き継がれる）。

### 2. service コマンドの内容確認

なぜ、環境変数 `PATH` と `TERM` のみが引き継がれるのか、`/sbin/service` コマンド（スクリプト）の内容を確認してみた。（CentOS 6 系の場合）

以下（"/sbin/service" を `grep` した結果）のように `env` コマンドに `-i`（継承された環境を無視して、空の環境から始める）オプションを付加して環境変数をリセット後、新たに `PATH` と `TERM` だけをセットし直していることが分かる。

File: `/sbin/service`

{% highlight bash linenos %}

                  env -i PATH="$PATH" TERM="$TERM" "${SERVICEDIR}/${SERVICE}" status

            env -i PATH="$PATH" TERM="$TERM" "${SERVICEDIR}/${SERVICE}" stop

            env -i PATH="$PATH" TERM="$TERM" "${SERVICEDIR}/${SERVICE}" start

   env -i PATH="$PATH" TERM="$TERM" "${SERVICEDIR}/${SERVICE}" ${OPTIONS}

{% endhighlight %}

### 3. 結論

`init.d` 起動と `service` 起動とで挙動に違いがあるということから、分かること・言えることは以下のとおり。

1. 環境変数に影響されないようなサービス（起動スクリプト）なら、`init.d` 起動も `service` 起動も変わりはない。
2. `init.d` 起動と `service` 起動で挙動が異なる場合は環境変数が影響している、と検討が付く。
3. サービスを実行しようとする一般ユーザによって環境変数が異なる場合は、`service` 起動の挙動も一般ユーザによって異なることがある。
4. 上記の事項を理解した上で、運用ルールを定めておくと良いだろう。

---

知っていれば、何かの時に役に立つ（原因に気付くのが早くなる）でしょう。

以上。

