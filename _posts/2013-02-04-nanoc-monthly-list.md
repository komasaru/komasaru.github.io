---
layout   : single
title    : "nanoc - 月別の記事一覧！"
published: true
date     : 2013-02-04 00:20:00 +0900
comments : true
categories:
- ブログ
tags:
- Ruby
- nanoc
---

[nanoc](http://nanoc.stoneship.org/ "nanoc") で月別の記事一覧を表示させる方法についてです。

<!--more-->

### 0. 前提条件

- Linux Mint 14 Nadia (64bit) での作業を想定。
- nanoc 3.4.3 を使用。
- Ruby 1.9.3-p362 を使用。
- nanoc 用ブログヘルパー（Blogging, Rendering, LinkTo, Tagging）のインクルード設定済み。
- テンプレート機能は ERB を使用。

### 1. 月一覧取得メソッド作成

月の一覧を取得するメソッドを作成する。  
当方は、`lib/helpers.rb` に以下を追加した。

File: `lib/helpers.rb`

{% highlight ruby linenos %}
def articles_by_month
  result = {}
  current_year = current_month = hash_of_year = items_of_the_month = nil
  sorted_articles.each do |article|
    d = Date.parse(article[:created_at])
    if current_year != d.year
      current_month = nil
      current_year = d.year
      hash_of_year = result[current_year] = {}
    end
    if current_month != d.month
      current_month = d.month
      items_of_the_month = hash_of_year[current_month] = []
    end
    items_of_the_month << article
  end
  result
end

def mm_str_month(month)
  sprintf("%02d", month)
end
{% endhighlight %}

### 2. 月別一覧作成メソッド作成

月別一覧ページを作成するメソッドを作成する。  
当方は、`lib/helpers.rb` に以下を追加した。

File: `lib/helpers.rb`

{% highlight ruby linenos %}
def create_monthly_archive_pages
  articles_by_month.each do |year, month_hash|
    month_hash.each do |month, articles|
      month_str = sprintf("%02d", month)
      items << ::Nanoc3::Item.new(
        "<%= render('_monthly_archives', :year => #{year}, :month => #{month}) %>",
        { :title => "Archives: #{year}/#{month_str}", :is_hidden => true },
        "/archives/#{year}/#{month_str}/",
        :binary => false
      )
    end
  end
end
{% endhighlight %}

### 3. 月一覧テンプレート作成

サイドバーに表示する月一覧のテンプレートを作成する。  
以下は当方の例で、ファイル名は `layouts/_month_list.html` とした。

File: `layouts/_month_list.html`

{% highlight html linenos %}
<% articles_by_m = articles_by_month %>
<ul>
  <% articles_by_m.keys.sort_by{|e| -e}.each do |year| %>
  <% articles_by_m[year].keys.sort_by{|e| -e}.each do |month| %>
  <li>
    <%= link_to("#{year}年#{mm_str_month(month)}月", "/archives/#{year}/#{mm_str_month(month)}/") %>
    (<%= articles_by_m[year][month].size %>)
  </li>
  <% end %>
  <% end %>
</ul>
{% endhighlight %}

### 4. テンプレート埋め込み

月一覧テンプレートをサイドバーの表示させたい箇所に埋め込む。  
以下は当方の例で、サイドバー用に作成しているテンプレートファイル内に埋め込んでいる。

File: `layouts/_sidebar.html`

{% highlight html linenos %}
<h2>Archives</h2>
<%= render('_month_list') %>
{% endhighlight %}

### 5. 月別一覧テンプレート作成

月別一覧ページのテンプレートを作成する。  
以下は当方の例で、ファイル名は `layouts/_monthly_archives.html` とした。

File: `layouts/_monthly_archives.html`

{% highlight html linenos %}
<h1>Archive: <%= year %>年<%= mm_str_month(month) %>月</h1>
<ul>
  <% articles_by_month[year][month].each do |post| %>
  <li class="monthly-list">
    <%= link_to(post[:title], post.path) %><br />
    <%= Time.parse(post[:created_at]).strftime("%Y-%m-%d %H:%M") %>
    [ <%= tags_for(post, {:base_url => '/tags/', :separator => ', '}) %> ]
  </li>
  <% end %>
</ul>
{% endhighlight %}

### 6. Rules 編集

全データロード後で、かつ、コンパイル前に実行されるのが `Rules` ファイル内の `preprocess` というメソッドである。  
この `Rules` ファイルを編集する。

File: `Rules`

{% highlight ruby linenos %}
preprocess do
  create_monthly_archive_pages
end
{% endhighlight %}

### 7. コンパイル

いつものようにコンパイルする。

File: `Rules`

{% highlight ruby linenos %}
$ nanoc compile
{% endhighlight %}

### 8. 確認

`nanoc view` 実行後、ブラウザで確認してみる。  
（以下は現時点での（調整中段階の）一例）

![NANOC_MONTHLY_ARCHIVES]({{site.baseurl}}/images/2013/02/04/NANOC_MONTHLY_ARCHIVES.png "NANOC_MONTHLY_ARCHIVES")

また、`output` ディレクトリには `archives` ディレクトリが作成され、さらに年別ディレクトリ・月別ディレクリも作成されているはずである。

### 9. 参考サイト

- [Design Recipe 別館 Blog - Nanoc のカスタマイズ - 年月毎の記事のアーカイブを用意する](http://blog.designrecipe.jp/2010/07/25/nanoc-customize-archive/ "Design Recipe 別館 Blog - Nanoc のカスタマイズ - 年月毎の記事のアーカイブを用意する")

---

これで、年月別に記事一覧が管理できるようになりました。

ちなみに、nanoc によるブログを Octopress による[メインのブログ](http://www.mk-mode.com/octopress/ "mk-mode BLOG")のクローンとして公開しています。

- [mk-mode BLOG (by nanoc)](http://www.mk-mode.com/nanoc/ "mk-mode BLOG (by nanoc)")

但し、[mk-mode BLOG (by Octopress)](http://www.mk-mode.com/octopress/ "mk-mode BLOG (by Octopress)")の記事を機械的に変換しているため、人知の及ばない部分もあるかと思います。ご了承下さい。

以上。

