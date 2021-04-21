---
layout   : single
title    : "Ruby - 日本語部分のみ URL エンコード！"
published: true
date     : 2013-08-15 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
- 正規表現
---

Ruby + OpenURI で URL を読み込む際に、URL に日本語が含まれているとそのままでは読み込めないため、URL エンコードして読み込みます。

しかし、URL 全体をまとめて URL エンコードすると、日本語以外でエンコードされてしまう部分もあります。（`/` や `#` 等）

以下、各種エンコード方法の比較と対策についての記録です。

<!--more-->

#### 0. 前提条件

- Ruby 2.0.0-p247 での作業を想定。
- エンコード前の URL とエンコード後の期待する結果は以下のとおり。

``` bash 
[ エンコード前 ]
URL_1 = "http://www.mk-mode.com/テスト"
URL_2 = "http://www.mk-mode.com/#test"

[ エンコード後の期待する結果 ]
URL_1 = "http://www.mk-mode.com/%E3%83%86%E3%82%B9%E3%83%88"
URL_2 = "http://www.mk-mode.com/#test"
```

#### 1. 検証用 Ruby スクリプト作成

以下のような簡単な各種エンコード検証用の Ruby スクリプトを作成する。また、期待する結果になるようなメソッドも作成している。

``` ruby 
require 'cgi'
require 'erb'
require 'uri'

URL_1 = "http://www.mk-mode.com/テスト"
URL_2 = "http://www.mk-mode.com/#test"

# 日本語のみ URL エンコード
def encode_ja(url)
  ret = ""
  url.split(//).each do |c|
    if  /[-_.!~*'()a-zA-Z0-9;\/\?:@&=+$,%#]/ =~ c
      ret.concat(c)
    else
      ret.concat(CGI.escape(c))
    end
  end
  return ret
end

puts "[ エンコード前 ]"
puts "URL_1 = \"#{URL_1}\""
puts "URL_2 = \"#{URL_2}\""
puts
puts "[ URI.escape (obsolete) ]"
puts "URL_1 = \"#{URI.escape(URL_1)}\""
puts "URL_2 = \"#{URI.escape(URL_2)}\""
puts
puts "[ URI.encode (obsolete) ]"
puts "URL_1 = \"#{URI.encode(URL_1)}\""
puts "URL_2 = \"#{URI.encode(URL_2)}\""
puts
puts "[ CGI.escape ]"
puts "URL_1 = \"#{CGI.escape(URL_1)}\""
puts "URL_2 = \"#{CGI.escape(URL_2)}\""
puts
puts "[ URI.encode_www_form_component ]"
puts "URL_1 = \"#{URI.encode_www_form_component(URL_1)}\""
puts "URL_2 = \"#{URI.encode_www_form_component(URL_2)}\""
puts
puts "[ ERB::Util.url_encode ]"
puts "URL_1 = \"#{ERB::Util.url_encode(URL_1)}\""
puts "URL_2 = \"#{ERB::Util.url_encode(URL_2)}\""
puts
puts "[ 日本語のみ URL エンコード ]"
puts "URL_1 = \"#{encode_ja(URL_1)}\""
puts "URL_2 = \"#{encode_ja(URL_2)}\""
```

「日本語のみ URL エンコード」メソッドでは、URL 文字列を１文字ずつ分解し、各文字が半角英数字や半角記号かどうかを正規表現で判定し、半角英数字や半角記号以外を URL エンコードする処理を行なっている。

#### 2. 検証用 Ruby スクリプト実行

作成した Ruby スクリプトを実行してみる。

``` bash 
$ ruby test_url_encode.rb
[ エンコード前 ]
URL_1 = "http://www.mk-mode.com/テスト"
URL_2 = "http://www.mk-mode.com/#test"

[ URI.escape (obsolete) ]
URL_1 = "http://www.mk-mode.com/%E3%83%86%E3%82%B9%E3%83%88"
URL_2 = "http://www.mk-mode.com/%23test"

[ URI.encode (obsolete) ]
URL_1 = "http://www.mk-mode.com/%E3%83%86%E3%82%B9%E3%83%88"
URL_2 = "http://www.mk-mode.com/%23test"

[ CGI.escape ]
URL_1 = "http%3A%2F%2Fwww.mk-mode.com%2F%E3%83%86%E3%82%B9%E3%83%88"
URL_2 = "http%3A%2F%2Fwww.mk-mode.com%2F%23test"

[ URI.encode_www_form_component ]
URL_1 = "http%3A%2F%2Fwww.mk-mode.com%2F%E3%83%86%E3%82%B9%E3%83%88"
URL_2 = "http%3A%2F%2Fwww.mk-mode.com%2F%23test"

[ ERB::Util.url_encode ]
URL_1 = "http%3A%2F%2Fwww.mk-mode.com%2F%E3%83%86%E3%82%B9%E3%83%88"
URL_2 = "http%3A%2F%2Fwww.mk-mode.com%2F%23test"

[ 日本語のみ URL エンコード ]
URL_1 = "http://www.mk-mode.com/%E3%83%86%E3%82%B9%E3%83%88"
URL_2 = "http://www.mk-mode.com/#test"
```

説明すると、

1. `URI.escape`, `URI.encode` は現在は "obsolete（もはや使われない）" メソッドであり、日本語と `#`（今回の例の場合） という記号がエンコードされる。  
   結果、日本語は正常に URL エンコードされるが、URL エンコードして欲しくない記号もエンコードされる。
2. `CGI.escape`, `URI.encode_www_form_component`, `ERB::Util.url_encode` は、日本語部分と存在する記号全てが URL エンコードされる。
3. 最後の「日本語のみ URL エンコード」するメソッドを使用した場合は、正常な（期待どおりの）結果となる。

ちなみに、`CGI.escape`, `URI.encode_www_form_component`, `ERB::Util.url_encode` は、以下のようなクエリストリングで URL を指定したい局面で使用する。

``` ruby 
url = "http://www.mk-mode.com/hoge?url=#{CGI.escape('http://www.mk-mode.com/テスト')}"
p url
# => http://www.mk-mode.com/hoge?url=http%3A%2F%2Fwww.mk-mode.com%2F%E3%83%86%E3%82%B9%E3%83%88
```

#### 参考サイト

- [singleton method CGI.escape](http://doc.ruby-lang.org/ja/2.0.0/method/CGI/s/escape.html "singleton method CGI.escape")

---

今までそれほど厳密に URL エンコードの処理を行いたい場面はありませんでした。

しかし、今回ある処理を実装しようとした際に不都合に感じる場面があったので、調査してみた次第です。  
当方、ネット（HTML）上から情報を取得（Web スクレイピング）して、処理をすることが好きなので、余計に不都合に感じる場面があるのかも知れませんが。。。

以上。

