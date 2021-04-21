---
layout   : single
title    : "Ruby - RubyGems API キー取得！"
published: true
date     : 2016-07-04 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
---

RubyGems ライブラリを [RubyGems.org](https://rubygems.org/ "RugyGems.org") にリリースする際には API キーが必要となります。

以下、 API キーを取得する方法についての備忘録です。

<!--more-->

### 1. RubyGems アカウントの作成

[RubyGems.org](https://rubygems.org/ "RugyGems.org") アカウント未作成なら [Sign up - RubyGems.org - your community gem host](https://rubygems.org/sign_up "Sign up - RubyGems.org - your community gem host") でアカウントを作成しておく。

### 2. API キーの取得

ローカル環境で以下を実行する。（RubyGems.org にサインインしていなくても大丈夫）

``` text
$ curl -u handle_name https://rubygems.org/api/v1/api_key.yaml > ~/.gem/credentials
Enter host password for user 'handle_name':

$ chmod 0600 ~/.gem/credentials
```

（`handle_name` は自身のものに置き換えること）

"~/.gem/credentials" が作成され、`rubygems_api_key` が記述されていることを確認する。

これで、ローカルの gem ライブラリが RubyGems.org にリリースできる。

### 3. 参考サイト

* [Make your own gem - RubyGems Guides](http://guides.rubygems.org/make-your-own-gem/#your-first-gem "Make your own gem - RubyGems Guides")

---

以上。

