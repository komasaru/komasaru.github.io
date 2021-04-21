---
layout   : single
title    : "Fortran - 最小二乗法！"
published: true
date     : 2014-03-04 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Fortran
---

前々回、前回は、C++, Ruby による「最小二乗法」のアルゴリズムを紹介しました。

* [C++ - 最小二乗法！]({{site.baseurl}}/2014/03/02/cpp-least-squares-method/ "C++ - 最小二乗法！")
* [Ruby - 最小二乗法！]({{site.baseurl}}/2014/03/03/ruby-least-squares-method/ "Ruby - 最小二乗法！")

今回は、同じアルゴリズムを Fortran 95 で実現してみました。アルゴリズムについては、上記リンクの記事を参照してください。

<!--more-->

### 0. 前提条件

* Linux Mint 13 Maya (64bit) での作業を想定。
* GNU Fortran (Ubuntu/Linaro 4.6.3-1ubuntu5) 4.6.3
* 最小二乗法についての説明は割愛。（「[C++ - 最小二乗法！]({{site.baseurl}}/2014/03/02/cpp-least-squares-method/ "C++ - 最小二乗法！")」を参照）

### 1. Fortran ソースコード作成

File: `least_squares_method.f95`

{% highlight fortran linenos %}
!***********************************************************
! 最小二乗法
!***********************************************************
!
!***********************************************************
! 定数モジュール
!***********************************************************
module constants
  implicit none  ! 暗黙の型指定を使用しない
  ! データ数
  integer, parameter :: N = 7
  ! 予測曲線の次数
  integer, parameter :: M = 5
  ! 測定データ
  integer, parameter :: X(7) = (/ -3, -2, -1,  0, 1, 2, 3 /)
  integer, parameter :: Y(7) = (/  5, -2, -3, -1, 1, 4, 5 /)
end module constants

!***********************************************************
! 計算モジュール
!***********************************************************
module calc
  use constants       ! 定数モジュール
  implicit none       ! 暗黙の型指定を使用しない
  private             ! モジュール外非公開
  public :: calc_lsm  ! calc_lsm のみモジュール外公開

contains

  !*********************************************************
  ! 最小二乗法
  !*********************************************************
  subroutine calc_lsm()
    ! 配列定義
    real :: a(M + 2, M + 1)
    real :: s(2 * M + 1) = 0, t(M + 1) = 0

    ! s[], t[] 計算
    call calc_st(s, t)

    ! a[][] に s[], t[] 代入
    call ins_st(a, s, t)

    ! 掃き出し
    call sweap_out(a)

    ! y 値計算＆結果出力
    call display(a, s, t)
  end subroutine calc_lsm

  !*********************************************************
  ! 以下、 private subroutine
  !*********************************************************
  ! s[], t[] 計算
  subroutine calc_st(s, t)
    real, intent(inout) :: s(:), t(:)
    integer :: i, j

    do i = 1, N
      do j = 1, 2 * M + 1
        s(j) = s(j) + x(i) ** (j - 1)
      end do
      do j = 1, M + 1
        t(j) = t(j) + x(i) ** (j - 1) * y(i)
      end do
    end do
  end subroutine calc_st

  ! a[][] に s[], t[] 代入
  subroutine ins_st(a, s, t)
    real, intent(inout) :: a(:,:)
    real, intent(in)    :: s(:), t(:)
    integer :: i, j

    do i = 1, M + 1
      do j = 1, M + 1
        a(j, i) = s(i + j - 1)
      end do
      a(M + 2, i) = t(i)
    end do
  end subroutine ins_st

  ! 掃き出し
  subroutine sweap_out(a)
    real, intent(inout) :: a(:,:)
    integer :: i, j, k
    real    :: p, d

    do k = 1, M + 1
      p = a(k, k)
      do j = k, M + 2
        a(j, k) = a(j, k) / p
      end do
      do i = 1, M + 1
        if (i /= k) then
          d = a(k, i)
          do j = k, M + 2
            a(j, i) = a(j, i) - d * a(j, k)
          end do
        end if
      end do
    end do
  end subroutine sweap_out

  ! 結果出力
  subroutine display(a, s, t)
    real, intent(in) :: a(:,:)
    real, intent(in) :: s(:)
    real, intent(in) :: t(:)
    integer :: i, px
    real    :: p

    do i = 1, M +1
      write (*, '(a,i1,a,f10.6)'), "a", i - 1, " = ", a(M + 2, i)
    end do
    write (*, '(a)'), "    x    y"
    do px = -3 * 2, 3 * 2
      p = 0
      do i = 1, M + 1
        p = p + a(M + 2, i) * ((px / 2.0) ** (i - 1))
      end do
      write (*, '(f5.1,f5.1)'), (px / 2.0), p
    end do
  end subroutine display
end module calc

!***********************************************************
! 主処理
!***********************************************************
program least_squares_method
  use constants  ! 定数モジュール
  use calc       ! 計算モジュール
  implicit none  ! 暗黙の型指定を使用しない

  ! ==== 最小二乗法
  call calc_lsm()
end program least_squares_method
{% endhighlight %}

* [Gist - Fortran95 source code to solve approximate equation with least squares method.](https://gist.github.com/komasaru/86bc7c9c2f0e805873f280ea88150dc1 "Gist - Fortran95 source code to solve approximate equation with least squares method.")

### 2. Fortran ソースコードコンパイル

``` text
$ f95 least_squares_method.f95 -o least_squares_method
```

何も出力されなければ成功。

### 3. 実行

``` text
$ ./least_squares_method
a0 =  -1.259740
a1 =   2.100002
a2 =   0.424242
a3 =  -0.083334
a4 =   0.030303
a5 =  -0.016667
    x    y
 -3.0  5.0
 -2.5  0.3
 -2.0 -2.1
 -1.5 -2.9
 -1.0 -2.8
 -0.5 -2.2
  0.0 -1.3
  0.5 -0.1
  1.0  1.2
  1.5  2.6
  2.0  3.9
  2.5  4.9
  3.0  5.0
```

C++ 版、Ruby 版と同じ結果になるはず。

---

数学的な内容だったので Fortran 95 でも実装してみた次第です。

以上。

