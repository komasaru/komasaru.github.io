---
layout   : single
title    : "CentOS 6.5 - Ruby 2.0 インストール（ソースビルド）！"
published: true
date     : 2014-01-07 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- Ruby
---

前回は CentOS 6.5 サーバに DB サーバ MariaDB の構築（ソースインストール）を行いました。  
今回は Ruby 2.0 のインストール（ソースビルド）を行います。

<!--more-->

### 0. 前提条件

- CentOS 6.5(x86_64) を Minimal で最小インストールしている。
- クライントマシンは Linux Mint 14(64bit) を想定。
- ソースを取得し、ビルドしてインストールする。
- 当記事執筆時点で最新の Ruby 2.0.0-p353 をインストールする。
- 過去にこのサイトを参考にして作業した際に記録していたものを参照している。

### 1. アーカイブファイルダウンロード＆展開

アーカイブファイルをダンロードし、展開する。（ダンロード先は “/usr/local/src” としている）

``` text
# cd /usr/local/src
# wget http://cache.ruby-lang.org/pub/ruby/2.0/ruby-2.0.0-p353.tar.gz
# tar zxvf ruby-2.0.0-p353.tar.gz
```

### 2. ビルド＆インストール

ビルド＆インストールは以下のように行う。（よくある `.configure`, `make`, `make install`）

``` text
# cd ruby-2.0.0-p353
# ./configure
# make
# make install
```

### 3. インストール確認

以下のようにバージョンを表示させてみて、インストールできているか確認する。

``` text
# ruby -v
ruby 2.0.0p353 (2013-11-22 revision 43784) [x86_64-linux]
```

### 4. gem 最新化

今後のために、gem を最新に更新しておく。

``` text
# gem -v
2.0.14

# gem update --system

# gem -v
2.1.11
```

### 5. 動作確認

適当にコーディングして、正常に動作するか確認する。
Ruby スクリプトファイルを作成して実行してもよいし、irb や pry でコーディングしてもよい。以下はコマンドラインから実行した例。

``` text
# ruby -e '5.times {puts "Hello Ruby!"}'
Hello Ruby!
Hello Ruby!
Hello Ruby!
Hello Ruby!
Hello Ruby!
```

以下は、`gem install pry` で Pry ライブラリをインストールしてコーディングした例。

``` text
# pry
[1] pry(main)> 5.times {puts "Hello Pry!"}
Hello Pry!
Hello Pry!
Hello Pry!
Hello Pry!
Hello Pry!
=> 5
[2] pry(main)> 
```

---

次回は、自動バックアップ運用について紹介する予定です。

以上。

