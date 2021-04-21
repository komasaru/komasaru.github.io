---
layout   : single
title    : "Fortran - 2 つの配列から単回帰直線計算！"
published: true
date     : 2019-04-02 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Fortran
---

Fortran 95 で、数値からなる同サイズの配列2つを説明変数・目的変数とみなして単回帰直線を計算する方法についての記録です。

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* GCC 6.3.0 (GFortran 6.3.0) でのコンパイルを想定。

### 1. アルゴリズムについて

当ブログ過去記事を参照のこと。

* [Ruby - Array クラス拡張で単回帰直線計算！]({{site.baseurl}}/2014/11/05/ruby-simple-linear-regression-line "Ruby - Array クラス拡張で単回帰直線計算！")
* [Python - 2 つの list から単回帰直線計算！]({{site.baseurl}}/2018/05/02/python-regression-line-computation "Python - 2 つの list から単回帰直線計算！")

### 2. ソースコードの作成

File: `regression_line.f95`

{% highlight fortran linenos %}
!****************************************************
! 単回帰直線計算
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
  public :: calc_reg_line

contains
  ! 単回帰直線計算
  !
  ! :param(in)  real(8) x(:): 説明変数配列
  ! :param(in)  real(8) y(:): 目的変数配列
  ! :param(out) real(8)    a: 切片
  ! :param(out) real(8)    b: 傾き
  subroutine calc_reg_line(x, y, a, b)
    implicit none
    real(DP), intent(in)  :: x(:), y(:)
    real(DP), intent(out) :: a, b
    integer(SP) :: size_x, size_y, i
    real(DP)    :: sum_x, sum_y, sum_xx, sum_xy

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

    sum_x  = sum(x)
    sum_y  = sum(y)
    sum_xx = sum(x * x)
    sum_xy = sum(x * y)
    a = (sum_xx * sum_y - sum_xy * sum_x) &
    & / (size_x * sum_xx - sum_x * sum_x)
    b = (size_x * sum_xy - sum_x * sum_y) &
    & / (size_x * sum_xx - sum_x * sum_x)
  end subroutine calc_reg_line
end module comp

program regression_line
  use const
  use comp
  implicit none
  real(DP)    :: x(10), y(10), a, b

  x = (/107, 336, 233, 82, 61, 378, 129, 313, 142, 428/)
  y = (/286, 851, 589, 389, 158, 1037, 463, 563, 372, 1020/)
  print '(A, 10F8.2, A)', "説明変数 X = (", x, ")"
  print '(A, 10F8.2, A)', "目的変数 Y = (", y, ")"
  print '(A)', "---"
  call calc_reg_line(x, y, a, b)
  print '(A, F12.8)', "切片 a = ", a
  print '(A, F12.8)', "傾き b = ", b
end program regression_line
{% endhighlight %}

* [Gist - Fortran 95 source code to compute a simple linear regression line.](https://gist.github.com/komasaru/f1e76fc44cd650298e2e9485620533ed "Gist - Fortran 95 source code to compute a simple linear regression line.")

### 3. ソースコードのコンパイル

``` text
$ gfortran -o regression_line regression_line.f95
```

### 4. 動作確認

``` text
$ ./regression_line
説明変数 X = (  107.00  336.00  233.00   82.00   61.00  378.00  129.00  313.00  142.00  428.00)
目的変数 Y = (  286.00  851.00  589.00  389.00  158.00 1037.00  463.00  563.00  372.00 1020.00)
---
切片 a =  99.07475877
傾き b =   2.14452350
```

参考までに、上記スクリプトで使用した2変量の各点と作成された単回帰直線を gnuplot で描画してみた。

![REGRESSION_LINE]({{site.baseurl}}/images/2019/04/02/REGRESSION_LINE.png "REGRESSION_LINE")

---

以上。

