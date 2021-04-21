---
layout   : single
title    : "Linux - tail コマンドで行を抽出！"
published: true
date     : 2013-09-12 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
---

Linux で、動的にテキストが追加されていくテキストファイルの内容をリアルタイムで確認するのに、`tail` コマンドをよく使用すると思います。

無条件にコンソール出力するのなら何ら問題はありませんが、行を抽出したい（不要な行を出力させたくない）ことがあります。

以下、そんな場合の対策方法についての備忘録です。

<!--more-->

#### 0. 前提条件

- Linux Mint 14 (64bit) での作業・動作確認を想定。

#### 1. tail コマンドで行を抽出する方法

次のコマンドは、コンソール出力対象のテキストファイル名を "test.txt" とし、"hoge" という文字列を含む行のみを抽出したい場合の例である。  
`grep` コマンドをパイプして実行するが、**リアルタイムでコンソール出力させるには `--line-buffered` というオプションが必要である。**  
`--line-buffered` オプションが指定しないと、`grep` コマンドが結果をバッファに格納してしまい、ある程度たまってからでないと出力されない。

``` bash 
$ tail -f test.txt | grep --line-buffered hoge
```

逆に、"fuga" という文字列を含まない行のみを抽出したい場合は以下のようにする。

``` bash 
$ tail -f test.txt | grep --line-buffered -v fuga
```

---

`--line-buffered` オプションについては、`man grep` には説明がありませんが、`grep --help` には説明があります。

`tail` と `grep` コマンドをパイプした使い方は意外とよく使用するので、記録しておいた次第です。

以上。

