---
layout   : single
title    : "Debian 7 Wheezy - Ruby 2.0 インストール（ソースビルド）！"
published: true
date     : 2013-10-31 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- Ruby
---

Debian GNU/Linux 7 Wheezy サーバにプログラミング言語 Ruby をソースをビルドしてインストールする方法についての記録です。

何てことない、いつものよくある方法ですが。

<!--more-->

### 0. 前提条件

- Debian GNU/Linux 7.1.0 での作業を想定。
- 接続元のマシンは Linux Mint 14(64bit) を想定。
- インストールする Ruby は 2.0.0-p247
- 作業は全て root ユーザで行なっている。

### 1. アーカイブファイルダウンロード＆展開

アーカイブファイルをダンロードし、展開する。（ダンロード先は "/usr/local/src" としている）

``` text 
# cd /usr/local/src
# wget http://cache.ruby-lang.org/pub/ruby/2.0/ruby-2.0.0-p247.tar.gz
# tar zxvf ruby-2.0.0-p247.tar.gz
```

### 2. ビルド＆インストール

ビルドインストールは以下のように行う。（よくある `.configure`, `make`, `make install`）

``` text 
# cd ruby-2.0.0-p247
# ./configure
# make
# make install
```

### 3. インストール確認

以下のようにバージョンを表示させてみて、インストールできているか確認する。

``` text 
# ruby -v
ruby 2.0.0p247 (2013-06-27 revision 41674) [x86_64-linux]
```

### 4. gem 最新化

今後のために、gem を最新に更新しておく。

``` text 
# gem -v
2.0.3

# gem update --system

# gem -v
2.1.6
```

### 5. 動作確認

適当にコーディングして、正常に動作するか確認する。  
Ruby スクリプトファイルを作成して実行してもよいし、`irb` でコーディングしてもよい。以下はコマンドラインから実行した例。

``` text 
# ruby -e '5.times {puts "Hello Ruby!"}'
Hello Ruby!
Hello Ruby!
Hello Ruby!
Hello Ruby!
Hello Ruby!
```

---

以上。

