---
layout   : single
title    : "Ruby - bitly API v3 で URL 短縮！"
published: true
date     : 2013-07-18 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
- bitly
- OAuth
---

こんばんは。

当方、普段 Twitter でのツイート時等に使用する URL は、URL 短縮サービス "[bitly](https://bitly.com/ "bitly")" を利用して短縮しています。

今回は、bitly API V3 を使用して URL を短縮する作業を Ruby で実装してみました。

以下、作業記録です。

<!--more-->

#### 0. 前提条件

- Ruby 2.0.0-p247 での作業を想定。
- bitly サービスのアカウント取得済み（APIキーも取得済み）である。
- API キー認証も OAuth 認証もできるようにする。（今回使用する `shorten` がどちらの認証方法も使用可なので）  
  API キー認証を使用するには、ユーザ名・API キーが必要。  
  OAuth 認証を使用するには、アクセストークンが必要。（「[bitly - OAuth 認証アクセストークン取得！]({{site.baseurl}}/2013/07/16/bitly-get-access-token "bitly - OAuth 認証アクセストークン取得！")」参照）
- bitly API のバージョンは V3 を想定。

#### 1. 事前調査

bitly API V3 について、事前に調査して主に判明したこと。

1. アクセス制限について  
   １時間単位で管理されているようだが、制限回数は不明。  
   アクセス制限に引っかかった場合は、１時間待つ。  
   短時間に大量にアクセスする必要のあるユーザは、別途問い合わせをするとよいようだ。
2. 認証方法について  
   bitly API の多くが、 OAuth 認証を必要としている。  
   今回利用する `shorten` は API キーでの認証も可能である。  
   OAuth 認証が可能なものはできるだけ OAuth 認証にした方がよい。（OAuth 認証も利用できるものは API キー認証の利用は非推奨）
3. 接続先ドメインについて  
   API キー認証では、"api.bitly.com" か "api-ssl.bitly.com" どちらでもよい。  
   OAuth 認証では、"api-ssl.bitly.com" のみ。
4. レスポンスフォーマットについて  
   デフォルトでは JSON フォーマットで返却されるが、 XML フォーマットで受け取ることも可能。  
   （一部では TXT フォーマットで受け取ることも可能）
5. ロング URL について  
   短縮化前のロング URL に半角スペースがあってはならない。半角スペースがある場合は URL エンコードしておくこと。  
   また、ロング URL のドメイン名とクエリストリングの間には `/` が存在しないといけない。（ドメイン名の最後に `/` を付与せずに `?` で始まるクエリストリングをつなげた URL であってはならないということ）
6. `shorten` で取得可能な項目について  
   "status_code", "status_txt", "data"{"long_url", "url", "hash", "global_hash", "new_hash"} が取得可能である。

#### 2. Ruby スクリプト作成

以下のように Ruby スクリプトを作成してみた。  
API キー認証も OAuth 認証も利用できるようにしている。スクリプト内のインスタンス化部分で、利用したい認証のコメントを解除して使用する。

File: `bitly_shorten.rb`

{% highlight ruby linenos %}
#*********************************************
# bitly API v3 で ロング URL を短縮する。
# - API キー認証、OAuth 認証両方対応
#   （インスタンス化部分で切り替え可能）
#*********************************************
#
require 'net/http'   # API キー認証用
require 'net/https'  # OAuth 認証用
require 'cgi'
require 'nkf'
require 'json'

# API キー認証用
DOMAIN      = "api.bitly.com"  # (or "api-ssl.bitly.com")
USER        = "hoge"
API_KEY     = "R_XXXXXXXXXXXXXXXXXXXXXXX"
# OAuth 認証用
DOMAIN_SSL  = "api-ssl.bitly.com"
TOKEN       = "XXXXXXXXXXXXXXXXXXXXXXXX"

# API キー認証用クラス
class BitlyApikey
  def shorten(url)
    params = "/v3/shorten?login=#{USER}&apiKey=#{API_KEY}&longURL=#{CGI.escape(NKF.nkf("-w -m0", url))}"
    http = Net::HTTP.new(DOMAIN, 80)
    res = http.start {http.get(params)}
    return JSON.parse(res.body)
  end
end

# OAuth 認証用クラス
class BitlyOauth
  def shorten(url)
    params = "/v3/shorten?access_token=#{TOKEN}&longURL=#{CGI.escape(NKF.nkf("-w -m0", url))}"
    https = Net::HTTP.new(DOMAIN_SSL, 443)
    https.use_ssl = true
    https.verify_mode = OpenSSL::SSL::VERIFY_PEER
    res = https.start {https.get(params)}
    return JSON.parse(res.body)
  end
end

# インスタンス化
bitly = BitlyApikey.new   # API キー認証用
# bitly = BitlyOauth.new  # OAuth 認証用

# URL 短縮
res = bitly.shorten("http://www.google.com/")

# 結果表示
puts "status_code: #{res["status_code"]}"
puts "status_txt : #{res["status_txt"]}"
if res["status_code"] == 200
  puts "long_url   : #{res["data"]["long_url"]}"
  puts "url        : #{res["data"]["url"]}"
  puts "hash       : #{res["data"]["hash"]}"
  puts "global_hash: #{res["data"]["global_hash"]}"
  puts "new_hash   : #{res["data"]["new_hash"]}"
end
{% endhighlight %}

- [Gist - Ruby script to shorten a long url to a short url by bitly API V3.](https://gist.github.com/komasaru/5939019 "Ruby script to shorten a long url to a short url by bitly API V3.")

#### 3. Ruby スクリプト実行

作成したスクリプトを以下のようにして実行する。

``` bash 
$ ruby bitly_shorten.rb
status_code: 200
status_txt : OK
long_url   : http://www.google.com/
url        : http://bit.ly/12iabO3
hash       : 12iabO3
global_hash: 2V6CFi
new_hash   : 0
```

`status_code` が 200 でなかったらエラーなので、Ruby スクリプト等をよく確認する。

#### 4. 確認

bitly にログインし、先ほど Ruby スクリプトを実行して作成された短縮 URL が登録されているか確認する。

![BITLY_API_1]({{site.baseurl}}/images/2013/07/18/BITLY_API_1.png "BITLY_API_1")

#### 参考サイト

以下のサイトでは、認証については "Authentication"、リクエスト・レスポンスフォーマットについては "Request / Response Formats"、アクセス回数制限については "Rate Limiting"、`shorten` については "Links" に記載がある。

- [bitly API Documentation](http://dev.bitly.com/api.html "bitly API Documentation")

Ruby による URL エンコード、HTTP/HTTPS 通信等については以下を参照。

- [オブジェクト指向スクリプト言語 Ruby リファレンスマニュアル](http://doc.ruby-lang.org/ja/2.0.0/doc/index.html "オブジェクト指向スクリプト言語 Ruby リファレンスマニュアル")

---

Ruby スクリプト等を使用してツイートする場合には、今回の方法を応用すれば、リンク URL が自分のアカウントで管理できるようなります。  
将来、どのリンクがどれくらいクリックされた等統計を取るのに役立ちます。（実際、将来統計を取ることを考えています）

以上。

