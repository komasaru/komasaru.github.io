---
layout   : single
title    : "Python - URL 短縮 (TinyURL)！"
published: true
date     : 2018-06-10 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Python
- TinyURL
---

Python で、 URL 短縮サービス TinyURL の API を使用して URL を短縮する方法についての記録です。

<!--more-->

### 0. 前提条件

* LMDE 2 (Linux Mint Debian Edition 2; 64bit) での作業を想定。
* Python 3.6.4 での作業を想定。
* **当方は他のバージョンとの共存環境であり、 `python3.6`, `pip3.6` で 3.6 系を使用するようにしている。（適宜、置き換えて考えること）**
* PyPI ライブラリ requests を使用する。

### 1. PyPI ライブラリ requests のインストール

``` text
$ sudo pip3.6 install requests
```

### 2. Python サンプルスクリプトの作成

* 敢えてオブジェクト指向で作成している。
* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）

File: `bitly_tinyurl.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.6
"""
URL shorten with TinyURL API
"""
import requests
import sys
import traceback
import urllib


class UrlShortenTinyurl:
    URL = "http://tinyurl.com/api-create.php"

    def shorten(self, url_long):
        try:
            url = self.URL + "?" \
                + urllib.parse.urlencode({"url": url_long})
            res = requests.get(url)
            print("STATUS CODE:", res.status_code)
            print("   LONG URL:", url_long)
            print("  SHORT URL:", res.text)
        except Exception as e:
            raise


if __name__ == '__main__':
    url_long = "https://www.mk-mode.com/octopress/2018/02/25/python-napier-computation/"
    try:
        obj = UrlShortenTinyurl()
        obj.shorten(url_long)
    except Exception as e:
        traceback.print_exc()
{% endhighlight %}

* [Gist - Python script to shorten a url with TinyURL API.](https://gist.github.com/komasaru/ed07018ae246d128370a1693f5dd1849 "Gist - Python script to shorten a url with TinyURL API.")

### 3. Python スクリプトの実行

まず、実行権限を付与。

``` text
$ chmod +x tinyurl_shorten.py
```

そして、実行。

``` text
$ ./tiny_shorten.py
STATUS CODE: 200
   LONG URL: https://www.mk-mode.com/octopress/2018/02/25/python-napier-computation/
  SHORT URL: http://tinyurl.com/y8r5wjbh
```

### 4. 参照

* [Ruby - TinyURL で URL 短縮！]({{site.baseurl}}/2016/03/02/ruby-shortening-url-by-tinyurl/ "Ruby - TinyURL で URL 短縮！")

---

以上

