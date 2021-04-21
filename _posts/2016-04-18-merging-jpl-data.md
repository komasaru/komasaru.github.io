---
layout   : single
title    : "JPL 天文暦データのバイナリ化！"
published: true
date     : 2016-04-18 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- カレンダー
- Fortran
---

前回、「[月・惑星の暦 JPL DE430 について]({{site.baseurl}}/2016/04/14/about-jpl-de430 "月・惑星の暦 JPL DE430 について - mk-mode BLOG")」という記事を公開しました。（DE430 は、NASA の機関である JPL(Jet Propulsion LaboratoryJPL) が惑星探査用に編纂・発行している月・惑星の暦の最新版）

今回は、複数存在する DE430 のテキスト形式データファイルを１つのバイナリ形式のファイルにコンバートする方法についての記録です。但し、現在はバイナリ形式のデータも公開されているので、今回のようなコンバート作業は不要です。今回は、公開されているコンバート用の FORTRAN77 プログラムの動作確認の意味で作業を行いました。）

<!--more-->

### 0. 前提条件

* Linux Mint 17.2(64bit) での作業を想定。
* GNU Fortran (GCC) 4.9.1 でのコンパイル作業を想定。（FORTRAN77 のソースコードがコンパイルできる環境であること）

### 1. 使用するデータファイル

"ftp://ssd.jpl.nasa.gov/pub/eph/planets/ascii/de430/" 内の以下のファイル。

* ヘッダファイル： header.430_572
* テキスト形式データファイル： ascp1550.430 〜 ascp2550.430
* 検証用ファイル： testpo.430

### 2. 使用するプログラム（ソースコード）

"ftp://ssd.jpl.nasa.gov/pub/eph/planets/fortran/" 内の以下のファイル。

* コンバートプログラム： asc2eph.f
* データ検証プログラム： testeph.f

### 3. コンバートプログラムのコンパイル

"asc2eph.f" の 74、75 行目辺りに以下のような記述があるので、 `NRECL = 4` の方のコメントを解除（行頭の `C` を削除）する。

File: `asc2eph.f`

{% highlight text linenos %}
      PARAMETER ( NRECL = 4 )
C      PARAMETER ( NRECL = 1 )
{% endhighlight %}

そして、コンパイルする。

``` text
$ gfortran asc2eph.f -o asc2eph
```

コンパイルに成功すると、 "asc2eph" というオブジェクトファイルが作成される。

### 4. データ検証プログラムのコンパイル

"testeph.f" の `NRECL=` となっている箇所を `NRECL=4` に、 `KSIZE = ` となっている箇所を `KSIZE = 2036` と編集する。さらに、コメント化されている `CALL FSIZER2 ...` のコメントを解除（行頭の `C` を削除）する。

File: `testeph.f`

{% highlight text linenos %}
      NRECL=4

      KSIZE = 2036

        CALL FSIZER2(NRECL,KSIZE,NRFILE,NAMFIL)
{% endhighlight %}

そして、コンパイルする。

``` text
$ gfortran testeph.f -o testeph
```

コンパイルに成功すると、 "testeph" というオブジェクトファイルが作成される。

### 5. テキスト形式データのマージ＆コンバート

"asc2eph" をヘッダファイル・テキスト形式データファイルと同じディレクトリに配置して以下のように実行する。（必要なテキスト形式データファイルだけをマージするようにしてもよいし、全てのテキスト形式データファイルをマージするようにしてもよい）

``` text
$ cat header.430_572 ascp1950.430 ascp2050.430 | ./asc2eph
  JPL ASCII-TO-DIRECT-I/O program.  Last modified 15-Aug-2013.

KSIZE =  2036

JPL Planetary Ephemeris DE430/LE430                                  
Start Epoch: JED=  2287184.5 1549-DEC-21 00:00:00                    
Final Epoch: JED=  2688976.5 2650-JAN-25 00:00:00                    

  DENUM   0.4300000000000000D+03  LENUM   0.4300000000000000D+03
  TDATEF  0.2013032920043800D+14  TDATEB  0.2013032919100700D+14
  JDEPOC  0.2440400500000000D+07  CENTER  0.0000000000000000D+00

===< 中略 >===

  1901 EPHEMERIS RECORDS WRITTEN.  LAST JED =   2494096.50
  2001 EPHEMERIS RECORDS WRITTEN.  LAST JED =   2497296.50
  2101 EPHEMERIS RECORDS WRITTEN.  LAST JED =   2500496.50
  2201 EPHEMERIS RECORDS WRITTEN.  LAST JED =   2503696.50
  2284 EPHEMERIS RECORDS WRITTEN.  LAST JED =   2506352.50
STOP  OK
```

成功すると、同じディレクトリ内に "JPLEPH" というバイナリファイルが作成される。（全てのテキスト形式データファイルをマージ＆コンバートした場合は "ftp://ssd.jpl.nasa.gov/pub/eph/planets/Linux/de430/linux_p1550p2650.430" と同じサイズになるはず）

"JPLEPH" が既に存在している場合はコンパイルエラーになるので、コンパイルし直す際は "JPLEPH" ファイルを削除してから。

### 6. バイナリ形式データの検証

"testeph" を "JPLEPH" や "testpo.430" と同じディレクトリに配置して以下のように実行する。

``` text
$ ./testeph < testpo.430
  JPL TEST-EPHEMERIS program.  Last modified March 2013.

    2433264.50    2506352.50         32.00
  DENUM   0.4300000000000000D+03
  LENUM   0.4300000000000000D+03
  TDATEF  0.2013032920043800D+14
  TDATEB  0.2013032919100700D+14

===< 中略 >===

   line -- jed --   t#   c#   x#   --- jpl value ---   --- user value --    -- difference --

   100 2436294.5    4    9    3        -13.1973964533829        -13.1973964533829  0.17764E-14
   200 2439338.5    7    6    1        -27.5380053144894        -27.5380053144894  0.71054E-14
   300 2442382.5    4   11    6         -0.0039421481584         -0.0039421481584  0.26021E-17

===< 中略 >===

  2200 2500212.5    5    3    1         -1.9119755198047         -1.9119755198047  0.00000E+00
  2300 2503256.5   15    0    4          0.0003062237721          0.0003062237721  0.00000E+00
  2400 2506300.5    6    5    3          5.3862187413309          5.3862187413309  0.88818E-15
```

`difference` の列が `0.00000E+00` もしくは `0.88818E-15` のように限りなく小さい値になっていれば、データに誤りがない（テキストデータが正常にバイナリデータにコンバートされている）ということではないでしょうか。（本来は全ての `difference` 値が `0.00000E+00` になるべきであろう。この誤差は "testpo.430" 読み込み時の誤差によるもの（浮動小数点数が受ける影響によるもの））

また、全てのテキスト形式データファイルをマージ＆コンバートした場合は、当方の環境では "testeph" 実行後に「浮動小数点」に関する例外が発生した。（原因は不明。これも浮動小数点数が受ける影響によるものかもしれない）

検証用フィル "testpo.430" の仕様については、「[月・惑星の暦 JPL DE430 について！]({{site.baseurl}}/2016/04/14/about-jpl-de430 "月・惑星の暦 JPL DE430 について！ - mk-mode BLOG")」を参照のこと。

### 参考サイト

JPL 本家サイトと FTP サイト。

* [JPL Planetary and Lunar Ephemerides](http://ssd.jpl.nasa.gov/?planet_eph_export "JPL Planetary and Lunar Ephemerides")
* [ftp://ssd.jpl.nasa.gov/pub/eph/planets/](ftp://ssd.jpl.nasa.gov/pub/eph/planets/ "")

---

今後、データやプログラムを解析して惑星の位置を正確に計算するのに役立てたいと思っております。

以上。

