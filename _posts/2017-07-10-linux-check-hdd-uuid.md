---
layout   : single
title: 'Linux - HDD の UUID を確認！'
published: true
date     : 2017-07-10 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
- LinuxMint
- LMDE2
- Debian
---

Linux で、 HDD を追加接続した際に fstab でのマウントを既存のパーティションと同様に UUID で行いたいということがあります。

以下、 Linux で HDD の UUID を確認する方法についての記録です。

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 8.6(64bit), LMDE2(Linux Mint Debian Edition 2; 64bit) での作業を想定。（他の Linux ディストリビューションでも同様のはず）

### 1. 確認方法・その１

（以下は、パーティション sdb1 の UUID を確認する例）

``` text
$ sudo blkid -o list
device     fs_type label    mount point    UUID
--------------------------------------------------------------------------------
/dev/sda1  ext4             /boot          f54f9a81-7e77-4606-a3a7-92288e87a844
/dev/sda2  swap    swap     <swap>         1301788a-e529-454e-b3fb-59516434b223
/dev/sda3  ext4             /              71d239cb-b83d-4fc7-9b95-79eb9b90f7f9
/dev/sda5  ext4             /usr           9347cfef-ddf6-47ba-a16e-3f428e5d6f62
/dev/sda6  ext4             /var           7f25166a-7806-4f1a-8115-e898c6e51535
/dev/sda7  ext4             /tmp           dc3f55b1-d287-4ce6-aea6-1e16ae265509
/dev/sda8  ext4             /home          9a96bcdc-47e3-40e6-aee5-d8c268d62189
/dev/sdb1  ext4             /home/etc      3c05eba0-6b30-49ad-aa7d-1457cefdbcf6
```

* オプション `-o list` がなくても確認はできる、付けたほうが分かりやすい。
* デバイスを指定すれば、そのデバイスのみ確認できる。

### 2. 確認方法・その２

（以下は、存在する全てのパーティションの UUID を確認する例）

``` text
$ ls -l /dev/disk/by-uuid
合計 0
lrwxrwxrwx 1 root root 10  6月 10 06:17 1301788a-e529-454e-b3fb-59516434b223 -> ../../sda2
lrwxrwxrwx 1 root root 10  6月 10 06:17 3c05eba0-6b30-49ad-aa7d-1457cefdbcf6 -> ../../sdb1
lrwxrwxrwx 1 root root 10  6月 10 06:17 71d239cb-b83d-4fc7-9b95-79eb9b90f7f9 -> ../../sda3
lrwxrwxrwx 1 root root 10  6月 10 06:17 7f25166a-7806-4f1a-8115-e898c6e51535 -> ../../sda6
lrwxrwxrwx 1 root root 10  6月 10 06:17 9347cfef-ddf6-47ba-a16e-3f428e5d6f62 -> ../../sda5
lrwxrwxrwx 1 root root 10  6月 10 06:17 9a96bcdc-47e3-40e6-aee5-d8c268d62189 -> ../../sda8
lrwxrwxrwx 1 root root 10  6月 10 06:17 dc3f55b1-d287-4ce6-aea6-1e16ae265509 -> ../../sda7
lrwxrwxrwx 1 root root 10  6月 10 06:17 f54f9a81-7e77-4606-a3a7-92288e87a844 -> ../../sda1
```

---

今後のために記録しておいた次第です。

以上。

