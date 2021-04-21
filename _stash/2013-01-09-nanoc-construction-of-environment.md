---
layout   : single
title    : "nanoc - 環境構築！"
published: true
date     : 2013-01-09 00:20:00 +0900
comments : true
categories:
- ブログ
tags:
- nanoc
- Ruby
---

Ruby 製の静的 CMS である [nanoc: a Ruby site compiler that generates static HTML](http://nanoc.stoneship.org/ "nanoc: a Ruby site compiler that generates static HTML") の環境を構築する方法についての記録です。

[nanoc: a Ruby site compiler that generates static HTML](http://nanoc.stoneship.org/ "nanoc: a Ruby site compiler that generates static HTML") については、以下で分かりやすく説明されています。（ちなみに、当方と同じ Ruby City MATSUE にある会社の方の資料です）

- [軽い! 速い! サーバを選ばない! Ruby製CMS "nanoc"](http://www.slideshare.net/g_maeda/rubycms-nanoc "軽い! 速い! サーバを選ばない! Ruby製CMS "nanoc"")

<!--more-->

### 0. 前提条件

- ローカル作業環境は Linux Mint 13 Maya (64bit)
- ローカル環境に Ruby 1.9.3-p327 がインストール済み。（Ruby は 1.8.6(1.9系含む) 以上である必要がある）
- RubyGems 1.8.24 がインストール済み。（RubyGems は 1.3.5 以上である必要がある）
- 今回作成するサイト名は `nanoc` とした。
- 作成するディレクトリはユーザルートとした。

### 1. nanoc インストール

nanoc の RubyGems パッケージをインストールする。  
インストール完了後、インストールできているかバージョンを表示させて確認してみる。

``` bash 
$ sudo gem install nanoc
$ nanoc --version
nanoc 3.4.3 © 2007-2012 Denis Defreyne.
Running ruby 1.9.3 (2012-11-10) on x86_64-linux with RubyGems 1.8.24.
```

### 2. adsf インストール

ローカルでプレビュー確認するのに必要な adsf の RubyGems パッケージをインストールする。  
インストール完了後、インストールできているか確認してみる。

``` bash 
$ sudo gem install adsf
$ gem list | grep adsf
adsf (1.1.1)
```

### 3. サイト作成

nanoc サイトの雛形を作成する。（最後の `nanoc` はサイト名）

``` bash 
$ nanoc create_site nanoc
      create  config.yaml
      create  Rules
      create  content/index.html
      create  content/stylesheet.css
      create  layouts/default.html
Created a blank nanoc site at 'nanoc'. Enjoy!
```

この時点で、作成されたディレクトリ配下は以下のようなになっているはず。

``` ruby 
Rules        # 各種ルール
config.yaml  # 設定
content/     # コンパイル元となるコンテンツ用ディレクトリ
layouts/     # サイトのレイアウト用ディレクトリ
lib/         # コンパイル時に読み込まれるライブラリ用ディレクトリ
output/      # コンパイルされたデータ格納用ディレクトリ
```

### 4. コンパイル

取り敢えず、今の時点（デフォルトのまま）でコンパイルしてみる。

``` bash 
$ cd nanoc
$ nanoc compile
Loading site data…
Compiling site…
      create  [0.00s]  output/index.html
      create  [0.00s]  output/style.css

Site compiled in 0.03s.
```

`output` ディレクトリにファイルが作成される。（一時作業ディレクトリ `tmp` も作成される）

### 5. サイト確認

以下のようにすると WEBrick サーバが起動するので、ブラウザで `http://localhost:3000/` にアクセスしてみる。

``` bash 
$ nanoc view
[2012-12-21 16:32:47] INFO  WEBrick 1.3.1
[2012-12-21 16:32:47] INFO  ruby 1.9.3 (2012-11-10) [x86_64-linux]
[2012-12-21 16:32:47] INFO  WEBrick::HTTPServer#start: pid=23610 port=3000
```

以下のような画面が表示されるはず。

![NANOC_1]({{site.baseurl}}/images/2013/01/09/NANOC_1.png "NANOC_1")

### 6. ページ作成

新たなページを作成するには以下のコマンドを使用する。（既存のファイルをコピーしてもOK）  
ファイルが生成されたら、編集する。

``` bash 
$ nanoc create_item foo
```

### 7. レイアウト編集

nanoc サイトのレイアウト編集は、`layouts` ディレクトリ配下のファイルを編集すればよい。

### 8. 日々の作業

nanoc サイトの日々の作業は、基本的に以下の手順となる。

``` bash 
$ nanoc create_imte foo  # <- ページ作成・編集
$ nanoc compile          # <- コンパイル
$ nanoc view             # <- プレビュー
```

### 参考サイト

- [nanoc: a Ruby site compiler that generates static HTML](http://nanoc.stoneship.org/ "nanoc: a Ruby site compiler that generates static HTML")
- [WordPressからnanocに移行しました - ナレッジエース](http://n.blueblack.net/articles/2012-05-03_01_initial_post/ "WordPressからnanocに移行しました - ナレッジエース")
- [軽い! 速い! サーバを選ばない! Ruby製CMS "nanoc"](http://www.slideshare.net/g_maeda/rubycms-nanoc "軽い! 速い! サーバを選ばない! Ruby製CMS "nanoc"")

---

[nanoc: a Ruby site compiler that generates static HTML](http://nanoc.stoneship.org/ "nanoc: a Ruby site compiler that generates static HTML") はデフォルトではシンプルに感じる CMS ですが、ヘルパー等を利用することでブログサイトを構築したりすることも可能です。  
自由度が高いということになるでしょうか。

RubyGems の kramdown をインストールすれば Markdown 記法での利用もできます。  
Rails のように ERB も使用できます。

静的 CMS のため、動的処理が売りの CMS にはかなわない部分もありますが、静的 CMS ならではのメリットも存分に味わえます。

今は、ホームページは [Ruby on Rails](http://rubyonrails.org/ "Ruby on Rails") で、ブログは [Octopress](http://octopress.org/ "Octopress") で運用しているので、nanoc を常用するかどうかは不明ですが。

以上。

