---
layout   : single
title    : "Python - MeCab で形態素解析！"
published: true
date     : 2018-10-17 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Linux
- Python
- 形態素解析
- MeCab
---

以前、 LMDE 2 上で Ruby を使って形態素解析 [MeCab](http://taku910.github.io/mecab/ "MeCab: Yet Another Part-of-Speech and Morphological Analyzer") をする方法を紹介しました。

* [LMDE2 - Ruby で形態素解析 MeCab を使う！]({{site.baseurl}}/2017/02/11/lmde2-ruby-mecab-installation "LMDE2 - Ruby で形態素解析 MeCab を使う！")

今回は Python で形態素解析 [MeCab](http://taku910.github.io/mecab/ "MeCab: Yet Another Part-of-Speech and Morphological Analyzer") を使用してみましたので、その記録です。

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。（Ubuntu, Debian でも同様）
* ソースをビルドしてインストールした Python 3.7.0 での作業を想定。
* RAM 容量が充分にあること。（最低：1.5GB, 推奨：5GB）
* 辞書には、最近の語を網羅している [mecab-ipadic-NEologd](https://github.com/neologd/mecab-ipadic-neologd "neologd/mecab-ipadic-neologd: Neologism dictionary based on the language resources on the Web for mecab-ipadic") を使用する。
* **当方、 Python は複数のバージョンの共存環境であり、 `python3.7`, `pip3.7` で 3.7 系を使用するようにしている。（適宜、置き換えて考えること）**

### 1. MeCab と辞書のインストール

MeCab と辞書(UTF-8)を Synaptic パッケージマネージャか `apt-get` 等でインストールする。  
`apt-get` でインストールするなら以下のようにする。

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

インストールディレクトリの確認。（後述のテスト用 Python スクリプト内に設定するもの）

``` text
$ echo `mecab-config --dicdir`"/mecab-ipadic-neologd"
/usr/lib/x86_64-linux-gnu/mecab/dic/mecab-ipadic-neologd
```

その他、コマンドラインオプションの確認は、

``` text
$ ./bin/install-mecab-ipadic-neologd -h
```

### 3. MeCab 単体での動作確認

``` text
$ mecab
太郎はこの本を二郎を見た女性に渡した。
太郎    名詞,固有名詞,人名,名,*,*,太郎,タロウ,タロー,,
は      助詞,係助詞,*,*,*,*,は,ハ,ワ,,
この    連体詞,*,*,*,*,*,この,コノ,コノ,,
本      名詞,一般,*,*,*,*,本,ホン,ホン,,
を      助詞,格助詞,一般,*,*,*,を,ヲ,ヲ,,
二      名詞,数,*,*,*,*,二,ニ,ニ,,
郎      名詞,一般,*,*,*,*,郎,ロウ,ロー,,
を      助詞,格助詞,一般,*,*,*,を,ヲ,ヲ,,
見      動詞,自立,*,*,一段,連用形,見る,ミ,ミ,み/見,
た      助動詞,*,*,*,特殊・タ,基本形,た,タ,タ,,
女性    名詞,一般,*,*,*,*,女性,ジョセイ,ジョセイ,,
に      助詞,格助詞,一般,*,*,*,に,ニ,ニ,,
渡し    動詞,自立,*,*,五段・サ行,連用形,渡す,ワタシ,ワタシ,わたし/渡し,
た      助動詞,*,*,*,特殊・タ,基本形,た,タ,タ,,
。      記号,句点,*,*,*,*,。,。,。,,
EOS
```

### 4. mecab-python のインストール

``` text
$ sudo pip3.7 install mecab-python3
```

### 5. テスト用 Python スクリプトの作成

File: `test_mecab.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.7
"""
Test of MeCab library
"""
import sys
import traceback
import MeCab


class TestMecab:
    DIR_DIC  = "/usr/lib/x86_64-linux-gnu/mecab/dic/mecab-ipadic-neologd"
    SENTENCE = "太郎はこの本を二郎を見た女性に渡した。"

    def exec(self):
        try:
            t = MeCab.Tagger("-d " + self.DIR_DIC)
            #print(t.parse(self.SENTENCE))
            for c in t.parse(self.SENTENCE).splitlines()[:-1]:
                surface, feature = c.split('\t')
                print("{}\t{}".format(surface, feature))
        except Exception as e:
            raise

if __name__ == '__main__':
    try:
        obj = TestMecab()
        obj.exec()
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)
{% endhighlight %}

* [Gist - Python script to test of MeCab.](https://gist.github.com/komasaru/c19d10d4ba25377cc51e09fb5ac271bb "Gist - Python script to test of MeCab.")

### 6. テスト

作成した Python スクリプトを実行して動作を確認してみる。

まず、実行権限を付与。

``` text
$ chmod +x test_mecab.py
```

そして、実行。

``` text
$ ./test_mecab.py
太郎    名詞,固有名詞,人名,名,*,*,太郎,タロウ,タロー
は      助詞,係助詞,*,*,*,*,は,ハ,ワ
この    連体詞,*,*,*,*,*,この,コノ,コノ
本      名詞,一般,*,*,*,*,本,ホン,ホン
を      助詞,格助詞,一般,*,*,*,を,ヲ,ヲ
二      名詞,数,*,*,*,*,二,ニ,ニ
郎      名詞,一般,*,*,*,*,郎,ロウ,ロー
を      助詞,格助詞,一般,*,*,*,を,ヲ,ヲ
見      動詞,自立,*,*,一段,連用形,見る,ミ,ミ
た      助動詞,*,*,*,特殊・タ,基本形,た,タ,タ
女性    名詞,一般,*,*,*,*,女性,ジョセイ,ジョセイ
に      助詞,格助詞,一般,*,*,*,に,ニ,ニ
渡し    動詞,自立,*,*,五段・サ行,連用形,渡す,ワタシ,ワタシ
た      助動詞,*,*,*,特殊・タ,基本形,た,タ,タ
。      記号,句点,*,*,*,*,。,。,。
```

問題ないようだ。

ちなみに、出力フォーマットは以下の通り。

``` text
表層形\t品詞,品詞細分類1,品詞細分類2,品詞細分類3,活用形,活用型,原形,読み,発音
```

※コスト（出現頻度）の取得方法は不明。（現時点）

### 7. 参考サイト

- [MeCab: Yet Another Part-of-Speech and Morphological Analyzer](https://taku910.github.io/mecab/ "MeCab: Yet Another Part-of-Speech and Morphological Analyzer")

---

以上。

