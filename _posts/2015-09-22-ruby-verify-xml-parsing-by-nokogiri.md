---
layout   : single
title    : "Ruby - Nokogiri による XML 解析の速度検証！"
published: true
date     : 2015-09-22 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
- XML
---

Ruby で HTML/XML パーサの Nokogiri を使用して XML を解析する際、名前空間(Namespace)が宣言されている場合は厳密に指定する必要があるものだと考えております。

しかし、実際は名前空間を指定せずに解析することも可能です。  
（実際、 XML 内の名前空間を削除するメソッドも用意されています。しかし、そのメソッドは名前空間について理解していない人のためのものであり、一般的には使用すべきではありません）

今回は、各種方法で解析し、どの方法が高速であるかを検証してみました。

<!--more-->

### 0. 前提条件

* Ruby 2.2.3-p173 での作業を想定。
* 以下で紹介する検証結果は、使用する XML の構造等により若干異なることもあるかもしれない、ということに留意。

### 1. 検証に使用する XML ファイル

以下のような XML を使用する。（実際の「気象庁防災情報 XML」通知用 Atom フィードを流用。情報の内容は24時間以内に `link` タグ内の URL にアクセスして得ることになっている）

File: `test_nokogiri.xml`

{% highlight xml linenos %}
<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="ja">
<title>JMAXML publishing feed</title>
<subtitle>this feed is published by JMA</subtitle>
<updated>2015-08-27T17:28:02+09:00</updated>
<id>urn:uuid:d38e0e80-12ba-3236-b10f-256b78a08995</id>
<link href="http://www.jma.go.jp/" rel="related"/>
<link href="http://xml.kishou.go.jp/feed/other.xml" rel="self"/>
<rights>Published by Japan Meteorological Agency</rights>

<entry>
<title>地方海上警報</title>
<id>urn:uuid:ac97395c-e388-33a9-922f-ab2a32e61bb1</id>
<updated>2015-08-27T08:27:18Z</updated>
<author><name>新潟地方気象台</name></author>
<link href="http://xml.kishou.go.jp/data/ac97395c-e388-33a9-922f-ab2a32e61bb1.xml" type="application/xml"/>
<content type="text">【新潟海上気象】</content>
</entry>
<entry>
<title>地方海上警報</title>
<id>urn:uuid:b42a06f2-a6f0-351a-a8c4-3619a847f66d</id>
<updated>2015-08-27T08:27:02Z</updated>
<author><name>仙台管区気象台</name></author>
<link href="http://xml.kishou.go.jp/data/b42a06f2-a6f0-351a-a8c4-3619a847f66d.xml" type="application/xml"/>
<content type="text">【仙台海上気象】</content>
</entry>
<entry>
<title>紫外線観測データ</title>
<id>urn:uuid:f27e93c8-ff97-376d-b3b0-5307d07e4a24</id>
<updated>2015-08-27T08:27:10Z</updated>
<author><name>気象庁地球環境・海洋部</name></author>
<link href="http://xml.kishou.go.jp/data/f27e93c8-ff97-376d-b3b0-5307d07e4a24.xml" type="application/xml"/>
<content type="text">【紫外線観測データ】</content>
</entry>
</feed>
{% endhighlight %}

### 2. 検証用 Ruby スクリプトの作成

* 以下のスクリプト内で指定する名前空間は、 "text_nokogiri.xml" 内で宣言されているものと同じ。
* `entry` ノードをループし、各 `title` ノードのテキストを取得するだけの簡単な処理を 10,000 回繰り返す。
* 今回は７種類（スクリプト内コメント参照）の解析方法で検証する。
* 以下のスクリプト内の XPath での「Namespace 指定なし」とは、 Nokogiri での厳密な指定をしないという意味。

File: `test_nokogiri_xml.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# coding: utf-8
#
# Ruby script to verify the speed of xml parsing by Nokogiri.
#
#++
require 'benchmark'
require 'nokogiri'

class TestNokogiriXml
  def initialize
    @xml  = Nokogiri::XML(File.read("test_nokogiri.xml"))
    @secs = 10000
    @ns   = {"a" => "http://www.w3.org/2005/Atom"}
  end

  def exec
    # 1. css メソッド(CSS セレクタ)による解析
    printf("CASE-1: %.4f secs.\n", case_1)

    # 2. search メソッド(CSS セレクタ)による解析
    printf("CASE-2: %.4f secs.\n", case_2)

    # 3. search メソッド(XPath, Namespace 指定なし)による解析
    printf("CASE-3: %.4f secs.\n", case_3)

    # 4. / メソッド(CSS セレクタ)による解析
    printf("CASE-4: %.4f secs.\n", case_4)

    # 5. / メソッド(XPath, Namespace 指定なし)による解析
    printf("CASE-5: %.4f secs.\n", case_5)

    # 6. xpath メソッド(XPath, Namespace 指定なし)による解析
    printf("CASE-6: %.4f secs.\n", case_6)

    # 7. xpath メソッド(XPath, Namespace 指定あり)による解析
    printf("CASE-7: %.4f secs.\n", case_7)
  rescue => e
    $stderr.puts "[#{self.class.name}.#{__method__}] #{e}"
    e.backtrace.each{ |tr| $stderr.puts "\t#{tr}" }
    exit 1
  end

  private

  def case_1
    return Benchmark.realtime do
      @secs.times do |i|
        @xml.css("entry").each do |e|
          title = e.css("title").first.text
        end
      end
    end
  rescue => e
    raise
  end

  def case_2
    return Benchmark.realtime do
      @secs.times do |i|
        @xml.search("entry").each do |e|
          title = e.search("title").first.text
        end
      end
    end
  rescue => e
    raise
  end

  def case_3
    return Benchmark.realtime do
      @secs.times do |i|
        @xml.search("//xmlns:entry").each do |e|
          title = e.search("./xmlns:title").first.text
        end
      end
    end
  rescue => e
    raise
  end

  def case_4
    return Benchmark.realtime do
      @secs.times do |i|
        (@xml/"entry").each do |e|
          title = (e/"title").first.text
        end
        # 以下でも同様。しかし、ごく少し遅い。
        #(@xml/:entry).each do |e|
        #  title = (e/:title).first.text
        #end
      end
    end
  rescue => e
    raise
  end

  def case_5
    return Benchmark.realtime do
      @secs.times do |i|
        (@xml/"//xmlns:entry").each do |e|
          title = (e/"./xmlns:title").first.text
        end
      end
    end
  rescue => e
    raise
  end

  def case_6
    return Benchmark.realtime do
      @secs.times do |i|
        @xml.xpath("//xmlns:entry").each do |e|
          title = e.xpath("xmlns:title").first.text
        end
      end
    end
  rescue => e
    raise
  end

  def case_7
    return Benchmark.realtime do
      @secs.times do |i|
        @xml.xpath("//a:entry", @ns).each do |e|
          title = e.xpath("a:title", @ns).first.text
        end
      end
    end
  rescue => e
    raise
  end
end

TestNokogiriXml.new.exec
{% endhighlight %}

* [Gist - Ruby script to verify the speed of xml parsing by Nokogiri. ](https://gist.github.com/komasaru/1f737b67baba38213570 "Gist - Ruby script to verify the speed of xml parsing by Nokogiri. ")

### 3. Ruby スクリプトの実行

``` text
$ ./test.rb
CASE-1: 2.3432 secs.
CASE-2: 2.4821 secs.
CASE-3: 2.0588 secs.
CASE-4: 2.4949 secs.
CASE-5: 2.0672 secs.
CASE-6: 1.7549 secs.
CASE-7: 1.5359 secs.
```

### 4. 検証結果について

* 何回か実行してみたが、全て同じような結果となった。
* `xpath` メソッドは `css`, `search`, `/` メソッドより高速に解析することができる。
* `xpath` メソッドで厳密に名前空間を指定した方が、指定せずに解析するより高速である。
* 要は、XML を解析する際は `xpath` メソッドで名前空間を指定しましょう、ということ。
* 今回の検証結果が全てという訳ではない（場合によっては「一概には言えない」ということがあるかもしれない）

---

当方、以前は CSS セレクタを使用して XML 解析を行なっていた時期もありましたが、現在は XPath で厳密に名前空間を指定して解析を行うようにしています。

以上。

