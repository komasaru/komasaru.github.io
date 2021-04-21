---
layout   : single
title    : "nanoc - コンパイル時のルーティング設定！"
published: true
date     : 2013-01-30 00:20:00 +0900
comments : true
categories:
- ブログ
tags:
- Ruby
- nanoc
---

[nanoc](http://nanoc.stoneship.org/ "nanoc") でブログ運用する場合、コンパイルした記事を月別や日別にディレクトリ分けしたいケースがある思います。

コンパイル時のルーティング設定で実現可能のようです。

<!--more-->

### 0. 前提条件

- Linux Mint 14 Nadia (64bit) での作業を想定。
- nanoc 3.4.3 を使用。
- Ruby 1.9.3-p362 を使用。
- 記事ファイルは nanoc ルート配下の `content/content/articles/` ディレクトリに置いている。
- 記事ファイルの名称は `yyyy-mm-dd-test-post.md` のような「年月日＋記事タイトル＋拡張子」としている。
- 出力する際のディレクトリ構成は `output/yyyy/mm/dd/test-post/index.html` ような形とする。

### 1. Rules ファイル編集

nanoc ルートにある `Rules` ファイルに以下のようなルーティング設定を追加する。  
（`route '*' do` の行より先に記述する）

File: `Rules`

{% highlight ruby linenos %}
route '/articles/*/' do
  y,m,d,slug = /([0-9]+)\-([0-9]+)\-([0-9]+)\-([^\/]+)/
    .match(item.identifier).captures

  "/#{y}/#{m}/#{d}/#{slug}/index.html"
end
{% endhighlight %}

### 2. コンパイル

いつものようにコンパイルする。

File: `Rules`

{% highlight ruby linenos %}
$ nanoc compile
{% endhighlight %}

### 3. 確認

出力ディレクトリ（デフォルトなら `output`）に指定のディレクトリ構成で HTML ファイルが作成されているのを確認する。  
今回の場合は、`output/yyyy/mm/dd/test-post/index.html` というディレクトリ構成になっているはず。

### 4. 参考サイト

- [nanoc - yet.org](http://www.yet.org/2012/11/nanoc/ "nanoc - yet.org")

---

これで、好みのディレクトリ構成で HTML ファイル出力が可能になりました。

ちなみに、nanoc によるブログを Octopress による[メインのブログ](http://www.mk-mode.com/octopress/ "mk-mode BLOG")のクローンとして公開しています。

- [mk-mode BLOG (by nanoc)](http://www.mk-mode.com/nanoc/ "mk-mode BLOG (by nanoc)")

但し、[mk-mode BLOG (by Octopress)](http://www.mk-mode.com/octopress/ "mk-mode BLOG (by Octopress)")の記事を機械的に変換しているため、人知の及ばない部分もあるかと思います。ご了承下さい。

以上。

