---
layout   : single
title    : "Ruby - ディレクトリ配下の全 Markdown ファイルからリンク一覧を取得！"
published: true
date     : 2013-08-24 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
- Markdown
---

あるディレクトリ配下に存在する全てのファイル（Markdown ファイル）から、リンク（リンクテキスト、リンクアドレス、リンクタイトル）を全て抽出し一覧にすることについてです。

Markdown 記法とは、簡単に言えば、容易に HTML (HyperText Markup Language) に変換できる記法（Markup の反対という意味で Markdown）のことですが、ブログシステム等で採用しているものも多数有ります。  
また、普段からのプレーンテキスト入力時にも Markdown 記法を使用することでフォーマットが統一化され、可読性も良くなることから、当方はいつも Markdown を意識して入力するようにしています。

<!--more-->

ちなみに、Markdown 記法でのリンクは以下のようなフォーマットにすることとなっています。

``` text 
[リンクテキスト](リンクアドレス "リンクタイトル")
```

そして、この記述は HTML に変換されると以下のようになるはずです。

``` html 
<a href="リンクアドレス" title="リンクタイトル">リンクテキスト</a>
```

以下、指定のディレクトリ配下の全ファイルから全てのリンクを取得する Ruby スクリプトの紹介です。

#### 0. 前提条件

- Linux Mint 14 (64bit) での作業を想定。
- Ruby 2.0.0-p247 で作業・動作確認。
- Markdown ファイルとは言っているものの、実体はプレーンテキストファイルである、ということを認識しておく。  
  したがって、ファイルの拡張子等で Markdown か否かの判定は行わない。
- Markdown パーサや HTML パーサは使用せず、純粋にテキストファイルを読み込んで正規表現で該当箇所を抽出する。
- 指定するディレクトリ配下にサブディレクトリがあってもよい。（再帰的にファイル一覧を取得するので）
- 指定するディレクトリ配下にプレーンテキストファイルではないファイル（バイナリ）があってもよい。  
  （正常に読み込めなければスキップするため）
- ソースコードブロック内か否かの判定はしない。

#### 1. Ruby スクリプト作成

例として、以下のように Ruby スクリプトを作成した。

File: `get_link_list_md.rb`

{% highlight ruby linenos %}
# チェックするディレクトリ
DIR_TARGET = "md_dir"

# [CLASS] リンク一覧取得
class GetLinkListMd
  def initialize
    # ファイル一覧取得 ( 再帰的に )
    @ary_files = Array.new
    Dir.glob("#{DIR_TARGET}/**/*").sort.each do |f|
      @ary_files << f if File::ftype(f) == "file"
    end
    # 結果格納用配列
    @ary_list = Array.new
  end

  # リンク一覧取得
  def get_link_list
    begin
      @ary_files.each do |fname|
        open(fname) do |f|
          while l = f.gets
            begin
              if l =~ /\[(.*?)\]\((.*?)\s"(.*?)"\)/
                @ary_list << [ fname, $1, $2, $3 ]
              end
            rescue => ex
              puts "[READ ERROR!] #{fname}.\n\t#{ex}\n\tSkipped."
            end
          end
        end
      end
    rescue => e
      STDERR.puts "[ERROR][#{self.class.name}.get_link_list] #{e}"
      exit 1
    end
  end

  # 結果表示
  def display
    begin
      @ary_list.each do |r|
        puts "[ File : #{r[0]} ]"
        puts "\tText    : #{r[1]}"
        puts "\tAddress : #{r[2]}"
        puts "\tTitle   : #{r[3]}"
      end
    rescue => e
      STDERR.puts "[ERROR][#{self.class.name}.display] #{e}"
      exit 1
    end
  end
end

# リンク一覧取得
puts "CHECK [ #{DIR_TARGET} ]"
obj_main = GetLinkListMd.new
obj_main.get_link_list
obj_main.display
{% endhighlight %}

- [Gist - Ruby script to get a link list from markdown files in a directory recursively.](https://gist.github.com/komasaru/6199786 "Gist - Ruby script to get a link list from markdown files in a directory recursively.")

#### 2. Ruby スクリプト実行

まず、リンク一覧を抽出したいディレクトリを準備（決定）する。  
当方は、Ruby スクリプトと同じディレクトリに "md_dir" というディレクトリを準備し Markdown ファイルを複数を準備した。（実際は Octopress ブログの記事ディレクトリを複製して作成した）  
また、実験的にバイナリファイル（アイコンファイル）も配置した。  
そして、作成した Ruby スクリプトを実行してみる。  

``` bash 
ruby get_link_list_md.rb
CHECK [ md_dir ]
[READ ERROR!] md_dir/favicon.ico.
        invalid byte sequence in UTF-8
        Skipped.
[ File : md_dir/2013-08-11-vim-install-fugitive.markdown ]
        Text    : tpope/vim-fugitive
        Address : https://github.com/tpope/vim-fugitive
        Title   : tpope/vim-fugitive
[ File : md_dir/2013-08-11-vim-install-fugitive.markdown ]
        Text    : 過去記事
        Address : /2013/08/10/vim-install-vundle
        Title   : Vim - Vundle インストール！
[ File : md_dir/2013-08-11-vim-install-fugitive.markdown ]
        Text    : tpope/vim-fugitive
        Address : https://github.com/tpope/vim-fugitive
        Title   : tpope/vim-fugitive
[ File : md_dir/2013-08-12-vim-install-gitv.markdown ]
        Text    : Vim - Git 用プラグイン vim-fugitive のインストール！
        Address : /2013/08/11/vim-install-fugitive
        Title   : Vim - Git 用プラグイン vim-fugitive のインストール！
[ File : md_dir/2013-08-12-vim-install-gitv.markdown ]
        Text    : 過去記事
        Address : /2013/08/10/vim-install-vundle
        Title   : Vim - Vundle インストール！
        :
===< 以下省略 >===
        :
```

正常に取得できている。（バイナリファイルは読み飛ばしてる）

---

当方、Ruby 製ブログシステム Octopress で記事作成に Markdown 記法を使用していますが、記事内のリンクが切れていないかどうかを判定するのに利用できないかと思った次第です。  
※実際には Markdown ファイルを読み込んで処理するより、生成後の HTML ファイルを読み込んで処理する方が簡単でした。（後日談）

ファイルが Markdown である必要もありませんし、他のことにも応用できるのではないでしょうか？

以上。

