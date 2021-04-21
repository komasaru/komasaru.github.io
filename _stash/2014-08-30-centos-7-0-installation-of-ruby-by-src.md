---
layout   : single
title    : "CentOS 7.0 - Ruby 2.1.2 インストール（ソースビルド）！"
published: true
date     : 2014-08-30 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- Ruby
---

「CentOS 7.0 - Ruby 2.1.2 インストール（ソースビルド）」についての記録です。

（旧バージョンでの作業記録を更新しました。興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

- CentOS 7.0-1406(x86_64) を NetInstall で最小限インストールしている。
- サーバ用途なので、作業は基本的に全て一般ユーザから root になって行う。
- クライアント側は Linux Mint 17 を想定。
- 当記事執筆時点で最新の Ruby 2.1.2 をインストールする。
- RPMforge リポジトリ導入済み。（[CentOS 7.0 - リポジトリ追加]({{site.baseurl}}/2014/08/06/centos-7-0-addition-of-repository "CentOS 7.0 - リポジトリ追加")）

### 1. 必要ライブラリのインストール

やりたいこと等により導入するライブラリも異なるだろうが、取り急ぎ以下をインストールした。(libyaml-devel は Ruby インストール前にインストールしておかないと、Ruby インストールに成功しても gem コマンド関連で不具合が生じる）

``` text
# yum -y install ncurses-devel gdbm-devel readline-devel libyaml-devel
```

### 2. アーカイブファイルダウンロード＆展開

アーカイブファイルをダンロードし、展開する。（ダンロード先は "/usr/local/src" としている）

``` text
# cd /usr/local/src
# wget http://cache.ruby-lang.org/pub/ruby/2.1/ruby-2.1.2.tar.gz
# tar zxvf ruby-2.1.2.tar.gz
```

### 3. ビルド＆インストール

ビルド＆インストールは以下のように行う。（よくある `.configure`, `make`, `make install`）

``` text
# cd ruby-2.1.2
# ./configure
# make
# make install
```

### 4. インストール確認

以下のようにバージョンを表示させてみて、インストールできているか確認する。

``` text
# ruby -v
ruby 2.1.2p95 (2014-05-08 revision 45877) [x86_64-linux]
```

### 5. gem 最新化

今後のために、gem を最新に更新しておく。

``` text
# gem -v
2.2.2
# gem update --system
# gem -v
2.4.1
```

### 6. gem の設定

サーバ環境ではドキュメントは不要であるので、RubyGems パッケージインストール時にドキュメントをインストールしないよう "~/.gemrc" に設定する。（RubyGems パッケージインストールの都度 `--no-ri --no-rdoc` オプションを使用しなくてもよいように）  

File: `/etc/gemrc`

{% highlight bash linenos %}
install: --no-document
update: --no-document
{% endhighlight %}

ちなみに、今ではもはや `--no-ri`, `--no-rdoc` というオプションは Deprecated（非推奨）。（`gem help install` で確認）

### 7. 動作確認

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

### 参考サイト

- [オブジェクト指向スクリプト言語 Ruby](https://www.ruby-lang.org/ja/ "オブジェクト指向スクリプト言語 Ruby")
- [Command Reference - RubyGems Guides](http://guides.rubygems.org/command-reference/#gem_install "Command Reference - RubyGems Guides")

---

以上。

