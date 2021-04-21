---
layout   : single
title    : "Octopress - Twitter の Tweet ボタン追加！"
published: true
date     : 2012-12-11 0:20
comments : true
categories:
- ブログ
tags:
- Octopress
- Ruby
- Twitter
---

Octopress は、デフォルトで Twitter の "Tweet"「ツイート」ボタンを表示させることが可能です。

以下、記録です。

<!--more-->

### 1. _config.yml の編集

ローカルの Octopress インストールディレクトリ配下にある `_config.yml` を編集する。
`twitter_user` に指定するだけで Twitter 機能が有効になる。

File: `_config.yml`

{% highlight text linenos %} 
# Twitter
twitter_user: hoge
twitter_tweet_count: 5              # <- 表示するツイート数
twitter_show_replies: false         # <- リプライを表示するかどうか
twitter_follow_button: true         # <- フォローボタンを表示するかどうか
twitter_show_follower_count: false  # <- フォロワー数を表示するかどうか
twitter_tweet_button: true          # <- 各記事にツイートボタンを表示するかどうか
{% endhighlight %}

### 2. デプロイ

後は、 `generate` 後 `preview` で確認し `deploy` するだけ。

``` text
$ rake generate
$ rake preview
$ rake deploy
```

---

これで、Twitter にログインした人が "Tweet" ボタンをクリックすれば、その人によって ツイートされます。

以上。

