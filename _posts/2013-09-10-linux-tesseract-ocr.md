---
layout   : single
title    : "Linux - Tesseract OCR で 文字認識！"
published: true
date     : 2013-09-10 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
- 画像
---

画像内の文字を認識したいことがあると思います。

今回は Linux で OCR を行なってみました。

OCR とは Optical Character Recognition の略で光学文字認識のことです。  
ちなみに、 OMR は Optical Mark Recognition(Reading) の略で光学式マーク認識（読取）のことです。

<!--more-->

OCR ソフトには、有償のもの、無償のもの、GUI ベースのもの、CUI ベースのもの等多数存在しますが、今回は Google が C++ で開発している Apache 2.0 ライセンスのあらゆるプラットフォームで動作可能な Tesseract OCR を使用してみました。

以下、作業記録です。

#### 0. 前提条件

- Linux Mint 14 (64bit) での作業・動作確認を想定。
- Tessarct OCR はパッケージを使用してインストールを行う。  
  （ソースをビルドしていインストールを行う方法もあります。）

#### 1. Tessarct OCR インストール

以下のようにして Tessarct OCR をインストールする。（Synaptic パッケージマネージャを使用してもよい）  
依存パッケージも同時にインストールされる。

``` bash 
$ sudo apt-get install tesseract-ocr
$ tesseract --version
tesseract 3.02
```

#### 2. 日本語言語ファイルインストール

Tessarct OCR をインストールしただけでは、日本語は認識できません。別途言語ファイルをインストール必要がある。  
以下のようにして日本語の言語ファイルをインストールする。

``` bash 
$ sudo apt-get install tesseract-ocr-jpn
```

#### 3. 画像準備

当然ながら、文字認識を行いたい画像を用意する。  
当方は以下のような PNG 画像を用意した。

![EINSTEIN]({{site.baseurl}}/images/2013/09/10/EINSTEIN.png "EINSTEIN")

#### 4. 文字認識

以下のよう書式で実行してみる。（オプション等についての説明は `--help` で確認可能）  
（認識した文字を出力するファイルは自動で ".txt" が付与されるので、拡張子は不要）

File: `【書式】`

{% highlight bash linenos %}
$ tesseract imagename outputbase [-l lang] [-psm pagesegmode] [configfile...]
{% endhighlight %}

次は、日本語指定なしの場合。

File: `【日本語指定なし】`

{% highlight bash linenos %}
$ tesseract EINSTEIN.png einstein_eng
{% endhighlight %}

![EINSTEIN_ENG]({{site.baseurl}}/images/2013/09/10/EINSTEIN_ENG.png "EINSTEIN_ENG")

次は、日本語指定ありの場合。

File: `【日本語指定あり】`

{% highlight bash linenos %}
$ tesseract EINSTEIN.png einstein_jpn -l jpn
{% endhighlight %}

![EINSTEIN_JPN]({{site.baseurl}}/images/2013/09/10/EINSTEIN_JPN.png "EINSTEIN_JPN")

言語指定しない場合は、英文の認識はパーフェクトである。  
日本語指定した場合は、英文の認識は全滅で、日本語も不完全である。  
**英文混じりの日本語はどのように対処したらよいだろう？**

また、フォントやサイズ、画像の品質にもよるが、画像サイズを変更しても必ずしも認識率が上がるという訳でもなかったし、画像をいくらか回転させると認識率が若干下がった。  
いずれにせよ、画像の質によるだろう。

#### 5. その他

1. `tesseract --help` には載っていないが、[公式サイト](http://code.google.com/p/tesseract-ocr/ "tesseract-ocr - An OCR Engine that was developed at HP Labs between 1985 and 1995... and now at Google. - Google Project Hosting")の "ReadMe" では、`hocr` を付加すると HTML ファイルが作成されると説明されている。
2. 画像内から読み取りたい文字が数字のみなら、configfile に `tessedit_char_whitelist 0123456789` のように記述して、オプションで configfile を指定する。そうすれば、数字を誤認識する場合の認識率が格段にアップする。
3. 縦書きの文章を認識させたいなら `-psm 5` のオプション指定をする。
4. 画像の品質によっては、Tesseract OCR で認識させる前に、ある程度画像処理（二値化、射影変換、ノイズ除去等）した方がよい場合もある。

#### 参考サイト

- [tesseract-ocr - An OCR Engine that was developed at HP Labs between 1985 and 1995... and now at Google. - Google Project Hosting](http://code.google.com/p/tesseract-ocr/ "tesseract-ocr - An OCR Engine that was developed at HP Labs between 1985 and 1995... and now at Google. - Google Project Hosting")
- [Tesseract ocr](http://www.slideshare.net/takmin/tesseract-ocr "Tesseract ocr")

---

品質の良い画像なら、英文は完璧かほぼ完璧に認識できそう。  
日本語は不完全ながら認識は可能で、ある程度（場合によって）は利用できそうだが、英文が混ざっていると英文が不完全どころか全滅になる。  
（オープン（フリー）ソフトだから、仕方のないことでしょうが）

いずれにせよ、目的に合わせて使い分けが必要であろう。

以上。

