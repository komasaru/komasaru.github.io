---
layout   : single
title    : "Ruby, Python - XML(XPath) 解析速度検証(Nokogiri, lxml)！"
published: true
date     : 2018-05-24 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Ruby
---

Ruby の XML パーサ Nokogiri で XML 解析した場合と、 Python の XML パーサ lxml で XML 解析した場合の実行速度の差を検証してみました。

<!--more-->

### 0. 前提条件

* Ruby 2.5.0, Python 3.6.4 での作業を想定。
* Ruby 用 XML パーサ Nokogiri がインストール済みであること。
* Python 用 XML パーサ lxml がインストール済みであること。
* 以下で紹介する検証結果は、使用する XML の構造等により若干異なることもあるかもしれない、ということに留意。

### 1. 検証に使用する XML ファイル

以下のような XML を使用する。（実際の「気象庁防災情報 XML」通知用 Atom フィードを流用）

File: `test.xml`

{% highlight xml linenos %}
<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="ja">
<title>JMAXML publishing feed</title>
<subtitle>this feed is published by JMA</subtitle>
<updated>2018-01-01T01:33:01+09:00</updated>
<id>urn:uuid:f57b5866-0c8c-3c92-9aff-10a715cdf48b</id>
<link href="http://www.jma.go.jp/" rel="related"/>
<link href="http://xml.kishou.go.jp/feed/extra.xml" rel="self"/>
<link href="http://alert-hub.appspot.com/" rel="hub"/>
<rights>Published by Japan Meteorological Agency</rights>

<entry>
<title>気象特別警報・警報・注意報</title>
<id>urn:uuid:34847d17-e9e0-356a-9b84-c1041d55c088</id>
<updated>2017-12-31T16:32:15Z</updated>
<author><name>名古屋地方気象台</name></author>
<link href="http://xml.kishou.go.jp/data/34847d17-e9e0-356a-9b84-c1041d55c088.xml" type="application/xml"/>
<content type="text">【愛知県気象警報・注意報】愛知県では、１日夜遅くまで強風や高波に、１日朝まで濃霧による視程障害に注意してください。</content>
</entry>
<entry>
<title>気象警報・注意報（Ｈ２７）</title>
<id>urn:uuid:994ab034-7c1b-356e-a507-1544a54ff374</id>
<updated>2017-12-31T16:32:15Z</updated>
<author><name>名古屋地方気象台</name></author>
<link href="http://xml.kishou.go.jp/data/994ab034-7c1b-356e-a507-1544a54ff374.xml" type="application/xml"/>
<content type="text">【愛知県気象警報・注意報】愛知県では、１日夜遅くまで強風や高波に、１日朝まで濃霧による視程障害に注意してください。</content>
</entry>
<entry>
<title>気象警報・注意報</title>
<id>urn:uuid:c7c222a8-9e4d-3a81-8fda-b018c12756c7</id>
<updated>2017-12-31T16:32:15Z</updated>
<author><name>名古屋地方気象台</name></author>
<link href="http://xml.kishou.go.jp/data/c7c222a8-9e4d-3a81-8fda-b018c12756c7.xml" type="application/xml"/>
<content type="text">【愛知県気象警報・注意報】愛知県では、１日夜遅くまで強風や高波に、１日朝まで濃霧による視程障害に注意してください。</content>
</entry>
</feed>
{% endhighlight %}

### 2. 検証用 Ruby スクリプトの作成

各 `entry` タグ内の `title` の値を取得する。（10,000回ループ）

File: `xml_parse_test.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
#
# Ruby script to verify the speed of xml(xpath) parsing by Nokogiri.
#
require 'nokogiri'

class XmlParse
  def initialize(loop_cnt)
    @doc = Nokogiri::XML(File.read("test.xml"))
    @ns  = {"a" => "http://www.w3.org/2005/Atom"}
    @cnt = loop_cnt
  end

  def parse_test
    @cnt.times do |i|
      @doc.xpath("//a:entry", @ns).each do |e|
        title = e.xpath("a:title", @ns).first.text
      end
    end
  rescue => e
    raise
  end
end

exit 0 unless __FILE__ == $0
begin
  CNT = 10000
  o = XmlParse.new(CNT)
  t_0 = Time.now
  o.parse_test
  puts "LOOP(#{CNT}): #{Time.now - t_0} secs."
rescue => e
  $stderr.puts "[#{self.class.name}.#{__method__}] #{e}"
  e.backtrace.each{ |tr| $stderr.puts "\t#{tr}" }
  exit 1
end
{% endhighlight %}

### 3. 検証用 Python スクリプトの作成

前述 Ruby スクリプト同様、各 `entry` タグ内の `title` の値を取得する。（10,000回ループ）

File: `xml_parse_test.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.6
"""
Python script to verify the speed of xml(xpath) parsing by lxml.
"""
import sys
import time
import traceback
from lxml import etree


class XmlParse:
    def __init__(self, loop_cnt):
        self.doc = etree.parse("test.xml")
        self.ns  = {"a": "http://www.w3.org/2005/Atom"}
        self.cnt = loop_cnt

    def parse_test(self):
        try:
            for i in range(self.cnt):
                for e in self.doc.xpath("//a:entry", namespaces=self.ns):
                    title = e.xpath("a:title", namespaces=self.ns)[0].text
        except Exception as e:
            raise


if __name__ != '__main__':
    sys.exit()
try:
    CNT = 10000
    o = XmlParse(CNT)
    t_0 = time.time()
    secs = o.parse_test()
    print("LOOP({}): {} secs.".format(CNT, time.time() - t_0))
except Exception as e:
    traceback.print_exc()
    sys.exit(1)
{% endhighlight %}

### 4. 検証スクリプトの実行

``` text
$ ./xml_parse_test.rb
LOOP(10000): 1.515421197 secs.

$ ./xml_parse_test.py
LOOP(10000): 1.0317723751068115 secs.
```

（何回か実行し、平均的なものを掲載）

### 5. 結果

Python の方が Ruby の 1.5倍近く 速かった。（想定どおり）

---

当方がこれまで Ruby で作成してきた Web スクレイピングツールを Python に移植しようか検討中。

以上。

