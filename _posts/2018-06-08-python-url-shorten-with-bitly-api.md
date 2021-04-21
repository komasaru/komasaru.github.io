---
layout   : single
title    : "Python - URL 短縮 (bitly)！"
published: true
date     : 2018-06-08 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Python
- bitly
---

Python で、 URL 短縮サービス bitly の API を使用して URL を短縮する方法についての記録です。

<!--more-->

### 0. 前提条件

* LMDE 2 (Linux Mint Debian Edition 2; 64bit) での作業を想定。
* Python 3.6.4 での作業を想定。
* **当方は他のバージョンとの共存環境であり、 `python3.6`, `pip3.6` で 3.6 系を使用するようにしている。（適宜、置き換えて考えること）**
* PyPI ライブラリ requests を使用する。
* bitly API のアクセストークンが必要なので、取得しておく。  
  （過去記事参照： [bitly - OAuth 認証アクセストークン取得！]({{site.baseurl}}/2013/07/16/bitly-get-access-token/ "bitly - OAuth 認証アクセストークン取得！")）

### 1. PyPI ライブラリ requests のインストール

``` text
$ sudo pip3.6 install requests
```

### 2. Python サンプルスクリプトの作成

* 敢えてオブジェクト指向で作成している。
* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）
* `TOKEN` は自分が取得したものに置き換えること。

File: `bitly_shorten.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.6
"""
URL shorten with bitly API v3
"""
import json
import requests
import sys
import traceback
import urllib


class UrlShortenBitly:
    URL   = "https://api-ssl.bitly.com/v3/shorten"
    TOKEN = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

    def shorten(self, url_long):
        try:
            url = self.URL + "?" \
                + urllib.parse.urlencode({
                      "access_token": self.TOKEN,
                      "longUrl":      url_long
                  })
            res = requests.get(url)
            j = json.loads(res.text)
            print("STATUS CODE:", j["status_code"], j["status_txt"])
            print("   LONG URL:", j["data"]["long_url"])
            print("  SHORT URL:", j["data"]["url"])
        except Exception as e:
            raise


if __name__ == '__main__':
    url_long = "https://www.mk-mode.com/octopress/2018/02/25/python-napier-computation/"
    try:
        obj = UrlShortenBitly()
        obj.shorten(url_long)
    except Exception as e:
        traceback.print_exc()
{% endhighlight %}

* [Gist - Python script to shorten a url with bitly API.](https://gist.github.com/komasaru/88bd488ddfef478a8adf139fc66c81f6 "Gist - Python script to shorten a url with bitly API.")

### 3. Python スクリプトの実行

まず、実行権限を付与。

``` text
$ chmod +x bitly_shorten.py
```

そして、実行。

``` text
$ ./bitly_shorten.py
STATUS CODE: 200 OK
   LONG URL: https://www.mk-mode.com/octopress/2018/02/25/python-napier-computation/
  SHORT URL: http://bit.ly/2BNW2VS
```

### 4. 参照

* [bitly - OAuth 認証アクセストークン取得！]({{site.baseurl}}/2013/07/16/bitly-get-access-token/ "bitly - OAuth 認証アクセストークン取得！")
* [Ruby - BitLy API v3 で URL 短縮！]({{site.baseurl}}/2013/07/18/ruby-url-shorten-by-bitly-api/ "Ruby - BitLy API v3 で URL 短縮！")

---

以上

