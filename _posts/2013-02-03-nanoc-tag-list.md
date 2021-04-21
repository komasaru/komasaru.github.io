---
layout   : single
title    : "nanoc - 記事でタグを使用！"
published: true
date     : 2013-02-03 00:20:00 +0900
comments : true
categories:
- ブログ
tags:
- Ruby
- nanoc
---

[nanoc](http://nanoc.stoneship.org/ "nanoc") でのブログ運用でタグを利用するにはタグ用のヘルパーを使用するようです。

今回は、タグ用のヘルパーを使用して記事にタグ付けし、サイドバータグの一覧を表示させ、さらに、タグ別の一覧ページを作成します。

<!--more-->

### 0. 前提条件

- Linux Mint 14 Nadia (64bit) での作業を想定。
- nanoc 3.4.3 を使用。
- Ruby 1.9.3-p362 を使用。
- nanoc 用ブログヘルパー（Blogging, Rendering, LinkTo）のインクルード設定済み。
- テンプレート機能は ERB を使用。
- タグ別ページの URL は `tags/hoge` のようにする。

### 1. タグ管理用ヘルパーのインクルード

コンパイル時にタグ管理用のヘルパー Tagging Helper をインクルードするよう、 `lib/default.rb` に次の１行を追加する。

File: `lib/default.rb`

{% highlight ruby linenos %}
include Nanoc3::Helpers::Tagging
{% endhighlight %}

### 2. 個別ページ編集

各記事にタグを表示するようにする。  
以下は当方の例の抜粋で、記事作成日時の後ろに表示させるようにしている。

File: `layouts/article.html`

{% highlight text linenos %} 
<p class="meta">
  <%= Time.parse(@item[:created_at]).strftime("%Y-%m-%d %H:%M") %>
  [ <%= tags_for(item, {:base_url => '/tags/', :separator => ', '}) %> ]
</p>
{% endhighlight %}

場合により、個別ページ以外（トップページ等）も編集する。

### 3. 件数カウントメソッド作成

タグ一覧表示に使用するタグ付されている件数をカウントするメソッドを作成する。  
当方は、`lib/helpers.rb` に以下を追加した。

File: `lib/helpers.rb`

{% highlight ruby linenos %}
def count_by_tag(items = nil)
  items = @items if items.nil?
  count_by_tag = Hash.new(0)
  items.each do |item|
    if item[:tags]
      item[:tags].each do |tag|
        count_by_tag[tag] += 1
      end
    end
  end
  count_by_tag
end
{% endhighlight %}

### 4. タグ別一覧作成メソッド作成

タグ別一覧ページを作成するメソッドを作成する。  
当方は、`lib/helpers.rb` に以下を追加した。

File: `lib/helpers.rb`

{% highlight ruby linenos %}
def create_tag_pages
  tag_set(items).each do |tag|
    items << ::Nanoc3::Item.new(
    "<%= render('_tag_page', :tag => '#{tag}') %>",
      {:title => "Tags: #{tag}", :is_hidden => true},
      "/tags/#{tag}/",
      :binary => false
    )
  end
end

def tag_set(items = nil)
  require 'set'
  items = @items if items.nil?
  tags = Set.new
  items.each do |item|
    next if item[:tags].nil?
    item[:tags].each { |tag| tags << tag }
  end
  tags.to_a
end
{% endhighlight %}

### 5. タグ一覧テンプレート作成

サイドバーに表示するタグ一覧用のテンプレートを作成する。  
以下は当方の例で、ファイル名は `layouts/_tag_list.html` とした。

File: `layouts/_tag_list.html`

{% highlight text linenos %} 
<% tags = count_by_tag(@items) %>
<% if tags %>
<ul>
  <% tags.sort_by{|e| e[0]}.each do |k, v| %>
  <li><%= link_for_tag(k, "/tags/") %> (<%= v %>)</li>
  <% end %>
</ul>
<% else %>
<p>(none)</p>
<% end %>
{% endhighlight %}

### 6. テンプレート埋め込み

タグ一覧を表示させたい場所にテンプレートを埋め込む。  
以下は当方の例で、サイドバー用に作成しているテンプレートファイル内に埋め込んでいる。

File: `layouts/_sidebar.html`

{% highlight html linenos %}
<h2>Tags</h2>
<%= render('_tag_list') %>
{% endhighlight %}

### 7. タグ別一覧テンプレート作成

タグ別一覧ページのテンプレートを作成する。  
以下は当方の例で、ファイル名は `layouts/_tag_page.html` とした。

File: `layouts/_tag_page.html`

{% highlight html linenos %}
<h1>Tags: <%= tag %></h1>
<% if taged_items = items_with_tag(tag) %>
<ul>
  <% taged_items.sort_by{|e| e[:created_at]}.reverse.each do |post| %>
  <li>
    <%= link_to(post[:title], post.path) %><br />
    <p class="meta">
      <%= Time.parse(post[:created_at]).strftime("%Y-%m-%d %H:%M") %>
      [ <%= tags_for(post, {:base_url => '/tags/', :separator => ', '}) %> ]
    </p>
  </li>
  <% end %>
</ul>
<% else %>
<p>none</p>
<% end %>
{% endhighlight %}

### 8. Rules 編集

全データロード後で、かつ、コンパイル前に実行されるのが `Rules` ファイル内の `preprocess` というメソッドである。  
タグ別一覧ページを作成するには、この `Rules` ファイルを以下のように編集する。（`preprocess` メソッドが無ければ作成する）

File: `Rules`

{% highlight ruby linenos %}
preprocess do
  create_tag_pages
end
{% endhighlight %}

### 9. タグ設定

各記事にタグを設定するには、メタデータ部分でタグを以下のように設定する。

File: `2013-01-17-test-tag.ｍｄ`

{% highlight text linenos %} 
---
title: TEST [ Tag ]
created_at: 2013/01/17 00:20:00
kind: article
tags: [nanoc, ruby]
---
{% endhighlight %}

もしくは以下のように設定する。

File: `2013-01-17-test-tag.ｍｄ`

{% highlight text linenos %} 
---
title: TEST [ Tag ]
created_at: 2013/01/17 00:20:00
kind: article
tags:
- nanoc
- ruby
---
{% endhighlight %}

### 10. コンパイル

いつものようにコンパイルする。

File: `Rules`

{% highlight ruby linenos %}
$ nanoc compile
{% endhighlight %}

### 11. 確認

`nanoc view` 実行後、ブラウザで確認してみる。  
（以下は現時点での（調整中段階の）一例）

![NANOC_TAG_1]({{site.baseurl}}/images/2013/02/03/NANOC_TAG_1.png "NANOC_TAG_1")

![NANOC_TAG_2]({{site.baseurl}}/images/2013/02/03/NANOC_TAG_2.png "NANOC_TAG_2")

また、`output` ディレクトリには `tags` ディレクトリが作成され、さらにタグ別ディレクリも作成されているはずである。

### 12. 参考サイト

- [Module: Nanoc::Helpers::Tagging — Documentation by YARD 0.8.3](http://nanoc.stoneship.org/docs/api/3.4/Nanoc/Helpers/Tagging.html "Module: Nanoc::Helpers::Tagging — Documentation by YARD 0.8.3")
- [Design Recipe 別館 Blog - Nanoc のカスタマイズ - タグを管理する](http://blog.designrecipe.jp/2010/07/25/nanoc-customize-tag/ "Design Recipe 別館 Blog - Nanoc のカスタマイズ - タグを管理する")

---

これで、タグ管理ができるようになりました。  
当方、実はこのタグ管理を流用してカテゴリ管理もするようにしました。（一部 nanoc の gem からメソッドも流用して）

ちなみに、nanoc によるブログを Octopress による[メインのブログ](http://www.mk-mode.com/octopress/ "mk-mode BLOG")のクローンとして公開しています。

- [mk-mode BLOG (by nanoc)](http://www.mk-mode.com/nanoc/ "mk-mode BLOG (by nanoc)")

但し、[mk-mode BLOG (by Octopress)](http://www.mk-mode.com/octopress/ "mk-mode BLOG (by Octopress)")の記事を機械的に変換しているため、人知の及ばない部分もあるかと思います。ご了承下さい。

以上。

