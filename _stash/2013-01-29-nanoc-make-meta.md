---
layout   : single
title    : "nanoc - 記事作成時にメタデータを自動作成！"
published: true
date     : 2013-01-29 00:20:00 +0900
comments : true
categories:
- ブログ
tags:
- Ruby
- nanoc
---

[nanoc](http://nanoc.stoneship.org/ "nanoc") でブログ記事を作成する際、その都度ブログ用のタグ `kind`、 `created_at` を記述するのはほんの少しだけ面倒です。

今回は、記事を新規作成する際に自動で `kind`、 `created_at` をセットする方法についてです。

<!--more-->

### 0. 前提条件

- Linux Mint 14 Nadia (64bit) での作業を想定。
- nanoc 3.4.3 を使用。
- Ruby 1.9.3-p362 を使用。
- 記事作成先は `./content/articles`
- 記事のファイル名は `yyyy-mm-dd-hogehoge.md` （タイトルに日本語を指定しても大丈夫）

### 1. 必要パッケージインストール

以下の作業で必要になる `stringex` という日本語タイトルをローマ字に変換するための RubyGems パッケージをインストールする。

``` bash 
$ sudo gem install stringex
```

実際は、ローマ字変換がうまく行かない（中国語読み？に変換される）ので、日本語タイトルは使用しない方がよいかもしれない。  
よって、日本語タイトルを使用しないのならこのパッケージもインストールする必要もない。

### 2. Rakefile 作成

nanoc ルートに以下のような内容で Rakefile を作成する。（[参考サイト](http://www.yet.org/2012/11/nanoc/ "nanoc | yet.org")を若干編集している）

File: `Rakefile`

{% highlight ruby linenos %}
require 'stringex'
desc "Create a new post"
task :new_post, :title do |t, args|
  mkdir_p './content/articles'
  args.with_defaults(:title => 'New Post')
  title = args.title
  filename = "./content/articles/#{Time.now.strftime('%Y-%m-%d')}-#{title.to_url}.md"
  created_at = Time.now.strftime('%Y/%m/%d %H:%M:%S')

  if File.exist?(filename)
    abort('rake aborted!') if ask("#{filename} already exists. Want to overwrite?", ['y','n']) == 'n'
  end

  puts "Creating new post: #{filename}"
  open(filename, 'w') do |post|
    post.puts '---'
    post.puts "title: \"#{title}\""
    post.puts "created_at: #{created_at}"
    post.puts 'kind: article'
    post.puts "---\n\n"
  end
end
{% endhighlight %}

### 3. 記事作成

先ほど作成した Rakefile を利用して新しい記事を作成する。  
タイトルを指定しなかった場合は、タイトルが `New Post`、ファイル名が `yyyy-mm-dd-new_post.md` となる。

``` bash 
$ rake new_post['記事作成TEST']
mkdir -p ./content/articles
Creating new post: ./content/articles/2013-01-20-ji-shi-zuo-cheng-test.md
```

日本語のローマ字変換はうまく行かないようなので、タイトルは半角英数で指定したほうが良さそうだ。

### 4. 記事内容確認

作成されたファイルの内容を確認してみる。

File: `content/articles/2013-01-20-ji-shi-zuo-cheng-test.md`

{% highlight text linenos %}
---
title    : "記事作成TEST"
created_at: 2013/01/20 21:34:05
kind: article
---
ここから記事本文。

{% endhighlight %}

`title` に指定されたタイトルが設定され、`created_at`、 `kind` も正常に設定されている。  
後は、記事を作成していけばよい。

### 5. 参考サイト

- [nanoc - yet.org](http://www.yet.org/2012/11/nanoc/ "nanoc - yet.org")

---

これで、ブログ記事新規作成時に少しだけ手間が省けます。  
場合によっては、`tags`, `categories`, `published` 等も追加します。  
また、今回の方法以外に、コンパイル時に `kind`, `created_at` を追加する方法もあるようです。

（とは言え、当方は普段は既存の記事を複製して新しい記事にすることが多いのですが。。。）

ちなみに、当記事執筆時点では nanoc によるブログは公開していません。  
しかし、現在メインで公開しているブログを今後移行するのかも知れませんし、メインのブログとは別にサブ（もしくは、クローン）として今後公開するかも知れません。あしからず。

以上。

