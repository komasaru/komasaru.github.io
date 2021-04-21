---
layout   : single
title    : "Linux - ファイル暗号化・復号化用の公開鍵生成(OpenSSL)！"
published: true
date     : 2016-12-15 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
- OpenSSL
- 暗号
---

[OpenSSL](https://www.openssl.org/ "OpenSSL") を使用して公開鍵方式でファイルを暗号化するには、まず秘密鍵＆公開鍵を生成する必要があります。

以下、秘密鍵＆公開鍵生成方法についての記録です。

<!--more-->

### 0. 前提条件

* LMDE2(Linux Mint Debian Edition 2) での作業を想定。
* 使用する OpenSSL は 1.0.1t を想定。
* ここでは、公開鍵（共通鍵）の詳細については説明しない。

### 1. 秘密鍵の生成

AES-256 アルゴリズムで長さ 2048 ビットの秘密鍵を生成する例。

``` text
$ openssl genrsa -aes256 -out private-key.pem 2048
Generating RSA private key, 2048 bit long modulus
...+++
..................+++
e is 65537 (0x10001)
Enter pass phrase for private-key.pem:              # <= パスワード入力
Verifying - Enter pass phrase for private-key.pem:  # <= パスワード確認入力
```

* 秘密鍵のビット長のデフォルトは `512`
* 秘密鍵のビット長を指定する場合は、一番最後に記述する

### 2. 秘密鍵の確認

File: `private-key.pem`

{% highlight text linenos %}
$ cat private-key.pem
-----BEGIN RSA PRIVATE KEY-----
Proc-Type: 4,ENCRYPTED
DEK-Info: AES-256-CBC,DE24386B30C08A165C2B8FB2FC4DE73A

IK0a52HDMQZ9+jWhCVFLgc/EBgBq16PGo90QO7z6Fo0QOYSvUjPKt71qAxdFKpDk
ZYWQT65r24kbbm3xa2EmW/uTSo5a8/ubO09bhkGS90y2xm2HwTQ6BG6tP8rif0ho

===< 中略 >===

SQLtQ+8vw3hiLYl90WSvOIF53O8PHi8zD9RkUUM2NsxYbB4Eh6+qpct28ZY2U4tM
Y0Zu2e4WK5j1Nx3NAk38kO1YkdiZqMNgF/Xc5hBpQ7gmzlB/5ej3D+yQuWzWl+0k
-----END RSA PRIVATE KEY-----
{% endhighlight %}

### 3. 公開鍵の生成

生成された秘密鍵を指定して公開鍵を生成する。

``` text
$ openssl rsa -in private-key.pem -pubout -out public-key.pem
Enter pass phrase for private-key.pem:
writing RSA key
```

### 4. 公開鍵の確認

File: `public-key.pem`

{% highlight text linenos %}
$ cat public-key.pem
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvRpQqkqudsH3ZNf7Ro8D

===< 中略 >===

CUssOdLjRfWJd9XiqfAyi0xH9Hs1syNSoHIziloF427wzzEI2ZHue9WiCMxXE2B1
IQIDAQAB
-----END PUBLIC KEY-----
{% endhighlight %}

### 5. 参考サイト

* [OpenSSL - genrsa](https://www.openssl.org/docs/manmaster/man1/genrsa.html "OpenSSL - genrsa")
* [OpenSSL - rsa](https://www.openssl.org/docs/manmaster/man1/rsa.html "OpenSSL - rsa")

その他、 `man openssl` も参考に。

---

これで、公開鍵方式でファイルを暗号化する準備が整いました。

次回、 [OpenSSL](https://www.openssl.org/ "OpenSSL") を使用した公開鍵方式での暗号化・復号化について記録した内容を紹介します。

以上。

