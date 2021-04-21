---
layout   : single
title    : "Linux - HDD 不良セクタのチェック等！"
published: true
date     : 2018-12-17 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
---

Linux で、 HDD の不良セクタのチェック等を行う方法についての記録です。

<!--more-->

### 0. 前提条件

* e2fsck コマンドを実行する際には作業対象のパーティションがアンマウントの状態でなければならない。  
  インストールCDからシングルユーザ（セーフ、レスキュー）モードで起動し、マウントされていない状態で作業を行うこと。

### 1. HDD の調査

マシンに装備されている HDD（ストレージ）を確認しておく。

``` text
$ sudo fdisk -l
```

### 2. HDD モデルの調査

マシンに装備されている HDD（ストレージ）のモデルを確認しておく。

``` text
$ sudo hdparm -i /dev/sda7 | fgrep Model
```

### 3. 不良セクタの調査

``` text
$ sudo badblocks -sv /dev/sda7 -o /tmp/badblocks.txt
```

又は、

``` text
$ sudo badblocks -sv /dev/sda7 | tee /tmp/badblocks.txt
```

* 不良セクタがあった場合は `-o` で指定したファイルに出力される。

### 4. 不良セクタのマーキング

``` text
$ sudo e2fsck -l /tmp/badblocks.txt /dev/sda7
```

* マーキングされたブロックは、システムにより無視されるようになる。

---

以上。

