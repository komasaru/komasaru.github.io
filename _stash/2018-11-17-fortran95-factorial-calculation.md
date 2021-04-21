---
layout   : single
title    : "Fortran - 階乗の計算！"
published: true
date     : 2018-11-17 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Fortran
---

Fortran 95 で階乗の計算をしてみました。（あまりに簡単なアルゴリズムですが）

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* GCC 6.3.0 (GFortran 6.3.0) でのコンパイルを想定。

### 1. ソースコードの作成

File: `factorial.f95`

{% highlight fortran linenos %}
!****************************************************
! 階乗計算
!
! date          name            version
! 2018.08.20    mk-mode.com     1.00 新規作成
!
! Copyright(C) 2018 mk-mode.com All Rights Reserved.
!****************************************************
!
program fact_main
  implicit none
  integer n

  do n = 0, 20
    write (*,'(I3,3X,I20)') n, fact(n)
  enddo

  stop
contains
  ! 階乗計算
  !
  ! :param  integer n
  ! :return integer fact
  integer(kind=8) recursive function fact(n)
    implicit none
    integer, intent(IN) :: n
    integer :: i

    fact = 1
    do i = 1, n
      fact = fact * i
    enddo
    return
  end function fact
end program fact_main
{% endhighlight %}

* [Gist - Fortran 95 source code to compute the factorial.](https://gist.github.com/komasaru/1034956cc26d0ef7549b0523df183518 "Gist - Fortran 95 source code to compute the factorial.")

### 2. ソースコードのコンパイル

``` text
$ gfortran -o factorial factorial.f95
```

### 3. 動作確認

``` text
$ ./factorial
  0                      1
  1                      1
  2                      2
  3                      6
  4                     24
  5                    120
  6                    720
  7                   5040
  8                  40320
  9                 362880
 10                3628800
 11               39916800
 12              479001600
 13             6227020800
 14            87178291200
 15          1307674368000
 16         20922789888000
 17        355687428096000
 18       6402373705728000
 19     121645100408832000
 20    2432902008176640000
```

---

以上、

