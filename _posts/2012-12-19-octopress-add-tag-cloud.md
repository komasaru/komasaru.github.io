---
layout   : single
title    : "Octopress - タグクラウドの追加"
published: true
date     : 2012-12-19 00:20:00 +0900
comments : true
categories:
- ブログ
tags:
- Octopress
- Ruby
- タグクラウド
---

前回、Octopress に導入したカテゴリリストのプラグインを改修して、サイドバーにタグクラウドを表示させてみます。

以下、作業記録です。

<!--more-->

### 0. 前提条件

- `plugins` ディレクトリに `tag_cloud.rb` が配置済み。
- `source/_includes/custom/asides` ディレクトリに `tag_cloud.html` が配置済み。

### 1. _config.yml の編集

`_config.yml` にカテゴリ用ディレクトリの設定同様、タグ用ディレクトリの設定を追加する。

File: `_config.yml`

{% highlight text linenos %} 
category_dir: blog/categories
tag_dir: blog/tags             # <- 追加
{% endhighlight %}

### 2. tag_cloud.rb の編集

`tag_cloud.rb` の `TagCloud` クラス内を以下のように編集する。
参考にしたサイト同様 `tag_cloud` は `tag_dir` とした。

File: `tag_cloud.rb`

{% highlight diff linenos %} 
diff --git a/plugins/tag_cloud.rb b/plugins/tag_cloud.rb
index aeab51b..f4d8932 100644
--- a/plugins/tag_cloud.rb
+++ b/plugins/tag_cloud.rb
@@ -59,21 +59,21 @@ module Jekyll
       lists = {}
       max, min = 1, 1
       config = context.registers[:site].config
-      category_dir = '/' + config['category_dir'] + '/'
-      categories = context.registers[:site].categories
-      categories.keys.sort_by{ |str| str.downcase }.each do |category|
-        count = categories[category].count
-        lists[category] = count
+      tag_dir = '/' + config['tag_dir'] + '/'
+      tags = context.registers[:site].tags
+      tags.keys.sort_by{ |str| str.downcase }.each do |tag|
+        count = tags[tag].count
+        lists[tag] = count
         max = count if count > max
       end
 
       html = ''
-      lists.each do | category, counter |
-        url = category_dir + category.gsub(/_|\P{Word}/, '-').gsub(/-{2,}/, '-'
+      lists.each do | tag, counter |
+        url = tag_dir + tag.gsub(/_|\P{Word}/, '-').gsub(/-{2,}/, '-').downcase
         style = "font-size: #{100 + (60 * Float(counter)/max)}%"
-        html << "<a href='#{url}' style='#{style}'>#{category}"
+        html << "<a href='#{url}' style='#{style}'>#{tag}"
         if @opts['counter']
-          html << "(#{categories[category].count})"
+          html << "(#{tags[tag].count})"
         end
         html << "</a> "
       end
{% endhighlight %}

### 3. tag_generator.rb の作成

`category_generator.rb` を流用して、`tag_generator` を作成する。  
内容は、以下の変換をしただけ。

``` text
Category   -> Tag
Categories -> Tags
category   -> tag
categories -> tags
```

### 4. SCSS の編集

`sass/partials/_archive.scss` と `sass/partials/_blog.scss` 内に `category` 同様に `tag` 部分を追加する。  
場合によっては、値を変更する。

File: `sass/partials/_archive.scss`

{% highlight diff linenos %} 
diff --git a/sass/partials/_archive.scss b/sass/partials/_archive.scss
index 9ef1e82..8c492e9 100644
--- a/sass/partials/_archive.scss
+++ b/sass/partials/_archive.scss
@@ -23,7 +23,7 @@
       display: inline-block;
     }
   }
-  a.category, time {
+  a.category, a.tag, time {
     @extend .sans;
     color: $text-color-light;
   }
@@ -58,12 +58,12 @@
     article {
       padding:{left: 4.5em; bottom: .7em;}
     }
-  a.category {
+  a.category, a.tag {
     line-height: 1.1em;
     }
   }
 }
-#content > .category {
+#content > .category, .tag {
   article {
     margin-left: 0;
     padding-left: 6.8em;
{% endhighlight %}

File: `sass/partials/_blog.scss`

{% highlight diff linenos %} 
diff --git a/sass/partials/_blog.scss b/sass/partials/_blog.scss
index 57fe7a8..53741ee 100644
--- a/sass/partials/_blog.scss
+++ b/sass/partials/_blog.scss
@@ -76,7 +76,7 @@ article {
       clear: both;
       overflow: hidden;
     }
-    .byline + time:before, time +time:before, .comments:before, .byline ~ .categories:before {
+    .byline + time:before, time +time:before, .comments:before, .byline ~ .categories:before, .byline ~ .tags:before {
       @extend .separator;
     }
   }
{% endhighlight %}

### 5. tag_index.html の作成

`source/_layouts/category_index.html` を流用して `source/_layouts/tag_index.html` を作成する。  
内容は、以下の変換をしただけ。

``` text
category   -> tag
categories -> tags
```

### 6. tags.html の作成

`source/_includes/post/categories.html` を流用して `source/_includes/post/tags.html` を作成する。  
内容は、以下の変換をしただけ。

``` text
category   -> tag
categories -> tags
```

### 7. tag_feed.xml の作成

`source/_includes/custom/category_feed.xml` をコピーして `source/_includes/custom/tag_feed.xml` を作成する。  
ファイルをコピーしただけ。

### 8. デプロイ

`generate` 後 `preview` で確認し `deploy` する。

``` text
$ rake generate
$ rake preview
$ rake deploy
```

---

これで、記事投稿時に `categoris:` 同様 `tags:` を指定すれば、タグクラウドが表示されるようになる。  
（うまく行かない場合は、単語の変換ミスが考えられるのでよく確認する。特に "category" の複数形は "categories" ですから。）

以上。

