---
layout   : single
title    : "Octopress - Facebook \"Like\" ボタン追加！"
published: true
date     : 2012-12-12 00:20:00 +0900
comments : true
categories:
- ブログ
tags:
- Octopress
- Ruby
- Facebook
---
Octopress は、デフォルトで Facebook の "Like"「いいね」ボタンを表示させることが可能です。

以下、記録です。

<!--more-->

### 1. _config.yml の編集

ローカルの Octopress インストールディレクトリ配下にある `_config.yml` を編集する。
`facebook_like` の値を変更するだけで Facebook の「いいね」ボタンが機能が有効になる。

File: `_config.yml`

{% highlight text linenos %} 
# Facebook Like
facebook_like: true  # <- false を true に変更
{% endhighlight %}

### 2. 日本語化

"Like" ではなく "いいね" にするなら、 `source/_includes/facebook_like.html` を編集する。

File: `source/_includes/facebook_like.html`

{% highlight text linenos %} 
  js.src = "//connect.facebook.net/ja_JP/all.js#appId=212934732101925&xfbml=1";  # <- en_US を ja_JP に変更
{% endhighlight %}

Facebook の AppID を持っているなら、`appID` の値も自分の AppID に変更する。

### 3. デプロイ

後は、 `generate` 後 `preview` で確認し `deploy` するだけ。

``` text
$ rake generate
$ rake preview
$ rake deploy
```

---

これで、 Facebook にログインした人が "Like" ボタンをクリックすれば、その人のアクティビティに追加されます。

以上。

