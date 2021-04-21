---
layout   : single
title    : "Linux - Bash をソースビルドでインストール！"
published: true
date     : 2015-03-12 00:20:00 +0900
comments : true
categories:
- PC_Tips
- サーバ構築
tags:
- Linux
- bash
---
こんにちは。

Bash(Bourne-again shell) の最新版をソースをビルドしてインストールする方法についての記録です。

<!--more-->

### 0. 前提条件

* Linux Mint 17.1(64bit) での作業を想定しているが、他のディストリビューションでも同様。
* Bash 4.3.33 をインストールする。
* Bash 4.3 に 1 から 33 までのパッチを適用する方法でインストールを行う。
* 作業はパッケージでインストールされた Bash の元で行う。
* パッケージでインストールされている Bash は削除せず残しておく。

### 1. Bash バージョンの確認

現状のパッケージでインストールされている Bash のバージョンを確認してみる。

``` text
$ bash --version
GNU bash, バージョン 4.3.11(1)-release (x86_64-pc-linux-gnu)
Copyright (C) 2013 Free Software Foundation, Inc.
ライセンス GPLv3+: GNU GPL バージョン 3 またはそれ以降 <http://gnu.org/licenses/gpl.html>

This is free software; you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.
```

### 2. アーカイブファイルのダウンロード＆展開

4.3.33 は 4.3 にパッチを 33 回適用したものであるので、パッチファイルは 33 個ある。

``` text
$ mkdir bash_tmp
$ cd bash_tmp
$ wget http://ftp.gnu.org/gnu/bash/bash-4.3.tar.gz
$ wget http://ftp.gnu.org/gnu/bash/bash-4.3-patches/bash43-{001..033}
$ tar zxvf bash-4.3.tar.gz
```

### 3. パッチの適用

１つずつパッチを適用してもよいが、手間なので以下のように一度に適用する。

``` text
$ cd bash-4.3
$ find ../bash43-??? -exec /bin/sh -c 'patch -p0 < {}' \;
```

### 4. ビルド＆インストール

``` text
$ ./configure
$ make
$ sudo make install
```

### 5. ログインシェルの変更

まず、現在のログインシェルを確認する。

``` text
$ echo $SHELL
/bin/bash
```

次に、"/etc/shells" に先ほどインストールした `/usr/local/bin/bash` を追記する。（root 権限で）

File: `/etc/shells`

{% highlight bash linenos %}
# /etc/shells: valid login shells
/bin/sh
/bin/dash
/bind/bash
/bin/rbash
/usr/bin/tmux
/bin/zsh
/usr/local/bin/bash
{% endhighlight %}

そして、ログインシェルを変更する。

``` text
$ chsh
パスワード: 
hoge のログインシェルを変更中
新しい値を入力してください。標準設定値を使うならリターンを押してください
        ログインシェル [/bin/bash]: /usr/local/bin/bash
```

再ログイン後、ログインシェルを確認する。

``` text
$ echo $SHELL
/usr/local/bin/bash
```

### 6. Bash バージョン確認

Bash のバージョンを確認みる。

``` text
$ bash --version
GNU bash, バージョン 4.3.33(1)-release (x86_64-unknown-linux-gnu)
Copyright (C) 2013 Free Software Foundation, Inc.
ライセンス GPLv3+: GNU GPL バージョン 3 またはそれ以降 <http://gnu.org/licenses/gpl.html>

This is free software; you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.
```

**".bashrc" や ".profile" 等の設定ファイル記述によっては、今までと挙動（プロンプト等）が異なるかも知れない。その際は設定ファイルを確認する。**

さらに、各種動作に異常が無いかも確認しておくとよいだろう。

### 6. 参考サイト

* [Bash - GNU Project - Free Software Foundation](https://www.gnu.org/software/bash/ "Bash - GNU Project - Free Software Foundation")

---

Bash に脆弱性が発見され最新版に更新する必要性が発生した際には、今回の方法でインストールすればよいでしょう。

以上。

