---
layout   : single
title    : "Debian 8 (Jessie) - Ruby 2.2 インストール（ソースビルド）！"
published: true
date     : 2015-06-22 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- Ruby
---

Debian GNU/Linux 8 (Jessie) に Ruby 2.2 をソースをビルドしてインストール方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 8 (Jessie) での作業を想定。
* 接続元のマシンは Linux Mint 17.1(64bit) を想定。
* インストールする Ruby は 2.2.2-p95
* 作業は全て root ユーザで行なっている。

### 1. 必要パッケージのインストール

Ruby のインストールに必要なパッケージを予めインストールする。（他に必要なものがあればインストールする）

``` text
# apt-get install libffi-dev zlib1g-dev libssl-dev libreadline-dev libgdbm-dev libbison-dev
```

### 2. アーカイブファイルのダウンロード＆展開

アーカイブファイルをダンロードし、展開する。（ダンロード先は "/usr/local/src" としている）

``` text
# cd /usr/local/src
# wget http://cache.ruby-lang.org/pub/ruby/2.2/ruby-2.2.2.tar.gz
# tar zxvf ruby-2.2.2.tar.gz
```

### 3. ビルド＆インストール

ビルドインストールは以下のように行う。（よくある `.configure`, `make`, `make install`）

``` text
# cd ruby-2.2.2
# ./configure
# make
# make install
```

### 4. インストールの確認

以下のようにバージョンを表示させてみて、インストールできているか確認する。

``` text
# ruby -v
ruby 2.2.2p95 (2015-04-13 revision 50295) [x86_64-linux]
```

### 5. gem の最新化

今後のために、gem を最新に更新しておく。

``` text
# gem -v
2.4.5

# gem update --system

# gem -v
2.4.6
```

### 6. ドキュメントの非インストール設定

サーバ環境には RubyGems ライブラリのドキュメントは不要なので、 RubyGems ライブラリインストール時にドキュメントをインストールしないように設定する。

File: `~/.gemrc`

{% highlight ruby linenos %}
install: --no-document
update: --no-document
{% endhighlight %}

ちなみに、今ではもはや `--no-ri`, `--no-rdoc` というオプションは Deprecated（非推奨）。（`gem help install` で確認）

### 7. 動作確認

適当にコーディングして、正常に動作するか確認する。  
Ruby スクリプトファイルを作成して実行してもよいし、`irb` や `pry` でコーディングしてもよい。以下はコマンドラインから実行した例。

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

