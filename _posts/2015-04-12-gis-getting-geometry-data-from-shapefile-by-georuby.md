---
layout   : single
title    : "GIS, Ruby - georuby で Shapefile のジオメトリデータ取得！"
published: true
date     : 2015-04-12 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- GIS
- 地図
---
こんにちは。

以前、Ruby で地理空間情報データ Shapefile の属性情報(DBF)を読み込む方法について記事にしました。

* [Ruby + GIS - Shapefile 読み込み！]({{site.baseurl}}/2014/10/07/ruby-read-shapefile-with-georuby/ "Ruby + GIS - Shapefile 読み込み！")

今回はジオメトリデータ（緯度・経度の情報）を取得する方法についての記録です。

<!--more-->

### 0. 前提条件

* Ruby 2.2.1-p85 での作業を想定。
* RubyGems ライブラリの georuby-2.5.2（GeoRuby でない方）がインストール済み。
* テストで使用した Shapefile は[国土交通省・国土数値情報](http://w3land.mlit.go.jp/ksj/index.html "国土交通省・国土数値情報")の行政区域データ（島根県分）。

### 1. Ruby スクリプトの作成

簡単なスクリプトなので、特に説明は不要だと思う。  
以下の例では`as_json` メソッドを使用して JSON(GeoJSON) 形式でデータを取得しているが、 `as_wkt`, `as_ewkt`, `as_hex_wkt`, `as_hex_ewkt`, `as_georss`, `as_kml` メソッドも使用可能である。  
また、 shebang ストリングは環境に合わせて適宜変更すること。ちなみに、当方はサーバ環境での cron 運用（cron では環境変数 PATH が通常の実行と異なること）を考慮して `#! /usr/bin/env ruby` を使用しない主義。

File: `geo_ruby_geometry.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# coding: utf-8
#*********************************************
# Ruby script to read geometric datas from shapefile.
#*********************************************
#
require 'georuby'
require 'geo_ruby/shp'

include GeoRuby::Shp4r

class Shp
  def initialize
    @shpfile = "/path/to/shapefile.shp"
  end

  def exec
    begin
      ShpFile.open(@shpfile) do |shp|
        shp.each { |s| p s.geometry.as_json }
      end
    rescue => e
      $stderr.puts "[ERROR][#{self.class.name}.#{__method__}] #{e}"
      e.backtrace.each{ |trace| $stderr.puts "\t#{trace}" }
      exit 1
    end
  end
end

Shp.new.exec
{% endhighlight %}

* [Gist - Ruby script to read geometric datas from shapefile.](https://gist.github.com/komasaru/8dd4bbc39b7af7c57102 "Gist - Ruby script to read geometric datas from shapefile.")

### 3. 取得データ

参考までに、取得できるデータは以下のようなもの。（可読性を高めるため整形している）

``` text
{
  :type=>"MultiPolygon",
  :coordinates=>[
    [
      [
        [133.276009003, 36.354486000000065],
        [133.2760620030001, 36.35453600000005],
                :
        ===< 途中省略 >===
                :
      ],
              :
      ===< 途中省略 >===
              :
    ],
            :
    ===< 途中省略 >===
            :
  ]
}
        :
===< 以下省略 >===
        :
```

### 4. 応用例

上記の例を応用して、東西南北端の座標（経度・緯度）を取得する Ruby スクリプトを作成してみた。  
（北半球＆東経0〜180度限定）

File: `geo_ruby_nsew.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# coding: utf-8
#*********************************************
# Ruby script to get NorthSouthEastWest ends from shapefile.
#*********************************************
#
require 'georuby'
require 'geo_ruby/shp'

include GeoRuby::Shp4r

class Shp
  def initialize
    @shpfile = "/path/to/shapefile.shp"
  end

  def exec
    # 北・南・東・西の緯度・経度初期値
    n_end, s_end, e_end, w_end = [0, 0], [0, 90], [0, 0], [180, 0]

    begin
      # 東西南北端取得
      ShpFile.open(@shpfile) do |shp|
        shp.each do |s|
          crds = s.geometry.as_json[:coordinates]
          crds.each do |c_0|
            c_0.each do |c_1|
              c_1.each do |c|
                e_end = c if c[0] > e_end[0]
                w_end = c if c[0] < w_end[0]
                n_end = c if c[1] > n_end[1]
                s_end = c if c[1] < s_end[1]
              end
            end
          end
        end
      end

      # 結果出力
      printf("North end: %8.4f%s, %7.4f%s\n", n_end[0], n_end[1])
      printf("South end: %8.4f%s, %7.4f%s\n", s_end[0], s_end[1])
      printf("East  end: %8.4f%s, %7.4f%s\n", e_end[0], e_end[1])
      printf("West  end: %8.4f%s, %7.4f%s\n", w_end[0], w_end[1])
    rescue => e
      $stderr.puts "[ERROR][#{self.class.name}.#{__method__}] #{e}"
      e.backtrace.each{ |trace| $stderr.puts "\t#{trace}" }
      exit 1
    end
  end
end

Shp.new.exec
{% endhighlight %}

* [Gist - Ruby script to get NorthSouthEastWest ends from shapefile.](https://gist.github.com/komasaru/11770abaf2ea20581a49 "Gist - Ruby script to get NorthSouthEastWest ends from shapefile.")

実行。

``` text
$ ./geo_ruby_nsew_end.rb
North end: 131.8654, 37.2443
South end: 131.8204, 34.3024
East  end: 133.3907, 36.2707
West  end: 131.6679, 34.5054
```

これは[国土交通省・国土数値情報](http://w3land.mlit.go.jp/ksj/index.html "国土交通省・国土数値情報")の行政区域データ「島根県」を使用した結果であるが、「[日本の東西南北端点の経度緯度｜国土地理院](http://www.gsi.go.jp/KOKUJYOHO/center.htm "日本の東西南北端点の経度緯度｜国土地理院")」発表の東西南北端の経度・緯度情報とほぼ同じ結果となった。

### 参考サイト

* [File: README — Documentation for georuby (2.5.2)](http://www.rubydoc.info/gems/georuby "File: README — Documentation for georuby (2.5.2)")

---

Shapefile を読み込んで処理を行う場合に役立つことがあるでしょう。

以上。

