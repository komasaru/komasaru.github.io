---
layout   : single
title    : "Linux - top, ps コマンドの CPU使用率の違い！"
published: true
date     : 2016-03-06 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
---

linux の `top` コマンドと `ps` コマンドで確認できる CPU 使用率は意味が異なります。

以下、単なる備忘録です。

<!--more-->

* top コマンドで出力される CPU 使用率
  - 前回の画面更新時からのタスクの所要 CPU 時間の占有率であり、総 CPU 時間のパーセンテージで出力される。
* ps コマンドで出力される CPU 使用率
  - プロセスの生存期間中に実行に利用した時間のパーセンテージで出力される。

---

以上。

