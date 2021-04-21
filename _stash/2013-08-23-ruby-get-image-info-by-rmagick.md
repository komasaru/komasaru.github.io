---
layout   : single
title    : "Ruby - RMagick で画像情報取得！"
published: true
date     : 2013-08-23 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
- 画像
- ImageMagick
- RMagick
---

今回は、RMagick で画像の各種情報を取得する方法についてです。

RMagick とは、ImageMagick 画像処理ライブラリ等を Ruby から呼び出せるようにできるインターフェースの機能を持った RubyGems ライブラリです。

RMagick 以外にも画像の情報を取得できるライブラリ等はあるようですが、他の機能も含めトータルで考えて RMagick を使用することとしました。

<!--more-->

#### 0. 前提条件

- Linux Mint 14 (64bit) での作業を想定。
- Ruby 2.0.0-p247 で作業・動作確認。
- 画像編集ソフト ImageMagick(当方は 6.7.7-10) インストール済み。

#### 1. RMagick インストール

画像を扱える RubyGems ライブラリ RMagick をインストールする。

``` bash 
$ sudo gem install rmagick
$ gem list | grep rmagick
rmagick (2.13.2)
```

"Magic-config" が無いというエラーになる場合は、"libmagickcore-dev" も apt インストールする。  
"MagickWand.h" が無いというエラーになる場合は、"libmagicwand-dev" も apt インストールする。

#### 2. Ruby スクリプト作成

例として、以下のように画像の情報を取得する Ruby スクリプトを作成する。

File: `rmagick_img_info.rb`

{% highlight ruby linenos %}
require 'RMagick'

# アニメーション GIF が考慮されて画像は配列で読み込まれるので、
# 配列の先頭画像を取得する。
img = Magick::Image.read("img_1.jpg").first
# 以下のように取得してもよい。
#img = Magick::ImageList.new("img_1.jpg")

# 画像情報取得
puts "FILENAME  : #{img.filename}"        # ファイル名
puts "FORMAT    : #{img.format}"          # フォーマット
puts "HEIGHT    : #{img.rows} px"         # 高さ
puts "WIDTH     : #{img.columns} px"      # 幅
puts "CLASSTYPE : #{img.class_type}"      # クラスタイプ
puts "DEPTH     : #{img.depth} bits/px"   # 深さ
puts "COLORS    : #{img.number_colors}"   # 色
puts "FILESIZE  : #{img.filesize} bytes"  # ファイルサイズ
puts "RESOLUTION: #{img.x_resolution.to_i}x#{img.y_resolution.to_i} " +
     "pixels/#{img.units == Magick::PixelsPerInchResolution ?
     "inch" : "cm"}"                      # レゾリューション
if img.properties.length > 0              # プロパティ
  puts "PROPERTIES:"
  img.properties do |name,value|
    puts "  #{name} = #{value}"
  end
end
{% endhighlight %}

- [Gist - Ruby script to get informations of a image file by RMagick.](https://gist.github.com/komasaru/6198886 "Gist - Ruby script to get informations of a image file by RMagick.")

#### 3. Ruby スクリプト実行

情報を取得したい画像（"img_1.jpg"）を準備し、作成した Ruby スクリプトを実行してみる。  
当方が使用した画像は以下のような画像。

![RMAGICK_TEST]({{site.baseurl}}/images/2013/08/23/RMAGICK_TEST.jpg "RMAGICK_TEST")

``` bash 
$ ruby rmagick_img_info.rb
FILENAME  : img_1.jpg
FORMAT    : JPEG
HEIGHT    : 480 px
WIDTH     : 640 px
CLASSTYPE : DirectClass
DEPTH     : 8 bits/px
COLORS    : 39335
FILESIZE  : 54982 bytes
RESOLUTION: 72x72 pixels/inch
PROPERTIES:
  date:create = 2013-08-23T21:45:13+09:00
  date:modify = 2013-08-23T20:40:01+09:00
  jpeg:colorspace = 2
  jpeg:sampling-factor = 2x2,1x1,1x1
```

#### 参考サイト

- [rmagick - RubyGems.org - your community gem host](http://rubygems.org/gems/rmagick "rmagick - RubyGems.org - your community gem host")
- [RMagick 2.12.0 User's Guide and Reference](http://studio.imagemagick.org/RMagick/doc/index.html "RMagick 2.12.0 User's Guide and Reference")

---

今回一番欲しかった情報は画像のサイズですが、その他の情報も色々と取得できます。また、情報を取得するだけでなく画像を加工したりもできます。  
何かと使えそうです。

以上。

