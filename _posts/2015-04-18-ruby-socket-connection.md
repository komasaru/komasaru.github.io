---
layout   : single
title    : "Ruby - TCP ソケット通信！"
published: true
date     : 2015-04-18 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
---
こんにちは。

よく Java の入門編でやるソケット通信を Ruby でやってみました。

非常に簡単な実装例です。

<!--more-->

### 0. 前提条件

* Linux Mint 17.1(64bit) での作業を想定。
* Ruby 2.2.1-p85 での作業を想定。

### 1. Ruby スクリプト（サーバ側）の作成

以下のような（非常に）簡単なスクリプトを作成する。  
（shebang ストリングは環境に合わせて変更すること。ちなみに、`env` を使用しても環境に依存することが多々あるため、当方は最初からフルパスで指定する方針）

File: `socket_server.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# coding: utf-8
#********************************************************
# Ruby script to test for socket connection.(Server-side)
#********************************************************
#
require 'socket'

# サーバ接続 OPEN
serv = TCPServer.new(20000)

loop do
  # ソケット OPEN （クライアントからの接続待ち）
  sock = serv.accept

  while str = sock.gets.chomp
    # クライアントから受信した文字列を出力
    puts "RECV : #{str}"

    # クライアントへ文字列返却
    sock.puts "SERVER received '#{str}' from CLIENT."
  end

  # ソケット CLOSE
  sock.close
end
{% endhighlight %}

* [Gist - Ruby script to test for socket connection.(Server-side)](https://gist.github.com/komasaru/50b9ffedea541b1300f8 "Gist - Ruby script to test for socket connection.(Server-side)")

### 2. 接続テスト（telnet 使用）

とりあえず、サーバ側 Ruby スクリプトが機能するかテストしてみる。

まず、コンソール上でサーバ側 Ruby スクリプトの起動。

``` text
$ ./socket_server.rb
```

そして、別コンソール上で `telnet` コマンドで接続後、対話してみる。

``` text
$ telnet localhost 20000
Trying 127.0.0.1...
Connected to localhost.
Escape character is '^]'.
Hello!
SERVER received 'Hello!' from CLIENT.
Ruby!
SERVER received 'Ruby!' from CLIENT.
^]

telnet> quit
Connection closed.
```

このとき、サーバ側は以下のような出力がされる。

``` text
$ ./socket_server.rb
RECV : Hello!
RECV : Ruby!
```

終了は、 `CTRL-]` で Telnet のプロンプトに戻って `quit` を入力すればよい。サーバ側はソケットが切断されて終了する。

### 3. Ruby スクリプト（クライアント側）の作成

以下のような（非常に）簡単なスクリプトを作成する。

File: `socket_client.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# coding: utf-8
#********************************************************
# Ruby script to test for socket connection.(Client-side)
#********************************************************
#
require 'socket'

# サーバ接続 OPEN
sock = TCPSocket.open("localhost", 20000)

while line = $stdin.gets
  # ソケットに入力文字列を渡す
  sock.puts line
  sock.flush

  # サーバから返却された文字列を出力
  puts sock.gets
end

# ソケット CLOSE
sock.close
{% endhighlight %}

* [Gist - Ruby script to test for socket connection.(Client-side)](https://gist.github.com/komasaru/64286f9c6a4f57e57204 "Gist - Ruby script to test for socket connection.(Client-side)")

### 4. 接続テスト（クライアント側も Ruby スクリプト使用）

クライアント側も Ruby スクリプトにして正常に機能するかテストしてみる。

まず、コンソール上でサーバ側 Ruby スクリプトの起動。

``` text
$ ./socket_server.rb
```

そして、別コンソール上でクライアント側 Ruby スクリプトを起動後、対話してみる。

``` text
$ ./socket_client.rb
Hello!
SERVER received 'Hello!' from CLIENT.
Ruby!
SERVER received 'Ruby!' from CLIENT.
```

このとき、サーバ側は以下のような出力がされる。

``` text
./socket_server.rb
RECV : Hello!
RECV : Ruby!
```

終了は、クライアント側で `CTRL-C` すればよい。サーバ側はソケットが切断されて終了する。

### 5. 参考サイト

* [library socket - オブジェクト指向スクリプト言語 Ruby リファレンスマニュアル](http://docs.ruby-lang.org/ja/2.2.0/library/socket.html "library socket - オブジェクト指向スクリプト言語 Ruby リファレンスマニュアル")

---

ふと、 Java でやったことのあることが Ruby でもできるのかと思い、試してみた次第です。

簡単でした。ソケットを使用したアプリを作成する際に役立ちそうです。

以上。

