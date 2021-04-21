---
layout   : single
title    : "Fortran - （離散）フーリエ変換！"
published: true
date     : 2019-03-26 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Fortran
---

Fortran 95 で（離散）フーリエ変換を実装する方法についての記録です。

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* GCC 6.3.0 (GFortran 6.3.0) でのコンパイルを想定。

### 1. アルゴリズムについて

当ブログ過去記事を参照のこと。

* [C++ - （離散）フーリエ変換！]({{site.baseurl}}/2013/06/10/cpp-discrete-fourier-transform "C++ - （離散）フーリエ変換！")
* [Ruby - （離散）フーリエ変換！]({{site.baseurl}}/2013/06/11/ruby-discrete-fourier-transform "Ruby - （離散）フーリエ変換！")
* [Python - （離散）フーリエ変換！]({{site.baseurl}}/2018/04/04/python-discrete-fourier-transform "Python - （離散）フーリエ変換！")

### 2. ソースコードの作成

File: `discrete_fourier_transformation.f95`

{% highlight fortran linenos %}
!****************************************************
! 離散フーリエ変換

! * f(t) = 2 * sin(4 * t) + 3 * cos(2 * t)
!          ( 0 <= t < 2 * pi )
!
!   date          name            version
!   2018.12.17    mk-mode.com     1.00 新規作成
!
! Copyright(C) 2018 mk-mode.com All Rights Reserved.
!****************************************************
!
module const
  ! SP: 単精度(4), DP: 倍精度(8)
  integer,     parameter :: SP = kind(1.0)
  integer(SP), parameter :: DP = selected_real_kind(2 * precision(1.0_SP))
  real(DP),    parameter :: PI = 4.0_DP * atan(1.0_DP)  ! 円周率
  integer(SP), parameter :: NUM = 100                   ! 分割数
end module const

module fourier
  use const
  implicit none
  private
  public :: gen_src, exec_dft, exec_idft

contains
  ! 元データ生成
  !
  ! :param(in)    integer(4)      n: データ個数(行数)
  ! :param(inout) real(8) dat(7, n): データ配列
  subroutine gen_src(n, dat)
    implicit none
    integer(SP), intent(in)    :: n
    real(DP),    intent(inout) :: dat(7, 0:n-1)
    integer(SP) :: i

    do i = 0, n - 1
      dat(1, i) = (2 * PI / n) * i
      dat(2, i) = 2 * sin(4 * (2 * PI / n) * i) &
              & + 3 * cos(2 * (2 * PI / n) * i)
      dat(3, i) = 0.0_DP
    end do
  end subroutine gen_src

  ! 離散フーリエ変換
  !
  ! :param(in)    integer(4)      n: データ個数(行数)
  ! :param(inout) real(8) dat(7, n): データ配列
  subroutine exec_dft(n, dat)
    implicit none
    integer(SP), intent(in)    :: n
    real(DP),    intent(inout) :: dat(7, 0:n-1)
    integer(SP) :: i, j
    real(DP)    :: dft_re, dft_im  ! 変換後(実部、虚部)

    do i = 0, n - 1
      dft_re = 0.0_DP
      dft_im = 0.0_DP
      do j = 0, n - 1
        dft_re = dft_re &
             & + dat(2, j) * ( cos((2 * PI / n) * i * j)) &
             & + dat(3, j) * ( sin((2 * PI / n) * i * j))
        dft_im = dft_im &
             & + dat(2, j) * (-sin((2 * PI / n) * i * j)) &
             & + dat(3, j) * ( cos((2 * PI / n) * i * j))
      end do
      dat(4, i) = dft_re
      dat(5, i) = dft_im
    end do
  end subroutine exec_dft

  ! 逆離散フーリエ変換
  !
  ! :param(in)    integer(4)      n: データ個数(行数)
  ! :param(inout) real(8) dat(7, n): データ配列
  subroutine exec_idft(n, dat)
    implicit none
    integer(SP), intent(in)    :: n
    real(DP),    intent(inout) :: dat(7, 0:n-1)
    integer(SP) :: i, j
    real(DP)    :: idft_re, idft_im  ! 逆変換後(実部、虚部)

    do j = 0, n - 1
      idft_re = 0.0_DP
      idft_im = 0.0_DP
      do i = 0, n - 1
        idft_re = idft_re &
              & + dat(4, i) * (cos((2 * PI / n) * i * j)) &
              & - dat(5, i) * (sin((2 * PI / n) * i * j))
        idft_im = idft_im &
              & + dat(4, i) * (sin((2 * PI / n) * i * j)) &
              & + dat(5, i) * (cos((2 * PI / n) * i * j))
      end do
      dat(6, j) = idft_re / n
      dat(7, j) = idft_im / n
    end do
  end subroutine exec_idft
end module fourier

program discrete_fourier_transformation
  use const, only : SP, DP, NUM
  use fourier
  implicit none
  real(DP) :: dat(7, 0:NUM-1)  ! 計算データ用配列
  integer(SP) :: i

  dat(:, :) = 0.0_DP        ! 配列初期化
  call gen_src(NUM, dat)    ! 元データ作成
  call exec_dft(NUM, dat)   ! 離散フーリエ変換
  call exec_idft(NUM, dat)  ! 逆離散フーリエ変換

  ! 結果出力
  ! * 左から：f, 元(実), (虚), IFT(実), (虚), DIFT(実), (虚)
  do i = 0, NUM - 1
    print '(7(X, F11.6))', dat(:, i)
  end do
end program discrete_fourier_transformation
{% endhighlight %}

* [Gist - Fortran 95 source code to compute discrete Fourier transformation.](https://gist.github.com/komasaru/ea44524a1fa57c64c4ab63532f2dd8f5 "Gist - Fortran 95 source code to compute discrete Fourier transformation.")

### 3. ソースコードのコンパイル

``` text
$ gfortran -o discrete_fourier_transformation discrete_fourier_transformation.f95
```

### 4. 動作確認

``` text
$ ./discrete_fourier_transformation
    0.000000    3.000000    0.000000    0.000000    0.000000    3.000000   -0.000000
    0.062832    3.473724    0.000000    0.000000   -0.000000    3.473724   -0.000000
    0.125664    3.869257    0.000000  150.000000   -0.000000    3.869257   -0.000000
    0.188496    4.158424    0.000000    0.000000   -0.000000    4.158424   -0.000000
    0.251327    4.317576    0.000000    0.000000 -100.000000    4.317576   -0.000000
                                     :
                               ===< 中略 >===
                                     :
    5.969026    0.524938    0.000000   -0.000000   -0.000000    0.524938   -0.000000
    6.031858    0.940264    0.000000    0.000000  100.000000    0.940264    0.000000
    6.094690    1.420235    0.000000   -0.000000   -0.000000    1.420235    0.000000
    6.157522    1.942242    0.000000  150.000000   -0.000000    1.942242    0.000000
    6.220353    2.478964    0.000000    0.000000   -0.000000    2.478964   -0.000000
```

※左から、 x 値、元の実部・虚部、変換後の実部・虚部、逆変換後の実部・虚部。

### 5. 結果確認

出力データを GNUPLOT で描画してみた。

![SRC]({{site.baseurl}}/images/2019/03/26/SRC.png "SRC")

![DFT]({{site.baseurl}}/images/2019/03/26/DFT.png "DFT")

![IDFT]({{site.baseurl}}/images/2019/03/26/IDFT.png "IDFT")

変換→逆変換で元に戻っているのが分かる。

---

以上。

