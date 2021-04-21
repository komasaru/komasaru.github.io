---
layout   : single
title    : "Linux Mint - apt-get update で GPG 公開鍵エラー！"
published: true
date     : 2015-10-14 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
- LinuxMint
---

Linux Mint で、いつしか Apt パッケージの一覧を更新しようとすると GPG 公開鍵エラーが発生するようになりました。

以下、現象・原因・対策についての備忘録です。

<!--more-->

### 0. 前提条件

* Linux Mint 17.2(64bit) を想定。

### 1. 現象

Apt パッケージ一覧をアップデートした際に以下のようなエラーが発生する。（`W` なので分類としては「警告」でしょうが）  
（以下は QGIS というパッケージの部分で発生した例で、実際のメッセージは１行）

``` text
$ sudo apt-get update

====< 途中省略 >====

W: GPG エラー: http://qgis.org trusty InRelease: 
公開鍵を利用できないため、以下の署名は検証できませんでした: NO_PUBKEY 3FF5FFCAD71472C4

====< 以下省略 >====

```

当然ながら、アップデートマネージャでも同じエラーが発生する。

### 2. 原因

メッセージのとおり、GPG 署名の検証に必要な公開鍵が存在しないため。

### 3. 対策

キーサーバに問い合わせればよい。（`--recv-keys` の値は、エラーメッセージ中 `NO_PUBKEY` の後ろの値）

``` text
$ sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 3FF5FFCAD71472C4
Executing: gpg --ignore-time-conflict --no-options --no-default-keyring --homedir /tmp/tmp.Wv6W1dQY2n --no-auto-check-trustdb --trust-model always --keyring /etc/apt/trusted.gpg --primary-keyring /etc/apt/trusted.gpg --keyserver keyserver.ubuntu.com --recv-keys 3FF5FFCAD71472C4
gpg: 鍵D71472C4をhkpからサーバーkeyserver.ubuntu.comに要求
gpg: 鍵D71472C4: 公開鍵“QGIS Archive Automatic Signing Key (2015) <qgis-developer@lists.osgeo.org>”を読み込みました
gpg: 処理数の合計: 1
gpg:               読込み: 1  (RSA: 1)
```

* `--keyserver` で指定するキーサーバは、キーが存在するサーバならどこでもよい。  
  （Debian 用の `keyring.debian.org`, `wwwkeys.pgp.net` 等（参照：[Debian -- 鍵署名 (Keysigning)](https://www.debian.org/events/keysigning.ja.html "Debian -- 鍵署名 (Keysigning)")））

再度 `apt-get update` でエラーが発生しないことを確認する。

---

稀に遭遇するエラーなので備忘録として残しておいた次第です。

以上。

