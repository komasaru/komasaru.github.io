---
layout   : single
title    : "Fortran - 赤道・黄道座標の変換！"
published: true
date     : 2018-12-29 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- Fortran
- カレンダー
---

赤道直交座標と黄道直交座標や、直交座標と極座標の相互変換を Fortran 95 で行いました。

過去には Ruby や Python でも行いましたが。

* [赤道座標と黄道座標、直交座標と極座標の変換！]({{site.baseurl}}/2016/05/08/convert-celestial-coordinates "赤道座標と黄道座標、直交座標と極座標の変換！")
* [Ruby - 赤道・黄道座標の変換（by 自作 gem ライブラリ）！]({{site.baseurl}}/2016/09/24/ruby-coordinate-conversion-by-my-gem "Ruby - 赤道・黄道座標の変換（by 自作 gem ライブラリ）！")
* [Python - 赤道・黄道座標の変換！]({{site.baseurl}}/2018/07/26/python-coordinate-conversion "Python - 赤道・黄道座標の変換！")

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* GCC 6.3.0 (GFortran 6.3.0) でのコンパイルを想定。

### 1. 赤道・黄道座標、直交・極の相互変換について

当ブログ過去記事を参照のこと。

* [赤道座標と黄道座標、直交座標と極座標の変換！]({{site.baseurl}}/2016/05/08/convert-celestial-coordinates "赤道座標と黄道座標、直交座標と極座標の変換！")

### 2. ソースコードの作成

* 以下は実行部分。

File: `conv_coord.f95`

{% highlight fortran linenos %}
!****************************************************
! 赤道・黄道座標変換（テスト）
!
!   date          name            version
!   2018.10.17    mk-mode.com     1.00 新規作成
!
! Copyright(C) 2018 mk-mode.com All Rights Reserved.
!****************************************************
!
program conv_coord
  use const
  use coord
  implicit none
  ! 黄道傾斜角(単位: rad)
  real(DP), parameter :: EPS = 23.43929_DP * PI / 180.0_DP
  ! 元の赤道直交座標
  ! (ある日の地球重心から見た太陽重心の位置(単位: AU))
  real(DP), parameter :: POS(3) = (/ &
    &  0.994436592207009972_DP, &
    & -0.038162917689578337_DP, &
    & -0.016551776709600584_DP/)
  real(DP) :: rect_ec(3), rect_eq(3), rect_eq_2(3)
  real(DP) :: pol_ec(3),  pol_eq(3),  pol_eq_2(3)

  ! 座標変換
  call rect_eq2ec(POS, EPS, rect_ec)
  call rect_ec2eq(rect_ec, EPS, rect_eq)
  call rect2pol(rect_eq, pol_eq)
  call pol_eq2ec(pol_eq, EPS, pol_ec)
  call pol_ec2eq(pol_ec, EPS, pol_eq_2)
  call pol2rect(pol_eq_2, rect_eq_2)

  ! 結果出力
  print *, "元の赤道直交座標(x, y, z):"
  print '(2X, 3F22.18)', POS
  print *, "黄道直交座標に変換(x, y, z):"
  print '(2X, 3F22.18)', rect_ec
  print *, "赤道直交座標に戻す(x, y, z):"
  print '(2X, 3F22.18)', rect_eq
  print *, "赤道極座標に変換(lambda, phi, r):"
  print '(2X, 3F22.18)', pol_eq
  print *, "黄道極座標に変換(lambda, beta, r):"
  print '(2X, 3F22.18)', pol_ec
  print *, "赤道極座標に戻す(alpha, delta, r):"
  print '(2X, 3F22.18)', pol_eq_2
  print *, "赤道直交座標に戻す(x, y, z):"
  print '(2X, 3F22.18)', rect_eq_2

  stop
end program conv_coord
{% endhighlight %}

モジュールを含めた全てのファイルは GitHub にアップしている。（当然ながら、モジュール部分の方が計算の本質となっている）

* [CalendarF95/conv_coord at master · komasaru/CalendarF95](https://github.com/komasaru/CalendarF95/tree/master/conv_coord "CalendarF95/conv_coord at master · komasaru/CalendarF95")

### 3. ソースコードのビルド

``` text
$ make
```

* やり直す場合は、 `make clean` してから。

### 4. 実行方法

``` text
$ ./conv_coord
```

* 引数は指定不可。
* テストなので、元の赤道直行座標はソースコード内に直接記述している。  
  （必要であれば、適宜変更すること）

以下、実行例。

``` text
$ ./conv_coord
 元の赤道直交座標(x, y, z):
    0.994436592207009973 -0.038162917689578336 -0.016551776709600584
 黄道直交座標に変換(x, y, z):
    0.994436592207009973 -0.041597711081466773 -0.000005622172494391
 赤道直交座標に戻す(x, y, z):
    0.994436592207009973 -0.038162917689578336 -0.016551776709600584
 赤道極座標に変換(lambda, phi, r):
    6.244827708799389754 -0.016630599800372015  0.995306237054263132
 黄道極座標に変換(lambda, beta, r):
    6.241379248856413042 -0.000005648686087788  0.995306237054263132
 赤道極座標に戻す(alpha, delta, r):
    6.244827708799389754 -0.016630599800372091  0.995306237054263132
 赤道直交座標に戻す(x, y, z):
    0.994436592207009973 -0.038162917689578552 -0.016551776709600660
```

---

以上、

