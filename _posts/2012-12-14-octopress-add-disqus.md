---
layout   : single
title    : "Octopress - Disqus コメント欄追加！"
published: true
date     : 2012-12-14 00:20:00 +0900
comments : true
categories:
- ブログ
tags:
- Octopress
- Ruby
- Disqus
---
Octopress は、デフォルトで Disqus の コメント欄を表示させることが可能です。

以下、記録です。

<!--more-->

### 1. _config.yml の編集

ローカルの Octopress インストールディレクトリ配下にある `_config.yml` を編集する。

File: `_config.yml`

{% highlight text linenos %} 
# Disqus Comments
disqus_short_name: hoge           # <- 自分のアカウントのショートネーム
disqus_show_comment_count: false  # <- コメント数を表示するかしないか
{% endhighlight %}

### 2. デプロイ

後は、 `generate` 後 `preview` で確認し `deploy` するだけ。

``` text
$ rake generate
$ rake preview
$ rake deploy
```

---

これで、各記事の下部に Disqus によるコメント欄が表示されます。

以上。

