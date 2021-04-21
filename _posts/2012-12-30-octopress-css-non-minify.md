---
layout   : single
title    : "Octopress - CSS を Minify しない！"
published: true
date     : 2012-12-30 00:20:00 +0900
comments : true
categories:
- ブログ
tags:
- Octopress
- CSS
---

[Octopress](http://octopress.org/ "Octopress") で `rake generate` すると、複数の `SCSS` ファイルから `screen.css` ファイルが作成されます。  
しかし、デフォルトでは、この `screen.css` ファイルの内容は高速化のために Minify され、テキストエディタで閲覧すると１行になっていて見にくいです。  

普段は、これでもよいのですが、テーマのデザインを編集する際には確認しづらいため不便に感じることがあります。

そこで、 Minify させないための設定についての記録です。

<!--more-->

### 0. 前提条件

- 作業 OS は Linux Mint 13 Maya (64bit)
- Ruby 1.9.3-p194
- Octopress 2.0

### 1. config.rb の編集

`config.rb` を以下のように編集する。  
`output_style` の値を `compressed` から `expanded` に変更するだけ。

File: `config.rb`

{% highlight diff linenos %} 
diff --git a/config.rb b/config.rb
index 727c96c..ce03eea 100644
--- a/config.rb
+++ b/config.rb
@@ -13,4 +13,5 @@ images_dir = "source/images"
 fonts_dir = "source/fonts"
 
 line_comments = false
-output_style = :compressed
+#output_style = :compressed
+output_style = :expanded
{% endhighlight %}

### 2. 確認

`generate` して `screen.css` を確認してみる。

``` bash 
$ rake generate
```

---

これで、`screen.css` を確認しやすくなりました。  
非常に簡単な話でした。

当然、デザインの編集作業時のみこのようにしているだけで、実際は高速化重視で Minify させています。

以上。

