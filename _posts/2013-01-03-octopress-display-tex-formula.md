---
layout   : single
title    : "Octopress - TeX で数式表示！"
published: true
date     : 2013-01-03 00:20:00 +0900
comments : true
categories:
- ブログ
tags:
- Octopress
- TeX
---

WordPress でブログを運営していた時は、$$\TeX$$ によるちょっとした数式表示をプラグインで実現していました。  
(多少手の混んだ数式は別途、$$\TeX$$ ソフトで作成して画像を表示させていました)

少し調べてみたところ、Octopress 用のプラグインがありました。  
そのプラグインを使用せず、`_config.yml` の `markdown: rdiscount` を `markdown: kramdown` や `markdown: maruku` に変更後、$$\TeX$$ 書式を '$' や '$$' で囲った上で JavaScript を使用する方法もあるようですが、当方はプラグインを利用する方法を採用することにしました。

<!--more-->

### 0. 前提条件

- Linux Mint 13 Maya (64bit)
- Ruby 1.9.3-p194
- Octopress 2.0

使用する環境は特に問わないはず。

### 1. プラグインのインストール

[こちら](https://gist.github.com/834610 "jessykate / Jekyll nd Octopress Liquid tag for MathJax.rb") から `MathJax.rb` をダウンロードし、`plugins` ディレクトリに配置する。

### 2. head.html の編集

`MAthJax.js` を読み込めるように `_includes/custom/head.html` に以下の記述を追加する。

File: `_includes/custom/head.html`

{% highlight js linenos %} 
<script src="http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML" type="text/javascript"></script>
{% endhighlight %}

### 3. 使い方

数式をブロックとして表示させるには、`{{ "{% math " }}%}` と `{{ "{% endmath " }}%}` で囲み、数式をインラインで表示させるには、`{{ "{% m " }}%}` と `{{ "{% em " }}%}` で囲む。

``` text
{{ "{% math " }}%}
N(m,\sigma^{2})=\frac{1}{\sigma\sqrt{2\pi}}e^{-\frac{(x-m)^2}{2\sigma^{2}}}
{{ "{% endmath " }}%}
```

とすれば、以下のように表示されるはず。

$$
N(m,\sigma^{2})=\frac{1}{\sigma\sqrt{2\pi}}e^{-\frac{(x-m)^2}{2\sigma^{2}}}
$$

ただ、インラインで `<` や `^` 等を使用すると正常に変換さいれないことある(?)  
jekyll が `{{ "{% m " }}%}` よりも先に `<` や `^` 等を変換しているように見える。  
しかし、これは `<` や `^` 等の前後にスペースを挿入すれば解消する。

### 参考サイト

- [MathJax](http://www.mathjax.org/ "MathJax")
- [jessykate / Jekyll nd Octopress Liquid tag for MathJax.rb](https://gist.github.com/834610 "jessykate / Jekyll nd Octopress Liquid tag for MathJax.rb")

---

若干解せない部分もあるが、これで、一応はちょっとした数式を容易に記述できるようになりました。  
ちょっとした数式ばかりか、本格的なものまで記述可能です。  

当方の過去の WordPress から移行した記事も全てインライン部分は(自作の XML ファイルからの変換スクリプトで)対応させました。

ちなみに、このプラグインとは別に GoogleChart API の $$\TeX$$ 画像を取得するプラグインも試してみましたが、取得した画像の見た目が綺麗でなかった(画像が荒かったり、位置が多少ずれたりする)ので、こちらのプラグインにしてみました。

また、当方は自作サーバに $$\TeX$$ をインストール済みで利用できる状態なので、外部サービスを使わず自前で $$\TeX$$ 変換処理したいところでもありますが。。。

以上。

