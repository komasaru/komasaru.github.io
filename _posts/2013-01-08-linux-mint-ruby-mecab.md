---
layout   : single
title    : "Linux Mint - Ruby で形態素解析 MeCab を使う！"
published: true
date     : 2013-01-08 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- LinuxMint
- Ruby
- 形態素解析
- MeCab
---

以前、Cygwin 上で Ruby を使って形態素解析 [MeCab](http://taku910.github.io/mecab/ "MeCab: Yet Another Part-of-Speech and Morphological Analyzer") をする方法を紹介しました。

- [* Cygwin - Ruby で形態素解析 MeCab を使う！]({{site.baseurl}}/2012/03/11/11002004/ "* Cygwin - Ruby で形態素解析 MeCab を使う！")

今回は、Linux Mint にソースをビルドしてインストールした Ruby で形態素解析 [MeCab](http://taku910.github.io/mecab/ "MeCab: Yet Another Part-of-Speech and Morphological Analyzer") を使用する方法についてです。  
以前の Cygwin での方法と若干異なるので記録しておきます。

<!--more-->

### 0. 前提条件

- Linux Mint 13 Maya (64bit) での作業を想定。（Ubuntu, Debian でも同様）
- Ruby はソースをビルドしてインストールした 1.9.3-p362 を想定。

### 1. MeCab と辞書のインストール

MeCab と辞書(UTF-8)を Synaptic パッケージマネージャか `apt-get` 等でインストールする。  
`apt-get` でインストールするなら以下のようにする。

``` bash 
$ sudo apt-get install mecab mecab-ipadic-utf8
$ mecab -v
mecab of 0.98
```

MeCab 0.98 がインストールできている。

### 2. libmecab-dev インストール

apt 管理下の Ruby でない場合、つまり、当方のようにソースをビルドしてインストールした Ruby や rvm, rbenv でインストールした Ruby の場合は、後にインストールする `mecab-ruby` のビルドで `libmecab-dev` が必要である。  
Synaptic パッケージマネージャか `apt-get` 等でインストールする。
`apt-get` でインストールするなら以下のようにする。

``` bash 
$ sudo apt-get install libmecab-dev
```

### 3. mecab-ruby インストール

`mecab-ruby` のアーカイブをダウンロード後をビルド＆インストールする。  
当記事執筆時点では `mecab-ruby 0.994` が最新だが、システムにインストールされている MeCab とバージョンが同じか近いものをインストールした方がよいようなので、`mecab-ruby 0.98` をインストールした。

``` bash 
$ cd /usr/local/src
$ wget http://mecab.googlecode.com/files/mecab-ruby-0.98.tar.gz
$ tar zxvf mecab-ruby-0.98.tar.gz
$ cd mecab-ruby-0.98
$ gem build mecab-ruby.gemspec
  Successfully built RubyGem
  Name: mecab-ruby
  Version: 0.97
  File: mecab-ruby-0.97.gem
$ sudo gem install mecab-ruby-0.97.gem
Building native extensions.  This could take a while...
Successfully installed mecab-ruby-0.97
1 gem installed
Installing ri documentation for mecab-ruby-0.97...
Installing RDoc documentation for mecab-ruby-0.97...
$ gem list | grep mecab-ruby
mecab-ruby (0.97)
```

> 【2016-12-29 追記】  
>  現在、 mecab-ruby-x.xx.tar.gz 等のダウンロードは [こちら](https://drive.google.com/open?id=0B4y35FiV1wh7fjQ5SkJETEJEYzlqcUY4WUlpZmR4dDlJMWI5ZUlXN2xZN2s2b0pqT3hMbTQ&authuser=1 "MeCab download - Google ドライブ") から行うようになっている。
> 【追記ここまで】

### 4. テスト用スクリプト作成

テスト用に以下のような Ruby スクリプトを作成する。

File: `test_mecab.rb`

{% highlight ruby linenos %}
# -*- encoding: utf-8 -*-
require 'MeCab'
sentence = "太郎はこの本を二郎を見た女性に渡した。"

begin
  c = MeCab::Tagger.new
  n = c.parseToNode(sentence)
  while n do
    print n.surface,  "\t", n.feature, "\t", n.cost, "\n"
    n = n.next
  end
  print "EOS\n";
rescue
   print "RuntimeError: ", $!, "\n";
end
{% endhighlight %}

- [Ruby script to test of mecab. - gist](https://gist.github.com/4411250 "Ruby script to test of mecab.")

### 5. テスト

作成した Ruby スクリプトを実行して動作を確認してみる。

``` bash 
$ ruby test_mecab.rb
	BOS/EOS,*,*,*,*,*,*,*,*	0
太郎	名詞,固有名詞,人名,名,*,*,太郎,タロウ,タロー	8614
は	助詞,係助詞,*,*,*,*,は,ハ,ワ	9699
この	連体詞,*,*,*,*,*,この,コノ,コノ	9755
本	名詞,一般,*,*,*,*,本,ホン,ホン	14548
を	助詞,格助詞,一般,*,*,*,を,ヲ,ヲ	13738
二	名詞,数,*,*,*,*,二,ニ,ニ	16665
郎	名詞,一般,*,*,*,*,郎,ロウ,ロー	21808
を	助詞,格助詞,一般,*,*,*,を,ヲ,ヲ	20998
見	動詞,自立,*,*,一段,連用形,見る,ミ,ミ	25194
た	助動詞,*,*,*,特殊・タ,基本形,た,タ,タ	22795
女性	名詞,一般,*,*,*,*,女性,ジョセイ,ジョセイ	25091
に	助詞,格助詞,一般,*,*,*,に,ニ,ニ	24938
渡し	動詞,自立,*,*,五段・サ行,連用形,渡す,ワタシ,ワタシ	28035
た	助動詞,*,*,*,特殊・タ,基本形,た,タ,タ	27158
。	記号,句点,*,*,*,*,。,。,。	23724
	BOS/EOS,*,*,*,*,*,*,*,*	22188
EOS
```

問題ないようだ。

ちなみに、出力フォーマットは以下の通り。

表層形\t品詞,品詞細分類1,品詞細分類2,品詞細分類3,
活用形,活用型,原形,読み,発音,コスト

※コストとは出現頻度のことです。

### 6. 参考サイト

- [MeCab: Yet Another Part-of-Speech and Morphological Analyzer](http://taku910.github.io/mecab/ "MeCab: Yet Another Part-of-Speech and Morphological Analyzer")

---

これで、Linux Mint にインストールしている Ruby でも形態素解析ができるようになりました。

以上。

