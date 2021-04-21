---
layout   : single
title    : "Ruby - XML に XSLT を適用して HTML 生成！"
published: true
date     : 2013-12-04 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
- XML
---

Ruby で XSLT スタイルシート未適用の XML ファイルに XSLT スタイルシートを適用する方法についての作業記録です。

<!--more-->

#### 0. 前提条件

- Ruby 2.0.0-p247 での作業を想定。
- "libxslt-ruby" という RubyGems ライブラリを使用する。

### 1. 事前情報

通常、XSLT スタイルシート未適用の XML ファイルに XSLT スタイルシートを適用するには、以下のように XML ファイルに１行を追加すればよいです。HTML ファイルに CSS スタイルシートを適用するのと同じように。

【XML ファイル】

File: `test.xml`

{% highlight xml linenos %}
<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="test.xsl" ?>

<Office>
  <People>
    <Person>
      <No>1234</No>
      <Name>Ruby 太郎</Name>
      <Birthday>1980-01-01</Birthday>
      <Age>33</Age>
    </Person>
    <Person>
      <No>2345</No>
      <Name>XML 二郎</Name>
      <Birthday>1985-04-15</Birthday>
      <Age>28</Age>
    </Person>
    <Person>
      <No>3456</No>
      <Name>XSL 花子</Name>
      <Birthday>1990-09-30</Birthday>
      <Age>23</Age>
    </Person>
  </People>
</Office>
{% endhighlight %}

【XSLT ファイル】

File: `test.xsl`

{% highlight xml linenos %} 
<?xml version="1.0" encoding="UTF-8" ?>

<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
   <xsl:output method="html" encoding="UTF-8"/>

  <xsl:template match="/">
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="Office">
    <html lang="ja">
    <body>
    <xsl:apply-templates/>
    </body>
    </html>
  </xsl:template>

  <xsl:template match="People">
    <table>
    <xsl:apply-templates/>
    </table>
  </xsl:template>

  <xsl:template match="Person">
    <tr>
      <td><xsl:value-of select="No"/></td>
      <td><xsl:value-of select="Name"/></td>
      <td><xsl:value-of select="Birthday"/></td>
    </tr>
  </xsl:template>
</xsl:stylesheet>
{% endhighlight %}

XSLT スタイルシート未適用の XML ファイルは、ブラウザで表示すると以下のようになりますが、

![XML_XSLT_1]({{site.baseurl}}/images/2013/12/04/XML_XSLT_1.png "XML_XSLT_1")

XSLT スタイルシートを適用すると、ブラウザでは以下のように表示できます。

![XML_XSLT_2]({{site.baseurl}}/images/2013/12/04/XML_XSLT_2.png "XML_XSLT_2")

そして、この時の HTML は以下のようになっている。

![XML_XSLT_3]({{site.baseurl}}/images/2013/12/04/XML_XSLT_3.png "XML_XSLT_3")

### 2. RubyGems ライブラリインストール

Ruby で XSLT スタイルシート未適用の XML ファイル動的に適用させるには、RubyGems ライブラリを使用すると良い。

色々と種類はあるが、今回は "libxslt-ruby" という RubyGems ライブラリを使用する。

以下のようにしてインストールする。

``` text 
# gem install libxslt-ruby

# gem list | grep libxslt-ruby
libxslt-ruby (1.1.0)
```

### 3. XML, XSL ファイル容易

テストで使用する XML ファイルと XSLT スタイルシート（XSL ファイル）を用意する。  
先ほど使用したファイルを使用するが、XSLT スタイルシート適用作業は Ruby で行うので、XML ファイルの２行目は削除しておく。

### 4. Ruby スクリプト作成

テスト用の Ruby スクリプトを以下のように作成する。

File: `test_xslt.rb`

{% highlight ruby linenos %} 
require 'xslt'

# Create a new XSL Transform
stylesheet_doc = LibXML::XML::Document.file('test.xsl')
stylesheet = LibXSLT::XSLT::Stylesheet.new(stylesheet_doc)

# Transform a xml document
xml_doc = XML::Document.file('test.xml')
html = stylesheet.apply(xml_doc)

puts html
{% endhighlight %}

### 5. Ruby スクリプト実行

作成した Ruby スクリプトを実行してみる。

HTML が生成され出力される。

``` text 
# ruby test_xslt_2.rb
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<html lang="ja">
  <body>
  <table>
    <tr><td>1234</td><td>Ruby 太郎</td><td>1980-01-01</td></tr>
    <tr><td>2345</td><td>XML 二郎</td><td>1985-04-15</td></tr>
    <tr><td>3456</td><td>XSL 花子</td><td>1990-09-30</td></tr>
  </table>
</body>
</html>
```

### 6. 応用

当方は、この動的に XSLT スタイルシートを適用する方法を利用して、「[Ruby on Rails 製の当方ホームページ](http://www.mk-mode.com/rails/jmaxml "mk-mode SITE : 気象庁防災情報XML")」で「[気象庁防災情報XML](http://xml.kishou.go.jp/ "気象庁防災情報XML")」を表示しています。  
（XSLT スタイルシートは、気象庁から XML 内容確認用として公開されているが、このサイトでは自作した XSLT スタイルシートを使用している）

この方法が非常に役立っている。

---

動的に XSLT スタイルシートを適用したい場合には、かなり有効な方法だと思います。（直接文字列操作する方法等もあるでしょうが・・・）

以上。

