---
layout   : single
title    : "Jekyll - Octopress から記事ファイルの移行！"
published: true
date     : 2019-01-30 00:20:00 +0900
comments : true
categories:
- ブログ
tags:
- Jekyll
- Ruby
- HTML
- Markdown
- Octopress
---

Octopress から Jekyll への移行すべく Markdown 形式の記事ファイルを編集しました。

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* Ruby 2.6.0-p0 での作業を想定。
* Jekyll で使用するテーマは Gem 化された [Minimal Mistakes](https://mmistakes.github.io/minimal-mistakes/ "Minimal Mistakes") を想定。
* GitHub Pages での運用は想定していない。（自前サーバでの運用を想定）

以下、この度、当方の環境に合わせて行った作業。（基本的に、コマンドラインから `sed` コマンドで一括変換）

### 1. `layout` 設定値の変更

`layout` の設定値を `post` から `single` に変更する。

``` text
$ find ./_posts -name "*.md" | xargs sed -i -e 's/^layout: *\?post/layout: single/'
```

### 2. `date` の書式変更

`date: YYYY-MM-DD hh:mm` を `date: YYYY-MM-DD hh:mm:ss +0900` に変更する。（不要かもしれないが、念の為）

``` text
$ find ./_posts -name "*.md" | xargs sed -i -e 's/^date: *\([^ ]\+\) \+\([0-9]\{2\}:[0-9]\{2\}\)/date: \1 \2:00 +0900/g'
```

### 3. `keywords` を削除

今回の移行に直接は関係ないが、 SEO 的に HTML 内 `meta` タグでの `KEYWORD` の指定はもはや不要なので、削除しておく。

``` text
$ find ./_posts -name "*.md" | xargs sed -i -e ':lbl1;N;s/^\(\-\-\-.*\?\).*\?keywords:.*\?\-\-\-/\1---/;b lbl1;'
```

### 4. 複数行コードブロックの変更

複数行コードブロックをLiquid タグ `highlight` に変更するために、

{% highlight text %}
{% raw %}```{% endraw %} lang file_name
{% raw %}```{% endraw %}
{% endhighlight %}

を

``` text
{% raw %}File: `file_name`  

{% highlight lang linenos %}
{% endhighlight %}{% endraw %}
```

に変更する。但し、

{% highlight text %}
{% raw %}```{% endraw %} text
{% raw %}```{% endraw %}
{% endhighlight %}

等のファイル名のないものや行番号の不要なものは（取り急ぎ）そのまま。

``` text
{% raw %}$ find ./_posts -name "*.md" | xargs sed -i -e ':lbl1;N;s/``` \+\([^ \n]\+\) \+\([^ \n]\+\)\(.\+\)```/File: `\2`\n\n{% highlight \1 linenos %}\3{% endhighlight %}/;b lbl1;'{% endraw %}
```

### 5. コードブロック内 `[` 〜 `]` の変更

コードブロック内の `[` 〜 `]` を `{% raw %}{{ "[" }}{% endraw %}` 〜 `{% raw %}{{ "]" }}{% endraw %}` に変更する。

面倒＆量が少ないので手動で。2ファイルのみだった。

### 6. 記事間リンクの変更

`_config.yml` で指定した `site.baseurl` に対応するために、

``` text
[xxxx](/yyyy/mm/dd/xxxx.png "xxxx")
```

を

``` text
{% raw %}[xxxx]({{site.baseurl}}/yyyy/mm/dd/xxxx.png "xxxx"){% endraw %}
```

の書式に変更する。

``` text
{% raw %}$ find ./_posts -name "*.md" | xargs sed -i -e 's/\](\/\([0-9]\{4\}\)\//]({{site.baseurl}}\/\1\//g'{% endraw %}
```

### 7. 画像リンクの変更

`_config.yml` で指定した `site.baseurl` に対応するために、

``` text
![xxxx](/images/yyyy/mm/dd/xxxx.png "xxxx")
```

を

``` text
{% raw %}![xxxx]({{site.baseurl}}/images/yyyy/mm/dd/xxxx.png "xxxx"){% endraw %}
```

の書式に変更する。

``` text
{% raw %}$ find ./_posts -name "*.md" | xargs sed -i -e 's/\](\/images\//]({{site.baseurl}}\/images\//g'{% endraw %}
```

また、 Octopress 用記事ファイル内に

``` text
{% raw %}{% img /images/yyyy/mm/dd/xxxx.png 'xxxx' 'xxxx'%}{% endraw %}
```

ような書式のものも残っていたので、同様に

``` text
![xxxx]({{site.baseurl}}/images/yyyy/mm/dd/xxxx.png "xxxx")
```

の書式に変更。

``` text
{% raw %}$ find ./_posts -name "*.md" | xargs sed -i -e 's/{% *img \+\(\/images[^ ]\+\) \+'\''\(.\+\)'\'' \+'\''\([^ ]\+\)'\'' *%}/![\3]({{site.baseurl}}\1 "\2")/g'{% endraw %}
```

### 8. more タグの変更

`_config.yml` で `excerpt_separator: "<!--more-->"` とスペース無しで指定したので、念の為、スペースを取り除く。（一覧表示時に抜粋処理で失敗しないよう）

``` text
{% raw %}$ find ./_posts -name "*.md" | xargs sed -i -e 's/<!-- \+more \+-->/<!--more-->/g'{% endraw %}
```

### 9. MathJax （数式）のインライン表示変更

実際には、 `{% raw %}{% m %}{% endraw %}` 〜 `{% raw %}{% em %}{% endraw %}` を `$$` 〜 `$$` に変更する。

``` text
{% raw %}$ find ./_posts -name "*.md" | xargs sed -i -e 's/{% *e\?m *%}/$$/g'{% endraw %}
```

### 10. MathJax （数式）の複数行表示変更

実際には、 複数行の

``` text
{% raw %}{% math %}
 :
{% endmath %}{% endraw %}
```

を

``` text
{% raw %}$$
 :
$${% endraw %}
```

に変更。

``` text
{% raw %}$ find ./_posts -name "*.md" | xargs sed -i -e 's/{% *\(end\)\?math *%}/$$/g'{% endraw %}
```

### 11. その他

* デフォルトだと、フィードは `feed.xml` になるので、 `_config.yml` を編集。

File: `_config.yml`

``` yaml
# Jekyll Feed
feed:
  path: "atom.xml"
```

* カテゴリ／タグ一覧のページ内リンク（日本語のみ）が正常に機能しない（ブラウザの URL 欄で再確定が必要）ので、 `categories.html`, `tags.html` 内の `#` を削除し、ページ内リンクでなく、直接各カテゴリ／タグのページへ移動する。（URL エンコードも効果なし）

### 12. 参考サイト

* [Jekyll](https://jekyllrb.com/ "Jekyll")
* [Jekyll Tips](https://jekylltips-ja.github.io/ "Jekyll Tips")
* [Quick-Start Guide - Minimal Mistakes](https://mmistakes.github.io/minimal-mistakes/docs/quick-start-guide/ "Quick-Start Guide - Minimal Mistakes")

---

以上。

