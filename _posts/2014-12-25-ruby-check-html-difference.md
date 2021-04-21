---
layout   : single
title    : "Ruby - Web サイト(HTML)差異チェックスクリプト！"
published: true
date     : 2014-12-25 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
---

以前、 Web サイト(HTML) の前回取得した HTML との差異をチェックする簡単な Bash スクリプトを紹介しました。

* [Bash - Web サイト（HTML）差異チェックスクリプト！]({{site.baseurl}}/2014/11/11/bash-check-html-difference "Bash - Web サイト（HTML）差異チェックスクリプト！")

今回は Ruby で作成してみました。（紹介するほどのものでもありませんが）

当方、何かと Ruby で処理している一連の流れがあるのですが、その中で HTML 差異チェックだけ Bash に任せていたのが気になっていたもので。

<!--more-->

### 0. 前提条件

* Linux Mint 17(64bit), CentOS 7.0(64bit), 6.6(32bit) での作業を想定。
* Ruby 2.1.5-p273 での作業を想定。

### 1. Ruby スクリプト作成

以下のような簡単な Ruby スクリプトを作成。

* エンコーディングは "UTF-8" に統一。
* 一応ボットになるので、ユーザエージェントをその旨が分かるように設定。  
  また、何らかの理由でチェック対象 Web サイトに迷惑がかかるようなことが発生した場合に連絡が取れるようメールアドレスも記載している。
* 保存している HTML と新たに取得した HTML を比較し、差異があれば新たに取得した HTML を保存用に退避する。  
  さらに、退避した HTML を過去遡って確認できるよう、タイムスタンプ付ファイル名でも保存する。

File: `check_html.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# coding: utf-8
#= Checking HTML difference
#
# date          name            version
# 2014.12.11    mk-mode         1.00 新規作成
#
# Copyright(C) 2014 mk-mode.com All Rights Reserved.
#---------------------------------------------------------------------------------
# 引数 : なし
#---------------------------------------------------------------------------------
#++
require 'kconv'
require 'open-uri'
require 'openssl'
require 'timeout'

class CheckHtml
  # クラス定数
  URL     = "http://www.********.com/********/"     # <= チェック対象ページの URL
  DIR     = "/path/to/data"                         # <= 取得 HTML 格納ディレクトリ
  FILE_L  = "#{DIR}/last.html"                      # <= 前回取得 HTML
  FILE_C  = "#{DIR}/current.html"                   # <= 今回取得 HTML
  TIMEOUT = 15                                      # <= タイムアウト設定（単位：秒）
  UA      = "mk-mode Bot (Ruby/#{RUBY_VERSION}, Administrator: ********@********.com)"
                                                    # <= ユーザエージェント

  # 主処理
  def exec
    # 前回取得 HTML
    read_html_last

    # 今回取得 HTML
    get_html_current

    # 今回取得 HTML ファイル保存
    save_html_current

    # 今回取得 HTML == 前回取得 HTML なら終了
    return if @html_c == @html_l

    # 今回取得 HTML を前回取得 HTML としてファイル保存
    save_html_last

    # 今回取得 HTML をタイムスタンプ付ファイル名(YYMMDD_HHMMSS.html)としても保存
    save_html_timestamp
  rescue => e
    $stderr.puts "[#{e.class}] #{e.message}"
    e.backtrace.each{ |bt| $stderr.puts "\t#{bt}" }
    exit 1
  end

private

  # 前回取得 HTML
  def read_html_last
    @html_l = File.exists?(FILE_L) ? File.open(FILE_L, "r").read.chomp : ""
  rescue => e
    raise
  end

  # 今回取得 HTML
  def get_html_current
    timeout(TIMEOUT) do
      @html_c = open(
        URL,
        {"User-Agent" => UA, :ssl_verify_mode => OpenSSL::SSL::VERIFY_NONE}
      ) do |f|
        f.read
      end.chomp.toutf8
    end
  rescue => e
    raise
  end

  # 今回取得 HTML ファイル保存
  def save_html_current
    File.open(FILE_C, "w") { |f| f.puts @html_c }
  rescue => e
    raise
  end

  # 今回取得 HTML を前回取得 HTML としてファイル保存
  def save_html_last
    File.open(FILE_L, "w") { |f| f.puts @html_c }
  rescue => e
    raise
  end

  # 今回取得 HTML をタイムスタンプ付ファイル名(YYMMDD_HHMMSS.html)としても保存
  def save_html_timestamp
    file_name = "#{DIR}/#{Time.now.strftime("%y%m%d_%H%M%S")}.html"
    File.open(file_name, "w") { |f| f.puts @html_c }
  rescue => e
    raise
  end
end

# 実行
CheckHtml.new.exec if __FILE__ == $0
{% endhighlight %}

* [Gist - Ruby script to check a difference between a saved-html and a current-html.](https://gist.github.com/komasaru/2836000139834d054bcb "Gist - Ruby script to check a difference between a saved-html and a current-html.")

### 2. cron 登録

以下のように cron 登録。  
（以下は５分ごとにチェックする設定）

File: `/etc/cron.d/check_html`

{% highlight bash linenos %}
*/5 * * * * root /path/to/check_html.rb > /dev/null 2>&1
{% endhighlight %}

### 3. 動作確認

cron により定期的にチェックされ、HTML に差異があればタイムスタンプ付きのファイルが保存されることを確認する。

---

当方の場合、Web スクレイピングしようと考えた場合に、実際どのような HTML が発行される可能性があるのかを事前に調査するために使用しています。

以上。

