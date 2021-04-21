---
layout   : single
title    : "nanoc - ブログ個別記事に Next/Previous リンク！"
published: true
date     : 2013-02-11 00:20:00 +0900
comments : true
categories:
- ブログ
tags:
- Ruby
- nanoc
---

[nanoc](http://nanoc.stoneship.org/ "nanoc") ブログをページネーション（記事を指定件数別にページ化）するには、公式サイトのドキュメント（[nanoc - Paginating articles](http://nanoc.ws/docs/guides/paginating-articles/ "nanoc - Paginating articles")）に記載さている通りの方法でできるようです。  
しかし、説明に「ページにオブジェクトを追加するたびに、あふれたオブジェクトを後ろのページにシフトさせる作業が発生するので推奨していない」というような記述があります。（他に方法があるのかも知れませんが未確認）

ですので、一覧ページのページネーションはとりあえず保留にし、個別の記事ページに「前ページ(Older)」・「次ページ(Newer)」のリンクを付けるようにしてみました。

<!--more-->

### 0. 前提条件

- Linux Mint 14 Nadia (64bit) での作業を想定。
- nanoc 3.4.3 を使用。
- Ruby 1.9.3-p385 を使用。
- nanoc 用ブログヘルパー（Blogging, Rendering, LinkTo, Tagging）のインクルード設定済みで、nanoc をブログとして利用できるように各種設定も済んでいる。
- テンプレート機能は ERB を使用。
- 前ページを１つ古い記事、次ページを１つ新しい記事とする。（逆の概念もあるかもしれないが）

### 1. ヘルパー作成

リンクを作成するヘルパーを作成する。  
`lib` ディレクトリ配下のファイルに作成する。（当方は `lib/helpers.rb` ファイルを作成しそこに記述した）

File: `lib/helpers.rb`

{% highlight ruby linenos %}
# Pager for each article page
# Previous(Olfer) article
def prev_link
  prv = sorted_articles.index(@item) + 1
  unless articles.size - 1 < prv
    link_to(
      '&laquo;[Older] ' + sorted_articles[prv][:title],
      sorted_articles[prv].reps[0],
      :class => "prev"
    )
  end
end

# Next(Newer) article
def next_link
  nxt = sorted_articles.index(@item) - 1
  unless nxt < 0
    link_to(
      sorted_articles[nxt][:title] + ' [Newer]&raquo;',
      sorted_articles[nxt].reps[0],
      :class => "next"
    )
  end
end
{% endhighlight %}

- [gist - Ruby script to generate pager for each article.](https://gist.github.com/4601648 "gist - Ruby script to generate pager for each article.")

### 2. テンプレート編集

テンプレートファイルを編集して、前ページ・次ページのリンクを貼る。  
以下は当方の例で、以下のような記述を各記事の先頭部分と末尾部分に追加している。（`class` 指定は CSS 適用のため）

File: `layouts/article.html`

{% highlight html linenos %}
<div class="pager">
  <%= prev_link %>
  <%= next_link %>
</div>
{% endhighlight %}

### 3. 確認

nanoc をコンパイル＆プレビューし、ページを確認してみる。  
以下は当方の例。

![NANOC_PAGER]({{site.baseurl}}/images/2013/02/11/NANOC_PAGER.png "NANOC_PAGER")

---

これで、各記事の直近・直後の記事への移動が便利になりました。

ちなみに、nanoc によるブログを Octopress による[メインのブログ](http://www.mk-mode.com/octopress/ "mk-mode BLOG")のクローンとして公開しています。

- [mk-mode BLOG (by nanoc)](http://www.mk-mode.com/nanoc/ "mk-mode BLOG (by nanoc)")

但し、[mk-mode BLOG (by Octopress)](http://www.mk-mode.com/octopress/ "mk-mode BLOG (by Octopress)")の記事を機械的に変換しているため、人知の及ばない部分もあるかと思います。ご了承下さい。

以上。

