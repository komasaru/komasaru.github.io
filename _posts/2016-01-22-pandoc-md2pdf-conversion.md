---
layout   : single
title    : "Pandoc で Markdown 文書を PDF に変換！"
published: true
date     : 2016-01-22 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- TeX
- PDF
---

Pandoc（あるマークアップ形式で書かれた文書を別の形式へ変換するためのコマンドラインツール）を使用して Markdown 文書を PDF に変換する方法についての記録です。

<!--more-->

### 0. 前提条件

* Linux Mint 17.2(64bit) での作業を想定。
* 組版処理ソフト$$\LaTeX$$が必要なので、$$\TeX Live$$がインストール済みであること。（以下を参照）
  - [Linux Mint - TeX Live 2015 インストール！]({{site.baseurl}}/2016/01/18/texlive-installation-on-linux-mint/ "Linux Mint - TeX Live 2015 インストール！")
  - [TeX Live - TeX Wiki](https://oku.edu.mie-u.ac.jp/~okumura/texwiki/?TeX%20Live#w628bee6 "TeX Live - TeX Wiki")
* Apt パッケージ版をインストールする。
* 今回は使用しないが、最新版をインストールしたければ Cabal（Haskell ライブラリやプログラムをビルド・パッケージングするシステム）を使用してソースからインストールする。（但し、パッケージ依存性の問題が発生しやすいとされているため、利用には注意）
* Pandoc では様々な変換が可能だが、今回は Markdown から PDF への変換を行う。

### 1. Pandoc のインストール

これだけ。

``` text
$ sudo apt-get install pandoc
```

ちなみに、 RedHat 系ディストリビューションなら `yum install pandoc` でインストールできる。（但し、 EPEL リポジトリからインストールするので導入済みであること）

### 2. Pandoc インストールの確認

``` text
$ pandoc --version
pandoc 1.12.2.1
Compiled with texmath 0.6.5.2, highlighting-kate 0.5.5.1.
Syntax highlighting is supported for the following languages:
    actionscript, ada, apache, asn1, asp, awk, bash, bibtex, boo, c, changelog,
    clojure, cmake, coffee, coldfusion, commonlisp, cpp, cs, css, curry, d,
    diff, djangotemplate, doxygen, doxygenlua, dtd, eiffel, email, erlang,
    fortran, fsharp, gnuassembler, go, haskell, haxe, html, ini, java, javadoc,
    javascript, json, jsp, julia, latex, lex, literatecurry, literatehaskell,
    lua, makefile, mandoc, markdown, matlab, maxima, metafont, mips, modelines,
    modula2, modula3, monobasic, nasm, noweb, objectivec, objectivecpp, ocaml,
    octave, pascal, perl, php, pike, postscript, prolog, python, r,
    relaxngcompact, rhtml, roff, ruby, rust, scala, scheme, sci, sed, sgml, sql,
    sqlmysql, sqlpostgresql, tcl, texinfo, verilog, vhdl, xml, xorg, xslt, xul,
    yacc, yaml
Default user data directory: /home/masaru/.pandoc
Copyright (C) 2006-2013 John MacFarlane
Web:  http://johnmacfarlane.net/pandoc
This is free software; see the source for copying conditions.  There is no
warranty, not even for merchantability or fitness for a particular purpose.
```

### 3. テスト用 Markdown 文書の作成

File: `pandoc_test.md`

{% highlight text linenos %}
Pandoc 変換テスト
=================

はじめに
--------

### はじめにー１

これは `Pandoc` の変換テストです。これは `Pandoc` の変換テストです。

### はじめにー２

これは `Pandoc` の変換テストです。これは `Pandoc` の変換テストです。

概要
----

#### 概要ー１

Markdown 文書を PDF に変換します。Markdown 文書を PDF に変換します。

#### 概要ー２

Markdown 文書を PDF に変換します。Markdown 文書を PDF に変換します。

参考
----

* [Pandoc - About pandoc](http://pandoc.org/ "Pandoc - About pandoc")
* [Pandoc ユーザーズガイド 日本語版 - Japanese Pandoc User's Association](http://sky-y.github.io/site-pandoc-jp/users-guide/ "Pandoc ユーザーズガイド 日本語版 - Japanese Pandoc User's Association")

｀｀｀
class Test
  def initialize
    @name = "Pandoc"
  end

  def hello
    puts "Hello #{@name}."
  end
end

a = Test.new
a.hello
｀｀｀
{% endhighlight %}

（上記コード内の最後の `｀｀｀` は、実際は半角（1バイト）文字）

### 4. Markdown から PDF への変換

``` text
$ pandoc pandoc_test.md -V documentclass=ltjarticle --latex-engine=lualatex -o pandoc_test.pdf
```

* `-V documentclass=ltjarticle` は、日本語フォントを使用するためのオプション。  
  （$$\LaTeX$$文書の `documentclass` を `ltjarticle` に設定するオプション）
* `--latex-engine=lualatex` は、$$\LaTeX$$エンジンを `lualatex`（日本語を扱う場合の推奨値）に設定するオプション。  
  （指定しない場合は、デフォルトの `pdflatex` となる）
* `-o pandoc_test.pdf` は、出力ファイルを指定するオプション。  
  （指定しない場合は、標準出力に HTML 出力される）
* その他、各種オプションあり。
  - A4 用紙に設定したければ `-V geometry:a4paper` オプションを指定する。
  - 余白を 2cm に設定したければ `-V geometry:margin=2cm` オプションを指定する。

（想像していたより変換に時間がかかる）

### 5. PDF の確認

作成された PDF 文書を確認してみる。（以下は、公開の都合上 PNG 画像としてキャプチャしたもの）

![PANDOC_TEST]({{site.baseurl}}/images/2016/01/22/PANDOC_TEST.png "PANDOC_TEST")

### 6. 参考サイト

* [Pandoc - About pandoc](http://pandoc.org/ "Pandoc - About pandoc")
* [Pandoc ユーザーズガイド 日本語版 - Japanese Pandoc User's Association](http://sky-y.github.io/site-pandoc-jp/users-guide/ "Pandoc ユーザーズガイド 日本語版 - Japanese Pandoc User's Association")

---

普段 Markdown でテキストを保存することが多いので、何かと重宝しそうです。

以上。

