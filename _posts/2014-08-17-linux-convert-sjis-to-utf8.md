---
layout   : single
title    : "Linux - テキストファイルの文字コード変換！"
published: true
date     : 2014-08-17 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
---

気分転換に CentOS サーバ構築以外の話題にします。

Linux で ShiftJIS で書かれたテキストファイルを UTF-8 に変換する方法についての個人的備忘録です。  
もちろん、オプションを変更することで ShiftJIS -> UTF8 以外の変換も可能です。

<!--more-->

### 0. 前提条件

- Linux Mint 17 での作業を想定。
- nkf コマンド、 iconv コマンドがインストール済みであること。

### 1. nkf コマンドを使用する例

``` text
$ nkf -w sjis_file.txt > utf8_file.txt
```

`-w` は UTF8 に変換するオプション。  
ShiftJIS に変換するなら `-s` オプションを使用する。  
その他オプションについては `nkf --help` 等で確認。

ちなみに（ついでに）、改行コードを変換する場合は以下のようにすればよい。

``` text
$ nkf -Lu src_file.txt > dst_file.txt  # <= LF へ変換
$ nkf -Lw src_file.txt > dst_file.txt  # <= CRLF へ変換
$ nkf -Lm src_file.txt > dst_file.txt  # <= CR へ変換
```

### 2. iconv コマンドを使用する例

``` text
$ iconv -f SHIFT_JIS -t UTF8 sjis_file.txt > utf8_file.txt
```

UTF8 を ShiftJIS に変換するなら `-f UTF8 -t SHIFT_JIS` とすればよい。  
その他オプションについては `iconv --help` 等で確認。

---

有事の際に慌てないために記録しておいた次第です。

以上。

