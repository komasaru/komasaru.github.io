---
layout   : single
title    : "nanoc - CSS, JavaScript を Minify！"
published: true
date     : 2013-02-10 00:20:00 +0900
comments : true
categories:
- ブログ
tags:
- Ruby
- nanoc
- CSS
- JavaScript
---

[nanoc](http://nanoc.stoneship.org/ "nanoc") は、デフォルトではコンパイルしても CSS や JavaScript ファイルは Minify されません（改行・余分な半角スペースが残ったまま）。

HTTP リクエス回数を減らしアクセススピードを上げるためには、Minify した方がよいです。  
それほど大きなサイトでなければ、Minify したからと言っても高速化は体感できないかも知れません。  
しかし、それでも HTTP リクエスト回数のことを考えれば、 Minify しておいた方がよいように思います。

<!--more-->

### 0. 前提条件

- Linux Mint 14 Nadia (64bit) での作業を想定。
- nanoc 3.4.3 を使用。
- Ruby 1.9.3-p385 を使用。
- nanoc 用ブログヘルパー（Blogging, Rendering, LinkTo, Tagging）のインクルード設定済みで、nanoc をブログとして利用できるように各種設定も済んでいる。
- JavaScript ファイルは `assets/javascripts/` というディレクトリに配置している。
- CSS ファイルは `assets/stylesheets/` というディレクトリに配置している。
- JDK(Java Development Kit) 導入済み。  
  （使用するRubyGems パッケージが Java ライブラリを使用するので、おそらく必要（当方は元々インストール済みだった））

### 1. RubyGems パッケージインストール

Java ライブラリによる CSS, JavaScript を Minify する YUI Compressor を実装した RubyGems パッケージ `yuicompressor` をインストールする。  
（YUI Compressor には数種類あるが nanoc で使用するのは `yuicompressor` なので要注意）

``` bash 
$ sudo gem install yuicompressor
```

### 2. Rules 編集

nanoc コンパイル時に `yui-compressor` フィルターが適用されるよう `Rules` ファイルを編集する。  
以下は当方の例で、全ての JavaScript, CSS ファイルに適用している。

File: `Rules`

{% highlight ruby linenos %}
compile '/assets/javascripts/*/' do
  filter :yui_compressor, :type => :js
end

compile '/assets/stylesheets/*/' do
  filter :yui_compressor, :type => :css
end
{% endhighlight %}

### 3. 確認

nanoc をコンパイルしてみて、コンパイル後の CSS, JavaScript ファイルの内容を確認してみる。  
改行や余分な半角スペースが除去され１行にまとめられているはず。  
以下は当方の CSS の例。

【コンパイル前】

![NANOC_MINIFY_1]({{site.baseurl}}/images/2013/02/10/NANOC_MINIFY_1.png "NANOC_MINIFY_1")

【コンパイル後】

![NANOC_MINIFY_2]({{site.baseurl}}/images/2013/02/10/NANOC_MINIFY_2.png "NANOC_MINIFY_1")

---

これで、CSS, JavaScript ファイルが Minify されました。

コンパイル前に別途 Minify ツールを使用して Minify しておくという方法もあります。  
しかし、コンパイルのたびにツールを使用するのも面倒ですし、せっかくフィルタが使用できるので、コンパイル時に処理してみた次第です。

ちなみに、nanoc によるブログを Octopress による[メインのブログ](http://www.mk-mode.com/octopress/ "mk-mode BLOG")のクローンとして公開しています。

- [mk-mode BLOG (by nanoc)](http://www.mk-mode.com/nanoc/ "mk-mode BLOG (by nanoc)")

但し、[mk-mode BLOG (by Octopress)](http://www.mk-mode.com/octopress/ "mk-mode BLOG (by Octopress)")の記事を機械的に変換しているため、人知の及ばない部分もあるかと思います。ご了承下さい。

以上。

