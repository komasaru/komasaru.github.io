---
layout   : single
title: 'Fortran - 倍精度浮動小数点数の指定方法！'
published: true
date     : 2017-05-10 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Fortran
---

今回は、 Fortran95 での倍精度浮動小数点数の指定方法についてです。

<!--more-->

### 0. 前提条件

* LMDE2(Linux Mint Debian Edition 2; 64bit) での作業を想定。
* GCC 6.3.0 (GFortran) でのコンパイルを想定。
* Fortran には長けていないので、コードに誤りがあるかもしれない。

### 1. Fortran コードの作成


File: `double_precision_real.f95`

{% highlight fortran linenos %}
!****************************************************
! 単精度・倍精度浮動小数点数の確認
!
! date          name            version
! 2017.04.10    mk-mode.com     1.00 新規作成
!
! Copyright(C) 2017 mk-mode.com All Rights Reserved.
!****************************************************
!
program double_precision_real
  implicit none
  integer, parameter ::  SP = kind(1.0)
  integer, parameter ::  DP = selected_real_kind(2*precision(1.0_SP))
  real(SP) :: a
  real(DP) :: b
  a = 3.1415926535897323846264338327950288_SP
  b = 3.1415926535897323846264338327950288_DP
  print *,' a, b = ', a, b
end program double_precision_real
{% endhighlight %}

* 上記の `SP` は、単精度浮動小数点数の精度に関係した整数定数
* 上記の `DP` は、`SP` を使って単精度として指定した浮動小数点数の2倍の精度を持つ浮動小数点数、つまり倍精度浮動小数点数に関係した整数定数
* `real(SP)`, `real(DP)` で単精度浮動小数点と倍精度浮動小数点数を宣言

* [Gist - Fortran code to specify floating-point numbers.](https://gist.github.com/komasaru/90ffd4f915744e9c520619342a0d2011 "Gist - Fortran code to specify floating-point numbers.")

### 2. コンパイル

``` text
$ gfortran double_precision_real.f95 -o double_precision_real
```

### 3. 実行

``` text
$ ./double_precision_real
  a, b =    3.14159274       3.1415926535897323
```

### 4. 参考サイト

* [2.2 Fortran90/95入門 後半](http://www.research.kobe-u.ac.jp/csi-viz/members/kageyama/lectures/H22_FY2010_former/ComputationalScience/2_2_f95b.html "2.2 Fortran90/95入門 後半")

---

学生時代に使用した Fortran （当時は大文字の FORTRAN77 ）を思い出すべく、簡単なコードを書いてみた次第です。（当時覚えたことはほとんど忘れているので、初心者レベル）

少し前に円周率計算を行ったことはありますが、いずれは、他の複雑な計算等も行ってみたいと考えております。

以上。

