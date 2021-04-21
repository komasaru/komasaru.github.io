---
layout   : single
title    : "Octopress - Google Analytics 設定！"
published: true
date     : 2012-12-15 00:20:00 +0900
comments : true
categories:
- ブログ
tags:
- Octopress
- Ruby
- Google
---

Octopress は、デフォルトで Google Analytics の設定をすることが可能です。

以下、記録です。

<!--more-->

### 1. _config.yml の編集

ローカルの Octopress インストールディレクトリ配下にある `_config.yml` を編集する。

File: `_config.yml`

{% highlight text linenos %} 
# Google Analytics
google_analytics_tracking_id: UA-99999999-9  # <- Google Analytics の ID を指定
{% endhighlight %}

### 2. デプロイ

後は、 `generate` 後 `preview` で確認し `deploy` するだけ。

``` text
$ rake generate
$ rake preview
$ rake deploy
```

---

これで、ブログにアクセスされるたびに Google Analytics で集計されます。

以上。

