---
layout   : single
title    : "Ruby - RMagick で画像内に透かしを描画！"
published: true
date     : 2016-05-16 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
- 画像
---

以前、RMagick（Ruby で画像処理ライブラリ ImageMagick を扱える RubyGems ライブラリ）で画像内に文字を描画しました。

* [Ruby - RMagick で画像内に文字を描画！]({{site.baseurl}}/2013/08/28/ruby-write-character-by-rmagick "Ruby - RMagick で画像内に文字を描画！")

今回は、少し異なる方法で既存の画像に透かし文字を描画してみました。(require も `RMagick` でなく `rmagick` に変更になっていますし）

<!--more-->

#### 0. 前提条件

* Linux Mint 17.3(64bit) での作業を想定。
* Ruby 2.3.0-p0 で作業・動作確認。
* 画像編集ソフト ImageMagick(当方は 6.7.7-10) インストール済み。
* RubyGems ライブラリ RMagick インストール済み。

#### 1. Ruby スクリプト作成

以下のような画像内にコピーライトの透かしを描画する Ruby スクリプトを作成してみた。  
概要はスクリプト内にコメントで記述している。

File: `rmagick_watermark.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# coding: utf-8
#----------------------------------------------------
# Ruby script to write a watermark by rmagick.
#
#   date          name            version
#   2016.04.24    mk-mode.com     1.00 New creation.
#
# Copyright(C) 2016 mk-mode.com All Rights Reserved.
#----------------------------------------------------
require 'rmagick'

class RmagickWatermark
  TEXT = "©#{Time.now.year} mk-mode.com"  # 描画文字

  def initialize
    exit unless check_arg
    @img      = Magick::Image.read(@file_in).first          # 元の画像オブジェクト
    @img_wm   = Magick::Image.new(@img.columns, @img.rows)  # ウォーターマークの画像オブジェクト
    @gc_wm    = Magick::Draw.new                            # ウォーターマーク画像の描画オブジェクト
    @file_out = @file_in.sub(/(.+)\.(.+?)$/, "#{'\1'}-wm.#{'\2'}")  # 保存ファイル名
  end

  def write_wm
    # 元画像と同じサイズの画像オブジェクトに文字を描画
    @gc_wm.annotate(@img_wm, 0, 0, 0, 0, TEXT) do
      self.gravity     = Magick::CenterGravity  # 描画位置（右下なら SouthEast etc.）
      self.pointsize   = 48
      self.font_family = "Courier"
      self.font_weight = Magick::BoldWeight
      self.stroke      = "none"
    end
    # 影描画（光源315度）
    @img_wm = @img_wm.shade(true, 315)
    # 画像の重ね合わせ
    @img.composite!(@img_wm, Magick::CenterGravity, Magick::HardLightCompositeOp)
    # 画像の保存
    @img.write(@file_out)
    puts "Wrote #{@file_out}!"
  rescue => e
    msg = "[#{e.class}] #{e.message}\n"
    msg << e.backtrace.map { |tr| "\t#{tr}"}.join("\n")
    $stderr.puts msg
    exit 1
  end

  private

  def check_arg
    ret = true

    begin
      unless ARGV[0]
        puts "Usage: ./rmagick_watermark.rb /path/to/target_image"
        ret = false
      end
      @file_in = ARGV[0]
      return ret
    rescue => e
      raise
    end
  end
end

RmagickWatermark.new.write_wm if __FILE__ == $0
{% endhighlight %}

* [Gist - Ruby script to write a watermark by rmagick.](https://gist.github.com/komasaru/c867bf9f60dc2fbc05e4e80e81cc58a2 "Gist - Ruby script to write a watermark by rmagick.")

#### 2. Ruby スクリプト実行

文字を描画したい画像を用意して、先ほど作成した Ruby スクリプトを実行してみる。

``` text
$ ./rmagick_watermark.rb test.jpg
Wrote test-wm.jpg!
```

#### 3. 実行結果確認

【元の画像】

![test.jpg]({{site.baseurl}}/images/2016/05/16/test.jpg "TEST_WATERMARK")

【文字描画後の画像】

![test_wm.jpg]({{site.baseurl}}/images/2016/05/16/test_wm.jpg "TEST_WATERMARK")

画像に透かし文字が描画された。

#### 4. その他（コピーライトについて）

今回の例ではコピーライトを表示させている。

本来はこの世の全ての著作物には著作権が存在し、コピーライトを表示しなくとも著作物は保護されるべきである。

敢えてコピーライトを表示する場合は、最低限 "Copyright" もしくは © マーク、著作物の創造された年、著作権者名を表示すればよいことになっている。  
"Copyright © 2009-2016 hoge All rights reserved." のような記述方法は、より念を押した記述方法と言える。

#### 参考サイト

* [rmagick - RubyGems.org - your community gem host](http://rubygems.org/gems/rmagick "rmagick - RubyGems.org - your community gem host")

---

意外と容易に画像に透かし文字を描画できます。  
単純に文字を描画するよりデザイン性が高いので、今後何かと利用していきたいと考えております。

また、透かし文字ではなく「電子透かし」についても理解を深めたいとも考えております。（こちらは、時間に余裕ができたらの話）

以上。

