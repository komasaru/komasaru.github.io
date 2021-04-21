---
layout   : single
title    : "Ruby - GitHub API ラッパー Octokit 使用！"
published: true
date     : 2013-07-04 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
- GitHub
---

GitHub API の Ruby / Objective-C ラッパーである "Octokit" というものがあります。  
この "Octokit" を使用すれば、比較的に容易に GitHub API の機能が実装できます。  
（ちなみに、Ruby 製静的ブログシステムの Octopress とは関係無いようです）

今回は、この Octokit を Ruby で実装してみました。

以下、作業記録です。

<!--more-->

#### 0. 前提条件

- Linux Mint 14 (64bit) での作業を想定。
- Ruby 2.0.0-p195 での作業を想定。
- 当然、GitHub のアカウントを所有していること。
- 今回は OAuth 認証は使用しない。
- Ruby 2.0 系をしているので、パラメータの指定はキーワード引数の記法を使用。（従来のハッシュの記法に変更しても良い）

#### 1. RubyGems パッケージインストール

GitHub API の Ruby 向けラッパー `octokit` RubyGems パッケージをインストールする。

``` bash 
$ sudo gem install octokit
$ gem list | grep octokit
octokit (1.24.0)
```

#### 2. Ruby スクリプト作成

自作のリポジトリの一覧を取得する Ruby スクリプト、自作の Gist の一覧を取得する Ruby スクリプトを作成してみた。  
もちろん、これら以外のソッドもある。メソッド一覧やオプション、返却値については、[Documentation for octokit (1.24.0)](http://rdoc.info/gems/octokit/ "Documentation for octokit (1.24.0)")を参照のこと。  

- スクリプト中の `repo.fullname` のような記述は Hashie::Mesh によるものであり、通常の Hash のように `repo[:fullname]` や `repo["fullname"]` のように記述してもよい。
- デフォルトではリクエスト結果は最大 30 件しか返ってこない。  
  パラメータ設定で、`per_page: 100`（従来のハッシュの記法なら `:per_page => 100`）のように記述すると１度に最大100件取得できるようになる。  
  それでも取得しきれなかったデータがある（次ページがある）かどうかは、HTTP ヘッダをチェックすれば分かるようだ。（以下のようになっているはずだ）  
  ただし、これは、認証ログインをした上でログインインスタンス作成時のパラーメタに `auto_traversal: true` （従来のハッシュの記法なら `:auto_traversal => true`）を指定すれば、自動で全ページを取得するようになる。（このことは、Octokit のソーススクリプトを眺めていて気付いた）

``` bash 
Link: <https://api.github.com/repos?page=2&per_page=100>; rel="next",
      <https://api.github.com/repos?page=10&per_page=100>; rel="last"
```

【リポジトリ一覧取得】

File: `octokit_repositories.rb`

{% highlight ruby linenos %}
require 'octokit'

# API 呼び出し回数
ratelimit           = Octokit.ratelimit
ratelimit_remaining = Octokit.ratelimit_remaining
puts "Rate Limit Remaining: #{ratelimit_remaining} / #{ratelimit}"
puts

# インスタンス化
# ==== 認証無しの場合
repos = Octokit.repositories("komasaru", {sort: :pushed_at})
# ==== OAuth 認証の場合
#cl = Octokit::Client.new(login: "komasaru", oauth_token: "token_string")
#repos = cl.repositories("komasaru", {sort: :pushed_at})

# 値取得
repos.each do |repo|
  puts "[ #{repo.name} ]"
  puts "\tOwner       : #{repo.owner.login}"
  puts "\tFull Name   : #{repo.full_name}"
  puts "\tDescription : #{repo.description}"
  puts "\tPrivate     : #{repo.private}"
  puts "\tLanguage    : #{repo.language}"
  puts "\tURL         : #{repo.html_url}"
  puts "\tCreated at  : #{repo.created_at}"
  puts "\tUpdated at  : #{repo.updated_at}"
  puts "\tPushed  at  : #{repo.pushed_at}"
  puts
end
{% endhighlight %}

- [Gist - Ruby script to get github repositories by octokit.](https://gist.github.com/komasaru/5835990 "Gist - Ruby script to get github repositories by octokit.")

【Gist 一覧取得】

File: `octokit_gists.rb`

{% highlight ruby linenos %}
require 'octokit'

# API 呼び出し回数
ratelimit          = Octokit.ratelimit
ratelimit_remainig = Octokit.ratelimit_remaining
puts "Rate Limit Remaining: #{ratelimit_remaining} / #{ratelimit}"
puts

# インスタンス化
# ==== 認証無しの場合
gists = Octokit.gists("komasaru")
# ==== OAuth 認証の場合
# cl = Octokit::Client.new(login: "komasaru", oauth_token: "token_string")
# gists = cl.gists("komasaru")

# 値取得
gists.each do |gist|
  file = Hash.new
  gist.files.each {|k, v| file = v}
  puts "[ #{file.filename} ]"
  puts "\tUser        : #{gist.user.login}"
  puts "\tDescription : #{gist.description}"
  puts "\tURL         : #{gist.html_url}"
  puts "\tPublic      : #{gist.public}"
  puts "\tLanguage    : #{file.language}"
  puts "\tID          : #{gist.id}"
  puts "\tCreated at  : #{gist.created_at}"
  puts
end
{% endhighlight %}

- [Gist - Ruby script to get gist lists by octokit.](https://gist.github.com/komasaru/5835997 "Gist - Ruby script to get gist lists by octokit.")

#### 3. Ruby スクリプト実行

作成した Ruby スクリプトを実行してみる。

【リポジトリ一覧取得】

``` bash 
$ ruby octokit_repositories.rb
Rate Limit Remaining: 44 / 60

[ komasaru.github.com ]
        Owner       : komasaru
        Full Name   : komasaru/komasaru.github.com
        Description : mk-mode Blog by Octopress
        Private     : false
        Language    : JavaScript
        URL         : https://github.com/komasaru/komasaru.github.com
        Created at  : 2013-05-26T05:41:03Z
        Updated at  : 2013-06-21T15:18:32Z
        Pushed  at  : 2013-06-21T15:18:31Z

[ Calendar ]
        Owner       : komasaru
        Full Name   : komasaru/Calendar
        Description : Ruby scripts to calc calendar.
        Private     : false
        Language    : Ruby
        URL         : https://github.com/komasaru/Calendar
        Created at  : 2013-02-19T04:15:49Z
        Updated at  : 2013-03-20T08:16:34Z
        Pushed  at  : 2013-03-20T08:16:34Z

[ CalcDist ]
        Owner       : komasaru
        Full Name   : komasaru/CalcDist
        Description : Ruby scripts to calc two points by latitude and longitude.
        Private     : false
        Language    : Ruby
        URL         : https://github.com/komasaru/CalcDist
        Created at  : 2013-02-12T09:02:29Z
        Updated at  : 2013-04-09T12:47:11Z
        Pushed  at  : 2013-02-12T09:27:38Z

[ WpXml2Md ]
        Owner       : komasaru
        Full Name   : komasaru/WpXml2Md
        Description : Ruby script converting WordPress XML to format of Octopress(markdown).
        Private     : false
        Language    : Ruby
        URL         : https://github.com/komasaru/WpXml2Md
        Created at  : 2012-12-02T05:46:54Z
        Updated at  : 2013-01-20T13:38:29Z
        Pushed  at  : 2012-12-03T07:58:44Z

[ SendUpdatePing ]
        Owner       : komasaru
        Full Name   : komasaru/SendUpdatePing
        Description : Ruby script of sending update ping of web site.
        Private     : false
        Language    : Ruby
        URL         : https://github.com/komasaru/SendUpdatePing
        Created at  : 2012-12-03T04:21:28Z
        Updated at  : 2013-01-13T11:33:06Z
        Pushed  at  : 2012-12-03T06:32:57Z
```

【Gist 一覧取得】

``` bash 
$ ruby octokit_gists.rb
Rate Limit Remaining: 40 / 60

[ google_geocode.rb ]
        User        : komasaru
        Description : Ruby script to get a address or latitude, longitude with Google Geocoding API.
        URL         : https://gist.github.com/5820771
        Public      : true
        Language    : Ruby
        ID          : 5820771
        Created at  : 2013-06-20T07:00:51Z

[ discrete_fourier_transform.rb ]
        User        : komasaru
        Description : Ruby script to calculate DFT(discrete fourier transform).
        URL         : https://gist.github.com/5606504
        Public      : true
        Language    : Ruby
        ID          : 5606504
        Created at  : 2013-05-19T02:57:49Z

         :
====< 途中省略 >====
         :

[ rndnum_lcgs.rb ]
        User        : komasaru
        Description : Ruby script to calc uniform random numbers by LCGs method.
        URL         : https://gist.github.com/5003310
        Public      : true
        Language    : Ruby
        ID          : 5003310
        Created at  : 2013-02-21T08:49:31Z

[ chi2_rndnum.rb ]
        User        : komasaru
        Description : Ruby script to calc uniform random numbers by chi-squared distribution method.
        URL         : https://gist.github.com/5003302
        Public      : true
        Language    : Ruby
        ID          : 5003302
        Created at  : 2013-02-21T08:47:20Z
```

#### 4. アクセストークン取得

上記のスクリプトでアクセストークンを使用してインスタンスを生成する場合は、アクセストークンを取得する必要がある。  
以下のように容易に取得できる。

1. [Account settings] - [Applications] と開き、 [Personal API Access Tokens] の [Create new token] をクリックする。
2. アクセストークンが表示されるので、コピーする。

#### 5. 応用

今回の Octokit を使った手法を応用して、当方の Ruby on Rails 製ホームページ上で自作成のリポジトリと Gist の一覧を表示できるようにした。  
よろしければ、ご覧ください。

- [mk-mode SITE : GitHub - リポジトリ一覧](http://www.mk-mode.com/rails/github/repos "mk-mode SITE : GitHub - リポジトリ一覧")
- [mk-mode SITE : GitHub - Gist 一覧](http://www.mk-mode.com/rails/github/gists "mk-mode SITE : GitHub - Gist 一覧")

#### 参考サイト

- [GitHubが発表したOctokitはGitHub APIを使いやすくするRuby/Objective-Cラッパー - TechCrunch Japan](http://jp.techcrunch.com/2013/06/01/20130531github-announces-octokit-the-official-way-to-build-using-the-github-api/ "GitHubが発表したOctokitはGitHub APIを使いやすくするRuby/Objective-Cラッパー - TechCrunch Japan")
- [Documentation for octokit (1.24.0)](http://rdoc.info/gems/octokit/ "Documentation for octokit (1.24.0)")
- [GitHub API v3](http://developer.github.com/v3/ "GitHub API v3")

---

この Octokit で、やりたいことがすぐに出来たので感動した次第です。  
GitHub に関してもっと突っ込んだことをやろうと思えばできるようですが、それは慣れてからということで。。。

以上。

