---
layout   : single
title    : "Octopress - Liquid テンプレート内での Liquid タグをエスケープ！"
published: true
date     : 2012-12-27 00:20:00 +0900
comments : true
categories:
- ブログ
tags:
- Octopress
- Ruby
- jekyll
---

Octopress は、jekyll を使って静的なブログを簡単に構築できるようにしたフレームワークです。  
そして、jekyll は Liquid という Ruby のテンプレートエンジンを採用しています。

たとえば、Octopress の記事内でソースコードを表示させたい場合、`{{ "{%" }} codeblock %}` と `{{ "{%" }} endcodeblock %}` の Liquid タグで囲んで記述します。  
しかし、ソースコード内に Liquid タグが含まれる場合は、`generate` するとそのタグも展開されてしまします。

以下、Liquid テンプレート内の Liquid タグをエスケープする方法についての記録です。

<!--more-->

### 1. 対応方法

ソースコード内の `{{ "{%" }} this %}` をエスケープする場合、 `{{ "{{" }} "%{ this " }}%}` とする。

ソースコード内の `{{ "{{" }} this }}` をエスケープする場合、 `{{ "{{ " }}"{{ "{{" }} this " }}}}` とする。

要は、開始タグの前に `｛｛ "` を、終了タグの前に `" ｝｝` を付加するということ。

> *【2013.06.09 追記】  
> 実際は、開始タグのみエスケープすれば、終了タグはエスケープする必要はなかった。*

### 2. 参考サイト

- [How to escape liquid template tags? - Stack Overflow](http://stackoverflow.com/questions/3426182/how-to-escape-liquid-template-tags "How to escape liquid template tags? - Stack Overflow")

---

少し面倒に感じますが、これでソースコード内に Liquid タグが存在しても問題なく表示させることが可能になります。  
（Liquid タグが存在するソースコードを表示させる機会もそんなに無いとは思いますが）

以上。

