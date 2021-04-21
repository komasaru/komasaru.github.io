---
layout   : single
title    : "Linux - プロセスが掴んでいるファイル一覧を取得！"
published: true
date     : 2016-03-10 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
---

Linux であるプロセスが掴んでいるファイルの一覧を確認したいことがあります。

以下、単なる備忘録です。

<!--more-->

### プロセスが掴んでいるファイル一覧の取得

``` text
$ lsof -p <PID>
```

もしくは、

``` text
$ ls -l /proc/<PID>/fd
```

---

以上。

