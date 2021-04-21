---
layout   : single
title    : "Linux Mint - Apt パッケージリストアップデートで GPG 公開鍵の期限切れエラー！"
published: true
date     : 2015-11-21 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
- LinuxMint
---

Linux Mint で `apt-get update` すると公開鍵期限切れのエラーが発生するようになりました。

（以前「[Linux Mint - apt-get update で GPG 公開鍵エラー！]({{site.baseurl}}/2015/10/14/linux-mint-apt-gpg-pubkey-error/ "Linux Mint - apt-get update で GPG 公開鍵エラー！")」という記事も公開しています。参考までに）

以下、現象・原因・対策についての記録です。

<!--more-->

### 0. 前提条件

* Linux Mint 17.2(64bit) での作業を想定。

### 1. 現象

`sudo apt-get update` を実行すると以下のようなエラーが発生する。（アップデートマネージャでも同様）

``` text
W: GPG エラー: http://cran.ism.ac.jp trusty/ Release: 以下の署名が無効です: KEYEXPIRED 1445181253 KEYEXPIRED 1445181253 KEYEXPIRED 1445181253,
```

（ちなみに、今回の現象は統計解析用プログラミング言語 R のパッケージにに関するもの）

### 2. 原因

エラーメッセージに記載されているとおり、 `1445181253` というキーが `KEYEXPIRED`（期限切れ）になっているため。

### 3. 対策

まず、キーの状態を確認してみる。

``` text
$ apt-key list

pub   2048R/E084DAB9 2010-10-19 [満了: 2015-10-18]
uid                  Michael Rutter <marutter@gmail.com>
```

確かに期限が切れている。

従って、キーサーバに問い合わせて、公開鍵を再取得すればよい。

``` text
$ sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys E084DAB9
Executing: gpg --ignore-time-conflict --no-options --no-default-keyring --homedir /tmp/tmp.UCCHrlWZQw --no-auto-check-trustdb --trust-model always --keyring /etc/apt/trusted.gpg --primary-keyring /etc/apt/trusted.gpg --keyserver keyserver.ubuntu.com --recv-keys E084DAB9
gpg: 鍵E084DAB9をhkpからサーバーkeyserver.ubuntu.comに要求
gpg: 鍵E084DAB9:“Michael Rutter <marutter@gmail.com>”新しい署名を2個
gpg: 処理数の合計: 1
gpg:         新しい署名: 2
```

再度、キーの状態を確認してみる。

``` text
$ apt-key list

pub   2048R/E084DAB9 2010-10-19 [満了: 2020-10-16]
uid                  Michael Rutter <marutter@gmail.com>
sub   2048R/1CFF3E8F 2010-10-19 [満了: 2020-10-16]
```

満了日が延長された。

これで、正常に `sudo apt-get update` が実行できるはず。

---

めったに遭遇しない事象なので、後学のために記録として残しておいた次第です。

以上。

