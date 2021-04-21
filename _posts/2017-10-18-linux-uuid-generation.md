---
layout   : single
title    : "Linux - UUID の生成！"
published: true
date     : 2017-10-18 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
- LMDE2
---

Linux で UUID （Universally Unique Identifier; 全世界で2つ以上のアイテムが同じ値を持つことがない一意な識別子）を生成する方法についての記録です。

<!--more-->

### 0. 前提条件

* LMDE 2 (Linux Mint Debian Edition 2) での作業を想定。  
  （Debian 系なら同じはず。その他のディストリビューションでも、パッケージインストール作業以外は同じはず）
* 後述の 1. では `uuidgen` コマンドを使用する。  
  未インストールなら、 `apt install uuid-runtime` でインストールしておく。
* UUID には Version.1〜5 が存在することを理解しておく。

### 1.  uuidgen コマンドを使用する場合

`uuidgen` コマンドは Version.4（乱数ベース）と Version.1（日時ベース）の UUID を生成可能。

#### 1-1. UUID Version.4 の生成例

Version.4 の UUID を生成するには、オプション `-r` を指定して実行する。  
（デフォルトなので、オプションを指定しなくても大丈夫）

``` text
$ uuidgen -r
dbdffb02-fd0f-4bc6-99d6-efa363351406
```

* 2個目のハイフン直後の `4` が Version.4 の UUID であることを表している。

#### 1-2. UUID Version.1 の生成例

Version.1 の UUID を生成するには、オプション `-t` を指定して実行する。

``` text
$ uuidgen -t
2e51f2ee-a425-11e7-a2a3-0023547f2031
```

* 2個目のハイフン直後の `1` が Version.1 の UUID であることを表している。

#### 1-3. その他

詳細については `uuidgen -h` や `man uuidgen` で確認できる。  
（Version.4 と Version.1 の UUID を生成するだけなので難しいことは何もないはずだが）

### 2.  /proc/sys/kernel/random/uuid を使用する場合

Version.4 の UUID のみ生成可能。

#### 2-1 UUID Version.4 の生成例

``` text
$ cat /proc/sys/kernel/random/uuid
065e0e7b-9204-4486-ac53-92ead96452cf
```

---

以上。

