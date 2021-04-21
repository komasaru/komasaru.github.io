---
layout   : single
title    : "Python - TLE（2行軌道要素形式）の取得(NASA)！"
published: true
date     : 2018-08-14 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Python
- 人工衛星
---

前回、 Ruby で NASA の Web ページから TLE（Two-line elements; 2行軌道要素形式）データを取得しました。

今回は、同じことを Python で実装してみました。

<!--more-->

### 0. 前提条件

* Python 3.6.5 での動作を想定。
* TLE を取得する Web ページは「[こちら](https://spaceflight.nasa.gov/realdata/sightings/SSapplications/Post/JavaSSOP/orbit/ISS/SVPOST.html "Human Space Flight (HSF) - Realtime Data")」。
* TLE の説明は「[こちら](https://spaceflight.nasa.gov/realdata/sightings/SSapplications/Post/JavaSSOP/SSOP_Help/tle_def.html "Human Space Flight (HSF) - Realtime Data")」。

### 1. Python スクリプトの作成

* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）

File: `tle_iss_nasa.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.6
"""
直近 TLE データ取得 (from NASA)
  : 過去の直近の TLE データ1件を取得する
    （過去データが存在しなければ、未来の直近データ）

  date          name            version
  2018.06.12    mk-mode.com     1.00 新規作成

Copyright(C) 2018 mk-mode.com All Rights Reserved.
---
引数 : [YYYYMMDD[HHMMSS]]
       （JST を指定。無指定なら現在時刻とみなす）
"""
from datetime import datetime
from datetime import timedelta
import re
import requests
import sys
import traceback


class TleIssNasa:
    URL = (
        "https://spaceflight.nasa.gov/realdata/sightings/"
        "SSapplications/Post/JavaSSOP/orbit/ISS/SVPOST.html"
    )
    UA = (
        "mk-mode Bot (by Python/{}.{}.{}, "
        "Administrator: postmaster@mk-mode.com)"
    ).format(
        sys.version_info.major,
        sys.version_info.minor,
        sys.version_info.micro
    )
    MSG_ERR = (
        "Invalid date!\n"
        "[USAGE] ./tle_iss_nasa.rb [YYYYMMDD[HHMMSS]]"
    )

    def __init__(self):
        if len(sys.argv) < 2:
            self.jst = datetime.now()
        else:
            if re.search(r"^(\d{8}|\d{14})$", sys.argv[1]) is not(None):
                dt = sys.argv[1].ljust(14, "0")
                try:
                    self.jst = datetime.strptime(dt, "%Y%m%d%H%M%S")
                except ValueError as e:
                    print(self.MSG_ERR)
                    sys.exit(1)
            else:
                print(self.MSG_ERR)
                sys.exit(0)
        self.utc = self.jst - timedelta(hours=9)

    def exec(self):
        """ Execution """
        tle = ""
        utc_tle = None
        try:
            print(self.jst.strftime("%Y-%m-%d %H:%M:%S.%f JST"))
            print(self.utc.strftime("%Y-%m-%d %H:%M:%S.%f UTC"))
            print("---")
            tles = self.__get_tle()
            for new in reversed(tles):
                tle = new
                item_utc = re.split(" +", tle[0])[3]
                y = 2000 + int(item_utc[0:2])
                d = float(item_utc[2:])
                utc_tle = datetime(y, 1, 1) + timedelta(days=d)
                if utc_tle <= self.utc:
                    break
            print("\n".join(tle))
            print(utc_tle.strftime("(%Y-%m-%d %H:%M:%S.%f UTC)"))
        except Exception as e:
            raise

    def __get_tle(self):
        """ 最新 TLE 一覧取得 """
        res = []
        try:
            html, status, reason = self.__get_html()
            if status != 200 or reason != "OK":
                print((
                    "STATUS: {} ({})"
                    "[ERROR] Could not retreive html."
                ).format(status, reason))
                sys.exit(1)
            for tle in re.findall(r"ISS\n +(1.+?)\n +(2.+?)\n", html):
                res.append([tle[0], tle[1]])
            return res
        except Exception as e:
            raise

    def __get_html(self):
        """ HTML 取得 """
        try:
            headers = {'User-Agent': self.UA}
            res = requests.get(self.URL, headers)
            return [res.text, res.status_code, res.reason]
        except Exception as e:
            raise


if __name__ == '__main__':
    try:
        obj = TleIssNasa()
        obj.exec()
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)
{% endhighlight %}

* [Gist - Python script to get TLE from NASA.](https://gist.github.com/komasaru/815a3ced9cda13fc59d63d34e4d04abf "Gist - Python script to get TLE from NASA.")

### 2. Python スクリプトの実行

まず、実行権限を付与。

``` text
$ chmod +x tle_iss_nasa.py
```

そして、コマンドライン引数に JST（日本標準時）を `YYYYMMDD[HHMMSS]` の書式で指定して実行する。（引数無指定なら、現在時刻を JST とみなす）

``` text
$ ./tle_iss_nasa.py 20180616
2018-06-16 00:00:00.000000 JST
2018-06-15 15:00:00.000000 UTC
---
1 25544U 98067A   18166.52817284  .00016717  00000-0  10270-3 0  9006
2 25544  51.6411  26.9891 0002986 198.2153 161.8893 15.54156291 38252
(2018-06-16 12:40:34.133376 UTC)
```

---

これで、 ISS の軌道計算時に最新の TLE を取得できます。

以上。

