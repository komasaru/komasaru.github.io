---
layout   : single
title    : "Octopress - rake clean 不具合！"
published: true
date     : 2013-07-24 00:20:00 +0900
comments : true
categories:
- プログラミング
- ブログ
tags:
- Ruby
- Octopress
---

当方、ブログは Ruby 製静的ブログ構築フレームワーク Octopress を使用しています。

しかし最近、キャッシュを削除するコマンド `rake clean` を実行してもキャッシュが削除されません。  

以下、記録です。

<!--more-->

#### 0. 前提条件

- Linux Mint 14 (64bit) での作業を想定。
- Octopress 2.0 は 2013/07/10 現在の GitHub ソースを使用。
- Ruby は 2.0.0-p247 を使用。

#### 1. 現象

キャッシュを削除すべく以下のコマンドを実行しても、キャッシュが削除されない。

``` bash 
$ rake clean
```

#### 2. 原因

"Rakefile" の `clean` 部分を確認してみると以下のようになっている。

File: `Rakefile`

{% highlight ruby linenos %}
task :clean do
  rm_rf [".pygments-cache/**", ".gist-cache/**", ".sass-cache/**", "source/stylesheets/screen.css"]
end
{% endhighlight %}

この中の `rm_rf` メソッドは、Unix(Linux) コマンド `rm -rf` と同等のことをする「fileutils ライブラリ - FileUtils モジュール」のラッパーメソッド "Kernel#rm_rf" であり、上記は配列の要素それぞれに対して `rm -rf` を実行するというものである。

しかし、この `rm_rf` メソッドは Unix(Linux) コマンド `rm -rf` と同等のことをするとは言っても、ワイルドカードは使用できない。（["Kernel#rm_rf" のドキュメント](http://doc.ruby-lang.org/ja/2.0.0/method/Kernel/i/rm_rf.html "instance method Kernel#rm_rf")によると「"Dir.glob" で利用できる glob パターンを指定する」となっている）  
それなのに、ワイルドカードを指定しているからキャッシュが削除できなくなっているようだ。

当方、最近 Octopress ソースファイルや Octopress で使用する Ruby をアップデートしたが、それが原因ではないかと思い、試しにバックアップしていた以前の環境で試してみたが、やはりキャッシュは削除できなかった。

さらに、"Kernel#rm_rf" ではなく `FileUtiles.rm_rf` を使用してもキャッシュは削除できなかった。

#### 3. 対策

取り急ぎ、以下のように、ワイルドカードを `Dir.glob` で展開したものに対して `rm_rf` を実行するように変更する。  

File: `Rakefile`

{% highlight ruby linenos %}
task :clean do
  rm_rf [Dir.glob(".pygments-cache/**"), Dir.glob(".gist-cache/**"), Dir.glob(".sass-cache/**"), "source/stylesheets/screen.css"]
end
{% endhighlight %}

これで、`rake clean` でキャッシュが削除されるようになった。

#### 参考サイト

- [instance method Kernel#rm_rf](http://doc.ruby-lang.org/ja/2.0.0/method/Kernel/i/rm_rf.html "instance method Kernel#rm_rf")
- [module function FileUtils.#rm_rf](http://doc.ruby-lang.org/ja/2.0.0/method/FileUtils/m/rm_rf.html "module function FileUtils.#rm_rf")

---

直接の原因は判明したものの、いつから、なぜこのような不具合が発生するようになったのかの経緯（何が影響しているのかということ）は、現時点では未解決です。  
Octopress を使い始めた当初は、`rake clean` でキャッシュが削除されてたと思うのですが。。。

また、今回の対策方法が正しかったのか否かも若干疑問を感じています。（メソッドの使用方法は正しいはずですが）  
もしも詳細が判明したら、当記事に追記するつもりです。

以上。

