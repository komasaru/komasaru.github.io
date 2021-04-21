---
layout   : single
title    : "MySQL - 設定ファイル my.cnf 読み込み順序！"
published: true
date     : 2013-06-03 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- MySQL
---

MySQL の設定ファイル "my.cnf" を配置できる場所は複数あり、あらかじめ決められた順序に従って読み込まれます。

以下、備忘録です。

<!--more-->

#### 0. 前提条件

- OS は Unix 系(Linux, BSD, MacOS)を想定。（Slackware, Suse 系 Linux や Windows 等は不明）

#### 1. "my.cnf" の配置場所と読み込み順序

1. "/etc/my.cnf"
2. "/etc/mysql/my.cnf"
3. "SYSCONFIGDIR(コンパイル時指定)/etc/my.cnf"
4. "$MYSQL_HOME(環境変数)/my.cnf"
5. `--defaults-extra-file` オプションで指定したファイル
6. "~/.my.cnf"

#### 2. 注意

- 配置場所は自由に決めて構わないが、複数の場所に "my.cnf" を配置すると後から読み込まれたファイルの内容が優先される。  
- １台のマシンに複数の MySQL をインストールする場合は、"/etc/my.cnf" や "/etc/mysql/my.cnf" を使用すると全ての MySQL が同じ設定ファイルを参照することになる。

#### 3. 読み込み順序確認

前述の順序で読み込まれるようになっているが、自身の環境で実際にどの順序で "my.cnf" が読み込まれるようになっているか確認できる。  
`mysql --help` で表示される中にそれが分かる部分がある。 `mysql --help` で表示して確認してもよいが、以下のように `grep` で抽出して確認するとよい。

``` text 
$ mysql --help | grep -A1 "Default options"
Default options are read from the following files in the given order:
/etc/my.cnf /etc/mysql/my.cnf /usr/etc/my.cnf ~/.my.cnf 
```

`grep` コマンドの `-A1` は該当行の１行下の行まで含めるという意味のオプション。

---

MySQL をパッケージでインストールしたり、ソースをビルドしてインストールしたりしていると、"my.cnf" が複数の場所に混在して思うように設定が反映されなくて困ることがあります。

「"my.cnf" が複数の場所に配置できること、読み込み順序があること」ということを理解していおくと、有事の時に早めに原因に気付くことができるでしょう。

以上。

