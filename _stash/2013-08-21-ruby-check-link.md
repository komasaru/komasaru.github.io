---
layout   : single
title    : "Ruby - サイト内リンク切れチェック！"
published: true
date     : 2013-08-21 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
---

ある特定の Web サイト内に存在するリンク（`a` タグの `href` 属性）が切れているか否かのチェックする Ruby スクリプトを作成してみました。

ある有名なブログソフトのプラグインや RubyGems ライブラリに存在するような複雑なものではありませんが、それらのソースコードも若干参考にしています。

以下、参考までに Ruby スクリプトのご紹介。

<!--more-->

#### 0. 前提条件

- Ruby 2.0.0-p247 での作業を想定。
- Proxy 経由の接続は考慮する。
- 日本語を含む URL にも対応。
- 再帰的にはチェックしない。

#### 1. Ruby スクリプト

HTTP 関連については色々な記述方法があるが、今回は以下のように Ruby スクリプトを作成した。（概要はスクリプトの後に記している）  
（必要な RubyGems ライブラリ等はあらかじめインストールしておく）

File: `check_link.rb`

{% highlight ruby linenos %}
require 'addressable/uri'
require 'cgi'
require 'hpricot'
require 'net/http'
require 'net/https'
require 'open-uri'

# リンクチェック対象 URL
URL = "http://www.mk-mode.com/rails/"

# [CLASS] リンクチェック
class CheckLink
  # リンクチェック
  def check_link
    begin
      # Response チェック
      res = Net::HTTP.get_response(URI.parse(URL))
      return unless res.code == "200"

      # HTML 読込 ( a タグのみ取得・配列化 )
      as = Hpricot(OpenURI::open_uri(URL).read).search("a")

      # 各 a タグについて処理
      as.each do |a|
        # href 取得
        href = a.attributes['href']
        # クエリストリングならスキップ
        next if href.include?("?")
        # mailto ならスキップ
        next if href =~ /^mailto/

        # URL ( フルパス ) 設定
        if href =~ /^http/
          url_f = href
        else
          url_f = URI.join(URL, encode_ja(href)).to_s
        end

        # レスポンスチェック
        begin
          res = fetch(url_f)
          puts "[#{res.code}] #{url_f}" unless res.code == "200"
        rescue => e
          # その他のレスポンス（例外発生）時
          puts "[XXX] #{url_f}\n\t#{e}"
        end
      end
    rescue => e
      # その他の例外発生時
      STDERR.puts "[ERROR][#{self.class.name}.check_link] #{e}"
      exit 1
    end
  end

private

  # Fetch 処理
  def fetch(url, limit = 10)
    # HTTP リダイレクトが深すぎる場合は例外を発生させる
    raise ArgumentError, 'HTTP Redirect is too deep!' if limit == 0

    # 環境変数 HTTP_PROXY に設定されていれば Proxy 経由接続とみなす
    # ( Proxy 非考慮なら以下2行はコメントアウト )
    proxy_host, proxy_port = (ENV["HTTP_PROXY"] || '').sub(/http:\/\//, '').split(':')
    proxy = Net::HTTP::Proxy(proxy_host, proxy_port)

    # HTTP レスポンスのチェック
    #uri = URI.parse(url)                               # <= 日本語 URL 非対応
    #http = Net::HTTP.new(uri.host, uri.port)           # <= 日本語 URL 非対応 ( Proxy 非考慮 )
    #http = proxy.new(uri.host, uri.port)               # <= 日本語 URL 非対応 ( Proxy 考慮 )
    uri = Addressable::URI.parse(url)                   # <= 日本語 URL 対応
    #http = Net::HTTP.new(uri.host, uri.inferred_port)  # <= 日本語 URL 対応 ( Proxy 非考慮 )
    http = proxy.new(uri.host, uri.inferred_port)       # <= 日本語 URL 対応 ( Proxy 考慮 )
    http.open_timeout = 10
    http.read_timeout = 20
    if uri.scheme == "https"
      http.use_ssl = true
      http.verify_mode = OpenSSL::SSL::VERIFY_NONE
    end
    res = http.request(Net::HTTP::Get.new(uri.path))

    # レスポンス判定
    case res
    when Net::HTTPSuccess      # 2xx はそのまま
      res
    when Net::HTTPRedirection  # 3xx は再度 Fetch
      fetch(URI.join("#{uri.scheme}://#{uri.host}:#{uri.port}", encode_ja(res['location'])).to_s, limit - 1)
    else                       # その他はそのまま
      res
    end
  end

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
end

# リンクチェック
puts "CHECK [ #{URL} ]"
CheckLink.new.check_link
{% endhighlight %}

- [Gist - Ruby script to check link in a web site.](https://gist.github.com/komasaru/6181771 "Gist - Ruby script to check link in a web site.")

簡単に説明すると、

- チェック対象ページの HTTP レスポンスをチェックし "200" の場合だけ処理。
- 対象ページ内のリンク URL を HTML パーサ Hpricot で全件取得。
- 日本語 URL は URL エンコード。
- `URI.parse` は日本語 URL に対応していないので、`Addressable::URI.parse` を使用。
- `HTTPS` プロトコルの場合は SSL 接続。
- タイムアウトの処理も行う。（接続時に最大10秒待ち、20秒で例外発生）
- レスポンスコードが `3xx` の場合はリダイレクト処理。
- ３桁のレスポンスコード以外のエラー（例外）は "XXX" で表現。
- このスクリプト内の `a` タグを `img` タグに、 `href` 属性を `src` 属性にすれば、画像のリンクチェックができる。
- ちなみに、再帰的にチェックしたい場合は、終了条件をよく考えて実装しないと無限ループになるので要注意！（特に、他人のサイトをチェックする場合）

#### 2. Ruby スクリプト実行

定数 `URL` に検証対象の URL を設定して実行してみる。

``` bash 
$ ruby check_link.rb
CHECK [ http://www.mk-mode.com/rails/ ]
[403] http://jigsaw.w3.org/css-validator/check/referer

$ ruby check_link.rb
CHECK [ http://www.mk-mode.com/octopress/ ]
[404] http://www.mk-mode.com/octopress/blog/archives
[XXX] http://octopress.org
        HTTP request path is empty
```

#### 参考サイト

- [library net/http](http://doc.ruby-lang.org/ja/2.0.0/library/net=2fhttp.html "library net/http")
- [RubyのAddressable::URIを使う - きたももんががきたん。](http://d.hatena.ne.jp/kitamomonga/20100316/ruby_gem_addressable_howto "RubyのAddressable::URIを使う - きたももんががきたん。")
- [instance method Net::HTTP#open_timeout](http://doc.ruby-lang.org/ja/2.0.0/method/Net=3a=3aHTTP/i/open_timeout.html "instance method Net::HTTP#open_timeout")
- [instance method Net::HTTP#read_timeout](http://doc.ruby-lang.org/ja/2.0.0/method/Net=3a=3aHTTP/i/read_timeout.html "instance method Net::HTTP#read_timeout")
- [singleton method Net::HTTP.Proxy](http://doc.ruby-lang.org/ja/2.0.0/method/Net=3a=3aHTTP/s/Proxy.html "singleton method Net::HTTP.Proxy")

---

それほど複雑な処理ではありませんが、結構使えるものになりました。

Ruby ではなく、Unix 系コマンド `wget` や `curl` でも同様のことは行えます。  
色々と試してみるのも HTTP について理解が深まって良いかも知れません。

以上。

