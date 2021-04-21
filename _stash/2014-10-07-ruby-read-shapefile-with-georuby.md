---
layout   : single
title    : "Ruby + GIS - Shapefile 読み込み！"
published: true
date     : 2014-10-07 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
- GIS
---

事実上の地図情報の業界標準フォーマット Shapefile を Ruby で読み込む方法についての記録です。

Shapefile についての詳細な説明はしませんが、広義の Shapefile は

- shp 拡張子の「形状規格」ファイル（狭義の Shapefile）
- shx 拡張子の「形状インデックス規格」ファイル
- dbf 拡張子の「属性規格」の3つのファイル

で構成されるファイルのことで地図情報システム間で情報をやりとりするためのファイルです。必要に応じてこれら3つ以外のオプションファイルを含めることもあります。

以下は、広義の Shapefile 読み込みについての記録であり、実際に取得するのは dbf ファイル（属性規格）内の情報です。

<!--more-->

### 0. 前提条件

- Linux Mint 17 での作業を想定。
- Ruby 2.1.2-p95 での作業を想定。
- 読み込みに使用する Shapefile は、国土交通省・国土数値情報・行政区域データのうち島根県分 "N03-140401_32_GML"。
- georuby という RubyGem パッケージを使用する。（GeoRuby ではない）

### 1. RubyGems パッケージのインストール

Ruby で Shapefile を読み込むための RubyGem パッケージ georuby(GeoRuby でない方) をインストールする。

``` text
$ sudo gem install georuby
```

さらに、DBF ファイルを読み込むための RubyGem パッケージ dbf もインストールする。

``` text
$ sudo gem install dbf
```

### 2. Ruby スクリプト作成

以下のように Shapefile を読み込む Ruby スクリプトを作成する。

File: `geo_ruby.rb`

{% highlight ruby linenos %}
require 'geo_ruby'
require 'geo_ruby/shp4r/shp'

include GeoRuby::Shp4r
include GeoRuby::SimpleFeatures

class Shp
  def initialize
    @shpfile = "./N03-140401_32_GML/N03-14_32_140401.shp"
  end

  def exec
    begin
      ShpFile.open(@shpfile) do |shp|
        fields = shp.fields
        shp.each do |s|
          datas = s.data
          puts fields.map { |f| datas[f.name] }.join(",")
        end
        puts "---"
        puts fields.map { |f| f.name }.join(",")
        puts "---"
        puts "Counts: #{shp.record_count}"
      end
    rescue => e
      STDERR.puts "[ERROR][#{self.class.name}.#{__method__}] #{e}"
      exit 1
    end
  end
end

Shp.new.exec
{% endhighlight %}

- [Gist - Ruby to read a shapefile with georuby.](https://gist.github.com/komasaru/d28a1cb59696f91b198c "Gist - Ruby to read a shapefile with georuby.")

### 3. Ruby スクリプト実行

Shapefile（shp, shx, dbf ファイル）のあるディレクトリを作成した Ruby スクリプトと同じディレクトリに配置後、実行してみる。

``` text
         :
====< 途中省略 >====
         :
島根県,,,益田市,32204
島根県,,,益田市,32204
島根県,,,益田市,32204
島根県,,,益田市,32204
島根県,,,益田市,32204
島根県,,,益田市,32204
島根県,,,益田市,32204
島根県,,,益田市,32204
島根県,,鹿足郡,津和野町,32501
島根県,,鹿足郡,吉賀町,32505
島根県,,隠岐郡,隠岐の島町,32528
島根県,,隠岐郡,隠岐の島町,32528
---
N03_001,N03_002,N03_003,N03_004,N03_007
---
Counts: 2579
```

国土数値情報・行政区域データの項目は以下のようになっている

- N03_001:「都道府県名」
- N03_002:「支庁・振興局名」
- N03_003:「郡・政令市名」
- N03_004:「市区町村名」
- N03_007:「行政区域コード」

### 4. その他（応用作業）

上記では、島根県内の全地物（ポリゴン１つ１つ）について情報を取得したので、同じ市町村でも情報が複数存在する。（実際、島根県内には19市町村しかないのに2,579県のデータが存在）

これらを QGIS というソフトで市町村単位で地物融合するなどすれば、市町村数のデータとなる。（参照「[QGIS(QuantumGIS) - 国土数値情報・ポリゴンの融合！]({{site.baseurl}}/2014/07/28/qgis-fusion-of-polygons/ "QGIS(QuantumGIS) - 国土数値情報・ポリゴンの融合！")」）

当方は、さらに全都道府県分同様の処理（市区町村単位で地物融合）して１つの Shapefile に結合してみた。（参照「[GDAL/OGR - 国土数値情報の複数 Shapefile を結合！]({{site.baseurl}}/2014/07/30/gdal-ogr-merge-shapefiles/ "GDAL/OGR - 国土数値情報の複数 Shapefile を結合！")」）

この日本全国分の１つの Shapefile を同じ Ruby スクリプトで読み込んでみた。（環境や地物融合時の文字コードについては、適宜対応すること）

``` text
         :
====< 途中省略 >====
         :
沖縄県,,宮古郡,多良間村,47375
沖縄県,,島尻郡,北大東村,47358
沖縄県,,島尻郡,伊平屋村,47359
沖縄県,,島尻郡,座間味村,47354
沖縄県,,島尻郡,粟国村,47355
沖縄県,,島尻郡,渡名喜村,47356
沖縄県,,,那覇市,47201
沖縄県,,島尻郡,南風原町,47350
沖縄県,,島尻郡,渡嘉敷村,47353
沖縄県,,八重山郡,与那国町,47382
沖縄県,,八重山郡,竹富町,47381
---
N03_001,N03_002,N03_003,N03_004,N03_007
---
Counts: 1906
```

実際、日本全国には 1,916 市区町村が存在するはずだが、今回の処理で取得できたのは 1,906 件だった。  
前者には政令指定都市の市も件数に含まれるが後者は含まれないためであろう。  
その他、後者には「所在未定地」なるデータも存在するようだ。  
もう少し精査する必要がありそうだ。

### 参考サイト

- [Documentation for georuby (2.2.1)](http://rubydoc.info/gems/georuby/2.2.1/frames "Documentation for georuby (2.2.1)")

---

今回は DBF ファイルの情報を取得したが、ジオメトリの取得も可能のようです。

Ruby で Shapefile が容易に扱えるのは大変興味深いと感じました。

以上。

