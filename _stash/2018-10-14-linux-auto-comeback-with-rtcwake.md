---
layout   : single
title    : "Linux - rtcwake で指定時刻に自動復帰！"
published: true
date     : 2018-10-14 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
---

rtcwake コマンドで、電源オフ／休止／サスペンド状態から指定時刻／指定時間後に自動で復帰させる方法についての記録です。

<!--more-->

### 0. 前提条件

* LMDE (Linux Mint Debian Edition 2; 64bit) での作業を想定。
* `/usr/sbin/rtcwake` が存在していること。

### 1. 指定時刻に自動復帰するよう電源オフ／休止／サスペンド

``` text
$ sudo rtcwake -m off -t $(date +%s -d "2018-08-01 07:00:00")
$ sudo rtcwake -m disk -t $(date +%s -d "2018-08-01 07:00:00")
$ sudo rtcwake -m mem -t $(date +%s -d "2018-08-01 07:00:00")
```

ハードウェアクロックがローカル時刻に設定されている場合、

``` text
$ sudo rtcwake -m off -l -t $(date +%s -d "2018-08-01 07:00:00")
$ sudo rtcwake -m disk -l -t $(date +%s -d "2018-08-01 07:00:00")
$ sudo rtcwake -m mem -l -t $(date +%s -d "2018-08-01 07:00:00")
```

のように `-l` オプションを使用する。  
そうでない場合に `-l` オプションを使用すると、指定時刻の9時間後になる。

### 2. 指定時間後に自動復帰するよう電源オフ／休止／サスペンド

``` text
$ sudo rtcwake -m off -s 1800
$ sudo rtcwake -m disk -s 1800
$ sudo rtcwake -m mem -s 1800
```

### 3. 注意

* 「サスペンド」とは、 ACPI ステータス S3 のこと。  
  「スタンバイ（ACPI ステータス S1）」なら、 `-m standby` を使用する。

### 4. その他

その他オプションや詳細夏仕様方法等については、 `rtcwake --help` や `man rtcwake` 等で確認する。

---

以上。

