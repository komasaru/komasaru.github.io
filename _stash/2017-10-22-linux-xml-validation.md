---
layout   : single
title    : "Linux - XML の正当性チェック／整形！"
published: true
date     : 2017-10-22 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
- LMDE2
- XML
---

Linux でコマンドラインからテキスト(XML)ファイルの正当性をチェックしたり、可読性を高めるために整形したりする方法についての記録です。

<!--more-->

### 0. 前提条件

* LMDE 2 (Linux Mint Debian Edition 2; 64bit) での作業を想定。
* xmllint コマンドを使用する。

### 1. xmllint コマンドのインストール

xmllint コマンドが未インストールなら、インストールする。（libxml2-utils パッケージ）

``` text
$ sudo apt install libxml2-utils
```

### 2. XML 正当性チェック（DTD を含まない）

``` text
$ xmllint --noout file.xml
```

* `--noout` は標準出力しないオプション

### 3. XML 正当性チェック（DTD を含む）

``` text
$ xmllint --noout --valid file.xml
```

### 4. XML の整形（標準出力）

``` text
$ xmllint --format file.xml
```

### 5. XML の整形（ファイル出力）

``` text
$ xmllint --format file_old.xml --output file_new.xml
```

### 6. その他

* 詳細な使用方法については、 `xmllint` をオプション無しで実行するか `man xmllint` を実行して確認できる。
* 正当性チェックや整形のみならず、解析することなどもできる。

---

以上。

