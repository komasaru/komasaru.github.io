---
layout   : single
title    : "XML - XSLT で改行コードを br タグに変換！"
published: true
date     : 2013-12-06 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Feed
- XML
---

XML ファイルを HTML に変換するのに、 XSLT スタイルシートを適用する方法があります。

その XSLT スタイルシートを作成する際に、XML 内の改行コードを `<br />` に変換するのに若干苦労します。

以下、改行コード `&#10;` を `<br />` に変換する方法についての記録です。

<!--more-->

### 1. この作業を行う理由

通常、XSLT での文字列変換は `translate('＜対象文字列＞', '＜変換元文字リスト＞', '＜変換後文字リスト＞')` で行う。  
例えば、「あいうえお」という文字列内の「い」と「え」を「ゐ」と「ゑ」に変換する場合は、 `transltate('あいうえお', 'いえ', 'ゐゑ')` とする。  

そう、変換元文字リストのｎ番目の文字が変換後文字リストのｎ番目に対応している（変換元と変換後の文字数が一致していないといけない）のである。

今回の、改行コードを `<br />` タグに変換する以外にも、任意の文字列を変換するには今回のような方法をとることになるだろう。（XSLT については疎いので、違う方法があるか否かは今のところ不明）

### 2. XSLT スタイルシート作成

例えば、XSLT スタイルシートを以下のように作成する。

重要なのは "call-template" の部分であるが、要は文字列を

- 改行コード `&#10;` より前の部分
- 改行コード `&#10;`
- 改行コード `&#10;` より後の部分

に分割後、「改行コード `&#10;` より前の部分」 + `<br />` + 「改行コード `&#10;` より後の部分」と再結合する作業を「再帰的」行うということ。

File: `test.xsl`

{% highlight xml linenos %} 
<?xml version="1.0" encoding="UTF-8" ?>

<xsl:stylesheet
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  version="1.0">

<xsl:output method="html" indent="yes" />

<xsl:template match="/">
  <html>
    <head>
    </head>
    <body>
      <xsl:call-template name="replace">
        <xsl:with-param name="str" select="Hoge" />
      </xsl:call-template>
    </body>
  </html>
</xsl:template>

<!-- 改行コードを "<br />" に変換 -->
<xsl:template name="replace">
  <xsl:param name="str" />

  <xsl:choose>
    <xsl:when test="contains($str, '&#10;')">
      <xsl:value-of select="substring-before($str, '&#10;')" /><br />
      <xsl:call-template name="replace">
        <xsl:with-param name="str" select="substring-after($str, '&#10;')" />
      </xsl:call-template>
    </xsl:when>
    <xsl:otherwise>
      <xsl:value-of select="$str" />
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>
{% endhighlight %}

---

難しい内容でもありませんが、変換する機会は少なくないし、知らないとハマるかも知れない内容なので記録しておいた次第です。

以上。

