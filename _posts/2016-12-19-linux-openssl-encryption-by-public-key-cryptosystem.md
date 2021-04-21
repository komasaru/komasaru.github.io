---
layout   : single
title    : "Linux - ファイルの暗号化・復号化（OpenSSL, 公開鍵方式）！"
published: true
date     : 2016-12-19 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
- OpenSSL
- 暗号
---

[OpenSSL](https://www.openssl.org/ "OpenSSL") を使用して公開鍵方式でファイルを暗号化・復号化する方法についての記録です。

<!--more-->

### 0. 前提条件

* LMDE2(Linux Mint Debian Edition 2) での作業を想定。
* 使用する OpenSSL は 1.0.1t を想定。
* ここでは、公開鍵（共通鍵）の詳細については説明しない。

### 1. 暗号化

暗号化する側は、復号化する側が生成した公開鍵を何らかの方法で受け取った後、以下のようにして暗号化する。  
（以下は、 test.txt というファイルを公開鍵で暗号化して test.txt.enc を出力する例）

``` text
$ openssl rsautl -in test.txt -out test.txt.enc -inkey public-key.pem -pubin -encrypt
```

### 2. 復号化

以下は、test.txt.enc という暗号化されたファイルを秘密鍵で復号化して test.txt を出力する例。

``` text
$ openssl rsautl -in test.txt.enc -out test.txt -inkey private-key.pem -decrypt
Enter pass phrase for private-key.pem:      # <= パスワード入力
```

### 3. 参考サイト

* [OpenSSL - rsautl](https://www.openssl.org/docs/manmaster/man1/rsautl.html "OpenSSL - rsautl")

---

重要なファイルを暗号化して相手に渡す際に役に立つでしょう。

以上。

