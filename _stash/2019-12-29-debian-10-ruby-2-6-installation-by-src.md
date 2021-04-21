---
layout   : single
title    : "Debian 10 (buster) - Ruby 2.6 インストール（ソースビルド）！"
published: true
date     : 2019-12-29 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- Ruby
---

Debian GNU/Linux 10 (buster) に Ruby 2.6 をソースをビルドしてインストール方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10 (buster) での作業を想定。
* 接続元のマシンは LMDE 3 (Linux Mint Debian Edition 3; 64bit) を想定。
* インストールする Ruby は 2.6.4 である。
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
# wget https://cache.ruby-lang.org/pub/ruby/2.6/ruby-2.6.4.tar.gz
# tar zxvf ruby-2.6.4.tar.gz
```

### 3. ビルド＆インストール

ビルド＆インストールは以下のように行う。（よくある `.configure`, `make`, `make install`）

``` text
# cd ruby-2.6.4
# ./configure
# make -j$(grep '^processor' /proc/cpuinfo | wc -l)
# make install
```

### 4. インストールの確認

バージョンを表示させてみて、インストールできているか確認する。

``` text
# ruby -v
ruby 2.6.4p104 (2019-08-28 revision 67798) [x86_64-linux]
```

### 5. ドキュメントの非インストール設定

サーバ環境には RubyGems ライブラリのドキュメントは不要なので、 RubyGems ライブラリインストール時にドキュメントをインストールしないように設定する。

File: `~/.gemrc`

{% highlight bash %}
install: --no-document
update: --no-document
{% endhighlight %}

ちなみに、今ではもはや `--no-ri`, `--no-rdoc` というオプションは Deprecated（非推奨）。（`gem help install` で確認）

### 6. gem の最新化

今後のために、gem を最新に更新しておく。

``` text
# gem -v
3.0.3

# gem update --system

# gem -v
3.0.6
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

