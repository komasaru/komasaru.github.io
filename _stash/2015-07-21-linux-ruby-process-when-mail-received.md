---
layout   : single
title    : "Linux & Ruby - メール受信時の処理！"
published: true
date     : 2015-07-21 00:20:00 +0900
comments : true
categories:
- サーバ構築
- プログラミング
tags:
- Linux
- Ruby
- Postfix
- Dovecot
---

Linux 上に構築したメールサーバで、メール受信をトリガにして処理を実行する手順等についての記録です。  
処理は Ruby で行うことを想定しています。（多くのサイト等では Perl や PHP での処理がよく紹介されてます）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 8.1 での作業を想定。
* Ruby 2.2.2-95 での作業を想定。
* SMTP サーバ Postfix 構築済み。  
  - 参考「[Debian 8 (Jessie) - SMTP サーバ Postfix 構築！]({{site.baseurl}}/2015/06/12/debian-8-postfix-installation/ "Debian 8 (Jessie) - SMTP サーバ Postfix 構築！")」
* POP/IMAP サーバ Dovecot 構築済み。  
  - 参考「[Debian 8 (Jessie) - POP/IMAP サーバ Dovecot 構築！]({{site.baseurl}}/2015/06/13/debian-8-dovecot-installation/ "Debian 8 (Jessie) - POP/IMAP サーバ Dovecot 構築！")」
* Postfix の aliases （メール転送機能）と連携をとる方法を想定。
* 処理対象のユーザ・グループは "test", "test" を想定。

### 1. Ruby スクリプトの作成

以下のような Ruby スクリプトを作成する。  
（紹介用に受信したメールを解析してテキストファイルに保存するだけのプログラム）

File: `get_mail.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# coding: utf-8
#-------------------------------------------------
# Ruby script to get a mail via alias of postfix.
#-------------------------------------------------
require 'mail'

class GetMail
  def initialize
    dt = Time.now.strftime("%Y%m%d_%H%M%S%L")
    @out_file = "/path/to/#{dt}.txt"
  end

  def execute
    open(@out_file, "w") do |f|
      mail = Mail.new($stdin.read)
      f.puts "From:    #{mail.from.first}"
      f.puts "To:      #{mail.to.first}"
      f.puts "Date:    #{mail.date}"
      f.puts "Subject: #{mail.subject}"
      f.puts "Body:\n#{mail.body.decoded.encode("UTF-8", mail.charset)}"
    end
  rescue => e
    $stderr.puts "[#{e.class}] #{e.message}"
    e.backtrace.each{|trace| $stderr.puts "\t#{trace}"}
    exit 1
  end
end

exit unless $0 == __FILE__
GetMail.new.execute
{% endhighlight %}

* [Gist - Ruby script to get a mail via alias of postfix.](https://gist.github.com/komasaru/0cbfe02794efa4c1a09e "Gist - Ruby script to get a mail via alias of postfix.")

### 2. Ruby スクリプトの配置

作成した Ruby スクリプトをサーバ上の適当な位置に配置する。  
（今回、当方は処理を行いたいユーザの home ディレクトリ "/home/test" 直下に配置した（所有者 "test" で））

配置後、実行権限を付与する。

``` text
# chmod +x get_mail.rb
```

### 3. メール保存用ディレクトリの作成

今回の処理で使用するディレクトリをサーバ上の適当な位置に作成する。  
（今回、当方は処理を行いたいユーザの home ディレクトリ "/home/test" 配下に "get_mail" ディレクトリを作成した（所有者 "test" で））

### 4. Postfix の aliases 設定

File: `/etc/aliases`

{% highlight bash linenos %}
test:  :include:/home/test/alias_inc
{% endhighlight %}

ちなみに、処理を行う他に転送も行いたい場合は、以下のようにカンマで区切ればよい。

File: `/etc/aliases`

{% highlight bash linenos %}
test:  hoge, :include:/home/test/alias_inc
{% endhighlight %}

### 5. include ファイル（実行コマンド）の作成

File: `/home/test/alias_inc`

{% highlight text linenos %}
"| /home/test/get_mail.rb"
{% endhighlight %}

そして、このファイルの所有者が "test" でなければ "test" にする。

``` text
# chown test. /home/test/alias_inc
```

### 6. Postfix 設定ファイル main.cf の編集

"/etc/aliases" ファイル内で `:include:` を使用する際は、Postfix の設定ファイル "main.cf" に以下のように追記しなければならない。  
（Postfix は、デフォルトでは `:include:` での "|command" への配送を認めていないため）

File: `/etc/postfix/main.cf`

{% highlight bash linenos %}
allow_mail_to_commands = alias,forward,include
{% endhighlight %}

### 7. Postfix 設定のリロード

``` text
# systemctl reload postfix
```

### 8. aliases の設定反映

``` text
# newaliases
```

### 9. 動作確認

実際に test ユーザ宛にメールを送信してみて、指定のディレクトリ配下に保存されること、内容が適切であることを確認する。

### 10. その他

上記の 4, 5, 6 でエイリアスを別ファイルに分けてインクルードしている。  
これは、"/etc/aliases" 内で直接コマンドを指定すると作成されるファイルの所有者・グループが "nobody:nogroup" になってしまうのを防ぐためである。

### 11. 参考サイト

* [Postfix manual - aliases(5)](http://www.postfix-jp.info/trans-2.3/jhtml/aliases.5.html "Postfix manual - aliases(5)")

---

当方は、Linux サーバに Twitter ツイート専用のユーザを作成し、そのユーザ宛に配送されたメール本文をツイートするように応用しています。

以上。

