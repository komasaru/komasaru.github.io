---
layout   : single
title    : "Linux - GnuPG 公開鍵の無効化・削除！"
published: true
date     : 2016-12-07 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
- GnuPG
- 暗号
---

[The GNU Privacy Guard](https://www.gnupg.org/ "The GNU Privacy Guard") の公開鍵暗号方式は基本的には安全だが、パスワードを忘れてしまったり、パスワードが外部に漏れてしまった場合は、公開鍵を無効化する必要があるでしょう。

以下、無効化する方法についての記録です。  
さらに、不要となった公開鍵を削除する方法についても記録しておく。

<!--more-->

### 0. 前提条件

* LMDE2(Linux Mint Debian Edition 2) での作業を想定。
* 使用する GnuPG は 1.4.18 を想定。
* ここでは、公開鍵（共通鍵）の詳細については説明しない。
* 公開鍵の無効化には公開鍵生成時に使用したパスワードが必要なので、以下の作業は**公開鍵生成時**に行っておいた方がよい。

### 1. 失効証明書の生成

``` text
$ gpg -o hoge_fuga.revoke --gen-revoke hoge_fuga@foo-bar.xxx

sec  2048R/AA260242 2016-11-04 Hoge Fuga (foo-bar) <hoge_fuga@foo-bar.xxx>

この鍵にたいする失効証明書を作成しますか? (y/N) y            # <= y で応答
失効の理由を選択してください:
  0 = 理由は指定されていません
  1 = 鍵がパクられました
  2 = 鍵がとりかわっています
  3 = 鍵はもう不用です
  Q = キャンセル
(ここではたぶん1を選びます)
あなたの決定は? 1                                            # <= 取り敢えず 1 で応答
予備の説明を入力。空行で終了:
>                                                            # <= 空 Enter
失効理由: 鍵がパクられました
(説明はありません)
よろしいですか? (y/N) y                                      # <= y で応答

次のユーザーの秘密鍵のロックを解除するには
パスフレーズがいります:“Hoge Fuga (foo-bar) <hoge_fuga@foo-bar.xxx>”
2048ビットRSA鍵, ID AA260242作成日付は2016-11-04

パスフレーズを入力:                                          # <= パスワード入力

ASCII包装出力を強制します。
失効証明書を作成しました。

見つからないような媒体に移動してください。もしワルがこの証明書への
アクセスを得ると、そいつはあなたの鍵を使えなくすることができます。
媒体が読出し不能になった場合に備えて、この証明書を印刷して保管するの
が賢明です。しかし、ご注意ください。あなたのマシンの印字システムは、
だれでも見える場所にデータをおくことがあります!

```

これで、 "hoge_fuga.revoke" という失効証明書が生成される。

### 2. 失効証明書の退避

万が一の場合に備えて、失効証明書は別のメディア（USB メモリ等）に退避しておくとよいだろう。

また、失効証明書はテキストファイルなのでプリントアウトして厳重に保管しておくのもよいだろう。

### 3. 公開鍵の無効化

失効証明書を使用して公開鍵を無効化する。

``` text
$ gpg --import hoge_fuga.revoke
gpg: 鍵AA260242:“Hoge Fuga (foo-bar) <hoge_fuga@foo-bar.xxx>”失効証明書を読み込みました
gpg:     処理数の合計: 1
gpg:   新しい鍵の失効: 1
gpg: 最小の「ある程度の信用」3、最小の「全面的信用」1、PGP信用モデル
gpg: 深さ: 0  有効性:   1  署名:   0  信用: 0-, 0q, 0n, 0m, 0f, 1u
```

### 4. 無効化の確認

登録済みの鍵一覧で無効化を確認する。

``` text
$ gpg --list-keys
/home/hoge/.gnupg/pubring.gpg
-------------------------------
pub   2048R/AA260242 2016-11-04 [失効: 2016-11-05]
uid                  Hoge Fuga (foo-bar) <hoge_fuga@foo-bar.xxx>
```

### 5. 公開鍵の削除

公開鍵自体を削除したい場合は、相手（公開鍵生成者）のメールアドレスを指定して削除する。

``` text
$ gpg --delete-key hoge_fuga@foo-bar.xxx
gpg (GnuPG) 1.4.18; Copyright (C) 2014 Free Software Foundation, Inc.
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.


pub  2048R/AA260242 2016-11-04 Hoge Fuga (foo-bar) <hoge_fuga@foo-bar.xxx>

この鍵を鍵輪から削除しますか? (y/N) y
```

削除対象の公開鍵に対応する秘密鍵が存在する場合（公開書きを生成した人の場合）は、以下のようなメッセージが出力される。

``` text
gpg (GnuPG) 1.4.18; Copyright (C) 2014 Free Software Foundation, Inc.
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.

gpg: この公開鍵にたいする秘密鍵“hoge_fuga@foo-bar.xxx”があります!
gpg: まず“--delete-secret-keys”オプションでこれを削除してください。

```

その場合は、予め秘密鍵を削除しておく。

``` text
$ gpg --delete-secret-key hoge_fuga@foo-bar.xxx
gpg (GnuPG) 1.4.18; Copyright (C) 2014 Free Software Foundation, Inc.
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.


sec  2048R/AA260242 2016-11-04 Hoge Fuga (foo-bar) <hoge_fuga@foo-bar.xxx>

この鍵を鍵輪から削除しますか? (y/N) y                # <= y で応答
これは秘密鍵です! 本当に削除しますか? (y/N) y        # <= 再度 y で応答

```

### 6. 鍵一覧の確認

``` text
$ gpg --list-keys
```

一覧に対象の鍵が表示されないことを確認する。

### 7. 参考サイト

* [The GNU Privacy Guard](https://www.gnupg.org/ "The GNU Privacy Guard")

---

これで、公開鍵が外部に流出しても慌てることなく対応できます。

以上。

