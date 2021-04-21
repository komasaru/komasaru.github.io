---
layout   : single
title    : "Linux - メモリキャッシュのクリア！"
published: true
date     : 2015-10-09 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
---

Linux でメモリキャッシュをクリアすることについての備忘録です。

<!--more-->

### 0. 前提条件

* Linux Kernel 2.6.16 以降であること。
* 当方は Linux Mint 17.2(64bit), 搭載メモリ:4GB の環境で動作確認。

### 1. キャッシュの削除方法

以下のコマンドは、 root になって実行するか `sudo` を使用して実行する。

#### 1-1. ページキャッシュの解放

``` text
# sysctl -w vm.drop_caches=1
```

もしくは、

``` text
# echo 1 > /proc/sys/vm/drop_caches
```

#### 1-2. Slab キャッシュの解放

（Slab キャッシュとは、ディレクトリやファイルのメタデータ情報を格納する dentry や inode のこと）

``` text
# sysctl -w vm.drop_caches=2
```

もしくは、

``` text
# echo 2 > /proc/sys/vm/drop_caches
```

#### 1-3. ページキャッシュと Slab キャッシュの解放

``` text
# sysctl -w vm.drop_caches=3
```

もしくは、

``` text
# echo 3 > /proc/sys/vm/drop_caches
```

#### 1-4. 初期状態について

あらゆる Web サイト等で「初期状態に戻すには `0` を設定する」旨の紹介がされている。  
しかし、 RedHat 系では機能するが Debian 系では機能しない。（`sysctl` も `echo` も）

`vm.drop_caches` についての説明は `man proc` で確認できるが、 Debian 系も RedHat 系も `0` についての説明がされていない。

従って、初期状態には戻す必要はないという結論に至った。（あくまで、個人の判断）  
（とは言え、 `cat /proc/sys/vm/drop_caches` の値が、マシンを再起動するまでずっと `0` 以外の状態でいることに疑問を感じる）

### 2. 作業の実際

実際の作業手順は以下のようになる。

1. キャッシュクリア前のメモリ状態を確認。
2. バッファの内容をディスクに書き込む。
3. キャッシュをクリア。
4. キャッシュクリア後のメモリ状態を確認。

以下は、ページキャッシュと Slab キャッシュを解放する例。

``` text
# free
             total       used       free     shared    buffers     cached
Mem:       4047488    3887116     160372     155764     247452    1104336
-/+ buffers/cache:    2535328    1512160
Swap:      8000508     557132    7443376

# sync

# sysctl -w vm.drop_caches=3
vm.drop_caches = 3

# free
             total       used       free     shared    buffers     cached
Mem:       4047488    2415508    1631980     155764       9856     324056
-/+ buffers/cache:    2081596    1965892
Swap:      8000508     557124    7443384
```

物理メモリの空き容量(Mem - free の値）が増えたことを確認する。

### 3. 参考サイト

* [Man page of PROC](http://linuxjm.osdn.jp/html/LDP_man-pages/man5/proc.5.html "Man page of PROC")

---

物理メモリの空き容量の減りが気になったら試してみるといいでしょう。  

以上。

