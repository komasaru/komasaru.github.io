---
layout   : single
title    : "Debian 7 Wheezy - コンソールでの日本語表示！"
published: true
date     : 2013-11-22 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
---

Debian GNU/Linux 7.1.0 をインストール後、コンソールで日本語が文字化けする場合の対処法についてです。

SSH 接続できれば文字化けは起こらないでしょうが、インストール後 SSH 接続するまでの間の応急処置についての備忘録です。

<!--more-->

### 0. 前提条件

- Debian GNU/Linux 7.1.0 での作業を想定。
- 環境によっては、当現象は発生しないかもしれない。また、以下のような対処方法も通用しないかも知れない。

### 1. フレームバッファロード

以下のようにして vga16fb というフレームバッファをロードする。

``` text 
# modprobe vga16fb
```

### 2. jfbterm インストール

Linux フレームバッファ上で日本語を表示するためのプログラム jfbterm を実行する。

``` text 
# aptitude -y install jfbterm
```

### 3. jfbterm 実行

以下のようにして、 jfbterm を実行する。

``` text 
# jfbterm -c other,EUC-JP,iconv,UTF-8 -q
```

上記は root での処理だが、一般ユーザでも同様。

### 4. jfbterm 自動起動設定

マシン起動時に自動で jfbterm が起動するようにするために以下のようにする。

``` text 
# (echo vga16fb; echo fbcon) >> /etc/modules
```

---

以上。

