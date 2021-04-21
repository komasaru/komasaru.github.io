---
layout   : single
title    : "Ruby - RMagick 利用可能フォント一覧画像作成！"
published: true
date     : 2013-08-26 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
- 画像
- ImageMagick
- RMagick
---

RMagick（Ruby で 画像処理ライブラリ ImageMagick を扱える RubyGems ライブラリ） でどのようなフォントが利用可能かは容易に一覧にできます。  
しかし、それだけでは実際にどのようなフォント（見た目）なのかがわかりません。

そこで今回は、RMagick で利用が可能なフォントの一覧を Ruby + RMagick で画像にしてみました。

以下、作成した Ruby スクリプト等の紹介です。

<!--more-->

#### 0. 前提条件

- Linux Mint 14 (64bit) での作業を想定。
- Ruby 2.0.0-p247 で作業・動作確認。
- 画像編集ソフト ImageMagick (当方は 6.7.7-10) インストール済み。
- RubyGems ライブラリ RMagick インストール済み。

#### 1. Ruby スクリプト作成

以下のような Ruby スクリプトを作成してみた。  
概要はスクリプト内にコメントで記述している。

File: `rmagick_available_fonts.rb`

{% highlight ruby linenos %}
require 'RMagick'

F_SIZE = 24               # フォントサイズ (pt)
FILE   = "font_list.png"  # 出力ファイル名

class RmagickAvailableFonts
  # フォント一覧画像作成
  def make_image
    fonts = Magick.fonts      # フォント一覧
    image = Magick::Image.new(
      600, (F_SIZE + 20) * fonts.size + 10) {
      self.background_color = '#DDDDCC'
    }                         # 画像オブジェクト
    draw  = Magick::Draw.new  # 描画オブジェクト

    begin
      # 全フォントについて LOOP
      fonts.each_with_index do |f, i|
        # コンソール出力
        puts "#{sprintf("%3d", i + 1)}: #{f.name}"

        # 描画
        # （次のフォントは 20pt 下へずらす）
        draw.annotate(image, 0, 0, 10, 10 + (F_SIZE + 20) * i, "#{i + 1}: #{f.name}") do
          self.font      = f.name                    # フォント名
          self.fill      = 'black'                   # フォント塗りつぶし色（黒）
          self.stroke    = 'transparent'             # フォント縁取り色（透過）
          self.pointsize = F_SIZE                    # フォントサイズ
          self.gravity   = Magick::NorthWestGravity  # 描画開始位置（左上）
        end
      end

      # 画像作成
      image.write(FILE)
    rescue => e
      STDERR.puts "[ERROR][#{self.class.name}.make_image] #{e}"
      exit 1
    end
  end
end

# フォント一覧画像作成
obj_main = RmagickAvailableFonts.new
obj_main.make_image
{% endhighlight %}

- [Gist - Ruby script to generate a image of available fonts on RMagick.](https://gist.github.com/komasaru/6229272 "Gist - Ruby script to generate a image of available fonts on RMagick.")

#### 2. Ruby スクリプト実行

作成した Ruby スクリプトを実行してみる。

``` bash 
$ ruby rmagick_available_fonts.rb
  1: AvantGarde-Book
  2: AvantGarde-BookOblique
  3: AvantGarde-Demi
  4: AvantGarde-DemiOblique
  5: Bookman-Demi
         :
===< 途中省略 >===
         :
356: Waree-BoldOblique
357: Waree-Book
358: Waree-Oblique
359: WenQuanYi-Micro-Hei-Mono-Regular
360: WenQuanYi-Micro-Hei-Regular
```

コンソールにはフォント名が出力され、実行した Ruby スクリプトと同じディレクトリ内には "font_list.png" という画像が作成される。

【font_list.png の冒頭部分】

![RMAGICK_AVAILABLE_FONTS]({{site.baseurl}}/images/2013/08/26/RMAGICK_AVAILABLE_FONTS.png "RMAGICK_AVAILABLE_FONTS")

#### 3. その他

RMagick で画像に文字を描画する作業の際に気付いたのだが、 Draw オブジェクトのメソッド `annotate` の第２・３引数の使い道が分からなかった（機能しない？）。  
`annotate` メソッドは、

``` ruby 
draw.annotate(image, w, h, x, y, text)
```

のように記述することになっている。

RMagick のドキュメント（後述の参考サイト参考）によると、第１引数 `image` は画像オブジェクト、第２・３引数 `w`, `h` は文字列を描画する長方形のサイズ（幅と高さ）、第４・５引数 `x`, `y` は文字列を描画する位置（横位置と縦位置）、第６引数 `text` は描画する文字列、ということになっている。

しかし、 `w` と `h` がどうにもうまく機能しないのだ。

参考にしたあらゆるサイトではどれも `0` のままで、 `0` 以外を指定している例は確認できなかった。また、実際に自分で `w` と `h` の値を変更してみても、値によって全く無変化か何も表示されなくなるかのどちらかにしかならない。

おそらく、今回単純な使い方をしているからであり、もっと複雑な使い方では何らかの機能はするのではないか、と思うことにした。  
よって、よくある作成例どおり `w` も `h` も `0` を指定することとした。

#### 参考サイト

- [rmagick - RubyGems.org - your community gem host](http://rubygems.org/gems/rmagick "rmagick - RubyGems.org - your community gem host")
- [RMagick 2.12.0 User's Guide and Reference](http://studio.imagemagick.org/RMagick/doc/index.html "RMagick 2.12.0 User's Guide and Reference")

---

これで、自分の使用するシステム上の RMagick で利用可能なフォントが容易に確認できるようになりました。

また、画像に文字を描画する手法を使用しているので、そのあたりを応用した使い方もできると思います。

以上。

