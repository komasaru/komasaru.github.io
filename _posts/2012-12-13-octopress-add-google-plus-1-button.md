---
layout   : single
title    : "Octopress - Google ＋１ ボタン追加！"
published: true
date     : 2012-12-13 00:20:00 +0900
comments : true
categories:
- ブログ
tags:
- Octopress
- Ruby
- Google
---
Octopress は、デフォルトで Google の "+1" ボタンを表示させることが可能です。

以下、記録です。

<!--more-->

### 1. _config.yml の編集

ローカルの Octopress インストールディレクトリ配下にある `_config.yml` を編集する。

File: `_config.yml`

{% highlight text linenos %} 
# Google +1
google_plus_one: true  # <- false を true に変更
{% endhighlight %}

### 2. デプロイ

後は、 `generate` 後 `preview` で確認し `deploy` するだけ。

``` text
$ rake generate
$ rake preview
$ rake deploy
```

---

これで、Google アカウントでログインしている人が "+1" ボタンをクリックすれば、Google の検索結果に反映されます。

以上。

