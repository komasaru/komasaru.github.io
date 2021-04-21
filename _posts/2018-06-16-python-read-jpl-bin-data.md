---
layout   : single
title    : "Python - JPL 天文暦バイナリデータの読み込み！"
published: true
date     : 2018-06-16 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- カレンダー
- Python
---

以前、 NASA の機関である JPL(Jet Propulsion Laboratory) が惑星探査用に編纂・発行している月・惑星の暦の最新版 DE430 のバイナリ形式のデータを Ruby で読み込んでみました。

* [Ruby - JPL 天文暦バイナリデータの読み込み！]({{site.baseurl}}/2016/04/26/ruby-read-jpl-bin-data/ "Ruby - JPL 天文暦バイナリデータの読み込み！")

今回は、 Python で同様の実装をしてみました。（Python でのバイナリデータの読み込み方法に関する記録と考えてもよい）

<!--more-->

### 0. 前提条件

* LMDE 2 (Linux Mint Debian Edition 2; 64bit) での作業を想定。
* Python 3.6.4 （エンコード：UTF-8）での作業を想定。
* 使用するバイナリ形式データは、テキスト形式データ "ascp1950.430", "ascp2050.430" を「[JPL 天文暦データのバイナリ化！]({{site.baseurl}}/2016/04/18/merging-jpl-data "JPL 天文暦データのバイナリ化！ - mk-mode BLOG")」の方法でバイナリ化したもの。（ファイル名は "JPLEPH" に変更）
* バイナリ形式データの仕様については「[JPL 天文暦バイナリデータの仕様！]({{site.baseurl}}/2016/04/22/about-jpl-binary-data "JPL 天文暦バイナリデータの仕様！ - mk-mode BLOG")」を参照。

### 1. Python スクリプトの作成

File: `jpl_read_de430.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.6
"""
JPLEPH(JPL の DE430 バイナリデータ)読み込み
: データの読み込みテストのため、対象日時・天体番号は定数で設定している
     1: 水星 (Mercury)
     2: 金星 (Venus)
     3: 地球 - 月の重心 (Earth-Moon barycenter)
     4: 火星 (Mars)
     5: 木星 (Jupiter)
     6: 土星 (Saturn)
     7: 天王星 (Uranus)
     8: 海王星 (Neptune)
     9: 冥王星 (Pluto)
    10: 月（地心） (Moon (geocentric))
    11: 太陽 (Sun)
    12: 地球の章動（1980年IAUモデル） (Earth Nutations in longitude and obliquity(IAU 1980 model))
    13: 月の秤動 (Lunar mantle libration)

  date          name            version
  2018.03.18    mk-mode.com     1.00 新規作成

Copyright(C) 2018 mk-mode.com All Rights Reserved.
"""
import struct
import sys
import traceback


class JplReadDe430:
    FILE_BIN = "JPLEPH"
    KSIZE    = 2036
    RECL     = 4
    JD       = 2457459.5  # 対象日時(= 2016-03-12 00:00:00)
    ASTR     = 1          # 天体番号

    def __init__(self):
        self.pos = 0      # レコード位置

    def exec(self):
        """ Execution """
        try:
            # バイナリファイル読み込み
            with open(self.FILE_BIN, "rb") as f:
                # ヘッダ（1レコード目）取得
                self.__get_ttl(f)     # TTL
                self.__get_cnam(f)    # CNAM
                self.__get_ss(f)      # SS
                self.__get_ncon(f)    # NCON
                self.__get_au(f)      # AU
                self.__get_emrat(f)   # EMRAT
                self.__get_ipt(f)     # IPT
                self.__get_numde(f)   # NUMDE
                self.__get_ipt_13(f)  # IPT
                # ヘッダ（2レコード目）取得
                self.__get_cval(f)    # CVAL
                # レコードインデックス計算
                self.idx = int((self.JD - self.sss[0]) / self.sss[2])
                # 係数取得（対象のインデックス分を取得）
                self.__get_coeff(f)   # COEFF
            # 結果出力
            self.__display()
        except Exception as e:
            raise

    def __get_ttl(self, f):
        """ TTL（タイトル）取得
            - 84 byte * 3
            - ASCII文字列(後続のnull文字やスペースを削除)

        :param file_object f
        """
        len_rec = 84
        self.ttl = ""
        try:
            for i in range(3):
                f.seek(self.pos + len_rec * i)
                a = struct.unpack(str(len_rec) + "s", f.read(len_rec))[0]
                if i != 0:
                    self.ttl += "\n"
                self.ttl += a.decode("utf-8").rstrip()
            self.pos += len_rec * 3
        except Exception as e:
            raise

    def __get_cnam(self, f):
        """ CNAM（定数名）取得
            - 6 byte * 400
            - ASCII文字列(後続のnull文字やスペースを削除)

        :param file_object f
        """
        len_rec = 6
        self.cnams = []
        try:
            for i in range(400):
                f.seek(self.pos + len_rec * i)
                a = struct.unpack(str(len_rec) + "s", f.read(len_rec))[0]
                self.cnams.append(a.decode("utf-8").rstrip())
            self.pos += len_rec * 400
        except Exception as e:
            raise

    def __get_ss(self, f):
        """ SS（ユリウス日（開始、終了）、分割日数）取得
            - 8 byte * 3
            - 倍精度浮動小数点数(機種依存)

        :param file_object f
        """
        len_rec = 8
        self.sss = []
        try:
            for i in range(3):
                f.seek(self.pos + len_rec * i)
                a = struct.unpack("d", f.read(len_rec))[0]
                self.sss.append(a)
            self.pos += len_rec * 3
        except Exception as e:
            raise

    def __get_ncon(self, f):
        """ NCON（定数の数）取得
            - 4 byte * 1
            - unsigned int (符号なし整数, エンディアンと int のサイズに依存)

        :param file_object f
        """
        len_rec = 4
        try:
            f.seek(self.pos)
            a = struct.unpack("I", f.read(len_rec))[0]
            self.ncon = a
            self.pos += len_rec
        except Exception as e:
            raise

    def __get_au(self, f):
        """ AU（天文単位）取得
            - 8 byte * 1
            - 倍精度浮動小数点数(機種依存)

        :param file_object f
        """
        len_rec = 8
        try:
            f.seek(self.pos)
            a = struct.unpack("d", f.read(len_rec))[0]
            self.au = a
            self.pos += len_rec
        except Exception as e:
            raise

    def __get_emrat(self, f):
        """ EMRAT（地球と月の質量比）取得
            - 8 byte * 1
            - 倍精度浮動小数点数(機種依存)

        :param file_object f
        """
        len_rec = 8
        try:
            f.seek(self.pos)
            a = struct.unpack("d", f.read(len_rec))[0]
            self.emrat = a
            self.pos += len_rec
        except Exception as e:
            raise

    def __get_numde(self, f):
        """ NUMDE（DEバージョン番号）取得
            - 4 byte * 1
            - unsigned int (符号なし整数, エンディアンと int のサイズに依存)

        :param file_object f
        """
        len_rec = 4
        try:
            f.seek(self.pos)
            a = struct.unpack("I", f.read(len_rec))[0]
            self.numde = a
            self.pos += len_rec
        except Exception as e:
            raise

    def __get_ipt(self, f):
        """ IPT（オフセット、係数の数、サブ区間数）（水星〜月の章動）取得
            - 4 byte * 12 * 3
            - unsigned int (符号なし整数, エンディアンと int のサイズに依存)

        :param file_object f
        """
        len_rec = 4
        self.ipts = []
        try:
            for i in range(12):
                l = []
                for j in range(3):
                    f.seek(self.pos + len_rec * j)
                    a = struct.unpack("I", f.read(len_rec))[0]
                    l.append(a)
                self.ipts.append(l)
                self.pos += len_rec * 3
        except Exception as e:
            raise

    def __get_ipt_13(self, f):
        """ IPT_13（オフセット、係数の数、サブ区間数）（月の秤動）取得
            - 4 byte * 1 * 3
            - unsigned int (符号なし整数, エンディアンと int のサイズに依存)

        :param file_object f
        """
        len_rec = 4
        try:
            l = []
            for i in range(3):
                f.seek(self.pos + len_rec * i)
                a = struct.unpack("I", f.read(len_rec))[0]
                l.append(a)
            self.ipts.append(l)
            self.pos += len_rec * 3
        except Exception as e:
            raise

    def __get_cval(self, f):
        """ CVAL（定数値）取得
            - 8 byte * @ncon
            - 倍精度浮動小数点数(機種依存)

        :param file_object f
        """
        self.pos = self.KSIZE * self.RECL
        len_rec = 8
        self.cvals = []
        try:
            for i in range(self.ncon):
                f.seek(self.pos + len_rec * i)
                a = struct.unpack("d", f.read(len_rec))[0]
                self.cvals.append(a)
        except Exception as e:
            raise

    def __get_coeff(self, f):
        """ CEFF（係数）取得
            - 8 byte * ?
            - 倍精度浮動小数点数(機種依存)
            - 地球・章動のみ要素数が 2 で、その他の要素数は 3
            - self.jds に当インデックスの開始・終了ユリウス日を格納
            - self.coeffs にその他の係数を格納

        :param file_object f
        """
        self.pos = self.KSIZE * self.RECL * (2 + self.idx)
        offset, cnt_coeff, cnt_sub = self.ipts[self.ASTR - 1]
        n = 2 if self.ASTR == 12 else 3
        len_rec = 8
        self.coeffs = []
        try:
            l = []
            for i in range(self.KSIZE // 2):
                f.seek(self.pos + len_rec * i)
                a = struct.unpack("d", f.read(len_rec))[0]
                l.append(a)
            self.jds = l[0:2]
            l = l[(offset - 1):(cnt_coeff * n * cnt_sub + offset - 1)]
            for a in [
                l[x:x + cnt_coeff * n]
                for x in range(0, len(l), cnt_coeff * n)
            ]:
                c = []
                for b in [
                    a[x:x + cnt_coeff]
                    for x in range(0, len(a), cnt_coeff)
                ]:
                    c.append(b)
                self.coeffs.append(c)
        except Exception as e:
            raise

    def __display(self):
        """ Display """
        try:
            print(self.ttl)
            print(self.cnams)
            print(self.sss)
            print(self.ncon)
            print(self.au)
            print(self.emrat)
            print(self.numde)
            print(self.ipts)
            print(self.cvals)
            print(self.idx)
            print(self.jds)
            print(self.coeffs)
        except Exception as e:
            raise


if __name__ == '__main__':
    try:
        obj = JplReadDe430()
        obj.exec()
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)
{% endhighlight %}

* [Gist - Python script to read a jpl binary data DE430.](https://gist.github.com/komasaru/b1551d1e9ac9cf7486e438013bdf67aa "Gist - Python script to read a jpl binary data DE430.")

### 2. Python スクリプトの実行

バイナリ形式データ "JPLEPH" を Python スクリプトと同じディレクトリに配置して以下を実行する。

``` text
$ ./jpl_read_de430.py
JPL Planetary Ephemeris DE430/LE430
Start Epoch: JED=  2287184.5 1549-DEC-21 00:00:00
Final Epoch: JED=  2688976.5 2650-JAN-25 00:00:00
['DENUM', 'LENUM', 'TDATEF', 'TDATEB', 'JDEPOC', 
      :
===< 中略 >===
      :
[19870922.88638703, 3401048.340544464, -820016.1365685505, 
-21884.71452138689, 4458.980962630561, 113.7942416160033, 
-28.94032658038136, -0.7360655861367853, 0.2262947806520317, 
0.0053757421530248, -0.001954966141811797, -4.175805388132797e-05, 
1.792660121594814e-05, 3.35376232236008e-07]]]
```

取得した値が出力される。（上記は視認性向上のため改行している）

必要であれば、出力を調整してご確認ください。

### 3. 参考サイト

アンパックする際の書式文字列については以下のページを参照。

* [7.1. struct — バイト列をパックされたバイナリデータとして解釈する — Python 3.6.4 ドキュメント](https://docs.python.jp/3/library/struct.html?highlight=unpack#format-characters "7.1. struct — バイト列をパックされたバイナリデータとして解釈する — Python 3.6.4 ドキュメント")

---

バイナリデータから目的の惑星・日付の係数が取得できるようになったので、天体の視位置計算に利用できることになります。

以上。

