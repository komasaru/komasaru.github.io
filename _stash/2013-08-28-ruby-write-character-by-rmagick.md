---
layout   : single
title    : "Ruby - RMagick で画像内に文字を描画！"
published: true
date     : 2013-08-28 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
- 画像
- ImageMagick
- RMagick
---

今回は、RMagick（Ruby で画像処理ライブラリ ImageMagick を扱える RubyGems ライブラリ）で画像内に文字を描画してみました。

実際は、前回の RMagick で利用可能なフォントの一覧画像を作成する処理の応用です。

- [Ruby - RMagick 利用可能フォント一覧画像作成！]({{site.baseurl}}/2013/08/26/ruby-available-fonts-of-rmagick "Ruby - RMagick 利用可能フォント一覧画像作成！")

以下、作成した Ruby スクリプト等の紹介です。

<!--more-->

#### 0. 前提条件

- Linux Mint 14 (64bit) での作業を想定。
- Ruby 2.0.0-p247 で作業・動作確認。
- 画像編集ソフト ImageMagick(当方は 6.7.7-10) インストール済み。
- RubyGems ライブラリ RMagick インストール済み。

#### 1. Ruby スクリプト作成

以下のような画像内にコピーライトを描画する Ruby スクリプトを作成してみた。  
概要はスクリプト内にコメントで記述している。（ちなみに、文字描画前の画像をリネームして退避させたり、背景の色合いによって可読性があまり悪くならないように文字に影を付けたりしている）

File: `write_copyright.rb`

{% highlight ruby linenos %}
require 'fileutils'
require 'RMagick'

# メッセージ
MSG_USAGE     = "USAGE: ruby write_copyright.rb filename"
MSG_NOT_EXIST = "File not exist!"
# フォント（存在するフォントファイルを指定する）
FONT    = '/usr/share/fonts/opentype/ipaexfont-gothic/ipaexg.ttf'
# 描画文字列
OUT_STR = "© 2013 mk-mode.com"

class Arg
  # 引数取得
  def get_arg
    begin
      if ARGV[0]
        # ファイルが存在しなければ終了
        unless File.exist?(ARGV[0])
          puts MSG_NOT_EXIST + " #{ARGV[0]}"
          exit
        end
      else
        # 引数無ければ終了
        puts MSG_USAGE
        exit
      end

      # ファイル名返却
      return ARGV[0]
    rescue => e
      STDERR.puts "[ERROR][#{self.class.name}.get_arg] #{e}"
      exit 1
    end
  end
end

class WriteCopyright
  def initialize(filename)
    @img_file = filename
  end

  # Copyright 描画
  def write_copyright
    FileUtils.cp(@img_file, @img_file + ".org", {:preserve => true})  # 元画像退避
    img  = Magick::ImageList.new(@img_file)  # 画像オブジェクト
    draw = Magick::Draw.new                  # 描画オブジェクト

    begin
      # 文字の影 ( 1pt 右下へずらす )
      draw.annotate(img, 0, 0, 4, 4, OUT_STR) do
        self.font      = FONT                      # フォント
        self.fill      = 'black'                   # フォント塗りつぶし色(黒)
        self.stroke    = 'transparent'             # フォント縁取り色(透過)
        self.pointsize = 16                        # フォントサイズ(16pt)
        self.gravity   = Magick::SouthEastGravity  # 描画基準位置(右下)
      end

      # 文字
      draw.annotate(img, 0, 0, 5, 5, OUT_STR) do
        self.font      = FONT                      # フォント
        self.fill      = 'white'                   # フォント塗りつぶし色(白)
        self.stroke    = 'transparent'             # フォント縁取り色(透過)
        self.pointsize = 16                        # フォントサイズ(16pt)
        self.gravity   = Magick::SouthEastGravity  # 描画基準位置(右下)
      end

      # 画像生成
      img.write(@img_file)
    rescue => e
      STDERR.puts "[ERROR][#{self.class.name}.write_copyright] #{e}"
      exit 1
    end
  end
end

# 引数取得
obj_arg = Arg.new
filename = obj_arg.get_arg

# Copyright 描画
obj_main = WriteCopyright.new(filename)
obj_main.write_copyright
{% endhighlight %}

- [Gist - Ruby script to write characters to a image file by RMagick.](https://gist.github.com/komasaru/6238151 "Gist - Ruby script to write characters to a image file by RMagick.")

#### 2. Ruby スクリプト実行

文字を描画したい画像を用意して、先ほど作成した Ruby スクリプトを実行してみる。

``` bash 
$ ruby write_copyright.rb COPYRIGHT_TEST.jpg
```

#### 3. 実行結果確認

【元の画像】

![WRITE_COPYRIGHT_1]({{site.baseurl}}/images/2013/08/28/WRITE_COPYRIGHT_1.jpg "WRITE_COPYRIGHT_1")

【文字描画後の画像】

![WRITE_COPYRIGHT_2]({{site.baseurl}}/images/2013/08/28/WRITE_COPYRIGHT_2.jpg "WRITE_COPYRIGHT_2")

画像の右下に文字が表示された。

#### 4. その他（コピーライトについて）

今回の例ではコピーライトを表示させている。

本来はこの世の全ての著作物には著作権が存在し、コピーライトを表示しなくとも著作物は保護されるべきである。

敢えてコピーライトを表示する場合は、最低限 "Copyright" もしくは © マーク、著作物の創造された年、著作権者名を表示すればよいことになっている。  
"Copyright © 2009-2013 hoge All rights reserved." のような記述方法は、より念を押した記述方法と言える。

#### 参考サイト

- [rmagick - RubyGems.org - your community gem host](http://rubygems.org/gems/rmagick "rmagick - RubyGems.org - your community gem host")
- [RMagick 2.12.0 User's Guide and Reference](http://studio.imagemagick.org/RMagick/doc/index.html "RMagick 2.12.0 User's Guide and Reference")
- [module function FileUtils.#copy](http://doc.ruby-lang.org/ja/2.0.0/method/FileUtils/m/cp.html "module function FileUtils.#copy")

---

意外と容易に画像に文字を描画できます。

これで、ブログ投稿用の画像に簡単にコピーライトを描画できるようになります。  
また、もう少し工夫をすれば、ディレクトリ配下の全ての画像に対してコピーライトを描画させることも可能になります。

以上。

