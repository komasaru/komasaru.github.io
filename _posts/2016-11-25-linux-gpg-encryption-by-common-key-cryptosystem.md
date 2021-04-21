---
layout   : single
title    : "Linux - ファイルの暗号化・復号化（GnuPG, 共通鍵方式）！"
published: true
date     : 2016-11-25 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
- GnuPG
- 暗号
---

[The GNU Privacy Guard](https://www.gnupg.org/ "The GNU Privacy Guard")(= GnuPG) を使用して手軽に（共通鍵方式で）ファイルを暗号化する方法についての記録です。

<!--more-->

### 0. 前提条件

* LMDE2(Linux Mint Debian Edition 2) での作業を想定。
* 使用する [GnuPG](https://www.gnupg.org/ "The GNU Privacy Guard") は 1.4.18 を想定。
* 今回は「共通鍵方式（対称暗号法」を使用して暗号化・復号化する。
* ここでは、共通鍵（公開鍵）の詳細については説明しない。

### 1. GnuPG による暗号化・復号化について

[GnuPG](https://www.gnupg.org/ "The GNU Privacy Guard") による暗号化・復号化には、暗号化時と復号化時に同じ鍵を使用する「共通鍵暗号方式」の他に、暗号化時と復号に異なる鍵（公開鍵と秘密鍵）を使用する「公開鍵暗号方式」がある。

### 2. 使用する GnuPG の確認

暗号化・復号化の前に、サポートされている暗号化アルゴリズム等を確認してみる。

``` text
$ gpg --help
gpg (GnuPG) 1.4.18
Copyright (C) 2014 Free Software Foundation, Inc.
License GPLv3+: GNU GPL version 3 or later <http://gnu.org/licenses/gpl.html>
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.

Home: ~/.gnupg
サポートしているアルゴリズム:
公開鍵: RSA, RSA-E, RSA-S, ELG-E, DSA
暗号法: IDEA, 3DES, CAST5, BLOWFISH, AES, AES192, AES256, TWOFISH,
           CAMELLIA128, CAMELLIA192, CAMELLIA256
ハッシュ: MD5, SHA1, RIPEMD160, SHA256, SHA384, SHA512, SHA224
圧縮: 無圧縮, ZIP, ZLIB, BZIP2

書式: gpg [オプション] [ファイル]
署名、検査、暗号化や復号
既定の操作は、入力データに依存

===< 以下、オプション説明 >===

```

### 3. 暗号化

以下は、 "password.txt" というテキストファイルを共通鍵（対称暗号法）のみを使用し、デフォルトの CAST5 アルゴリズムで暗号化する例。（途中、任意のパスワードを入力＆確認入力）

``` text
$ gpg --symmetric password.txt
gpg: ディレクトリー「/home/hoge/.gnupg」ができました
gpg: 新しい構成ファイル「/home/hoge/.gnupg/gpg.conf」ができました
gpg: 警告: 「/home/hoge/.gnupg/gpg.conf」のオプションは起動している間、有効になりません
gpg: 鍵輪「/home/hoge/.gnupg/pubring.gpg」ができました
パスフレーズを入力:
パスフレーズを再入力:
```

（`--symmetric` は `-c` でもよい）

暗号化が完了すると "password.txt.gpg" というファイルが作成される。  
（初めて GnuPG 暗号化した場合は、ユーザディレクトリに ".gnupg" ディレクトリが配置され、各種ファイルも作成される）

デフォルトの CAST5 アルゴリズム以外のアルゴリズムで暗号化したければ以下のように `--cipher-algo` オプションで指定すればよい。

``` text
$ gpg --cypher-algo AES256 --symmetric password.txt
```

### 4. 復号化

以下は、暗号化前の元ファイルを残して、別のファイル名で復号化する例。（途中、暗号化時と同じパスワードを入力）

``` text
$ gpg password.txt.gpg
gpg: 鍵輪「/home/masaru/.gnupg/secring.gpg」ができました
gpg: CAST5暗号化済みデータ
パスフレーズを入力:
ファイル「password.txt」は既に存在します。上書きしますか? (y/N)
新しいファイル名を入力してください: password_2.txt
gpg: 警告: メッセージの完全性は保護されていません
```

当然、元のファイルに上書きしてもよければ、「上書きしますか？」で `y` 応答すればよい。

### 5. その他

圧縮方式も指定できたりする。  
その他、詳細は `gpg --help` や `man gpg` 等で確認できる。

### 6. 参考サイト

* [The GNU Privacy Guard](https://www.gnupg.org/ "The GNU Privacy Guard")

---

手軽にファイルを暗号化できるので、ちょっとしたファイルを相手に渡す際に役に立つでしょう。

以上。

