---
layout   : single
title    : "Ruby - rbenv インストール(on Linux Mint)！"
published: true
date     : 2015-04-24 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
---
こんにちは。

当方、普段は Ruby はソースをビルドしてインストールして使用していますが、他のバージョンを使用した場合はバージョン管理システム rbenv を使用しています。

Linux Mint へのインストール方法について今まで記録したことがなかったので、今回記録しておいた次第です。

<!--more-->

### 0. 前提条件

* Linux Mint 17.1(64bit) での作業を想定。
* Ruby そのもののインストールには `rbenv` のプラグイン `ruby-build` を使用する。
* `git` コマンドを使用するのでインストール済みであること。

### 1. rbenv, ruby-build のチェックアウト(git clone)

``` text
$ git clone https://github.com/sstephenson/rbenv.git ~/.rbenv
$ git clone https://github.com/sstephenson/ruby-build.git ~/.rbenv/plugins/ruby-build
```

### 2. 環境設定

".bashrc" （環境によっては ".bash_profile"）に設定を追記。

``` text
$ echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.bashrc
$ echo 'eval "$(rbenv init -)"' >> ~/.bashrc
```

そして、即時反映。

``` text
$ source ~/.bashrc
```

### 3. rbenv, ruby-build のインストール確認

``` text
$ rbenv --version
rbenv 0.4.0-146-g7ad01b2

$ ruby-build --version
ruby-build 20141225
```

### 5. インストール可能リストの確認

``` text
$ rbenv install -l
Available versions:
  1.8.6-p383
  1.8.6-p420
  1.8.7-p249
         :
====< 以下省略 >====
         :
```

（`-l` を `--list` と置き換えてもよい）

### 6. Ruby のインストール

``` text
$ rbenv install -v 2.2.1
```

### 7. インストール済み Ruby の確認

``` text
$ rbenv versions
* system (set by /home/hoge/.rbenv/version)
  2.2.1
```

### 8. 環境全体で使用する Ruby バージョンの設定

``` text
$ rbenv global 2.2.1

$ rbenv rehash  # <= 変更の反映

$ ruby -v
ruby 2.2.1p85 (2015-02-26 revision 49769) [x86_64-linux]

$ rbenv versions
  system
* 2.2.1 (set by /home/masaru/.rbenv/version)
```

### 9. Ruby のアンインストール

rbenv + ruby-build でインストールした Ruby のアンインストールは以下のようにする。

``` text
$ rbenv uninstall 2.0.0-p353
```

ruby-build をインストールしていないのなら、以下のようにすればよい。

``` text
$ rm -rf ~/.rbenv/versions/2.2.1
```

### 10. rbenv - アップグレード

``` text
$ cd ~/.rbenv
$ git pull
```

* [sstephenson/rbenv](https://github.com/sstephenson/rbenv#installation "sstephenson/rbenv")
* [sstephenson/ruby-build](https://github.com/sstephenson/ruby-build "sstephenson/ruby-build")

---

よくある方法ですが、当方普段は rbenv をあまり使用しないので備忘録として残しておいた次第です。

以上。

