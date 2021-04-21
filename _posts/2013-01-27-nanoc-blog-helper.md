---
layout   : single
title    : "nanoc - ブログ用ヘルパーを使用！"
published: true
date     : 2013-01-27 00:20:00 +0900
comments : true
categories:
- ブログ
tags:
- Ruby
- nanoc
---

[nanoc](http://nanoc.stoneship.org/ "nanoc") に標準で準備されているヘルパーを使用することで、 [nanoc](http://nanoc.stoneship.org/ "nanoc") で容易にブログサイトを構築することができます。

当方と同じ Ruby City MATSUE の方の次の資料が大変参考になりました。

- [松江Ruby会議02のライトニングトークでnanocの発表を行いました - maeda.log](http://maeda.farend.ne.jp/blog/2010/02/14/matrk02-nanoc/ "松江Ruby会議02のライトニングトークでnanocの発表を行いました - maeda.log")

<!--more-->

### 0. 前提条件

- Linux Mint 14 Nadia (64bit) での作業を想定。
- nanoc 3.4.3 を使用。
- Ruby 1.9.3-p362 を使用。

環境は多少異なっても以下の作業にさほど影響しないと思う。（Windows なら文字コード関連で調整が必要になるかも？）

### 1. 使用するヘルパー

nanoc サイトをブログサイトにするには以下のヘルパーを使用する。

1. Blogging Helper  
   ブログサイトを構築するのに役立つ機能。
2. Rendering Helper  
   レイアウトを部分テンプレートとして描画する機能。
3. LinkTo Helper  
   リンク生成の機能。

### 2. ヘルパーのインクルード設定

前述の３つのヘルパーを使用するために、`lib/default.rb` にインクルードする設定を記述する。

File: `lib/default.rb`

{% highlight ruby linenos %}
include Nanoc3::Helpers::Blogging
include Nanoc3::Helpers::Rendering
include Nanoc3::Helpers::LinkTo
{% endhighlight %}

`lib` ディレクトリ配下にあるファイルは全て読み込まれるので、必ずしも `lib/default.rb` でなくてもよい。  
当方は、今のところインクルードするものだけを `lib/default.rb` に記述するようにしている。

### 3. ページ作成

テスト用にページを作成する。

``` bash 
$ nanoc create_item test-post
      create  content/test-post.html
An item has been created at /test-post/.
```

### 4. ページ編集

そのページがブログの記事であると認識できるようにするには、メタデータ部分に追加の記述をすることになっている。  
最低限、`kind` に `article` を、`created_at` に記事作成日時を Time.parse で処理可能なフォーマットで設定する。

File: `content/test-post.html`

{% highlight bash linenos %}
---
kind: article
title: TEST [ Post ]
created_at: 2013/01/13 00:20:00
---

<h2>Hi, I'm a new item!</h2>
{% endhighlight %}

毎回編集するのが面倒なら、ページ作成時に自動で挿入されるようにすることも可能。（Rakefile を細工する）

### 4. 確認

コンパイルして作成される画面をブラウザで確認してみる。  
URL は `http://127.0.0.1:3000/test-post/` となる。

``` bash 
$ nanoc compile
Loading site data…
Compiling site…
      create  [0.00s]  output/test-post/index.html
      update  [0.00s]  output/index.html

Site compiled in 0.03s.
$ nanoc view
[2013-01-13 12:31:00] INFO  WEBrick 1.3.1
[2013-01-13 12:31:00] INFO  ruby 1.9.3 (2012-12-25) [x86_64-linux]
[2013-01-13 12:31:00] INFO  WEBrick::HTTPServer#start: pid=10419 port=3000
```

![NANOC_1]({{site.baseurl}}/images/2013/01/27/NANOC_1.png "NANOC_1")

見た目では分からないが、そのページがブログの記事として扱われる。  
上記の例では、デザインをデフォルトからカスタマイズしている。（トップページと記事のページのレイアウトを振り分けるようにしたり、記事データをサブディレクトリ化したりもしている）  
タイトルや投稿日時は `<%= @item[:title] %>` や `<%= @item[:created_at] %>` で取得できる。

### 5. 参考サイト

- [nanoc: a Ruby site compiler that generates static HTML](http://nanoc.stoneship.org/ "nanoc: a Ruby site compiler that generates static HTML")
- [Module: Nanoc::Helpers — Documentation by YARD 0.8.3](http://nanoc.stoneship.org/docs/api/3.4/Nanoc/Helpers.html "Module: Nanoc::Helpers — Documentation by YARD 0.8.3")
- [松江Ruby会議02のライトニングトークでnanocの発表を行いました - maeda.log](http://maeda.farend.ne.jp/blog/2010/02/14/matrk02-nanoc/ "松江Ruby会議02のライトニングトークでnanocの発表を行いました - maeda.log")

---

Ruby on Rails は使い慣れているので、ERB（`<%=  %>` というような記述）が使えるのが嬉しいです。  
但し、nanoc は汎用性が高い CMS なので、完全にブログシステムと利用できるようになるまでには時間がかかりそうです。  
Ruby を知らない方には、敷居が高く感じられるかも知れませんね。

ちなみに、当記事執筆時点では nanoc によるブログは公開していません。  
しかし、現在メインで公開しているブログを今後移行するのかも知れませんし、メインのブログとは別にサブ（もしくは、クローン）として今後公開するかも知れません。あしからず。

以上。

