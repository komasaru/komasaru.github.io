---
layout   : single
title    : "Octopress - プロフィール表示を追加！"
published: true
date     : 2012-12-17 0:20
comments : true
categories: 
- ブログ
tags:
- Octopress
- Ruby
---

Octopress では、プロフィールを表示させることが可能です。

以下、記録です。

<!--more-->

### 1. HTML の確認・編集

プロフィールを表示する HTML `source/_includes/custom/asides/about.html` は以下のようになっている。  
必要なら編集する。

File: `source/_includes/custom/asides/about.html`

{% highlight html linenos %} 
<section>
  <h1>About Me</h1>
  <p>ここに、プロフィールを記載。</p>
</section>
{% endhighlight %}

通常の HTML なので、画像を貼ったりしてもよい。

### 2. サイドバー表示設定

サイドバーにプロフィールを表示させる為、`_config.yml` を編集する。  
`custom/asides/about.html` を表示させたい位置に挿入する。

File: `_config.yml`

{% highlight text linenos %} 
# list each of the sidebar modules you want to include, in the order you want them to appear.
# To add custom asides, create files in /source/_includes/custom/asides/ and add them to the list like 'custom/asides/custom_aside_name.html'
default_asides: [custom/asides/about.html, asides/recent_posts.html, custom/asides/category_list.html, custom/asides/tag_cloud.html, asides/github.html, asides/twitter.html, asides/delicious.html, asides/pinboard.html, asides/googleplus.html]
{% endhighlight %}

### 3. デプロイ

`generate` 後 `preview` で確認し `deploy` する。

``` text
$ rake generate
$ rake preview
$ rake deploy
```

---

これで、サイドバーにプロフィールが表示されます。

以上。

