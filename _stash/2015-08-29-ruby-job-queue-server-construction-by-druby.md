---
layout   : single
title    : "Ruby - dRuby でジョブキューサーバ構築！"
published: true
date     : 2015-08-29 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
---

前回に引き続き、Ruby の分散オブジェクトプログラミングするためのライブラリ dRuby についての内容です。

今回は、 dRuby を利用してジョブキューサーバ＆クライアントを構築してみました。

要は、キューに順次プッシュした内容をクライアント側から順次ポップする仕組みのことです。

<!--more-->

### 0. 前提条件

* Linux Mint 17.2(64bit) での作業を想定。
* Ruby 2.2.3-p173 での作業を想定。
* 本来は複数のマシンで実行することが多いと思うが、今回は１つのマシンでテストする。
* dRuby の簡単な使用例は「[Ruby - dRuby で分散処理！]({{site.baseurl}}/2015/08/25/ruby-distributed-processing-by-druby "Ruby - dRuby で分散処理！")」を参照。

### 1. サーバ側スクリプトの作成例

Queue オブジェクトを生成して待ち受けるのみの簡単なスクリプト。

File: `queue_server.rb`

{% highlight ruby linenos %}
#!/usr/local/bin/ruby
# codeing: utf-8
require 'drb/drb'

q = Queue.new
DRb.start_service("druby://localhost:8787", q, safe_level: 1)
DRb.thread.join
{% endhighlight %}

* `start_service` の `safe_level` を `1` に設定しているのは、 `instance_eval` による危険性を防ぐための処置。

### 2. クライアント側 Pop スクリプトの作成例

キューサーバから順次ポップして5秒後にコンソール出力するのみの簡単なスクリプト。（キューに溜め込まれるデータは時刻文字列を想定している）

File: `pop_client.rb`

{% highlight ruby linenos %}
#!/usr/local/bin/ruby
# coding: utf-8
require 'drb/drb'

obj = DRbObject.new_with_uri("druby://localhost:8787")
loop do |a|
  tm = obj.pop
  sleep 5
  puts "Received at #{tm}."
end
{% endhighlight %}

### 3. クライアント側 Push スクリプトの作成例

キューサーバへ現在時刻の文字列をプッシュするのみの簡単なスクリプト。

File: `push_client.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# coding: utf-8
require 'drb/drb'

obj = DRbObject.new_with_uri("druby://localhost:8787")
tm = Time.now.strftime("%Y-%m-%d %H:%M:%S")
obj.push tm
puts "Sended at #{tm}."
{% endhighlight %}

### 4. 動作確認

まず、１つ目の端末を立ち上げて、サーバ側スクリプトを実行する。

``` text
$ ./queue_server.rb

```

次に、２つ目の端末を立ち上げて、クライアント側 Pop スクリプトを実行する。

``` text
$ ./pop_client.rb

```

最後に、３つ目の端末を立ち上げて、クライアント側 Push スクリプトを何度も連続して実行してみる。

``` text
$ ./push_client.rb
Sended at 2015-07-28 23:34:02.
$ ./push_client.rb
Sended at 2015-07-28 23:34:03.
$ ./push_client.rb
Sended at 2015-07-28 23:34:03.
$ ./push_client.rb
Sended at 2015-07-28 23:34:04.
$ ./push_client.rb
Sended at 2015-07-28 23:34:04.
```

すると、２つ目の Pop クライアントの端末に５秒間隔で出力がなされるはずである。

``` text
$ ./pop_client.rb
Received at 2015-07-28 23:34:02.
Received at 2015-07-28 23:34:03.
Received at 2015-07-28 23:34:03.
Received at 2015-07-28 23:34:04.
Received at 2015-07-28 23:34:04.

```

### 5. 注意

* dRuby で構築したサーバをインターネットで外部に公開すべきではない。
* ローカルで使用する際もセキュリティ面に注意する。

### 6. 参考サイト

* [library drb(Ruby2.2.0)](http://docs.ruby-lang.org/ja/2.2.0/library/drb.html "library drb(Ruby2.2.0)")

---

当方、一度に並列で処理をされては困るような場合に、この仕組みを応用して順次処理を行うようにしています。  
（インターネット上からデータが配信されたら処理を行うようなシステムの場合に、データが集中的に配信されてもマシンに負荷をかけないようにするため）

以上。

