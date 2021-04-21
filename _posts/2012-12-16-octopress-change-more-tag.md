---
layout   : single
title    : "Octopress - more タグ変更！"
published: true
date     : 2012-12-16 00:20:00 +0900
comments : true
categories:
- ブログ
tags:
- Octopress
- Ruby
- HTML
---

Octopress では、 `<!--more-->` タグを挿入すると、デフォルトでは `Read on >>` と表示されます。

これを変更する方法についての記録です。

以下、記録です。

<!--more-->

### 1. _config.yml の編集

ローカルの Octopress インストールディレクトリ配下にある `_config.yml` を編集する。

File: `_config.yml`

{% highlight text linenos %} 
# ----------------------- #
#    Jekyll & Plugins     #
# ----------------------- #

excerpt_link: "続きを読む &raquo;"  # "Continue reading" link text at the bottom of excerpted articles
{% endhighlight %}

### 2. デプロイ

後は、 `generate` 後 `preview` で確認し `deploy` するだけ。

``` text
$ rake generate
$ rake preview
$ rake deploy
```

---

これで、文言が変更されます。

以上。

