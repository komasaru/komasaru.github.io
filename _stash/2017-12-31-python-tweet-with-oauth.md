---
layout   : single
title    : "Python - Twitter ツイート（OAuth のみで）！"
published: true
date     : 2017-12-31 00:20:00 +0900
comments : true
categories:
- プログラミング
- SNS
tags:
- Python
- Twitter
- OAuth
---

Python 3 で OAuth ライブラリのみを使用してツイートする方法についての記録です。  
（ツイート自体は単純な処理のため、 Twitter 用ライブラリを使用するほどでもない）

<!--more-->

### 0. 前提条件

* LMDE 2 (Linux Mint Debian Edition 2; 64bit) での作業を想定。
* Python 3.6.3 での作業を想定。
* 複数の Twitter アカウントを使い分けることを想定。
* **当方は他のバージョンとの共存環境であり、 `python3.6`, `pip3.6` で 3.6 系を使用するようにしている。（適宜、置き換えて考えること）**

### 1. ライブラリのインストール

OAuth, YAML を使用するので、対応のライブラリをインストールしておく。

``` text
$ sudo pip3.6 install requests_oauthlib
$ sudo pip3.6 install PyYAML
```

### 2. Twitter キー情報ファイルの作成

Twitter API キー情報を "twitter.yml" というファイルに YAML 型式で記載しておく。

File: `twitter.yml`

{% highlight text linenos %}
account_1:
  cons_key: AAAAAAAAAAAAAAAAAAAAAAAAA
  cons_sec: BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB
  accs_key: CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC
  accs_sec: DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD
account_2:
  cons_key: EEEEEEEEEEEEEEEEEEEEEEEEE
  cons_sec: FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
  accs_key: GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG
  accs_sec: HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH
{% endhighlight %}

### 3. Python スクリプトの作成

* 前述の "twitter.yml" から API キー情報を取得してツイートする。
* 例外処理を入れているが、実際には、 Exception を詳細に指定しないことは非推奨あることに留意。
* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）
* Twitter アカウントが1個のみなら、 YAML ファイルを作成せず、定数で設定してもよいだろう。

File: `tweet.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.6
"""
Twitter tweet with OAuth only.

date          name            version
2017.11.10    mk-mode         1.00 Created.

Copyright(C) 2017 mk-mode.com All Rights Reserved.
"""
from requests_oauthlib import OAuth1Session
import json
import sys
import traceback
import yaml


class Tweet:
    """ Tweet class """
    YML     = "twitter.yml"
    URL_UPD = "https://api.twitter.com/1.1/statuses/update.json"

    def __init__(self):
        self.ac   = sys.argv[1]
        self.text = sys.argv[2].replace("\\n", "\n")
        with open(self.YML) as f:
            self.yml = yaml.load(f)

    def exec(self):
        """ Execution """
        try:
            if not(self.ac in self.yml):
                print("'{}' could not be found!".format(self.ac))
                sys.exit(0)
            print("[{}]\n{}".format(self.ac, self.text))
            status_code, res_json = self.__tweet()
            if status_code == 200:
                print("(TWEET-ID: {})".format(res_json["id_str"]))
            else:
                print("!ERROR! STATUS-CODE: ", status_code)
        except Exception as e:
            raise

    def __tweet(self):
        """ Tweet """
        try:
            oa = OAuth1Session(
                    self.yml[self.ac]["cons_key"],
                    self.yml[self.ac]["cons_sec"],
                    self.yml[self.ac]["accs_key"],
                    self.yml[self.ac]["accs_sec"]
                 )
            res = oa.post(self.URL_UPD, params = {"status": self.text})
            return [res.status_code, json.loads(res.text)]
        except Exception as e:
            raise


if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("USAGE: ./tweet.py SCREEN-NAME TWEET-TEXT")
        sys.exit(0)
    try:
        Tweet().exec()
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)
{% endhighlight %}

* [Gist - Python script to tweet with OAuth only.](https://gist.github.com/komasaru/f9880d8a82cf3165d557f21084b355a0 "Gist - Python script to tweet with OAuth only.")

### 4. Python スクリプトの実行

まず、実行権限を付与しておく。

``` text
$ sudo chmod +x tweet.py
```

そして、アカウント名とツイート文を引数に指定して実行する。

* ツイート文に半角スペースが含まれる場合はシングル／ダブルクォーテーションでくくること。
* 改行は `\n` で行うこと。

``` text
$ ./tweet.py account_1 "これは Python 3.6 によるツイートテストです。\nこれは Python 3.6 によるツイートテストです。"
[account_1]
これは Python 3.6 によるツイートテストです。
これは Python 3.6 によるツイートテストです。
(TWEET-ID: 931026450605522944)
```

---

あらゆる局面で活用できるでしょう。  
（第3引数で添付画像を指定するようにしてもよいだろう）

以上

