---
layout   : single
title    : "Linux - ファイルの暗号化・復号化（GnuPG, 公開鍵方式）！"
published: true
date     : 2016-12-03 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
- GnuPG
- 暗号
---

[The GNU Privacy Guard](https://www.gnupg.org/ "The GNU Privacy Guard") を使用して公開鍵方式でファイルを暗号化・復号化する方法についての記録です。

<!--more-->

### 0. 前提条件

* LMDE2(Linux Mint Debian Edition 2) での作業を想定。
* 使用する GnuPG は 1.4.18 を想定。
* ここでは、公開鍵（共通鍵）の詳細については説明しない。

### 1. 公開鍵のインポート

暗号化する側は、復号化する側が生成した公開鍵をメールなどで受け取った後、以下のようにしてインポートする。

``` text
$ gpg --import hoge_fuga.pub
gpg: 鍵AA260242:“Hoge Fuga (foo-bar) <hoge_fuga@foo-bar.xxx>” を読み込みました
gpg:     処理数の合計: 1
gpg:           読込み: 1
```

インポートされている鍵の確認は、以下のとおり。

``` text
$ gpg --list-keys
/home/hoge/.gnupg/pubring.gpg
-------------------------------
pub   2048R/AA260242 2016-11-04
uid                  Hoge Fuga (foo-bar) <hoge_fuga@foo-bar.xxx>
sub   2048R/AC922C7E 2016-11-04

```

### 2. 暗号化

``` text
$ gpg -e -a -r hoge_fuga@foo-bar.com password.txt
```

* `-e` は、暗号化するオプション
* `-a` は、ASCII 形式で出力するオプション  
  ASCII 形式でなく、バイナリ形式で出力する場合は使用しない
* `-r xxxx@xxxx` は、公開鍵を指定するオプション

暗号化が完了すると、 "password.txt.asc" （バイナリ形式の場合は "password.txt.gpg"）というファイルが生成される。

### 3. 復号化

復号化する側は、暗号化されたファイルを何らかの方法で受け取った後、以下のようにして復号化する。

``` text
$ gpg password.txt.asc

次のユーザーの秘密鍵のロックを解除するには
パスフレーズがいります:“Hoge Fuga (foo-bar) <hoge_fuga@foo-bar.xxx>”
2048ビットRSA鍵, ID AC922C7E作成日付は2016-11-04 (主鍵ID AA260242)

パスフレーズを入力: 

gpg: 2048-ビットRSA鍵, ID AC922C7E, 日付2016-11-04に暗号化されました
      “Hoge Fuga (foo-bar) <hoge_fuga@foo-bar.xxx>”
ファイル「password.txt」は既に存在します。上書きしますか? (y/N)
新しいファイル名を入力してください: password_2.txt
```

バイナリ形式の場合も同様に復号化できる。

``` text
$ gpg password.txt.gpg
```

---

重要なファイルを暗号化して相手に渡す際に役に立つでしょう。

以上。

