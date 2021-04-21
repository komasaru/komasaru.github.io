---
layout   : single
title    : "Ruby - TinyURL で URL 短縮！"
published: true
date     : 2016-03-02 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
---

過去に Ruby で URL を [Bitly](https://bitly.com/ "Bitly") 短縮する方法について記事にしました。

* [Ruby - BitLy API v3 で URL 短縮！]({{site.baseurl}}/2013/07/18/ruby-url-shorten-by-bitly-api/ "Ruby - BitLy API v3 で URL 短縮！")

今回は、Ruby で URL を [TinyURL](http://tinyurl.com/ "TinyURL") 短縮する方法についてです。

<!--more-->

### 0. 前提条件

* Ruby 2.3.0-p0 での作業を想定。
* RubyGems ライブラリも公開されているが、今回は使用しない。
* Ruby を使用しているとは言っても、やっていることは指定の URL にクエリストリングを付加してアクセスして、レスポンスから短縮された URL を取得しているだけ。

### 1. Ruby スクリプト作成

File: `tinyurl_shoten.rb`

{% highlight ruby linenos %}
#!/usr/local/bin/ruby
# coding:utf-8
#*************************************
# TinyURL API で ロング URL を短縮する
#*************************************
#
require 'cgi'
require 'open-uri'

class TinyurlShorten
  URL_BASE = "http://tinyurl.com/api-create.php"

  def initialize(arg)
    @url_long = arg
  end

  def shorten
    puts "URL(LONG) : #{@url_long}"
    query = "url=#{URI.encode(@url_long)}"
    url_short = open("#{URL_BASE}?#{query}") { |f| f.read }
    puts "URL(SHORT): #{url_short}"  # => http://tinyurl.com/j3nceqk
  end
end

if __FILE__ == $0
  exit 0 unless arg = ARGV.shift
  TinyurlShorten.new(arg).shorten
end
{% endhighlight %}

* [Gist - Ruby script to shorten a url by TinyURL.](https://gist.github.com/komasaru/dd2a73954811406c68f3 "Gist - Ruby script to shorten a url by TinyURL.")

以下は、 Net/HTTP ライブラリを使用したバージョン。

File: `tinyurl_shoten_2.rb`

{% highlight ruby linenos %}
#!/usr/local/bin/ruby
# coding:utf-8
#*************************************
# TinyURL API で ロング URL を短縮する
#*************************************
#
require 'cgi'
require 'net/http'
require 'open-uri'

class TinyurlShorten
  SERVER = "tinyurl.com"
  PATH   = "/api-create.php"

  def initialize(arg)
    @url_long = arg
  end

  def shorten
    puts "URL(LONG) : #{@url_long}"
    query = "url=#{URI.encode(@url_long)}"
    url_short = Net::HTTP.get(SERVER, "#{PATH}?#{query}")
    puts "URL(SHORT): #{url_short}"  # => http://tinyurl.com/j3nceqk
  end
end

exit 0 unless __FILE__ == $0
exit 0 unless arg = ARGV.shift
TinyurlShorten.new(arg).shorten
{% endhighlight %}

* [Gist - Ruby script to shorten a url by TinyURL.(ver.2)](https://gist.github.com/komasaru/3e17d1f33f5588371117 "Gist - Ruby script to shorten a url by TinyURL.(ver.2)")

### 3. Ruby スクリプト実行

コマンドライン引数に短縮したい URL を指定して実行するだけ。

``` text
$ ./tinyurl_shorten.rb http://www.mk-mode.com/
URL(LONG) : http://www.mk-mode.com/
URL(SHORT): http://tinyurl.com/j3nceqk

$ ./tinyurl_shorten_2.rb http://www.mk-mode.com/
URL(LONG) : http://www.mk-mode.com/
URL(SHORT): http://tinyurl.com/j3nceqk
```

---

当方は普段は Bitly 短縮を利用しているので TinyURL 短縮を利用することはありませんが、有事の際の Bitly 短縮の代替として TinyURL 短縮について理解しておいても損はないでしょう。

以上。

