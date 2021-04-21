---
layout   : single
title    : "Ruby - XML パーステスト(Nokogiri, Hpricot)！"
published: true
date     : 2014-04-21 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
- XML
---

当方、Ruby で HTML や XML を解析する際に Nokogiri や Hpricot という HTML/XML パーサライブラリをよく使用します。  
大量にパースすることも多いので、実際にはどちらのほうが高速なのか気になるところです。

そこで、実際に XML ファイルをパースして速度を比較してみました。

<!--more-->

### 0. 前提条件

- ruby 2.1.1-p76 での作業を想定。

### 1. パース対象ファイル準備

当然ながら、パースの対象となるファイルを用意する。当方は以下のような、当ブログの "sitemap.xml" を用意した。（ちなみに、 `url` タグは 1,118 個ある）

File: `sitemap.xml`

{% highlight xml linenos %}
<?xml version='1.0' encoding='UTF-8'?>
<urlset xmlns='http://www.sitemaps.org/schemas/sitemap/0.9'>
    <url>
        <loc>http://www.mk-mode.com/octopress/2009/01/05/05165522/</loc>
        <lastmod>2014-04-11T14:12:58+09:00</lastmod>
    </url>
    <url>
        <loc>http://www.mk-mode.com/octopress/2009/01/05/05190900/</loc>
        <lastmod>2014-04-11T14:12:58+09:00</lastmod>
    </url>
    <url>
        <loc>http://www.mk-mode.com/octopress/2009/01/06/06101002/</loc>
        <lastmod>2014-04-11T14:12:58+09:00</lastmod>
    </url>

    <!-- 途中省略 -->

    <url>
        <loc>http://www.mk-mode.com/octopress/</loc>
        <lastmod>2014-04-11T14:12:58+09:00</lastmod>
    </url>
    <url>
        <loc>http://www.mk-mode.com/octopress/archives/</loc>
        <lastmod>2014-04-11T14:12:58+09:00</lastmod>
    </url>
</urlset>
{% endhighlight %}

### 2. Ruby スクリプト作成

以下のようにスクリプトを作成してみた。

File: `test_xml.rb`

{% highlight ruby linenos %}
# **************************************
#  XML パーステスト
# **************************************
#
require 'hpricot'
require 'nokogiri'

class TestXml
  FILE_XML = "sitemap.xml"
  N = 100

  def proc_main
    begin
      # Nokogiri
      t1 = Time.now
      N.times { |i| parse_nokogiri }
      t2 = Time.now
      printf("[Nokogiri] Time: %6.2f sec.\n", t2 - t1)

      # Hpricot
      t1 = Time.now
      N.times { |i| parse_hpricot }
      t2 = Time.now
      printf("[Hpricot ] Time: %6.2f sec.\n", t2 - t1)
    rescue => e
      puts "[#{e.class}] #{e.message}"
      e.backtrace.each{|trace| puts "\t#{trace}"}
      exit
    end
  end

  private

  def parse_nokogiri
    begin
      doc = Nokogiri::XML(File.read(FILE_XML))
      ns = {"ns" => "http://www.sitemaps.org/schemas/sitemap/0.9"}
      #locs = doc.css('urlset url loc')  # <= 遅い
      locs = doc.xpath('/ns:urlset/ns:url/ns:loc', ns)
    rescue => e
      raise
    end
  end

  def parse_hpricot
    begin
      doc = Hpricot::XML(File.read(FILE_XML))
      #locs = doc/:urlset/:url/:loc   # <= 遅い
      #locs = doc/('urlset url loc')  # <= 遅い
      locs = doc/('/urlset/url/loc')
    rescue => e
      raise
    end
  end
end

TestXml.new.proc_main
{% endhighlight %}

- [Gist - Ruby script to do tests of parsing xml with Nokogiri, Hpricot parsers.](https://gist.github.com/komasaru/10515805 "Gist - Ruby script to do tests of parsing xml with Nokogiri, Hpricot parsers.")

### 3. 実行

実際に、実行してみる。（"sitemap.xml" が同じディレクトリ内に置いてあることを確認して）

``` text
$ ruby test_xml.rb
[Nokogiri] Time:   1.09 sec.
[Hpricot ] Time:   2.54 sec.
```

### 3. 結果

（非力なマシンで）何回か実行してみた結果、今回のような単純構造の XML の場合は Nokogiri の方が Hpricot より約2.5倍早いことが分かった。  
（当然、 XML 構造等にもよるだろうが）

---

当方、最近は新たに HTML/XML パーサを使用する際は Nokogiri を使うようにしています。

以上。

