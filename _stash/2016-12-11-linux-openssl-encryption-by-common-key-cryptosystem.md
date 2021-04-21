---
layout   : single
title    : "Linux - ファイルの暗号化・復号化（OpenSSL, 共通鍵方式）！"
published: true
date     : 2016-12-11 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
- OpenSSL
- 暗号
---

[OpenSSL](https://www.openssl.org/ "OpenSSL") を使用して共通鍵方式でファイルを暗号化する方法についての記録です。

<!--more-->

### 0. 前提条件

* LMDE2(Linux Mint Debian Edition 2) での作業を想定。
* 使用する OpenSSL は 1.0.1t を想定。
* 今回は「共通鍵方式（対称暗号法」を使用して暗号化・復号化する。
* ここでは、共通鍵（公開鍵）の詳細については説明しない。

### 1. 指定可能な暗号化アルゴリズムの確認

``` text
$ openssl list-cipher-commands
aes-128-cbc
aes-128-ecb
aes-192-cbc
aes-192-ecb
aes-256-cbc
aes-256-ecb
base64
bf

===< 中略 >===

rc4
rc4-40
seed
seed-cbc
seed-cfb
seed-ecb
seed-ofb
```

ちなみに、サポートされている暗号化スイートの確認は以下のようにする。

``` text
$ openss ciphers -v
ECDHE-RSA-AES256-GCM-SHA384 TLSv1.2 Kx=ECDH     Au=RSA  Enc=AESGCM(256) Mac=AEAD
ECDHE-ECDSA-AES256-GCM-SHA384 TLSv1.2 Kx=ECDH     Au=ECDSA Enc=AESGCM(256) Mac=AEAD
ECDHE-RSA-AES256-SHA384 TLSv1.2 Kx=ECDH     Au=RSA  Enc=AES(256)  Mac=SHA384
ECDHE-ECDSA-AES256-SHA384 TLSv1.2 Kx=ECDH     Au=ECDSA Enc=AES(256)  Mac=SHA384
ECDHE-RSA-AES256-SHA    SSLv3 Kx=ECDH     Au=RSA  Enc=AES(256)  Mac=SHA1
ECDHE-ECDSA-AES256-SHA  SSLv3 Kx=ECDH     Au=ECDSA Enc=AES(256)  Mac=SHA1
SRP-DSS-AES-256-CBC-SHA SSLv3 Kx=SRP      Au=DSS  Enc=AES(256)  Mac=SHA1
SRP-RSA-AES-256-CBC-SHA SSLv3 Kx=SRP      Au=RSA  Enc=AES(256)  Mac=SHA1
SRP-AES-256-CBC-SHA     SSLv3 Kx=SRP      Au=SRP  Enc=AES(256)  Mac=SHA1

===< 中略 >===

ECDHE-RSA-DES-CBC3-SHA  SSLv3 Kx=ECDH     Au=RSA  Enc=3DES(168) Mac=SHA1
ECDHE-ECDSA-DES-CBC3-SHA SSLv3 Kx=ECDH     Au=ECDSA Enc=3DES(168) Mac=SHA1
SRP-DSS-3DES-EDE-CBC-SHA SSLv3 Kx=SRP      Au=DSS  Enc=3DES(168) Mac=SHA1
SRP-RSA-3DES-EDE-CBC-SHA SSLv3 Kx=SRP      Au=RSA  Enc=3DES(168) Mac=SHA1
SRP-3DES-EDE-CBC-SHA    SSLv3 Kx=SRP      Au=SRP  Enc=3DES(168) Mac=SHA1
EDH-RSA-DES-CBC3-SHA    SSLv3 Kx=DH       Au=RSA  Enc=3DES(168) Mac=SHA1
EDH-DSS-DES-CBC3-SHA    SSLv3 Kx=DH       Au=DSS  Enc=3DES(168) Mac=SHA1
ECDH-RSA-DES-CBC3-SHA   SSLv3 Kx=ECDH/RSA Au=ECDH Enc=3DES(168) Mac=SHA1
ECDH-ECDSA-DES-CBC3-SHA SSLv3 Kx=ECDH/ECDSA Au=ECDH Enc=3DES(168) Mac=SHA1
DES-CBC3-SHA            SSLv3 Kx=RSA      Au=RSA  Enc=3DES(168) Mac=SHA1
PSK-3DES-EDE-CBC-SHA    SSLv3 Kx=PSK      Au=PSK  Enc=3DES(168) Mac=SHA1
```

### 2. 暗号化

以下は、 "test.txt" というテキストファイルを共通鍵を使用し、デフォルトの AES-256-CBC アルゴリズムで暗号化する例。  
（途中、任意のパスワードを入力＆確認入力）

``` text
$ openssl enc -e -aes-256-cbc -in test.txt -out test.txt.enc
enter aes-256-cbc encryption password:
Verifying - enter aes-256-cbc encryption password:
```

* `-aes-256-cbc` はデフォルトなので指定しなくてもよい
* `-aes-256-cbc` は `-aes256` で置き換えてもよい

以下のように、パスワードの記述されたファイルを読み込ませることも可能。

``` text
$ openssl enc -e -aes-256-cbc -in test.txt -out test.txt.enc -kfile password.txt
```

`-k password` でコマンドラインでパスワードを指定することも可能。

### 3. 復号化

``` text
$ openssl enc -d -aes-256-cbc -in test.txt.enc -out test.txt
enter aes-256-cbc decryption password:
```

暗号化時と同様、 `-kfile` や `-k` オプションでパスワード指定が可能。

### 4. 参考サイト

* [OpenSSL - enc](https://www.openssl.org/docs/manmaster/man1/enc.html "OpenSSL - enc")
* [OpenSSL - list](https://www.openssl.org/docs/manmaster/man1/list.html "OpenSSL - list")

その他、 `man openssl` も参考に。

---

手軽にファイルを暗号化できるので、ちょっとしたファイルを相手に渡す際に役に立つでしょう。

以上。

