---
layout   : single
title    : "Linux - root での SSH 接続が制限されているリモートへの rsync 同期方法！"
published: true
date     : 2018-09-23 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- rsync
---

リモート側で root での SSH 接続が制限されている場合、通常、ローカル側から一般ユーザで rsync コマンドで同期することができません。

以下、解決方法についての記録です。

<!--more-->

### 0. 前提条件

* リモート側は Debian GNU/Linux 9.5 を想定。  
* ローカル側は LMDE 3 (Linux Mint Debian Edition 3; 64bit) を想定。
* リモート側 SSH 用ポートは、デフォルトの `22` から `9999` に変更している。
* 当然、ローカル側からリモート側へ一般ユーザで SSH 接続できる状況にあること。（以下では、一般ユーザ名 "foo" を想定）

### 1. sudo の設定（リモート側）

リモート側で `sudo` でパスワード無しで `rsync` コマンドが使用できるよう設定する。

File: `visudo`

{% highlight text linenos %}
foo  ALL=(ALL)  NOPASSWD:/usr/bin/rsync
{% endhighlight %}

### 2. rsync の実行（ローカル側）

``` text
rsync -auv --delete -e "ssh -p 9999" --rsync-path="sudo rsync" /path/to/bar foo@<SERVER_NAME>:/path/to/
```

ちなみに、同期元のユーザ／グループを同期先で変更させたい場合、以下のようなオプションを追加すればよい。（ユーザ／グループ `hoge:fuga` を `nobody:nogroup` に変更する例）

``` text
--usermap=hoge:nobody --groupmap=fuga:nogroup
```

---

以上。

