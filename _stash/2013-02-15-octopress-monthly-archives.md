---
layout   : single
title    : "Octopress - 月別アーカイブ！"
published: true
date     : 2013-02-15 00:20:00 +0900
comments : true
categories:
- ブログ
tags:
- Octopress
- jekyll
- Ruby
---

[Octopress](http://octopress.org/ "Octopress") のブログには、デフォルトでは全記事のアーカイブはあっても月別アーカイブの機能がありません。

記事数が増えてくると、月別アーカイブの機能があった方が便利なので、プラグインを作成してみました。

<!--more-->

### 0. 前提条件

- Linux Mint 14 Nadia (64bit)
- Ruby 1.9.3-p194
- Octopress 2.0
- 月別ページの URL は `/yyyy/mm/[index.html]` とする。
- サイドバーに年月一覧を設置する。

使用する環境は特に問わないはず。

### 1. プラグイン（月別ページ生成用）作成

月別ページを生成するプラグインを作成する。  
当方が過去に作成していたカテゴリ別ページやタグ別ページ生成プラグインを流用した。

File: `plugins/archive_generator.rb`

{% highlight ruby linenos %}
# encoding: utf-8
#
# Jekyll monthly arvchive page generator.
module Jekyll
  class ArchiveIndex < Page
    def initialize(site, base, dir, period, posts)
      @site = site
      @base = base
      @dir = dir
      @name = 'index.html'
      self.process(@name)
      self.read_yaml(File.join(base, '_layouts'), 'archive_index.html')
      self.data['period'] = period
      self.data['period_posts'] = posts
      archive_title_prefix = site.config['archive_title_prefix'] || 'Archive: '
      self.data['title'] = "#{archive_title_prefix}#{period["year"]}-#{"%02d" % period["month"]}"
      self.data['description'] = "#{archive_title_prefix}#{period["year"]}-#{"%02d" % period["month"]}"
    end
  end

  class ArchiveGenerator < Generator
    safe true
    def generate(site)
      if site.layouts.key? 'archive_index'
        site.posts.group_by{ |c| {"month" => c.date.month, "year" => c.date.year} }.each do |period, posts|
          archive_dir = File.join(period["year"].to_s(), "%02d" % period["month"].to_s())
          write_archive_index(site, archive_dir, period, posts)
        end
      end
    end

    def write_archive_index(site, dir, period, posts)
      index = ArchiveIndex.new(site, site.source, dir, period, posts)
      index.render(site.layouts, site.site_payload)
      index.write(site.dest)
      site.pages << index
    end
  end
end
{% endhighlight %}

### 2. プラグイン（年月一覧生成用）作成

サイドバーに設置する年月一覧を生成するプラグインを作成する。  
当方が過去に作成していたカテゴリ一覧やタグクラウド生成プラグインを流用した。

File: `plugins/month_list.rb`

{% highlight ruby linenos %}
# encoding: utf-8
#
# Month List for Octopress
module Jekyll
  class MonthList < Liquid::Tag
    def initialize(tag_name, markup, tokens)
      @opts = {}
      if markup.strip =~ /\s*counter:(\w+)/i
        @opts['counter'] = ($1 == 'true')
        markup = markup.strip.sub(/counter:\w+/i,'')
      end
      super
    end

    def render(context)
      html = ""
      posts = context.registers[:site].posts.reverse
      posts = posts.group_by{|c| {"month" => c.date.month, "year" => c.date.year}}
      posts.each do |period, post|
        month_dir = "/#{period["year"]}/#{"%02d" % period["month"]}/"
        html << "<li><a href='#{month_dir}'>#{period["year"]}-#{"%02d" % period["month"]}"
        html << " (#{post.count})" if @opts['counter']
        html << "</a></li>"
      end
      html
    end
  end
end

Liquid::Template.register_tag('month_list', Jekyll::MonthList)
{% endhighlight %}

### 3. テンプレート（月別ページ用）作成

月別ページ用のテンプレートを作成する。  
以下は当方の例で、明細部分は別途作成しているテンプレートをインクルードする形にしている。

File: `source/_layouts/archive_index.html`

{% highlight html linenos %}
---
layout: page
footer: false
---

<div id="blog-archives" class="month">
{{ "{% for post in page.period_posts " }}%}
<article>
  {{ "{% include archive_post.html " }}%}
</article>
{{ "{% endfor " }}%}
</div>
{% endhighlight %}

### 4. テンプレート（年月一覧用）作成

サイドバーに設置する年月一覧用のテンプレートを作成する。  
以下は当方の例。

File: `source/_includes/custom/asides/month_list.html`

{% highlight html linenos %}
<section>
  <h1>Monthly Archives</h1>
    <ul id="month-list">{{ "{% month_list counter:true " }}%}</ul>
</section>
{% endhighlight %}

### 5. 年月一覧表示設定

作成したサイドバー用テンプレートを読み込むよう `_config.yml` の `default_asides` を編集する。  
以下は当方の例で、タグクラウドの次に配置している。

File: `_config.yml`

{% highlight ruby linenos %}
default_asides: [custom/asides/about.html, asides/recent_posts.html, custom/asides/category_list.html, custom/asides/tag_cloud.html, custom/asides/month_list.html, asides/github.html, asides/twitter.html, asides/delicious.html, asides/pinboard.html, asides/googleplus.html, custom/asides/sponsored_link.html, custom/asides/validator.html]
{% endhighlight %}

### 6. 確認

いつものように、`generate`, `preview` してブラウザで確認してみる。

``` bash 
$ rake generate
$ rake preview
```

サイドバーに以下のような年月一覧が表示され、

![OP_MONTHLY_ARCHIVES_1]({{site.baseurl}}/images/2013/02/15/OP_MONTHLY_ARCHIVES_1.png "OP_MONTHLY_ARCHIVES_1")

年月リンクをクリックして、その年月の記事一覧が表示されることを確認する。

![OP_MONTHLY_ARCHIVES_2]({{site.baseurl}}/images/2013/02/15/OP_MONTHLY_ARCHIVES_2.png "OP_MONTHLY_ARCHIVES_2")

### 7. 参考サイト

- [Generating monthly archives with Jekyll](http://joseoncode.com/2011/11/27/generating-monthly-archives-with-jekyll/ "Generating monthly archives with Jekyll")

---

Octopress での月別アーカイブについては詳しい情報が少なくて苦労しましたが、 jekyll の月別アーカイブについて情報が参考になりました。

また、当方は上記の方法をさらに改造して、サイドバーの月別一覧をドロップダウンにしました。（年月が多いと縦に長くなるので。カテゴリやタグはひと目で分かるようにそのまま表示しているが。。。）

以上。

