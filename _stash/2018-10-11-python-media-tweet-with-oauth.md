---
layout   : single
title    : "Python - Twitter ツイートで画像添付（OAuth のみで）！"
published: true
date     : 2018-10-11 00:20:00 +0900
comments : true
categories:
- プログラミング
- SNS
tags:
- Python
- Twitter
- OAuth
---

以前、 Python で Twitter 用の PiPI ライブラリを使用せず、 OAuth のみでツイートする方法方法を紹介しました。

* [Python - Twitter ツイート（OAuth のみで）！]({{site.baseurl}}/2017/12/31/python-tweet-with-oauth "Python - Twitter ツイート（OAuth のみで）！")

但し、画像は添付できない仕様でした。

今回は、画像も添付できるよう仕様を変更しました。

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* Python 3.7.0 での作業を想定。
* 複数の Twitter アカウントを使い分けることを想定。
* **当方は他のバージョンとの共存環境であり、 `python3.7`, `pip3.7` で 3.7 系を使用するようにしている。（適宜、置き換えて考えること）**

### 1. ライブラリのインストール

OAuth, YAML を使用するので、対応のライブラリをインストールしておく。

``` text
$ sudo pip3.7 install requests_oauthlib
$ sudo pip3.7 install PyYAML
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

File: `tweet_v2.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.7
"""
date          name         version
2017.11.10    mk-mode.com  1.00 新規作成
2018.08.05    mk-mode.com  1.01 画像ツイート昨日を追加

Copyright(C) 2017-2018 mk-mode.com All Rights Reserved.
"""
from requests_oauthlib import OAuth1Session
import json
import sys
import traceback
import yaml


class Tweet:
    """ Tweet class """
    YML       = "twitter.yml"
    URL_UPD   = "https://api.twitter.com/1.1/statuses/update.json"
    URL_MEDIA = "https://upload.twitter.com/1.1/media/upload.json"

    def __init__(self):
        self.ac   = sys.argv[1]
        self.text = sys.argv[2].replace("\\n", "\n")
        self.media_paths = sys.argv[3:] if len(sys.argv) > 3 else []
        with open(self.YML) as f:
            self.yml = yaml.load(f)

    def exec(self):
        """ Execution """
        try:
            if not(self.ac in self.yml):
                print("'{}' could not be found!".format(self.ac))
                sys.exit(0)
            print("[{}]".format(self.ac, self.text))
            status_code, res_json = self.__tweet()
            if status_code == 200:
                print("TWEET-ID:", res_json["id_str"])
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
            if self.media_paths == []:
                res = oa.post(self.URL_UPD, params = {"status": self.text})
            else:
                media_ids = []
                for m in self.media_paths:
                    files = {"media" : open(m, 'rb')}
                    res_m = oa.post(self.URL_MEDIA, files = files)
                    if res_m.status_code != 200:
                        return [res_m.status_code, json.loads(res_m.text)]
                    media_ids.append(
                        json.loads(res_m.text)["media_id_string"]
                    )
                res = oa.post(
                    self.URL_UPD,
                    params = {
                        "status": self.text,
                        "media_ids": ",".join(media_ids)
                    }
                )
            return [res.status_code, json.loads(res.text)]
        except Exception as e:
            raise


if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("USAGE: ./tweet.py SCREEN-NAME TWEET-TEXT [MEDIA-PATH ...]")
        sys.exit(0)
    try:
        Tweet().exec()
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)
{% endhighlight %}

* [Gist - Python script to tweet with medias by OAuth only.](https://gist.github.com/komasaru/21e26138628ea0b6534a3bba08d1c5a6 "Gist - Python script to tweet with medias by OAuth only.")

### 4. Python スクリプトの実行

まず、実行権限を付与しておく。

``` text
$ sudo chmod +x tweet_v2.py
```

そして、アカウント名とツイート文、更に、画像を添付したい場合は続けて画像ファイルのパス（複数あればスペースで区切る）を引数に指定して実行する。

* ツイート文に半角スペースが含まれる場合はシングル／ダブルクォーテーションでくくること。
* 改行は `\n` で行うこと。

``` text
$ ./tweet_v2.py account_1 "これは Python 3.7 によるツイートテストです。\nこれは Python 3.7 によるツイートテストです。" /path/to/image_1.png /path/to/image_2.png
[account_1]
これは Python 3.7 によるツイートテストです。
これは Python 3.7 によるツイートテストです。
(TWEET-ID: 1026048555562098688)
```

---

あらゆる局面で活用できるでしょう。

以上

