---
layout   : single
title    : "Linux - tail コマンド応用！"
published: true
date     : 2013-09-13 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
---

Linux を含む Unix 系 OS でサーバ管理している方なら `tail` コマンドでログを監視するのは日常業務の１つだと思います。  
特に、`tail -f hoge.log` のようにしてリアルタイムで監視しているでしょう。

以下、`tail` コマンドを応用した当方が日常的に使用している方法についての備忘録です。

<!--more-->

#### 0. 前提条件

- CentOS 6.4, Linux Mint 14 で動作確認済み。（Unix 系 OS ならどれも同じでしょう）

#### 1. 複数ファイルを同時に監視

単純に、監視したいファイルをスペースを空けて指定すれば良い。

``` bash 
$ tail -f hoge.log fuga.log
==> hoge.log <==
AAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAA
           :
  ===< 途中省略 >===
           :
AAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAA

==> fuga.log <==
BBBBBBBBBBBBBBBBBBBBBBBB
BBBBBBBBBBBBBBBBBBBBBBBB
           :
  ===< 途中省略 >===
           :
BBBBBBBBBBBBBBBBBBBBBBBB
BBBBBBBBBBBBBBBBBBBBBBBB
```

ただし、どのファイルの内容かが分かるように、`==> hoge.log <==` のようにファイル名が出力される。  
このファイル名を非表示にしたい場合は、以下のように `-q` オプションを使用する。`-f` と `-q` をまとめて `-fq` としても良い。

``` bash 
$ tail -f -q hoge.log fuga.log
AAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAA
           :
  ===< 途中省略 >===
           :
AAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAA
BBBBBBBBBBBBBBBBBBBBBBBB
BBBBBBBBBBBBBBBBBBBBBBBB
           :
  ===< 途中省略 >===
           :
BBBBBBBBBBBBBBBBBBBBBBBB
BBBBBBBBBBBBBBBBBBBBBBBB
```

また、ファイル指定にはワイルドカードも使用できる。以下のように `*` で指定する。

``` bash 
$ tail -f -q foo/*.log
```

#### 2. 監視ファイルに行が追加されたらビープ音を鳴らす

頻繁に行が追加されないファイルであれば、行が追加された際にそれを音で通知して欲しいと思うだろう。  
以下のように、`tail` の結果と `sed` コマンド（正規表現）とをパイプすると、行が出力される際にビープ音が鳴る。

``` bash 
$ tail -f -q foo/*.log | sed --unbuffered -e 's/^\(.*\)$/\1^G/'
```

`sed -e 's/^\(.*\)$/\1^G/'` は各行の行末にビープ音を鳴らす `^G` を付加するという意味である。（`^G` は `^` と `G` ではなく、`CTRL-V` と `CTRL-G` なのでご注意を！）  
`^G` の代わりに `\a` でもよい。  
また、`sed` コマンドは `grep` コマンド同様、結果を一旦バッファに格納してある程度溜まってからでないと出力されないようだ。これを回避するために `--unbuffered` オプションを使用している。  

---

今回は、当方がよく利用するコマンド使用例を紹介したが、`sed` コマンドでエスケープシーケンスを使用して特定の文字に色を付けたりすることも可能です。

以上。

