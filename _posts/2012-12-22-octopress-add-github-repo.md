---
layout   : single
title    : "Octopress - GitHub リポジトリの表示！"
published: true
date     : 2012-12-22 00:20:00 +0900
comments : true
categories:
- ブログ
tags:
- Octopress
- Ruby
- Git
- GitHub
---

Octopress は、デフォルトで GitHub の公開リポジトリの一覧を表示させることが可能です。

以下、記録です。

<!--more-->

### 1. _config.yml の編集

ローカルの Octopress インストールディレクトリ配下にある `_config.yml` を編集する。

File: `_config.yml`

{% highlight text linenos %} 
# Github repositories
github_user: komasaru           # <- ユーザ名
github_repo_count: 5            # <- 表示するリポジトリの数
github_show_profile_link: true  # <- GitHub プロフィールへのリンク表示有無
github_skip_forks: true         # <- 不明？
{% endhighlight %}

必要なら `default_asides` で GitHub の表示位置を変更する。

### 2. デプロイ

後は、 `generate` 後 `preview` で確認し `deploy` するだけ。

``` text
$ rake generate
$ rake preview
$ rake deploy
```

---

これで、サイドバーに GitHub の公開リポジトリ一覧が表示されます。

以上。

