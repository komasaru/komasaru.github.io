---
layout   : single
title    : "Linux - ファイル暗号化・復号化用の公開鍵生成(GnuPG)！"
published: true
date     : 2016-11-29 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
- GnuPG
- 暗号
---

[The GNU Privacy Guard](https://www.gnupg.org/ "The GNU Privacy Guard") を使用して公開鍵方式でファイルを暗号化するには、まず公開鍵を生成する必要があります。

以下、公開鍵生成方法についての記録です。

<!--more-->

### 0. 前提条件

* LMDE2(Linux Mint Debian Edition 2) での作業を想定。
* 使用する GnuPG は 1.4.18 を想定。
* ここでは、公開鍵（共通鍵）の詳細については説明しない。

### 1. 公開鍵暗号方式について

公開鍵暗号方式では、ファイルを暗号化する人は復号化する人によって公開されている「公開鍵」を使用してファイルを暗号化する。そして、復号する際には「秘密鍵」を使用する。

### 2. 公開鍵の生成

公開鍵の生成は、実際には複合する側が行う。

``` text
$ gpg --gen-key
gpg (GnuPG) 1.4.18; Copyright (C) 2014 Free Software Foundation, Inc.
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.

ご希望の鍵の種類を選択してください:
   (1) RSA and RSA (default)
   (2) DSA and Elgamal
   (3) DSA (署名のみ)
   (4) RSA (署名のみ)
選択は? 1                                        # <= 1 で応答
RSA keys may be between 1024 and 4096 bits long.
What keysize do you want? (2048)                 # <= Enter 応答
要求された鍵長は2048ビット
鍵の有効期限を指定してください。
         0 = 鍵は無期限
      <n>  = 鍵は n 日間で満了
      <n>w = 鍵は n 週間で満了
      <n>m = 鍵は n か月間で満了
      <n>y = 鍵は n 年間で満了
鍵の有効期間は? (0)                              # <= Enter 応答
Key does not expire at all
これで正しいですか? (y/N) y                      # <= y で応答

あなたの鍵を同定するためにユーザーIDが必要です。
このソフトは本名、コメント、電子メール・アドレスから
次の書式でユーザーIDを構成します:
    "Heinrich Heine (Der Dichter) <heinrichh@duesseldorf.de>"

本名: Hoge Fuga                                  # <= 本名入力
電子メール・アドレス: hoge_fuga@foo-bar.xxx      # <= メールアドレス入力
コメント: foo-bar                                # <= コメント入力
次のユーザーIDを選択しました:
    “Hoge Fuga (foo-bar) <hoge_fuga@foo-bar.com>”

名前(N)、コメント(C)、電子メール(E)の変更、またはOK(O)か終了(Q)? O
秘密鍵を保護するためにパスフレーズがいります。

パスフレーズを入力:                              # <= パスワード入力
パスフレーズを再入力:                            # <= パスワード確認入力

今から長い乱数を生成します。キーボードを打つとか、マウスを動かす
とか、ディスクにアクセスするとかの他のことをすると、乱数生成子で
乱雑さの大きないい乱数を生成しやすくなるので、お勧めいたします。
.+++++
.......+++++                                     # <= マウスを動かすなどする
gpg: /home/hoge/.gnupg/trustdb.gpg: 信用データベースができました
gpg: 鍵AA260242を絶対的に信用するよう記録しました
公開鍵と秘密鍵を作成し、署名しました。

gpg: 信用データベースの検査
gpg: 最小の「ある程度の信用」3、最小の「全面的信用」1、PGP信用モデル
gpg: 深さ: 0  有効性:   1  署名:   0  信用: 0-, 0q, 0n, 0m, 0f, 1u
pub   2048R/AA260242 2016-11-04
                 指紋 = 112D F348 D1CF A429 1F83  489C 5F33 C0E4 AA26 0242
uid                  Hoge Fuga (foo-bar) <hoge_fuga@foo-bar.com>
sub   2048R/AC922C7E 2016-11-04

```

### 3. 生成された鍵の確認

``` text
$ gpg --list-keys
/home/hoge/.gnupg/pubring.gpg
-------------------------------
pub   2048R/AA260242 2016-11-04
uid                  Hoge Fuga (foo-bar) <hoge_fuga@foo-bar.xxx>
sub   2048R/AC922C7E 2016-11-04

```

### 4. 公開鍵のエクスポート

生成された公開鍵は暗号化する人に渡さないといけないので、エクスポートする。

以下のように、作成した鍵のメールアドレスを指定し、さらに ASCII 形式に変換してエクスポートする。  
（ASCII 形式に変換したのは、メール本文に貼り付けて送信できるようにするためであり、 `-a` オプションを使用せずにバイナリ形式でエクスポートすることも可能）

``` text
$ gpg -o hoge_fuga.pub -a --export hoge_fuga@foo-bar.com
```

* `-o` は、出力ファイル名を指定するオプション
* `-a` は、ASCII 形式で出力するオプション
* `--export xxxx@xxxx` は、公開鍵 xxxx@xxxx をエクスポートするオプション

ASCII 形式でエクスポートした公開鍵を確認してみる。

``` text
$ cat hoge_fuga.pub
-----BEGIN PGP PUBLIC KEY BLOCK-----
Version: GnuPG v1

mQENBFgcHXkBCADfSx/lua9zdCjPMbEAmtrf02G8oD0FMZVgf1wQmR6yZulr39oq
HmwcC+vJyV4pHarqE5OmVehI4MGC7dHW+2i8Ug9COdn0MjwQNj1fXVtH2OmLQ/up

    ===< 中略 >===

vMkosNDA6nXXuHUdHIfbvgM0ZOhotUIcVD91U97vItJcbD3R/vpE5V5GvKw=
=FBoJ
-----END PGP PUBLIC KEY BLOCK-----
```

### 5. 参考サイト

* [The GNU Privacy Guard](https://www.gnupg.org/ "The GNU Privacy Guard")

---

これで、公開鍵方式でファイルを暗号化する準備が整いました。

次回は [The GNU Privacy Guard](https://www.gnupg.org/ "The GNU Privacy Guard") を使用した公開鍵方式での暗号化・復号化について記録します。

以上。

