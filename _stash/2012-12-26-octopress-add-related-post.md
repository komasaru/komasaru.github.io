---
layout   : single
title    : "Octopress - 関連記事の表示！"
published: true
date     : 2012-12-26 00:20:00 +0900
comments : true
categories:
- ブログ
tags:
- Octopress
- Ruby
---

Octopress の各記事にその記事に関連する記事の一覧を表示させる方法についての記録です。

以下、作業記録です。

<!--more-->

### 1. プラグインの導入

大変ありがたいことに、 [LawrenceWoodman/related_posts-jekyll_plugin · GitHub](https://github.com/LawrenceWoodman/related_posts-jekyll_plugin "LawrenceWoodman/related_posts-jekyll_plugin · GitHub") にプラグインがある。  
適当な場所に `clone` して、必要な Ruby スクリプトを `plugins` ディレクトリに配置する。

``` text
$ cd ~/tmp
$ git clone https://github.com/LawrenceWoodman/related_posts-jekyll_plugin.git
$ cp related_posts-jekyll_plugin/_plugins/related_posts.rb ~/octopress/plugins/
```

### 2. 表示用 HTML の作成

表示させるための HTML ソース `octopress/source/includes/post/related_posts.html` を以下のような内容で作成する。  
表示件数を指定しないと、全ての関連記事が表示されるようだ。

File: `octopress/source/includes/post/related_posts.html`

{% highlight html linenos %} 
<div class="related_posts">
<h1>Related Posts</h1>
<ul>
｛% for post in site.related_posts limit:5 %｝
  <li><a href="｛｛ post.url ｝｝">｛｛ post.title ｝｝</a></li>
｛% endfor %｝
</ul>
</div>
{% endhighlight %}

* 上記の全角 `｛`, `｝` は半角に置き換えて考えること。

### 3. 表示元 HTML の編集

表示用 HTML を表示させるため、呼び出し元の HTML `octopress/source/_layout/post.html` を以下のように編集する。  
当方は、「ツイート」ボタンや「いいね」ボタンの下に配置した。

File: `octopress/source/_layout/post.html`

{% highlight diff linenos %} 
diff --git a/source/_layouts/post.html b/source/_layouts/post.html
index a834653..c7f174e 100644
--- a/source/_layouts/post.html
+++ b/source/_layouts/post.html
@@ -16,6 +16,9 @@ single: true
     ｛% unless page.sharing == false %｝
       ｛% include post/sharing.html %｝
     ｛% endunless %｝
+    ｛% unless page.related_posts == false %｝
+      ｛% include post/related_posts.html %｝
+    ｛% endunless %｝
     <p class="meta">
       ｛% if page.previous.url %｝
         <a class="basic-alignment left" href="｛｛page.previous.url｝｝" title="Pre
{% endhighlight %}

* 上記の全角 `｛`, `｝` は半角に置き換えて考えること。

### 4. デプロイ

`generate` 後 `preview` で確認し `deploy` する。

``` text
$ rake generate
$ rake preview
$ rake deploy
```

### 5. 参考サイト

- [LawrenceWoodman/related_posts-jekyll_plugin · GitHub](https://github.com/LawrenceWoodman/related_posts-jekyll_plugin "LawrenceWoodman/related_posts-jekyll_plugin · GitHub")
- [OctopressでRelated Posts(関連エントリー)を表示させるようにした - Glide Note - グライドノート](http://blog.glidenote.com/blog/2012/01/04/octopress-related-posts/ "OctopressでRelated Posts(関連エントリー)を表示させるようにした - Glide Note - グライドノート")

---

これで、各記事に関連記事の一覧が表示されるようになりました。

以上。

