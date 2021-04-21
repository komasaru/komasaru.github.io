---
layout   : single
title    : "Linux - XML に XSLT を適用して HTML 生成！"
published: true
date     : 2015-09-07 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- XML
- Linux
---

以前、 Ruby で XML ファイルに XSL テンプレートを適用して HTML を生成する方法を紹介しました。

* [Ruby - XML に XSLT を適用して HTML 生成！]({{site.baseurl}}/2013/12/04/ruby-apply-xslt-to-xml/ "Ruby - XML に XSLT を適用して HTML 生成！")

ただ、 Linux ディストリビューションによってはデフォルトで XML に XSL テンプレートを適用するコマンドがインストールされています。  
わざわざ Ruby を使用しなくてもよいということです。

以下、その使用方法についての備忘録です。

<!--more-->

### 0. 前提条件

* Linux Mint 17.2(64bit) での作業を想定。
* XML に XSL テンプレート適用して HTML ファイルを生成するのに `xsltproc` コマンドを使用する。

### 1. xsltproc コマンドのインストール

`xsltproc` コマンドが未インストールならインストールしておく。

``` text
$ sudo apt-get install xsltproc
```

### 2. XML ファイルの準備

試験的に使用する XML ファイルを以下のように作成する。（あくまで一例）

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

### 3. XSL テンプレートファイルの準備

試験的に使用する XSL テンプレートファイルを以下のように作成する。（あくまで一例）

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

### 4. HTML ファイルの生成

準備しておいた XML ファイルに XSL テンプレートを適用して HTML ファイルを生成する。

``` text
$ xsltproc --output test.html test.xsl test.xml
```

※オプションは他にも多数あるので、 `xsltproc --help` や `man xsltproc` で確認する。

### 5. HTML ファイルの確認

"test.html" というファイルが作成されているはずなので、確認してみる。

File: `test.html`

{% highlight html linenos %}
<html lang="ja"><body>
  <table>
    <tr>
<td>1234</td>
<td>Ruby 太郎</td>
<td>1980-01-01</td>
</tr>
    <tr>
<td>2345</td>
<td>XML 二郎</td>
<td>1985-04-15</td>
</tr>
    <tr>
<td>3456</td>
<td>XSL 花子</td>
<td>1990-09-30</td>
</tr>
  </table>
</body></html>
{% endhighlight %}

さらに、この HTML ファイルをブラウザで開いて確認してみる。

![XSLTPROC]({{site.baseurl}}/images/2015/09/07/XSLTPROC.png "XSLTPROC")

---

単に XML ファイルに XSL テンプレートを適用して HTML ファイルを作成するだけなら、今回の方法が楽でいいかもしれませんね。

以上。

