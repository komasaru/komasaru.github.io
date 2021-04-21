---
layout   : single
title    : "Linux - bash で古いファイルの削除！"
published: true
date     : 2016-02-12 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- bash
---

サーバを運用していると、日々ログファイルが作成され続けてディレクトリが肥大化することがあります。（ログローテションが使えないような場合等）

以下で、最終更新日から一定の日数を超えたファイルを削除する bash スクリプトを紹介します。（簡単すぎるので、記事にするほどのものでもないかも知れませんが）

<!--more-->

### 0. 前提条件

* CentOS 6.7, Linux Mint 17.2 での作業を想定。（他の環境でも問題ないはず）

### 1. bash スクリプトの作成

File: `del_oldlogs.sh`

{% highlight bash linenos %}
#!/bin/bash

DIR=/path/to/target_dir
DAYS=7

find $DIR -mtime +$DAYS -a -type f -exec rm -f {} \;
{% endhighlight %}

* `-mtime` は更新日時を指定するオプション。（指定する値は「日」ベース）  
  そして、以下に注意。
  - `-mtime 1` で更新日時が1日（24時間以上48時間以下）のファイルを検索。
  - `-mtime +1` で更新日時が1日超（48時間超）のファイルを検索。
  - `-mtime -1` で更新日時が1日未満（24時間未満）のファイルを検索。
* `-type` はファイルタイプを指定するオプション。
  - `-type f` でファイルを指定。
  - `-type d` でディレクトリを指定。
  - `-type l` でシンボリックリンクを指定。
* `-a` は AND 条件を指定するオプション。
* `-exec` は以降に続くコマンドを実行するオプション。  
  - `{}` で検索結果を受け取る。
* `\` は `-exec` の終端であることを表す記号。

ちなみに、上記の `find ...` の部分は以下のように書き換えることも可能。

``` bash
find $DIR -mtime +$DAYS -a -type f | xargs rm -f;
```

### 2. bash スクリプトの実行

``` text
$ ./del_oldlogs.rb
```

### 3. 実際の運用

毎回手動で起動するのは面倒なので、実際には cron 登録して定期的に実行するようにする。

---

後学のための備忘録でした。

以上。

