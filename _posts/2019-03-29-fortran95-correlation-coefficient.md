---
layout   : single
title    : "Fortran - 2 つの配列から相関係数計算！"
published: true
date     : 2019-03-29 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Fortran
---

Fortran 95 で、数値からなる同サイズの配列2つを2つの確率変数とみなして相関係数を計算する方法についての記録です。

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* GCC 6.3.0 (GFortran 6.3.0) でのコンパイルを想定。

### 1. アルゴリズムについて

当ブログ過去記事を参照のこと。

* [Ruby - Array クラス拡張で相関係数計算！]({{site.baseurl}}/2014/11/04/ruby-correlation-coefficient "Ruby - Array クラス拡張で相関係数計算！")
* [Python - 2 つの list から相関係数計算！]({{site.baseurl}}/2018/04/28/python-correlation-coefficient-computation "Python - 2 つの list から相関係数計算！")

### 2. ソースコードの作成

File: `correlation_coefficient.f95`

{% highlight fortran linenos %}
!****************************************************
! 相関係数計算
!
!   date          name            version
!   2018.12.18    mk-mode.com     1.00 新規作成
!
! Copyright(C) 2018 mk-mode.com All Rights Reserved.
!****************************************************
!
module const
  ! SP: 単精度(4), DP: 倍精度(8)
  integer,     parameter :: SP = kind(1.0)
  integer(SP), parameter :: DP = selected_real_kind(2 * precision(1.0_SP))
end module const

module comp
  use const
  implicit none
  private
  public :: calc_r

contains
  ! 相関係数計算
  !
  ! :param(in) real(8) x(:): X 値配列
  ! :param(in) real(8) y(:): Y 値配列
  ! :return    real(8)    r: 相関係数
  function calc_r(x, y) result(r)
    implicit none
    real(DP), intent(in) :: x(:), y(:)
    real(DP)    :: r
    integer(SP) :: size_x, size_y, i
    real(DP)    :: mean_x, mean_y, cov, var_x, var_y

    size_x = size(x)
    size_y = size(y)
    if (size_x == 0 .or. size_y == 0) then
      print *, "[ERROR] array size == 0"
      stop
    end if
    if (size_x /= size_y) then
      print *, "[ERROR] size(X) != size(Y)"
      stop
    end if

    r = 0.0_DP
    mean_x = sum(x) / size_x
    mean_y = sum(y) / size_y
    cov = sum((x(1:size_x) - mean_x) * (y(1:size_x) - mean_y))
    var_x = sum((x(1:size_x) - mean_x) * (x(1:size_x) - mean_x))
    var_y = sum((y(1:size_x) - mean_y) * (y(1:size_x) - mean_y))
    r = (cov / sqrt(var_x)) / sqrt(var_y)
  end function calc_r
end module comp

program correlation_coefficient
  use const
  use comp
  implicit none
  real(DP)    :: x(10), y(10), r
  integer(SP) :: i

  x = (/(i, i=1,10)/)

  y = (/(i, i=1,10)/)
  r = calc_r(x, y)
  print '("X = (", 10F6.2, ")")', x
  print '("Y = (", 10F6.2, ")")', y
  print '("r = ", F11.8)', r
  print *

  y = (/2, 3, 3, 4, 6, 7, 8, 9, 10, 11/)
  r = calc_r(x, y)
  print '("X = (", 10F6.2, ")")', x
  print '("Y = (", 10F6.2, ")")', y
  print '("r = ", F11.8)', r
  print *

  y = (/15, 13, 12, 12, 10, 10, 8, 7, 4, 3/)
  r = calc_r(x, y)
  print '("X = (", 10F6.2, ")")', x
  print '("Y = (", 10F6.2, ")")', y
  print '("r = ", F11.8)', r
end program correlation_coefficient
{% endhighlight %}

* [Gist - Fortran 95 source code to compute a correlation coefficient.](https://gist.github.com/komasaru/e0e28a15062786d91819afd97137b283 "Gist - Fortran 95 source code to compute a correlation coefficient.")

### 3. ソースコードのコンパイル

``` text
$ gfortran -o correlation_coefficient correlation_coefficient.f95
```

### 4. 動作確認

``` text
$ ./correlation_coefficient
X = (  1.00  2.00  3.00  4.00  5.00  6.00  7.00  8.00  9.00 10.00)
Y = (  1.00  2.00  3.00  4.00  5.00  6.00  7.00  8.00  9.00 10.00)
r =  1.00000000

X = (  1.00  2.00  3.00  4.00  5.00  6.00  7.00  8.00  9.00 10.00)
Y = (  2.00  3.00  3.00  4.00  6.00  7.00  8.00  9.00 10.00 11.00)
r =  0.99233730

X = (  1.00  2.00  3.00  4.00  5.00  6.00  7.00  8.00  9.00 10.00)
Y = ( 15.00 13.00 12.00 12.00 10.00 10.00  8.00  7.00  4.00  3.00)
r = -0.98039069
```

---

以上。

