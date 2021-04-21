---
layout   : single
title    : "LMDE2 - Ruby で形態素解析 MeCab を使う！"
published: true
date     : 2017-02-11 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- LMDE2
- Ruby
- 形態素解析
- MeCab
---

以前、 Linux Mint 上で Ruby を使って形態素解析 [MeCab](http://taku910.github.io/mecab/ "MeCab: Yet Another Part-of-Speech and Morphological Analyzer") をする方法を紹介しました。

* [Linux Mint - Ruby で形態素解析 MeCab を使う！]({{site.baseurl}}/2013/01/08/linux-mint-ruby-mecab/ "Linux mint - Ruby で形態素解析 MeCab を使う！")

今回は、 LMDE2 で [MeCab](http://taku910.github.io/mecab/ "MeCab: Yet Another Part-of-Speech and Morphological Analyzer"), さらには最近の語を網羅している辞書 [mecab-ipadic-NEologd](https://github.com/neologd/mecab-ipadic-neologd "neologd/mecab-ipadic-neologd: Neologism dictionary based on the language resources on the Web for mecab-ipadic") をインストールする方法についてです。

<!--more-->

### 0. 前提条件

* LMDE2(Linux Mint Debian Edition 2) での作業を想定。（Ubuntu, Debian でも同様）
* Ruby 2.3.3-p222 での作業を想定。
* RAM 容量が充分にあること。（最低：1.5GB, 推奨：5GB）

### 1. MeCab と辞書のインストール

MeCab と辞書(UTF-8)を Synaptic パッケージマネージャかコマンドでインストールする。  
`apt` でインストールするなら以下のようにする。

``` text
$ sudo apt install mecab libmecab-dev mecab-ipadic-utf8
$ mecab -v
mecab of 0.996
```

MeCab 0.996 がインストールできている。

さらに、 mecab-ipadic-NEologd のインストールには git, make, curl, xz-utils, file も必要なので、未インストールならインストールしておく。

### 2. mecab-ipadic-neologd のインストール

Git リポジトリのクローン。

``` text
$ git clone --depth 1 git@github.com:neologd/mecab-ipadic-neologd.git
```

インストール。（途中、インストールするかどうか問われたら `yes` で応答する）

``` text
$ cd mecab-ipadic-neologd
$ ./bin/install-mecab-ipadic-neologd -n
```

インストールディレクトリの確認。

``` text
$ echo `mecab-config --dicdir`"/mecab-ipadic-neologd"
/usr/lib/mecab/dic/mecab-ipadic-neologd
```

その他、コマンドラインオプションの確認は、

``` text
$ ./bin/install-mecab-ipadic-neologd -h
```

### 3. RubyGems ライブラリ natto のインストール

（以前（[Linux Mint - Ruby で形態素解析 MeCab を使う！]({{site.baseurl}}/2013/01/08/linux-mint-ruby-mecab/ "Linux mint - Ruby で形態素解析 MeCab を使う！")）は mecab-ruby を使用していたが、今回は natto）

``` text
$ sudo gem install natto
```

### 4. 辞書設定

デフォルトで使用する辞書を mecab-ipadic-neologd に変更する。

File: `/etc/mecabrc`

{% highlight text linenos %}
;dicdir = /var/lib/mecab/dic/debian               # <= コメントアウト
dicdir = /usr/lib/mecab/dic/mecab-ipadic-neologd  # <= 追加
{% endhighlight %}

### 5. テスト用スクリプトの作成

テスト用に以下のような簡単な Ruby スクリプトを作成する。

File: `test_mecab.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# coding: utf-8
require 'natto'

text = "オバマ大統領は演説で、安倍首相の真珠湾訪問を「和解の力を示すものだ」と述べ、謝意を表明した。"
natto = Natto::MeCab.new
puts natto.parse(text)
{% endhighlight %}

### 6. 動作確認

``` text
$ ./test_mecab.rb
オバマ大統領    名詞,固有名詞,一般,*,*,*,オバマ大統領,オバマダイトウリョウ,オバマダイトウリョー
は      助詞,係助詞,*,*,*,*,は,ハ,ワ
演説    名詞,サ変接続,*,*,*,*,演説,エンゼツ,エンゼツ
で      助詞,格助詞,一般,*,*,*,で,デ,デ
、      記号,読点,*,*,*,*,、,、,、
安倍首相        名詞,固有名詞,一般,*,*,*,安倍首相,アベシュショウ,アベシュショー
の      助詞,連体化,*,*,*,*,の,ノ,ノ
真珠湾  名詞,固有名詞,地域,一般,*,*,真珠湾,シンジュワン,シンジュワン
訪問    名詞,サ変接続,*,*,*,*,訪問,ホウモン,ホーモン
を      助詞,格助詞,一般,*,*,*,を,ヲ,ヲ
「      記号,括弧開,*,*,*,*,「,「,「
和解    名詞,サ変接続,*,*,*,*,和解,ワカイ,ワカイ
の      助詞,連体化,*,*,*,*,の,ノ,ノ
力      名詞,一般,*,*,*,*,力,チカラ,チカラ
を      助詞,格助詞,一般,*,*,*,を,ヲ,ヲ
示す    動詞,自立,*,*,五段・サ行,基本形,示す,シメス,シメス
もの    名詞,非自立,一般,*,*,*,もの,モノ,モノ
だ      助動詞,*,*,*,特殊・ダ,基本形,だ,ダ,ダ
」      記号,括弧閉,*,*,*,*,」,」,」
と      助詞,格助詞,引用,*,*,*,と,ト,ト
述べ    動詞,自立,*,*,一段,連用形,述べる,ノベ,ノベ
、      記号,読点,*,*,*,*,、,、,、
謝意    名詞,一般,*,*,*,*,謝意,シャイ,シャイ
を      助詞,格助詞,一般,*,*,*,を,ヲ,ヲ
表明    名詞,サ変接続,*,*,*,*,表明,ヒョウメイ,ヒョーメイ
し      動詞,自立,*,*,サ変・スル,連用形,する,シ,シ
た      助動詞,*,*,*,特殊・タ,基本形,た,タ,タ
。      記号,句点,*,*,*,*,。,。,。
EOS
```

しっかりと、「オバマ大統領」、「安倍首相」が固有名詞として扱われている。

参考までに、デフォルトの辞書(mecab-dictionry)を使用した場合は以下のとおり。

``` text
$ ./test_mecab.rb
オバマ  名詞,一般,*,*,*,*,*
大統領  名詞,一般,*,*,*,*,大統領,ダイトウリョウ,ダイトーリョー,,
は      助詞,係助詞,*,*,*,*,は,ハ,ワ,,
演説    名詞,サ変接続,*,*,*,*,演説,エンゼツ,エンゼツ,,
で      助詞,格助詞,一般,*,*,*,で,デ,デ,,
、      記号,読点,*,*,*,*,、,、,、,,
安倍    名詞,固有名詞,人名,姓,*,*,安倍,アベ,アベ,,
首相    名詞,一般,*,*,*,*,首相,シュショウ,シュショー,,
の      助詞,連体化,*,*,*,*,の,ノ,ノ,,
真珠湾  名詞,固有名詞,地域,一般,*,*,真珠湾,シンジュワン,シンジュワン,,
訪問    名詞,サ変接続,*,*,*,*,訪問,ホウモン,ホーモン,,
を      助詞,格助詞,一般,*,*,*,を,ヲ,ヲ,,
「      記号,括弧開,*,*,*,*,「,「,「,,
和解    名詞,サ変接続,*,*,*,*,和解,ワカイ,ワカイ,,
の      助詞,連体化,*,*,*,*,の,ノ,ノ,,
力      名詞,一般,*,*,*,*,力,チカラ,チカラ,,
を      助詞,格助詞,一般,*,*,*,を,ヲ,ヲ,,
示す    動詞,自立,*,*,五段・サ行,基本形,示す,シメス,シメス,しめす/示す,
もの    名詞,非自立,一般,*,*,*,もの,モノ,モノ,,
だ      助動詞,*,*,*,特殊・ダ,基本形,だ,ダ,ダ,,
」      記号,括弧閉,*,*,*,*,」,」,」,,
と      助詞,格助詞,引用,*,*,*,と,ト,ト,,
述べ    動詞,自立,*,*,一段,連用形,述べる,ノベ,ノベ,のべ/述べ/陳べ,
、      記号,読点,*,*,*,*,、,、,、,,
謝意    名詞,一般,*,*,*,*,謝意,シャイ,シャイ,,
を      助詞,格助詞,一般,*,*,*,を,ヲ,ヲ,,
表明    名詞,サ変接続,*,*,*,*,表明,ヒョウメイ,ヒョーメイ,,
し      動詞,自立,*,*,サ変・スル,連用形,する,シ,シ,,
た      助動詞,*,*,*,特殊・タ,基本形,た,タ,タ,,
。      記号,句点,*,*,*,*,。,。,。,,
EOS
```

さらに、IPA辞書(ipadic-utf8)を使用した場合の結果は、以下のとおり。

``` text
$ ./test_mecab.rb
オバマ  名詞,一般,*,*,*,*,*
大統領  名詞,一般,*,*,*,*,大統領,ダイトウリョウ,ダイトーリョー
は      助詞,係助詞,*,*,*,*,は,ハ,ワ
演説    名詞,サ変接続,*,*,*,*,演説,エンゼツ,エンゼツ
で      助詞,格助詞,一般,*,*,*,で,デ,デ
、      記号,読点,*,*,*,*,、,、,、
安倍    名詞,固有名詞,人名,姓,*,*,安倍,アベ,アベ
首相    名詞,一般,*,*,*,*,首相,シュショウ,シュショー
の      助詞,連体化,*,*,*,*,の,ノ,ノ
真珠湾  名詞,固有名詞,地域,一般,*,*,真珠湾,シンジュワン,シンジュワン
訪問    名詞,サ変接続,*,*,*,*,訪問,ホウモン,ホーモン
を      助詞,格助詞,一般,*,*,*,を,ヲ,ヲ
「      記号,括弧開,*,*,*,*,「,「,「
和解    名詞,サ変接続,*,*,*,*,和解,ワカイ,ワカイ
の      助詞,連体化,*,*,*,*,の,ノ,ノ
力      名詞,一般,*,*,*,*,力,チカラ,チカラ
を      助詞,格助詞,一般,*,*,*,を,ヲ,ヲ
示す    動詞,自立,*,*,五段・サ行,基本形,示す,シメス,シメス
もの    名詞,非自立,一般,*,*,*,もの,モノ,モノ
だ      助動詞,*,*,*,特殊・ダ,基本形,だ,ダ,ダ
」      記号,括弧閉,*,*,*,*,」,」,」
と      助詞,格助詞,引用,*,*,*,と,ト,ト
述べ    動詞,自立,*,*,一段,連用形,述べる,ノベ,ノベ
、      記号,読点,*,*,*,*,、,、,、
謝意    名詞,一般,*,*,*,*,謝意,シャイ,シャイ
を      助詞,格助詞,一般,*,*,*,を,ヲ,ヲ
表明    名詞,サ変接続,*,*,*,*,表明,ヒョウメイ,ヒョーメイ
し      動詞,自立,*,*,サ変・スル,連用形,する,シ,シ
た      助動詞,*,*,*,特殊・タ,基本形,た,タ,タ
。      記号,句点,*,*,*,*,。,。,。
EOS
```

ちなみに、出力フォーマットは以下の通り。

表層形\t品詞,品詞細分類1,品詞細分類2,品詞細分類3,
活用形,活用型,原形,読み,発音,コスト

※コストとは出現頻度のことです。

### 7. 参考サイト

* [MeCab: Yet Another Part-of-Speech and Morphological Analyzer](http://taku910.github.io/mecab/ "MeCab: Yet Another Part-of-Speech and Morphological Analyzer")
* [mecab-ipadic-NEologd](https://github.com/neologd/mecab-ipadic-neologd "neologd/mecab-ipadic-neologd: Neologism dictionary based on the language resources on the Web for mecab-ipadic")

---

ipadic-utf8 も優秀な辞書ですが、若干古いため最近の辞書を実装してみた次第です。

以上。

