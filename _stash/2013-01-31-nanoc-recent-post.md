---
layout   : single
title    : "nanoc - 最近の記事一覧を表示！"
published: true
date     : 2013-01-31 00:20:00 +0900
comments : true
categories:
- ブログ
tags:
- Ruby
- nanoc
---

[nanoc](http://nanoc.stoneship.org/ "nanoc") でブログ運用する場合に、ちょっとした設定を行うことでサイドバー等に最近の記事の一覧を表示させることが可能です。

以下は、当方の作業の記録です。

<!--more-->

### 0. 前提条件

- Linux Mint 14 Nadia (64bit) での作業を想定。
- nanoc 3.4.3 を使用。
- Ruby 1.9.3-p362 を使用。
- nanoc 用ブログヘルパー（Blogging, Rendering, LinkTo）のインクルード設定済み。
- テンプレート機能は ERB を使用。

### 1. 部分テンプレート作成

サイドバー表示用の部分テンプレートを作成する。

File: `layouts/_article_list.html`

{% highlight html linenos %}
<ul>
  <% sorted_articles[0, 10].each do |article| %>
  <li>
    <%= link_to(article[:title], article.path) %><br />
    <span class="meta">[ <%= Time.parse(article[:created_at]).strftime("%Y-%m-%d %H:%M") %> ]</span>
  </li>
  <% end %>
</ul>
{% endhighlight %}

Blogging Helper の `sorted_articles` により、記事ファイル内のメタデータ `kind` の設定値が `article` のものだけを `created_at` の降順にソートしてくれる。

### 2. サイドバー埋め込み

サイドバーの適切な位置に前述のテンプレートを埋め込む。（以下は当方の例）

File: `layouts/_sidebar.html`

{% highlight html linenos %}
<h2>Recent Posts</h2>
<%= render('_article_list') %>
{% endhighlight %}

### 3. コンパイル

いつものようにコンパイルする。

File: `Rules`

{% highlight ruby linenos %}
$ nanoc compile
{% endhighlight %}

### 4. 確認

`nanoc view` 実行後、ブラウザで確認してみる。  
今回の例の場合、最大10件の記事タイトル・投稿日時の一覧表示されるはずである。  
以下は当方の例で、当記事執筆時点（調整中の段階）のもの。

![NANOC_RECENT_POST]({{site.baseurl}}/images/2013/01/31/NANOC_RECENT_POST.png "NANOC_RECENT_POST")

### 5. 参考サイト

- [nanoc - yet.org](http://www.yet.org/2012/11/nanoc/ "nanoc - yet.org")
- [Design Recipe 別館 Blog - Nanoc のカスタマイズ - 最近の記事一覧の表示](http://blog.designrecipe.jp/2010/07/25/nanoc-customize-recent-articles/ "Design Recipe 別館 Blog - Nanoc のカスタマイズ - 最近の記事一覧の表示")

---

これで、最近の記事の一覧が表示されるようになりました。

ちなみに、nanoc によるブログを Octopress による[メインのブログ](http://www.mk-mode.com/octopress/ "mk-mode BLOG")のクローンとして公開しています。

- [mk-mode BLOG (by nanoc)](http://www.mk-mode.com/nanoc/ "mk-mode BLOG (by nanoc)")

但し、[mk-mode BLOG (by Octopress)](http://www.mk-mode.com/octopress/ "mk-mode BLOG (by Octopress)")の記事を機械的に変換しているため、人知の及ばない部分もあるかと思います。ご了承下さい。

以上。

