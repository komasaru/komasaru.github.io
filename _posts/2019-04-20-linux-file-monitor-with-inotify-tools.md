---
layout   : single
title    : "Linux - inotify-tools でファイル監視！"
published: true
date     : 2019-04-20 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- Debian
- LMDE3
---

Linux で指定のディレクトリ内にファイルが作成された際に、そのファイル名を取得して何らかの処理を行う方法についてです。

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 9.6, LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* inotify-toos パッケージ（`inotifywait` コマンド）を使用する。

### 1. パッケージのインストール

``` text
$ sudo apt install inotify-tools
```

### 2. 基本的な使い方

``` text
$ inotifywait -e create -mq dir_name
```

このように実行し、別コンソール等から対象のディレクトリ内にファイルを作成すると、以下のように出力される。（監視終了は `CTRL-C`）

``` text
dir_name/ CREATE 1234
dir_name/ CREATE 2345
```

* `-e create` は、ファイル作成のみを監視するオプション。  
  他に `access`, `modify`, `delete` 等も指定可能。（複数指定する場合は `,` でつなぐ）
* `-m` は、監視を継続するオプション。  
  （指定しない場合は、1回検知後に終了）
* `-q` は、イベント検知以外の出力を行わないオプション。
* フォアグラウンドでなく、バックグラウンドで監視したければ、末尾に `&` を付与。

### 3. 応用

上記の使い方を応用し、指定のディレクトリ内にファイルが作成されたら、そのファイルの名称を取得して、別の処理を実行するよう Bash スクリプトを作成してみた。

以下は、作業ディレクトリ `/path/to/work` 内の `foo` ディレクトリ内に UUID を名称とするファイルが作成されたら、作業ディレクトリ内の `my_cmd` コマンドにその UUID を引数に渡して実行する例。（単に、出力結果の3番目の値を引数にしているだけ）

File: `sample.sh`

{% highlight bash linenos %}
#! /bin/bash

DIR_WK="/path/to/work"
DIR_WATCH="foo"

cd $DIR_WK

inotifywait -e create -mq $DIR_WATCH | while read line; do
  set $line
  uuid=${3}
  ./my_cmd $uuid
done
{% endhighlight %}

### 4. その他

今回はディレクトリ内にファイルが作成された場合の話に限定しているが、その他のことについて知りたければ `inotifywait --help` か `man inotifywait` 等で確認する。

---

以上。

