---
layout   : single
title    : "Python - 地球自転速度補正値 ΔT の取得（USNO から）！"
published: true
date     : 2018-08-20 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- Python
---

前回、 USNO（The United States Naval Observatory; アメリカ海軍天文台）から地球自転速度補正値 ΔT をする処理を Ruby で実装しました。

* [Ruby - 地球自転速度補正値 ΔT の取得（USNO から）！]({{site.baseurl}}/2018/08/17/ruby-delta-t-getting-from-usno "Ruby - 地球自転速度補正値 ΔT の取得（USNO から）！")

今回は、同じ処理を Python で実装してみました。

<!--more-->

### 0. 前提条件

* Python 3.6.5 での動作を想定。
* ΔT 一覧を取得するページは「[こちら](http://www.usno.navy.mil/USNO/earth-orientation/eo-products/long-term "Long-term Delta T - Naval Oceanography Portal")」。

### 1. Python スクリプトの作成

* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）
* User Agent `UA` の PG(Bot) 名やメールアドレスは自分のもので置き換えること。  
  （User Agent の設定は Web スクレイプする者のマナーであると個人的に認識している）

File: `get_delta_t_usno.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.6
"""
USNO（アメリカ海軍天文台） から delta T(ΔT) を取得
: 確定データは
  [Delta T determinations](http://maia.usno.navy.mil/ser7/deltat.data)
  から、推定データは
  [Delta T predictions](http://maia.usno.navy.mil/ser7/deltat.preds)
  から取得する。

  date          name            version
  2018.06.20    mk-mode.com     1.00 新規作成

Copyright(C) 2018 mk-mode.com All Rights Reserved.
---
引数 : UTC (YYYYMMDD 形式)
       * 無指定ならシステム日時を UTC とみなす
"""
from datetime import datetime
import re
import requests
import sys
import traceback


class GetDeltaTUsno:
    USAGE = "[USAGE] ./get_delta_t_usno.py [yyyymmdd]"
    URL_D = "http://maia.usno.navy.mil/ser7/deltat.data"
    URL_P = "http://maia.usno.navy.mil/ser7/deltat.preds"
    UA = (
        "mk-mode Bot (by Python/{}.{}.{}, "
        "Administrator: postmaster@mk-mode.com)"
    ).format(
        sys.version_info.major,
        sys.version_info.minor,
        sys.version_info.micro
    )
    PTN_0 = re.compile(r'[\r\n]+')
    PTN_1 = re.compile(r'^\s+')
    PTN_2 = re.compile(r'\s+')
    PTN_3 = re.compile(r'[\d\.]+')
    PTN_4 = re.compile(r'\.')

    def __init__(self):
        self.__get_arg()
        self.data = []    # delta t 一覧
        self.delta_t = 0  # delta t 初期値
        self.dp = ""      # 確定／推定値区分（推定値なら "*"）

    def exec(self):
        try:
            self.__get_determination()  # 確定データ取得
            self.__get_prediction()     # 推定データ取得
            self.__get_delta_t()        # delta_t 取得
            self.__display()            # 結果出力
        except Exception as e:
            raise

    def __get_arg(self):
        """ argument getting """
        try:
            if len(sys.argv) > 1:
                ymd = sys.argv[1]
            else:
                ymd = datetime.now().strftime("%Y%m%d")
            if not(re.search(r"^\d{8}$", ymd)):
                print(self.USAGE)
                sys.exit(0)
            self.date = "{}-{}-{}".format(ymd[0:4], ymd[4:6], ymd[6:8])
        except Exception as e:
            raise

    def __get_determination(self):
        """ 確定データ取得 """
        try:
            headers = {'user-agent': self.UA}
            res = requests.get(self.URL_D, headers=headers)
            html = res.text.strip()
            for line in re.split(self.PTN_0, html):
                line = re.sub(self.PTN_1, "", line)
                items = re.split(self.PTN_2, re.sub(self.PTN_1, "", line))
                date = "{:04d}-{:02d}-{:02d}".format(
                    int(items[0]), int(items[1]), int(items[2])
                )
                self.date_max = date
                self.data.append([date, float(items[-1]), "D"])
        except Exception as e:
            raise

    def __get_prediction(self):
        """ 推定データ取得 """
        try:
            headers = {'user-agent': self.UA}
            res = requests.get(self.URL_P, headers=headers)
            html = res.text.strip()
            for line in re.split(self.PTN_0, html):
                line = re.sub(self.PTN_1, "", line)
                items = re.split(self.PTN_2, re.sub(self.PTN_1, "", line))
                if not(re.match(self.PTN_3, items[0])):
                    continue
                year, year_frac = re.split(self.PTN_4, items[0])
                year = int(year)
                if year_frac == "00":
                    month = 1
                elif year_frac == "25":
                    month = 4
                elif year_frac == "50":
                    month = 7
                elif year_frac == "75":
                    month = 10
                date = "{:04d}-{:02d}-01".format(year, month)
                if date <= self.date_max:
                    continue
                self.data.append([date, float(items[1]), "P"])
        except Exception as e:
            raise

    def __get_delta_t(self):
        """ delta t 取得 """
        try:
            for i, d in enumerate(reversed(self.data)):
                if d[0] <= self.date:
                    if i == 0:
                        break
                    self.delta_t = d[1]
                    if d[2] == "P":
                        self.dp = "*"
                    break
        except Exception as e:
            raise

    def __display(self):
        """ 結果出力 """
        try:
            print("[{}] delta_T = {} sec. {}".format(
                self.date, self.delta_t, self.dp)
            )
        except Exception as e:
            raise


if __name__ == '__main__':
    try:
        obj = GetDeltaTUsno()
        obj.exec()
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)
{% endhighlight %}

* [Gist - Python script to get delta_T from USNO.](https://gist.github.com/komasaru/2d56aaa2d19e40fd0eeb393e76ffa3f1 "Gist - Python script to get delta_T from USNO.")

### 2. Python スクリプトの実行

まず、実行権限を付与。

``` text
$ chmod +x get_delta_t_usno.py
```

そして、コマンドライン引数に UTC（協定世界時）を `YYYYMMDD` の書式で指定して実行する。（引数無指定なら、システム日付を UTC とみなす）

``` text
$ ./get_delta_t_usno.py 20180620
[2018-06-20] delta_T = 69.14 sec. *
```

* 推定値の場合は行末に `*` が付与される。

---

人工衛星の正確な軌道計算等に利用できるでしょう。

ちなみに、今回の方法を応用して、 IERS（国際地球回転観測事業; International Earth Rotation and Reference systems Service）提供の Polar Motion（地球の極運動）のデータも取得できます。

以上。

