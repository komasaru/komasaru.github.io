---
layout   : single
title    : "Fortran - 2つの配列から単回帰曲線（2次回帰）計算！"
published: true
date     : 2019-06-17 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Fortran
---

Fortran 95 で、数値からなる同サイズの配列2つを説明変数・目的変数とみなして単回帰曲線（2次回帰）を計算する方法についての記録です。

過去には、単回帰直線（1次回帰）を計算する方法についての紹介しまいた。

* [Fortran - 2 つの配列から単回帰直線計算！]({{site.baseurl}}/2019/03/26/fortran95-regression-line "Fortran - 2 つの配列から単回帰直線計算！")

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* GCC 6.3.0 (GFortran 6.3.0) でのコンパイルを想定。

### 1. アルゴリズムについて

当ブログ過去記事を参照のこと。

* [Ruby - Array クラス拡張で単回帰曲線計算！ ]({{site.baseurl}}/2018/05/16/uby-simple-linear-regression-curve "Ruby - Array クラス拡張で単回帰曲線計算！ ")
* [Python - 2 つの list から単回帰曲線（二次回帰）計算！ ]({{site.baseurl}}/2018/05/18/python-regression-curve-computation "Python - 2 つの list から単回帰曲線（二次回帰）計算！ ")

### 2. ソースコードの作成

File: `regression_curve.f95`

{% highlight fortran linenos %}
!****************************************************
! 単回帰曲線（2次回帰）計算
! : y = a + b * x + c * x^2
!
!   date          name            version
!   2019.03.17    mk-mode.com     1.00 新規作成
!
! Copyright(C) 2019 mk-mode.com All Rights Reserved.
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
  ! 単回帰曲線（2次回帰）計算
  !
  ! :param(in)  real(8) x(:): 説明変数配列
  ! :param(in)  real(8) y(:): 目的変数配列
  ! :param(out) real(8)    a: 係数 a
  ! :param(out) real(8)    b: 係数 b
  ! :param(out) real(8)    b: 係数 c
  subroutine calc_reg_line(x, y, a, b, c)
    implicit none
    real(DP), intent(in)  :: x(:), y(:)
    real(DP), intent(out) :: a, b, c
    integer(SP) :: size_x, size_y, i
    real(DP)    :: m_x, m_x2, m_x3, m_x4, m_xy, m_x2y, m_y
    real(DP)    :: s_xx, s_xy, s_xx2, s_x2x2, s_x2y

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

    m_x    = sum(x) / size_x              ! avg(X)
    m_y    = sum(y) / size_y              ! avg(Y)
    m_x2   = sum(x * x) / size_x          ! avg(X^2)
    m_x3   = sum(x * x * x) / size_x      ! avg(X^3)
    m_x4   = sum(x * x * x * x) / size_x  ! avg(X^4)
    m_xy   = sum(x * y) / size_x          ! avg(X * Y)
    m_x2y  = sum(x * x * y) / size_x      ! avg(X-2 * Y)
    s_xx   = m_x2 - m_x * m_x             ! Sxx
    s_xy   = m_xy - m_x * m_y             ! Sxy
    s_xx2  = m_x3 - m_x * m_x2            ! Sxx2
    s_x2x2 = m_x4 - m_x2 * m_x2           ! Sx2x2
    s_x2y  = m_x2y - m_x2 * m_y           ! Sx2y
    b = s_xy * s_x2x2 - s_x2y * s_xx2
    b = b / (s_xx * s_x2x2 - s_xx2 * s_xx2)
    c = s_x2y * s_xx - s_xy * s_xx2
    c = c / (s_xx * s_x2x2 - s_xx2 * s_xx2)
    a = m_y - b * m_x - c * m_x2
  end subroutine calc_reg_line
end module comp

program regression_curve
  use const
  use comp
  implicit none
  character(9), parameter :: F_INP = "input.txt"
  integer(SP),  parameter :: UID   = 10
  real(DP)      :: a, b, c
  integer(SP)   :: n, i
  character(20) :: f
  real(DP), allocatable :: x(:), y(:)

  ! IN ファイル OPEN
  open (UID, file = F_INP, status = "old")

  ! データ数読み込み
  read (UID, *) n

  ! 配列用メモリ確保
  allocate(x(n))
  allocate(y(n))

  ! データ読み込み
  do i = 1, n
    read (UID, *) x(i), y(i)
  end do
  write (f, '("(A, ", I0, "F8.2, A)")') n
  print f, "説明変数 X = (", x, ")"
  print f, "目的変数 Y = (", y, ")"
  print '(A)', "---"

  ! IN ファイル CLOSE
  close (UID)

  ! 回帰曲線計算
  call calc_reg_line(x, y, a, b, c)
  print '(A, F12.8)', "a = ", a
  print '(A, F12.8)', "b = ", b
  print '(A, F12.8)', "c = ", c

  ! 配列用メモリ解放
  deallocate(x)
  deallocate(y)
end program regression_curve
{% endhighlight %}

* [Gist - Fortran 95 source code to compute a simple regression curve(2d).](https://gist.github.com/komasaru/58d6ee2af579ac7b5832faf3de6914cc "Gist - Fortran 95 source code to compute a simple regression curve(2d).")

### 3. ソースコードのコンパイル

``` text
$ gfortran -o regression_curve regression_curve.f95
```

### 4. 動作確認

まず、以下のような入力ファイルを用意する。  
（先頭行：点の数、2行目以降：各点）

File: `input.txt`

{% highlight text linenos %}
14
83 183
71 168
64 171
69 178
69 176
64 172
68 165
59 158
81 183
91 182
57 163
65 175
58 164
62 175
{% endhighlight %}

そして、テキストファイルの出力をパイプ処理して実行。

``` text
$ ./regression_curve
説明変数 X = (   83.00   71.00   64.00   69.00   69.00   64.00   68.00   59.00   81.00   91.00   57.00   65.00   58.00   62.00)
目的変数 Y = (  183.00  168.00  171.00  178.00  176.00  172.00  165.00  158.00  183.00  182.00  163.00  175.00  164.00  175.00)
---
a =  41.37453964
b =   3.08672320
c =  -0.01683565
```

参考までに、上記スクリプトで使用した2変量の各点と作成された回帰曲線を gnuplot で描画してみた。

![REGRESSION_CURVE]({{site.baseurl}}/images/2019/06/17/REGRESSION_CURVE.png "REGRESSION_CURVE")

---

以上。

