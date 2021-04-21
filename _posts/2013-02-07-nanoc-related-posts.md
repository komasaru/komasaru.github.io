---
layout   : single
title    : "nanoc - 関連記事一覧作成！"
published: true
date     : 2013-02-07 00:20:00 +0900
comments : true
categories:
- ブログ
tags:
- Ruby
- nanoc
---

[nanoc](http://nanoc.stoneship.org/ "nanoc") ブログで、それぞれの記事に関連する記事の一覧を表示させる方法についてです。

関連記事を抽出方法には色々な考え方がありますが、今回は単純に記事に付けられているタグを元に関連記事を作成します。

<!--more-->

### 0. 前提条件

- Linux Mint 14 Nadia (64bit) での作業を想定。
- nanoc 3.4.3 を使用。
- Ruby 1.9.3-p362 を使用。
- nanoc 用ブログヘルパー（Blogging, Rendering, LinkTo, Tagging）のインクルード設定済みで、nanoc をブログとして利用できるように各種設定も済んでいる。
- テンプレート機能は ERB を使用。
- 関連記事は各記事に付けられている `tags` の情報を元に作成する。
- 各記事の `created_at` の書式を `%Y/%m/%d %H:%M:%S` としている。（日時判定に使用するので）

### 1. ヘルパー作成

関連記事一覧を作成するヘルパーを作成する。  
`lib` ディレクトリ配下のファイルに以下のメソッドを追加する。  
（`lib/default.rb` でもよいし、別のファイルでもよい。当方は `lib/helpers.rb` を作成している）

File: `lib/helpers.rb`

{% highlight ruby linenos %}
require 'time'

# To generate related articles
def related_articles
  articles = []
  tm = DateTime.strptime(@item[:created_at], "%Y/%m/%d %H:%M:%S")
  if @item[:tags] != nil
    @item[:tags].each do |tag|
      @items.each do |item|
        if item[:kind] == "article" &&
           DateTime.strptime(item[:created_at], "%Y/%m/%d %H:%M:%S") < tm
          if item[:tags] != nil && item[:tags].include?(tag)
            articles << item unless articles.include?(item)
          end
        end
      end
    end

    # Sort by created_at
    articles.sort! {|a, b| b[:created_at] <=> a[:created_at]}
  end
  articles
end
{% endhighlight %}

何をしているのかというと、過去の記事から同じタグを使用している記事を抽出し、最後に作成日時降順にソートしている。

- [gist - Ruby script to generate a list of related articles.](https://gist.github.com/4578640 "gist - Ruby script to generate a list of related articles.")

### 2. テンプレート作成

記事一覧表示用のテンプレートを作成する。  
以下は当方の例で、作成日時＋記事タイトルリンクを直近５件分表示させる。

File: `layouts/_relayted_posts.html`

{% highlight html linenos %}
<h2>Related Posts</h2>
<ul>
  <% related_articles[0,5].each do |article| %>
  <li>
    [ <%= Time.parse(article[:created_at]).strftime("%Y-%m-%d %H:%M") %> ]
    <%= link_to(article[:title], article.path) %>
  </li>
  <% end %>
</ul>
{% endhighlight %}

### 3. テンプレート埋め込み

記事一覧表示用テンプレートを実際に表示させたい部分に埋め込む。  
以下は当方の例で、実際は各記事の直後に挿入している。（`div` タグは CSS 用）

File: `layouts/article.html`

{% highlight html linenos %}
<div class="related-posts">
  <%= render('_related_posts') %>
</div>
{% endhighlight %}

### 4. 確認

nanoc をコンパイルしてプレビューで確認してみる。  
以下は当方の例で、CSS により若干デザインを調整している。

![NANOC_RELATED_POSTS]({{site.baseurl}}/images/2013/02/07/NANOC_RELATED_POSTS.png "NANOC_RELATED_POSTS")

### 5. 参考サイト

- [Nanoc helper to list articles related to the current item](https://gist.github.com/1053680 "Nanoc helper to list articles related to the current item")

---

これで、各記事に関連記事を表示させることができるようになりました。

ちなみに、nanoc によるブログを Octopress による[メインのブログ](http://www.mk-mode.com/octopress/ "mk-mode BLOG")のクローンとして公開しています。

- [mk-mode BLOG (by nanoc)](http://www.mk-mode.com/nanoc/ "mk-mode BLOG (by nanoc)")

但し、[mk-mode BLOG (by Octopress)](http://www.mk-mode.com/octopress/ "mk-mode BLOG (by Octopress)")の記事を機械的に変換しているため、人知の及ばない部分もあるかと思います。ご了承下さい。

以上。

