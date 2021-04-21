---
layout   : single
title    : "FreeBSD 10.0 - 最新 Ruby インストール（ソースビルド）！"
published: true
date     : 2014-11-02 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- FreeBSD
- Ruby
---

「FreeBSD 10.0 - 最新 Ruby インストール（ソースビルド）」についての記録です。

（旧バージョンでの個人の作業記録を更新しました。興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* 以下の作業は、リモート接続して行う。（リモートから `ssh vbox` で接続）
* リモート端末は、 Linux Mint 17 マシンを想定しているが、 Unix 系 OS なら同じ。
* 設定ファイル等のテキストファイルの編集には `vi` コマンドを使用。
* 作業はリモート接続で一般ユーザから root になって行う。
* デフォルトで Ruby がインストールされているが、アンインストールはしない。

### 1. アーカイブダウンロード

``` text
# cd /usr/local/etc
# fetch http://cache.ruby-lang.org/pub/ruby/2.1/ruby-2.1.3.tar.gz
# tar zxvf ruby-2.1.3.tar.gz
```

### 2. Ruby インストール

``` text
# cd ruby-2.1.3
# ./configure
# make
# make install clean
# rehash
# ruby -v
ruby 2.1.3p242 (2014-09-19 revision 47630) [x86_64-freebsd10.0]
```

### 3. make.conf

今後 ports などを使って ruby 関連のモジュールをインストールする際にインストール先がわかるように make.conf にパス設定を追記。

``` text
# which ruby
usr/local/bin/ruby          # <= ruby の位置を確認
```

File: `/etc/make.conf`

{% highlight bash linenos %}
RUBY?=/usr/local/bin/ruby  # <= 追加
{% endhighlight %}

### 4. gem 最新化

今後のために、gem を最新に更新。

``` text
# gem -v
2.2.2
# gem update --system
# gem -v
2.4.2
```

### 5. gem の設定

サーバ環境ではドキュメントは不要であるので、RubyGems パッケージインストール時にドキュメントをインストールしないよう "~/.gemrc" に設定する。（RubyGems パッケージインストールの都度 `--no-ri --no-rdoc` オプションを使用しなくてもよいように）  

File: `~/.gemrc`

{% highlight bash linenos %}
install: --no-document
update: --no-document
{% endhighlight %}

ちなみに、今ではもはや `--no-ri`, `--no-rdoc` というオプションは Deprecated（非推奨）。（`gem help install` で確認）

### 6. 動作確認

適当にコーディングして、正常に動作するか確認する。  
Ruby スクリプトファイルを作成して実行してもよいし、irb や pry でコーディングしてもよい。以下はコマンドラインから実行した例。

``` text
# ruby -e '5.times { puts "Hello Ruby!" }'
Hello Ruby!
Hello Ruby!
Hello Ruby!
Hello Ruby!
Hello Ruby!
```

---

以上。

