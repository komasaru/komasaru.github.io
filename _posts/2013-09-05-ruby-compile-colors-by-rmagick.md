---
layout   : single
title    : "Ruby - RMagick で画像内使用色を集計！"
published: true
date     : 2013-09-05 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
- 画像
- ImageMagick
- RMagick
---

少し前に、Ruby + RMagick で画像から各種情報を取得したり、画像内に文字を描画したりしました。

今回は、ある画像内で使用されている色（どの色がどのくらいの割合で使用されているか）を集計してみました。

以下、その記録です。

<!--more-->

#### 0. 前提条件

- Linux Mint 14 (64bit) での作業を想定。
- Ruby 2.0.0-p247 で作業・動作確認。
- 画像編集ソフト ImageMagick(当方は 6.7.7-10) インストール済み。
- RubyGems ライブラリ RMagick(当方は 2.13.2) がインストール済み。

#### 1. Ruby スクリプト作成

例として、以下のように Ruby スクリプトを作成してみた。  
色は16進数で取得するので、ある程度大きい画像だと色の数が膨大になる。そのため、ある％未満の色は非表示にするようにしている。  
また、スクリプトを見ると分かるが、`inject` メソッドを使ったり、ソートで宇宙船演算子を使用したりしている。Ruby の勉強にもなるでしょう。  
さらに、RMagick の `color_histogram` メソッドを使用して一括で色のヒストグラムを取得しているが、全ピクセルの色情報をループ処理で取得（`pixel_color(x, y)` で取得）して集計することもできるでしょう。

File: `rmagick_compile_color.rb`

{% highlight ruby linenos %}
require 'RMagick'

class RmagickCompileColor
  # 画像ファイル
  IMG_FILE = "img_1.jpg"
  # この百分率未満は非表示
  RATE_MIN = 0.05

  def initialize
    # アニメーション GIF が考慮されて画像は配列で読み込まれるので、
    # 配列の先頭画像を取得する。
    @img = Magick::Image.read(IMG_FILE).first
    # 以下のように取得してもよい。
    #@img = Magick::ImageList.new(IMG_FILE)

    # ピクセル数
    @px_x = @img.columns       # 横
    @px_y = @img.rows          # 縦
    @px_total = @px_x * @px_y  # トータル
  end

  # 使用色集計
  def compile
    begin
      # 画像の Depth を取得
      img_depth = @img.depth

      # カラーヒストグラムを取得してハッシュで集計
      hist = @img.color_histogram.inject({}) do |hash, key_val|
        # 各ピクセルの色を16進で取得
        color = key_val[0].to_color(Magick::AllCompliance, false, img_depth, true)
        # Hash に格納
        hash[color] ||= 0
        hash[color] += key_val[1]
        hash
      end

      # ヒストブラムのハッシュを値の大きい順にソート
      @hist = hist.sort{|a, b| b[1] <=> a[1]}
    rescue => e
      STDERR.puts "[ERROR][#{self.class.name}.compile] #{e}"
      exit 1
    end
  end

  # 結果表示
  def display
    begin
      @hist.each do |color, count|
        rate = (count / @px_total.to_f) * 100
        break if rate < RATE_MIN
        puts "#{color} => #{count} px ( #{sprintf("%2.4f", rate)} % )"
      end
      puts
      puts "Image Size: #{@px_x} px * #{@px_y} px"
      puts "TOTAL     : #{@px_total} px, #{@hist.size} colors"
    rescue => e
      STDERR.puts "[ERROR][#{self.class.name}.display] #{e}"
      exit 1
    end
  end
end

# 画像内使用色集計
obj_main = RmagickCompileColor.new
obj_main.compile
obj_main.display
{% endhighlight %}

- [Gist - Ruby script to compile colors in a image with RMagick.](https://gist.github.com/komasaru/6278280 "Gist - Ruby script to compile colors in a image with RMagick.")

#### 3. Ruby スクリプト実行

情報を取得したい画像（今回は "img_1.jpg"）を準備し、作成した Ruby スクリプトを実行してみる。  
当方が使用した画像は以下のような画像。

![img_1]({{site.baseurl}}/images/2013/09/05/img_1.jpg "テスト画像")

``` bash 
$ ruby rmagick_compile_color.rb
#070705 => 316 px ( 0.1029 % )
#005820 => 230 px ( 0.0749 % )
#005623 => 224 px ( 0.0729 % )
#0C55B4 => 217 px ( 0.0706 % )
#070906 => 198 px ( 0.0645 % )
#005921 => 195 px ( 0.0635 % )
#005724 => 190 px ( 0.0618 % )
#005822 => 181 px ( 0.0589 % )
#005722 => 174 px ( 0.0566 % )
#060805 => 170 px ( 0.0553 % )
#00571F => 168 px ( 0.0547 % )
#005823 => 166 px ( 0.0540 % )
#005522 => 164 px ( 0.0534 % )
#005923 => 161 px ( 0.0524 % )
#005721 => 160 px ( 0.0521 % )
#005621 => 155 px ( 0.0505 % )

Image Size: 640 px * 480 px
TOTAL     : 307200 px, 55307 colors
```

#### 参考サイト

- [rmagick - RubyGems.org - your community gem host](http://rubygems.org/gems/rmagick "rmagick - RubyGems.org - your community gem host")
- [RMagick 2.12.0 User's Guide and Reference](http://studio.imagemagick.org/RMagick/doc/index.html "RMagick 2.12.0 User's Guide and Reference")

---

画像を扱いだすと、なかなか奥が深くておもしろいです。

ちなみに、今回の手法を応用すれば、アメダス画像内のある１つのピクセルの色をチェックして、雨が降っているのかどうかを判定したりもできるのではないでしょうか。

以上。

