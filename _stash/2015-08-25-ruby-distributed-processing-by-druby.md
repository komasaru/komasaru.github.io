---
layout   : single
title    : "Ruby - dRuby で分散処理！"
published: true
date     : 2015-08-25 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
---

dRuby とは、 Ruby で分散オブジェクトプログラミングするためのライブラリです。

<!--more-->

### 0. 前提条件

* Linux Mint 17.2(64bit) での作業を想定。
* Ruby 2.2.3-p173 での作業を想定。
* 本来は複数のマシンで実行することが多いと思うが、今回は１つのマシンでテストする。
* 特に別途インストールの必要なライブラリ等はない。

### 1. サーバ側スクリプトの作成例

日付・時刻の文字列を返すだけの簡単な例。

File: `druby_server.rb`

{% highlight ruby linenos %}
#!/usr/local/bin/ruby
# coding: utf-8
require 'drb/drb'

# 通信を待ち受ける URI
URI="druby://localhost:8787"

class DrubyServer
  def get_cur_time
    cur_time = Time.now.strftime("%Y年%m月%d日 %H時%M分%S秒")
    msg = "ただいま #{cur_time} です。"
    puts msg
    return msg
  end
end

# リクエストを受け付けるオブジェクト
obj = DrubyServer.new
# サーバの起動
DRb.start_service(URI, obj, safe_level: 1)
# DRb スレッド終了の待ち受け
DRb.thread.join
{% endhighlight %}

* `start_service` の `safe_level` を `1` に設定しているのは、 `instance_eval` による危険性を防ぐための処置。

### 2. クライアント側スクリプトの作成例

サーバのメソットを呼び出す簡単な例。

File: `druby_client.rb`

{% highlight ruby linenos %}
#!/usr/local/bin/ruby
# coding: utf-8
require 'drb/drb'

# 接続先 URI
URI="druby://localhost:8787"

# リモートオブジェクトの取得
obj = DRbObject.new_with_uri(URI)
# リモートメソッドの呼び出し
puts obj.get_cur_time
{% endhighlight %}

### 3. 動作確認

まず、１つ目の端末を立ち上げて、サーバ側スクリプトを実行する。

``` text
$ ./druby_server.rb
```

そして、もう１つ端末を立ち上げて、クライアント側スクリプトを実行する。

``` text
$ ./druby_client.rb
ただいま 2015年07月22日 24時31分16秒 です。
$ ./druby_client.rb
ただいま 2015年07月22日 24時32分30秒 です。
```

クライアント側スクリプトを実行する度にサーバ側で処理した結果が出力されるはずである。  
また、この時サーバ側の端末にも同じ出力がされるはずである。

``` text
$ ./druby_server.rb
ただいま 2015年07月22日 24時31分16秒 です。
ただいま 2015年07月22日 24時32分30秒 です。
```

### 4. 注意

* dRuby で構築したサーバをインターネットで外部に公開すべきではない。
* ローカルで使用する際もセキュリティ面に注意する。

### 5. 参考サイト

* [library drb (Ruby 2.2.0)](http://docs.ruby-lang.org/ja/2.2.0/library/drb.html "library drb (Ruby 2.2.0)")

---

この dRuby による分散処理をいろいろ応用できそうです。

実際、目論んでいることもありますし。

以上。

