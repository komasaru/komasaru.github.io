---
layout   : single
title    : "Linux - ハードウェア情報の確認！"
published: true
date     : 2019-09-05 00:20:00 +0900
comments : true
categories:
- サーバ構築
- PC_Tips
tags:
- Linux
- Debian
- LMDE3
---

Linux でハードウェア情報を確認する方法についての備忘録です。

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 9.9, LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* `dmidecode` コマンドを使用する。
* 一般ユーザでの実行想定。（`sudo` 使用）

### 1. 使用例1（全てのハードウェア情報を確認）

``` text
$ sudo dmidecode
# dmidecode 3.0
Getting SMBIOS data from sysfs.
SMBIOS 2.6 present.
35 structures occupying 1301 bytes.
Table at 0x000FC350.

Handle 0x0000, DMI type 218, 29 bytes
OEM-specific Type
        Header and Data:
                DA 1D 00 00 B2 00 30 4B 0E 30 00 5C 00 00 00 01
                00 5D 00 00 00 00 00 FF FF 00 00 00 00

         :
===< 以下、省略>===
         :
```

### 2. 使用例2（メモリ情報を確認）

``` text
$ sudo dmidecode --type memory
# dmidecode 3.0
Getting SMBIOS data from sysfs.
SMBIOS 2.6 present.

Handle 0x000D, DMI type 16, 15 bytes
Physical Memory Array
        Location: System Board Or Motherboard
        Use: System Memory
        Error Correction Type: None
        Maximum Capacity: 4 GB
        Error Information Handle: Not Provided
        Number Of Devices: 2

Handle 0x000F, DMI type 17, 27 bytes
Memory Device
        Array Handle: 0x000D
        Error Information Handle: Not Provided
        Total Width: 64 bits
        Data Width: 64 bits
        Size: 2048 MB
        Form Factor: DIMM
        Set: None
        Locator: DIMM0
        Bank Locator: Not Specified
        Type: DDR3
        Type Detail: Synchronous
        Speed: 1333 MHz
        Manufacturer: Hyundai
        Serial Number: 1C9390F6
        Asset Tag: 011116
        Part Number: HMT325U6BFR8C-H9

Handle 0x0011, DMI type 17, 27 bytes
Memory Device
        Array Handle: 0x000D
        Error Information Handle: Not Provided
        Total Width: 64 bits
        Data Width: 64 bits
        Size: 2048 MB
        Form Factor: DIMM
        Set: None
        Locator: DIMM1
        Bank Locator: Not Specified
        Type: DDR3
        Type Detail: Synchronous
        Speed: 1333 MHz
        Manufacturer: Hyundai
        Serial Number: 1C5390F5
        Asset Tag: 011116
        Part Number: HMT325U6BFR8C-H9
```

*` --type` オプションは `-t` でもよい。

### 3. 使用例3（使用可能なタイプの確認）

``` text
$ sudo dmidecode --type
dmidecode: option '--type' requires an argument
Type number or keyword expected
Valid type keywords are:
  bios
  system
  baseboard
  chassis
  processor
  memory
  cache
  connector
  slot
```

### 4. その他

その他の使用方法等については `sudo dmidecode --help` や `man dmidecode` 等で確認可能。

---

以上。

