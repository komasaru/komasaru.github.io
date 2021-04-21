---
layout   : single
title    : "nanoc - Markdown でコード表示！"
published: true
date     : 2013-02-05 00:20:00 +0900
comments : true
categories:
- ブログ
tags:
- Ruby
- nanoc
- Markdown
---

[nanoc](http://nanoc.stoneship.org/ "nanoc") の Markdown 記法によるページでソースコードをハイライト表示（シンタックスハイライト）させる方法についてです。

nanoc の ColorizeSyntax というフィルターを使用します。

<!--more-->

### 0. 前提条件

- Linux Mint 14 Nadia (64bit) での作業を想定。
- nanoc 3.4.3 を使用。
- Ruby 1.9.3-p362 を使用。
- nanoc 用ブログヘルパー（Blogging, Rendering, LinkTo, Tagging）のインクルード設定済み。
- Markdown パーサに Kramdown を使用している。
- ハイライトに使用する手法は CodeRay とした。（Pygmentize, Pygmentrb 等も選択可能）
- スタイルは HTML タグで `style` 属性を使用するのではなく、 `class` 属性と CSS ファイルを使用する。

### 1. CodeRay インストール

今回はスタイルシートを使用するので、スタイルシートの雛形を作成してくれるコマンドを使用できるように CodeRay をインストールする。  
`apt-get` でインストールするなら以下のようにする。

``` bash 
$ sudo apt-get install coderay
```

### 2. RubyGem パッケージインストール

シンタックスハイライトをするための RubyGems パッケージ `coderay` をインストールする。  
さらに、HTML 解析等するためパッケージ `nokogiri` も必要のようなのでインストールする。

``` bash 
$ sudo gem install coderay
$ sudo gem install nokogiri
```

ちなみに、`nokogiri` をインストールするには `libxml2`, `libxml2-dev`, `libxslt1.1`, `libxslt1-dev` がインストール済みである必要があるので、あらかじめパッケージマネージャか `apt-get` 等でインストールしておく。

### 3. Rules 編集

Kramdown によるフィルター処理の後に ColorizeSyntax のフィルター処理を行うようにする。  
さらに、Kramdown フィルターがデフォルトで CodeRay を有効にしているので無効に設定しおく。  
以下は当方の例。（環境により適宜読み替えて下さい）

File: `Rules`

{% highlight ruby linenos %}
compile '/articles/*/' do
  filter :erb
  filter :kramdown, :enable_coderay => false
  filter :colorize_syntax,
         :coderay    => {
           :css => :class,
           :line_numbers => :table
         }
  layout 'article'
end
{% endhighlight %}

ちなみに、 `class` 属性＋ CSS ではなく `style` 属性で実現させるには、`:css => :class` の部分を `:css => :style` にすればよい。

### 4. CSS 雛形作成

今回は `class` 属性＋ CSS ファイルの運用とするので、CSS ファイルを作成する。  
以下のコマンドで CodeRay 用の CSS ファイルの雛形が作成される。  
作成された CSS ファイルを必要なら編集し適切な場所に配置する。当方は、nanoc 本体の CSS ファイルと同じディレクトリ `content/assets/stylesheets/` に配置した。

``` bash 
$ coderay stylesheet > coderay.css
```

ちなみに、 `coderay` と `stylesheet` を `_` でつなげたコマンドを使用するような説明をしているサイトもあったが現在は上記のようになっている。（ヘルプで確認できる。環境により異なるのかもしれないが。。。）

### 5. CSS 読み込み設定

作成した CSS ファイルを使用できるようにするために HTML の `head` タグ内に以下の記述を追加する。

File: `layouts/_head.html`

{% highlight html linenos %}
<link rel="stylesheet" type="text/css" href="/assets/stylesheets/coderay.css" media="screen">
{% endhighlight %}

### 6. Rules 編集

nanoc コンパイル時に、作成した CSS ファイルはコンパイルせずにそのまま指定に位置にコピーするよう `Rules` ファイルを編集する。  
以下は当方の例。（環境により適宜読み替えて下さい）

File: `Rules`

{% highlight ruby linenos %}
compile '/assets/stylesheets/coderay/' do
  # don’t filter or layout
end

route '/assets/stylesheets/coderay/' do
  '/assets/stylesheets/coderay.css'
end
{% endhighlight %}

### 7. 記事作成

Markdown 記法で記事を作成してみる。  
Markdown 記法では、行頭に４つの半角スペースか１つのタブがあるとコードブロックとみなされる。  
コードブロック直後の行に `{: .language-＜言語名＞}` のように表示させたい言語に合わせた記述を追加する。（これは Kramdown 特有の書き方）  
もしくは、コードを３個以上のチルダ `~` の行ではさみ、最初のチルダ行の末尾に言語名を付与する。（チルダと言語名の間には半角スペースが有っても無くてもOK）（これも Kramdown 特有の書き方）  
以下の例では２種類の書き方を試しているが、チルダ行で挟んで最後に `{: .language-＜言語名＞}` 行を追加する方法も可能。

File: `2013-01-19-test-syntaxhighlight.ｍｄ`

{% highlight text linenos %} 

  :

### 8. サンプルスクリプト

~~~ ruby
class Test1
  def test(foo, bar)
    puts "#{foo}, #{bar}"
  end
end

obj = Test1.new
obj.test
~~~

    void hello() {
      printf("Hello, world!\n");
    }
{: .language-c}

  :

{% endhighlight %}

### 9. 確認

コンパイルしてプレビューで確認してみる。  
以下は当方の例で、CSS ファイルを若干編集している。

![NANOC_MD_COLORIZESYNTAX]({{site.baseurl}}/images/2013/02/05/NANOC_MD_COLORIZESYNTAX.png "NANOC_MD_COLORIZESYNTAX")

行番号部分をダブルクリックすると行番号が表示されたり非表示になったりする。  
行番号をシングルクリックするとその行番号が強調される。

### 10. 参考サイト

- [Class: Nanoc::Filters::ColorizeSyntax — Documentation by YARD 0.8.3](http://nanoc.stoneship.org/docs/api/3.4/Nanoc/Filters/ColorizeSyntax.html "Class: Nanoc::Filters::ColorizeSyntax — Documentation by YARD 0.8.3")
- [Syntax - kramdown](http://kramdown.rubyforge.org/syntax.html "Syntax - kramdown")

---

取り敢えずは、ColorizeSyntax フィルタの CodeRay による最低限（？）のシンタックスハイライトができるようになりました。

ColorizeSyntax フィルタを使用せず Kramdown フィルタの機能で CodeRay を使用する方法もある。（と言うか、今は Kramdown フィルタを使用すればデフォルトで使用できる）  
Web で調査する際は、Kramdown フィルタのオプションとしての CodeRay 設定と、ColorizeSyntax のオプションとしての CodeRay 設定が混同しやすいので要注意です。  
当方も目的の情報（ColorizeSyntax での CodeRay 設定の「最近」の情報）が少なく（ほとんど無く）苦慮しました。

ちなみに、nanoc によるブログを Octopress による[メインのブログ](http://www.mk-mode.com/octopress/ "mk-mode BLOG")のクローンとして公開しています。

- [mk-mode BLOG (by nanoc)](http://www.mk-mode.com/nanoc/ "mk-mode BLOG (by nanoc)")

但し、[mk-mode BLOG (by Octopress)](http://www.mk-mode.com/octopress/ "mk-mode BLOG (by Octopress)")の記事を機械的に変換しているため、人知の及ばない部分もあるかと思います。ご了承下さい。

以上。

