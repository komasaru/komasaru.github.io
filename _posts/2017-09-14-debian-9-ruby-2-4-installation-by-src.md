---
layout   : single
title    : "Debian 9 (Stretch) - Ruby 2.4 インストール（ソースビルド）！"
published: true
date     : 2017-09-14 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- Ruby
---

Debian GNU/Linux 9 (Stretch) に Ruby 2.4 をソースをビルドしてインストール方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 9 (Stretch) での作業を想定。
* 接続元のマシンは LMDE2(Linux Mint Debian Edition 2)(64bit) を想定。
* インストールする Ruby は 2.4.1-p111
* root ユーザでの作業を想定。

### 1. 必要パッケージのインストール

Ruby のインストールに必要なパッケージを予めインストールする。（他に必要なものがあればインストールする）

``` text
# apt -y install libffi-dev zlib1g-dev libssl-dev libreadline-dev \
libgdbm-dev libbison-dev libmariadbclient-dev
```

### 2. アーカイブファイルのダウンロード＆展開

アーカイブファイルをダンロードし、展開する。（ダンロード先は "/usr/local/src" としている）

``` text
# cd /usr/local/src
# wget http://cache.ruby-lang.org/pub/ruby/2.4/ruby-2.4.1.tar.gz
# tar zxvf ruby-2.4.1.tar.gz
```

### 3. ビルド＆インストール

ビルドインストールは以下のように行う。（よくある `.configure`, `make`, `make install`）

``` text
# cd ruby-2.4.1
# ./configure
# make
# make install
```

### 4. インストールの確認

バージョンを表示させてみて、インストールできているか確認する。

``` text
# ruby -v
ruby 2.4.1p111 (2017-03-22 revision 58053) [x86_64-linux]
```

### 5. ドキュメントの非インストール設定

サーバ環境には RubyGems ライブラリのドキュメントは不要なので、 RubyGems ライブラリインストール時にドキュメントをインストールしないように設定する。

File: `~/.gemrc`

{% highlight ruby linenos %}
install: --no-document
update: --no-document
{% endhighlight %}

ちなみに、今ではもはや `--no-ri`, `--no-rdoc` というオプションは Deprecated（非推奨）。（`gem help install` で確認）

### 6. gem の最新化

今後のために、gem を最新に更新しておく。

``` text
# gem -v
2.6.11

# gem update --system

# gem -v
2.6.12
```

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

