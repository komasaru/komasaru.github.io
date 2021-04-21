---
layout   : single
title    : "Octopress - カテゴリリストの追加！"
published: true
date     : 2012-12-18 00:20:00 +0900
comments : true
categories:
- ブログ
tags:
- Octopress
- Ruby
---

Octopress にプラグインをインストールすることで、サイドバーにカテゴリリストを表示させることが可能です。

以下、作業記録です。

<!--more-->

### 1. プラグインのダウンロード

先人によって便利なプラグインが用意されている。  
Git で `clone` することでダウンロードできる。

``` text
$ git clone git://github.com/tokkonopapa/octopress-tagcloud.git
Cloning into 'octopress-tagcloud'...
remote: Counting objects: 44, done.
remote: Compressing objects: 100% (28/28), done.
remote: Total 44 (delta 9), reused 40 (delta 5)
Receiving objects: 100% (44/44), 6.05 KiB, done.
Resolving deltas: 100% (9/9), done.
```

### 2. ファイルのコピー

必要なファイルをコピーする。

``` text
$ cp octopress-tagcloud/plugins/tag_cloud.rb plugins/tag_cloud.rb
$ cp octopress-tagcloud/source/_includes/custom/asides/* source/_includes/custom/asides/
```

### 3. HTML の確認・編集

カテゴリリストを表示する HTML `source/_includes/custom/asides/category_list.html` は以下のようになっている。必要なら編集する。

File: `source/_includes/custom/asides/category_list.html`

{% highlight html linenos %} 
<section>
  <h1>Categories</h1>
  <ul id="category-list">{{ "{% category_list counter:true " }}%}</ul>
</section>
{% endhighlight %}

`counter:true` は件数を表示する。件数を表示しないなら `counter:false` とする。

### 4. サイドバー表示設定

サイドバーにカテゴリリストを表示させる為、`_config.yml` を編集する。  
`custom/asides/category_list.html`, `custom/asides/tag_cloud.html` を表示させたい位置に挿入する。

File: `_config.yml`

{% highlight text linenos %} 
# list each of the sidebar modules you want to include, in the order you want them to appear.
# To add custom asides, create files in /source/_includes/custom/asides/ and add them to the list like 'custom/asides/custom_aside_name.html'
default_asides: [asides/recent_posts.html, custom/asides/category_list.html, asides/github.html, asides/twitter.html, asides/delicious.html, asides/pinboard.html, asides/googleplus.html]
{% endhighlight %}

### 5. tag_cloud.rb の編集

当方は、`http://＜サーバホスト名＞/hoge` のようにサブディレクトリを使用する方法を採っている。
これだと、生成される URL が不正となるので、以下のように編集した。(２ヶ所)

File: `plugins/tag_cloud.rb`

{% highlight ruby linenos %} 
      #        :
      # ====< 省略 >====
      #        :
      #category_dir = config['root'] + config['category_dir'] + '/'
      category_dir = '/' + config['category_dir'] + '/'
      #        :
      # ====< 省略 >====
      #        :
      #category_dir = config['root'] + config['category_dir'] + '/'
      category_dir = '/' + config['category_dir'] + '/'
      #        :
      # ====< 省略 >====
      #        :
{% endhighlight %}

### 6. デプロイ

`generate` 後 `preview` で確認し `deploy` する。

``` text
$ rake generate
$ rake preview
$ rake deploy
```

### 7. 後始末

`git clone` でダウンロードした `octopress-tagcloud` ディレクトリは不要なので削除する。

``` text
$ rm -rf octopress-tagcloud
```

---

これで、サイドバーにカテゴリリストが表示されます。  

今回の作業でタグクラウドも取り込んでいますが、このままではタグクラウドではなくタグクラウド状のカテゴリリストとなってしまいます。  
次回改修してみます。

以上。

