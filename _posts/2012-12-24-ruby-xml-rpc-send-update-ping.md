---
layout   : single
title    : "Ruby - XML-RPC でサイト更新 Ping 送信！"
published: true
date     : 2012-12-24 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
- XML
---

Ruby で XML-RPC を使用して、ブログの更新状況を Ping サーバに送信する方法についてです。

WordPress のような動的サイトなら、記事投稿時にプラグインで指定の Ping サーバに更新情報を Ping 送信してくれますが、 Octopress のような静的サイトでは通常そのようなことができません。

という訳で、Ruby で作成してみました。  
取り敢えず手動ですが、サーバで cron 起動するなりすれば、自動になります。

<!--more-->

### 0. 前提条件

- Ruby 1.9.3-p327 で作成・動作確認。

### 1. Ruby スクリプト作成

作成した Ruby スクリプトは以下の通り。  
実際使用する際は、「Ping サーバ一覧」に URL を記入する。

File: `send_update_ping.rb`

{% highlight ruby linenos %}
# -*- coding: utf-8 -*-
require 'xmlrpc/client'

SITE_NAME = "hogehoge BLOG"          # 自サイト名称
SITE_URL  = "http://xxxxxxxx/blog/"  # 自サイト URL
# Ping サーバ一覧 ( 以下に送信先を設定する )
PING_SERVERS = [
  "http://api.my.yahoo.co.jp/RPC2",
  "http://blogsearch.google.co.jp/ping/RPC2"
]

# 処理クラス
class Main
  # サイト更新 Ping 送信処理
  def send
    begin
      PING_SERVERS.each do |svr|
        puts "- #{svr}"
        client = XMLRPC::Client.new2(svr)
        begin
          res = client.call("weblogUpdates.ping", SITE_NAME, SITE_URL)
        rescue XMLRPC::FaultException => e
          puts "  [ERROR] #{e.faultCode} - #{e.faultString}"
        rescue Exception => e
          puts "  [ERROR] #{e.class} - #{e.message}"
        end
      end
    rescue => e
      str_msg = "[ERROR][" + self.class.name + ".send] " + e.to_s
      STDERR.puts str_msg
      exit 1
    end
  end
end

################

####  MAIN  ####

################

# 開始メッセージ出力
puts "#### Send Update Ping [ START ]"

# 処理クラスインスタンス化
obj_main = Main.new

# サイト更新 Ping 送信
obj_main.send

# 終了メッセージ出力
puts "#### Send Update Ping [ E N D ]"
{% endhighlight %}

GitHub にもアップしている。( [komasaru/SendUpdatePing](https://github.com/komasaru/SendUpdatePing "komasaru/SendUpdatePing") )

### 2. Ruby スクリプト実行

以下のようにして Ruby スクリプトを実行する。

``` text
$ ruby send_update_ping.rb
```

失敗した場合のみ、メッセージを表示するようにしているが、成功した場合は `XMLRPC::Client#call` の返り値として以下のような内容が返ってるはず。

``` text
{"flerror"=>{"_value"=>[0], "_signature"=>[], "_type"=>"boolean", "_attr"=>{}}, "message"=>"Thanks for the ping"}
```

### 3. その他

今回は `weblogUpdates.ping` を使用しましたが、Ping サーバによっては、拡張された `weblogUpdates.extendedPing` を使用できる場合があります。  
引数に、サイトURLとは別に記事のURLとRSSのURLを追加して使用します。  

当方は実際には、 `weblogUpdates.extendedPing` で一旦 Ping 送信し、失敗した場合に `weblogUpdates.ping` で Ping 送信し直すような処理にしています。

### 4. 問題点

Ruby で XML-RPC を使った場合、`content-type` が `text/xml` 以外だとエラーになるようです。  
実際には、以下のようなエラー。

``` text
RuntimeError - Wrong content-type (received 'text/html' but expected 'text/xml'):
```

このエラーについては、対策していません。  
ライブラリを直接修正すれば、対応可能のようですが、他に複数の Ping サーバも利用しているので、今のところは放っています。

### 5. 参考サイト

- [Rubyist Magazine - 標準添付ライブラリ紹介 【第 1 回】 XMLRPC4R](http://jp.rubyist.net/magazine/?0007-BundledLibraries "Rubyist Magazine - 標準添付ライブラリ紹介 【第 1 回】 XMLRPC4R")
- [class XMLRPC::Client](http://doc.ruby-lang.org/ja/1.9.3/class/XMLRPC=3a=3aClient.html "class XMLRPC::Client")
- [XML-RPC§更新Pingの送信 - isnot.jp/wiki](http://isnot.jp/?p=XML-RPC%A1%F8%B9%B9%BF%B7Ping%A4%CE%C1%F7%BF%AE "XML-RPC§更新Pingの送信 - isnot.jp/wiki")

---

さらに、当方はサーバで定期(cron)起動(エラー時にはメールで通知)するようにしています。  
そして、エラーメールをチェックし、無効な Ping サーバ等には Ping 送信しないように整理したりしています。

以上。

