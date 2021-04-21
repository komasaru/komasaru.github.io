---
layout   : single
title    : "Octopress - 環境構築！"
published: true
date     : 2012-12-10 00:20:00 +0900
comments : true
categories:
- ブログ
tags:
- Octopress
- Ruby
- WordPress
- tDiary
- nanoc
- Lokka
---

少し前には、Ruby 製の日記ツール [tDiary](http://www.tdiary.org/ "tDiary") や、CMS の [nanoc](http://nanoc.stoneship.org/ "nanoc"), [Lokka](http://lokka.org/ "Lokka") が気になっていました。  
しかし最近は、それらよりも [Octopress](http://octopress.org/ "Octopress") の方が非常に気になる存在になっていました。  
そこで、ついに当方のサーバに [Octopress](http://octopress.org/ "Octopress") の環境を構築しました。(昨日も言いましたが)

WordPress(PHP + MySQL) は、プラグインが豊富で、設定次第ではとても快適に使用できます。  
しかし、当方は一応 Rubyist なので、Ruby や Rails 製の方が使いやすいのでは？と最近は感じていた次第です。

今日は、環境構築についての記録です。  
(基本的には [Octopress](http://octopress.org/ "Octopress") の説明通り)

<!--more-->
## 0. 前提条件
- クライアント側は Linux Mint 13 (64bit) を想定。
- クライアント側の Ruby は rbenv でインストールする。
- クライアント側に Git がインストール済みである。  
  (Octpress のインストール、ソースのバージョン管理で使用する)
- Github Pages や Heroku は使用せず、Rsync 経由でデプロイする。
- サーバ側は CentOS 6.3 (32bit) を想定。
- サーバ側には OpenSSH サーバが構築済みで、鍵ペアによる SSH 接続が可能になっている。
- サーバ側には Git サーバが構築済みである。
- サーバ側ディレクトリは "/var/www/octopress" で SSH 接続するユーザの権限になっている。
- 以降の作業は当方の環境によるものなので、適宜ディレクトリ等の記述は置き換えて考えること。

## 1. Octopress インストール

### 1-1. Ruby インストール

rbenv でインストールされている Ruby が 1.9.3-p194(次項で作成されるファイル `.rbenv-version` に記載されているバージョンに合わせるため) でないならインストールする。

``` bash 
$ rbenv install 1.9.3-p194
$ rbenv rehash
```

`.rbenv-version` のバージョンを変更してもよかったのかも知れない。

### 1-2. Octopress のインストール

``` bash 
$ git clone git://github.com/imathis/octopress.git octopress
```

### 1-3. 依存関係のインストール

``` bash 
$ cd octopress
$ gem install bundler
$ rbenv rehash              # <- rbenv で Ruby をインストールしている場合のみ
$ bundle install
```

### 1-4. デフォルトテーマのインストール

``` bash 
$ rake install
```

## 2. SSH 経由 Rsync でデプロイ！

### 2-1. Rakefile 編集

以下を `Rakefile` に追加する。

File: `Rakefile`

{% highlight text linenos %} 
ssh_user       = "user@server"          # <- 実際のユーザ名、サーバ名を指定
document_root  = "/var/www/octopress/"  # <- サーバでの配置ディレクトリ
rsync_delete   = true
deploy_default = "rsync"
{% endhighlight %}

### 2-2. デプロイ

``` bash 
$ rake generate
$ rake deploy
```

ローカルの `public` ディレクトリ配下とサーバ側のドキュメントルートにファイルが生成される。

### 2-3. プレピュー

``` bash 
$ rake preview
```

ローカルでブラウザで `http://localhost:4000/` にアクセスすれば、プレビューを確認できる。

### 2-4. Rsync で同期除外

Rsync による同期をさせたくないファイル・ディレクトリがある場合、それらを以下のように `rsync-exclude` に記載しローカルに配置する。

File: `rsync-exclude`

{% highlight text linenos %} 
some-file.txt
some-directory/
*.mp4
{% endhighlight %}

### 2-5. サブディレクトリ運用

`http://＜サーバURL＞/fuga` のようにサブディレクトリ運用する場合は、以下のようにする。

``` bash 
$rake set_root_dir[fuga]
```

File: `_config.yml`

{% highlight bash linenos %} 
url: http://www.mk-mode.com/fuga  # <- サブディレクトリ追加
{% endhighlight %}

File: `Rakefile`

{% highlight bash linenos %} 
document_root = "/var/www/octopress"  # <- 必要ならここも変更
{% endhighlight %}

次回から、`http://localhost:4000/fuga` でアクセスする。

## 3. ソースのバージョン管理

### 3-1. リモートリポジトリ作成

ソース管理用に自前の Git サーバにリモートリポジトリを作成する。  
サーバの `~/git` ディレクトリに `octopress.git` というリポジトリを作成する。  
※前提条件に記載しているように、今回は GitHub は使用しない。

``` bash 
$ mkdir /var/lib/git/public_git/octopress.git
$ cd /var/lib/git/public_git/octopress.git
$ git --bare init --shared
```

### 3-2. バージョン管理

Octopress から `clone` しているので、`orign` は `clone` したリポジトリになっている。  
自前の Git サーバを使用するので、`origin` は `octopress` に変更しておく。  
そして、自前 Git サーバ用に `origin` を登録し直し、新しい `origin` をデフォルトブランチに設定する。

``` bash 
$ git remote rename origin octopress
$ git remote add origin ssh://bar@foo.mk-mode.com/var/lib/git/public_git/octopress.git
$ git config branch.master.remote origin
```

後は、通常の Git 操作でよい。(ローカルポジトリを `add`, `commit` して、リモートリポジトリに `push` する)

## 4. 記事作成

### 4-1. 記事作成

テスト用に記事を作成する。

``` bash 
$ rake new_post['Test post by Octopress']
```

これで、 `source/_posts/2012-11-27-test-post-by-octopress.markdown` というファイルが作成される。
内容を Markdown 記法で編集する。
タイトルもここで日本語にできる。

``` text
---
layout   : single
title    : "Test post by Octopress"
date     : 2012-11-27 13:56:00 +0900
comments : true
categories: 
---
```

### 4-2. プレビュー

``` bash 
$ rake generate
$ rake preview
```

ブラウザで `http://localhost:4000/fuga` にアクセスすれば確認できる。

## 5. 日常作業
日常の作業は、記事やページを作成後、HTML 変換、プレピュー、デプロイでよい。

``` bash 
$ rake new_post["title"]  # <- 新規記事を作成
$ rake new_page["title"]  # <- 新規ページを作成
$ rake generate           # <- 記事を HTML に変換
$ rake preview            # <- プレビュー(http://localhost:4000/octopress)
$ rake deploy             # <- 記事を公開(サーバにデプロイ)
```

## 6. その他

### 6-1. 所感

- データベース(WordPress の MySQL 等) を使わず、１記事１テキストファイルなので、管理しやすい。
- Markdown 記法で記事を作成できる。
- Ruby 製なので Rubyist は何かとメンテナンスしやすい。
- GitHub Pages, Heroku で運用するなら、レンタルサーバや自前のサーバは不要。(当方は自宅サーバで運用している)
- デフォルトのクラシックテーマでも、シンプルで見やすい。

### 6-2. 今後の課題

- テーマのカスタマイズ。
- 各種プラグインの導入。(コメント、Twitter、等々)
- アクセス解析をどうするか？
- 既存の WordPress の記事の移行作業。
- 記事投稿時の ping 送信処理をどうするか？(Ruby で XML-RPC 使用？)
- W3C Validation はどうするか？(HTML5だからやらない？)
- Git 知識の習得。
- Markdown 記法についての知識の習得。

### 6-3. 参考サイト

- [Octopress](http://octopress.org/ "Octopress") - 本家サイト

---

明日以降も、各種設定や WordPress からの移行について掲載していく予定です。

以上。

