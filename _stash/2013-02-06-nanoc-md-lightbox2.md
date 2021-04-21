---
layout   : single
title    : "nanoc - Markdown 記法 + Lightbox2 で画像を美麗表示！"
published: true
date     : 2013-02-06 00:20:00 +0900
comments : true
categories:
- ブログ
tags:
- Ruby
- nanoc
- Markdown
---

Lightbox2 は言わずと知れた Web 上で画像をクリックした際に綺麗に表示してくれるものです。

当方 Ruby on Rails や WordPress で使用してきましたが、この Lightbox2 を [nanoc](http://nanoc.stoneship.org/ "nanoc") の Markdown 記法で実現させるための方法について記録しておきます。

<!--more-->

### 0. 前提条件

- Linux Mint 14 Nadia (64bit) での作業を想定。
- nanoc 3.4.3 を使用。
- Ruby 1.9.3-p362 を使用。
- nanoc 用ブログヘルパー（Blogging, Rendering, LinkTo, Tagging）のインクルード設定済み。
- Markdown パーサに Kramdown を使用している。
- nanoc 自体が汎用性・拡張性が高い CMS であるので、今回紹介する方法もファイル名やディレクトリ構成等も当方独自にカスタマイズを施している。適宜読み替えること。

### 1. 事前準備

LightBox による画像表示の前に、 Markdown 記法で画像を表示させる方法（記述方法）について説明する。

まず、画像表示の前に Markdown 記法でリンクを貼るには以下のようにする。

``` bash 
[参考サイト](http://foo.bar/ "クリックで移動する")
```

この例では、「参考サイト」というリンクにマウスオーバーすると「クリックで移動する」と表示がポップアップし、リンクをクリックすることで `http://foo.bar/` に遷移する。

そして、Markdown 記法で画像を挿入するには以下のようにする。

``` bash 
![画像テスト](/path/to/img.jpg "これはテスト画像")
```

この場合は、`/path/to/img.jpg` の画像に「画像テスト」という `alt` 属性が、「これはテスト画像」という `title` 属性（マウスオーバー時のポップアップ）が付くようになる。  
`title` 属性が不要なら無くてもよい。

ここまでは、Markdown 記法の標準機能である。

さらに、Markdown のパーサーに Kramdown を使用している場合はオプションで画像サイズも指定できる。  
以下のように末尾にオプションを追加すればよい。

``` bash 
![画像テスト](/path/to/img.jpg "これはテスト画像"){: width="320"}
```

これらを応用して、指定のサイズで画像リンクを作成するには以下のようにする。

``` bash 
[![画像テスト](/path/to/img.jpg){: width="320"}](/path/to/img.jpg "これはテスト画像")
```

リンク文字の部分を画像に置き換えればよいだけのこと。

### 2. Lightbox2 ダウンロード

まず、Lightbox2 のアーカイブファイルを [こちら](http://lokeshdhakar.com/projects/lightbox2/ "Lightbox 2") のダウンロードリンクからダウンロードして適当な場所に解凍しておく。  
当方は、当記事執筆時点で 1.7.2 が最新であったので、1.7.2 をダウンロード＆解凍した。

### 3. ファイルの配置

ダウンロード＆解凍したファイルの中から、必要な JavaScript ファイル, CSS ファイル, 画像ファイルを適切な場所を配置する。  
当方は以下のように配置した。（配置したファイルのみ記載。ディレクトリ構成は当方の場合であるので、適宜読み換えること）  
ダウンドーロ＆解凍した中には他にも多数ファイルはあるが、使用するのは以下のみでよい。

``` text
nanoc
+-- content
    +-- assets
        +-- images
             +-- close.png
             +-- loading.gif
             +-- next.png
             +-- prev.png
        +-- javascripts
             +-- jquery-1.7.2.min.js
             +-- lightbox.js
        +-- stylesheets
             +-- lightbox.css
```

nanoc は、デフォルトではファイル名に２個以上のドット（ピリオド）があるとうまく行かない（１つ目のドットより後ろが拡張子と判断されてしまう）。  
`config.yaml` の `allow_periods_in_identifiers` の値を `true` にすれば解消する。（ファイル名をファイルにドットが１つになるように変更してもよいが）

なお、コンパイル後は `nanoc/content` 配下の上記のファイルを `nanoc/output` ディレクトリ配下へ同じディレクトリ構成でコピーすることにする。

### 4. ファイル編集

ディレクトリ構成が異なるかもしれないので、 `lightbox.js` や `lightbox.css` の画像のパスを確認・編集する。  
当方は以下のようにした。

File: `content/assets/javascripts/lightbox.js`

{% highlight js linenos %}
    :
      this.fileLoadingImage = '/assets/images/loading.gif';
      this.fileCloseImage = '/assets/images/close.png';
    :
{% endhighlight %}

File: `content/assets/stylesheets/lightbox.css`

{% highlight js linenos %}
    :
  background: url(/assets/images/prev.png) left 48% no-repeat;
    :
  background: url(/assets/images/next.png) right 48% no-repeat;
    :
{% endhighlight %}

### 5. Rules 編集

nanoc のコンパイル、ルーティングルールを編集する。  
以下は当方の例の抜粋で、 `/assets/javascripts/` ディレクトリ配下の全ファイルと `/assets/stylesheets/lightbox.css` はコンパイルしないように、CSS ファイルと JavaScript ファイルは「そのまま」移動先へコピーするようにしている。  
上記の「そのまま」とは、「拡張子を除いたファイル名 / index.html」（以下の `case` 文の `else` の部分）にならないための措置。

File: `Rules`

{% highlight ruby linenos %}
compile '/assets/javascripts/*/' do
  # don’t filter or layout
end

compile '/assets/stylesheets/lightbox/' do
  # don’t filter or layout
end

route '*' do
  if item.binary?
    # Write item with identifier /foo/ to /foo.ext
    item.identifier.chop + '.' + item[:extension]
  else
    case item[:extension]
    when 'css'
      item.identifier.chop + '.' + item[:extension]
    when 'js'
      item.identifier.chop + '.' + item[:extension]
    else
      # Write item with identifier /foo/ to /foo/index.html
      item.identifier + 'index.html'
    end
  end
end

{% endhighlight %}

### 6. JavaScript, CSS 読み込み設定

Lightbox2 用の JavaScript, CSS ファイルを読み込むように HTML の head タグ内に以下のような記述を追加する。

File: `layouts/_head.html`

{% highlight html linenos %}
<link rel="stylesheet" type="text/css" href="/assets/stylesheets/lightbox.css" media="screen">
<script src="/assets/javascripts/jquery-1.7.2.min.js" type="text/javascript"></script>
<script src="/assets/javascripts/lightbox.js" type="text/javascript"></script>
{% endhighlight %}

### 7. 記事作成

Markdown 記法で画像を表示させる記事を記述してみる。  
以下は当方の例の抜粋。

File: `content/articles/2013-01-20-test-img-by-md.ｍｄ`

{% highlight text linenos %}
   :

![Dayan Zhanchi]({{site.baseurl}}/images/2013/01/20/DAYAN_ZHANCHI_W.JPG)

![Dayan Zhanchi]({{site.baseurl}}/images/2013/01/20/DAYAN_ZHANCHI_W.JPG "Dayan製Zhanchiです。")

![Dayan Zhanchi]({{site.baseurl}}/images/2013/01/20/DAYAN_ZHANCHI_W.JPG){: width="320"}

[![Dayan Zhanchi]({{site.baseurl}}/images/2013/01/20/DAYAN_ZHANCHI_W.JPG)]({{site.baseurl}}/images/2013/01/20/DAYAN_ZHANCHI_W.JPG "Dayan製Zhanchiです。")

[![Dayan Zhanchi]({{site.baseurl}}/images/2013/01/20/DAYAN_ZHANCHI.JPG){: width="320"}]({{site.baseurl}}/images/2013/01/20/DAYAN_ZHANCHI.JPG "Dayan Zhanchi 黒素体"){: rel="lightbox[Zhanchi]"}

[![Dayan Zhanchi]({{site.baseurl}}/images/2013/01/20/DAYAN_ZHANCHI_W.JPG){: width="320"}]({{site.baseurl}}/images/2013/01/20/DAYAN_ZHANCHI_W.JPG "Dayan Zhanchi 白素体"){: rel="lightbox[Zhanchi]"}

   :
{% endhighlight %}

上から、

1. 実サイズで画像を表示する。
2. 実サイズで画像を表示し、画像にマウスオーバーするとコメントを表示する。
3. 画像を横幅 320px に拡縮して表示する。（Kramdown 特有の機能）
4. 実サイズの画像を表示し、画像をクリックすると実サイズの画像を表示する。マウスオーバーでコメントも表示する。
5. 画像を横幅 320px に拡縮して表示し、画像をクリックすると Lightbox2 で画像を表示する。（6 の画像と同じグループとして扱う）
6. 5 と同様、画像を横幅 320px に拡縮して表示し、画像をクリックすると Lightbox2 で画像を表示する。（5 の画像と同じグループとして扱う）

となるはず。（全ての `img` タグの `alt` 属性に `Dayan Zhanchi` を設定している）  
`a` タグの `rel` 属性に `lightbox` を指定することで Lightobx2 を使用できる。さらに、`lightbox[hoge]` のようにすることで `[ ]` 内の同じ単語の画像が同一グループとして扱われる。

ちなみに、Dayan とは立体パズルメーカーの名称で、Zhanchi は商品名。テストに使用した画像が立体パズルなので・・・）

### 8. 確認

nanoc をコンパイルしてプレビューで確認してみる。  
以下は、前項の `5` の実行結果で Lightbox2 が機能しているのが分かる。

![NANOC_MD_LIGHTBOX2]({{site.baseurl}}/images/2013/02/06/NANOC_MD_LIGHTBOX2.png "NANOC_MD_LIGHTBOX2")

### 9. 参考サイト

- [Lightbox 2](http://lokeshdhakar.com/projects/lightbox2/ "Lightbox 2")

---

これで、nanoc でも画像を Lightbox2 で綺麗に表示させることができるようになりました。  
（Lightbox2 等を使用しなくても画像表示はできます。こだわらなければ、Lightbox2 を使用しなくてもよいです）

環境やディレクトリ構成が異なるかもしれないので、今回紹介したとおりにはならないかもしれませんが、参考になれば幸いです。

ちなみに、nanoc によるブログを Octopress による[メインのブログ](http://www.mk-mode.com/octopress/ "mk-mode BLOG")のクローンとして公開しています。

- [mk-mode BLOG (by nanoc)](http://www.mk-mode.com/nanoc/ "mk-mode BLOG (by nanoc)")

但し、[mk-mode BLOG (by Octopress)](http://www.mk-mode.com/octopress/ "mk-mode BLOG (by Octopress)")の記事を機械的に変換しているため、人知の及ばない部分もあるかと思います。ご了承下さい。

以上。

