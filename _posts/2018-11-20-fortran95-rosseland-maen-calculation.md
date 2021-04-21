---
layout   : single
title    : "Fortran - 1次元配列各要素の逆数平均(Rosseland Mean)の計算！"
published: true
date     : 2018-11-20 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Fortran
---

Fortran 95 で1次元配列の各要素の逆数平均(Rosseland Mean)を計算してみました。

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* GCC 6.3.0 (GFortran 6.3.0) でのコンパイルを想定。

### 1. ソースコードの作成

* 1次元配列はソースコード内で直接設定している。

File: `rosseland_mean.f95`

{% highlight fortran linenos %}
program rosseland_mean
  implicit none
  real(8) :: a(3) = (/1.0_8, 2.0_8, 3.0_8/)

  write (*,*) rmean(a)

  stop
contains
  ! Rosseland-mean 計算
  !
  ! :param  integer x(:)
  ! :return read(8)
  real(8) function rmean(x)
    implicit none
    real(8), intent(IN) :: x(:)  ! 形状仮定配列

    rmean = size(x) / sum(1.0_8 / x)
  end function rmean
end program rosseland_mean
{% endhighlight %}

* [Gist - Fortran 95 source code to compute the rosseland-maen.](https://gist.github.com/komasaru/c604eccd4073dbb83765a5387e0082b6 "Gist - Fortran 95 source code to compute the rosseland-mean.")

以下は、内部副プログラムではなく、外部副プログラム(interface)を使用するバージョン。

File: `rosseland_mean_2.f95`

{% highlight fortran linenos %}
!****************************************************
! 1次元配列の各要素の逆数平均(Rosseland mean)を計算
!
! date          name            version
! 2018.08.20    mk-mode.com     1.00 新規作成
!
! Copyright(C) 2018 mk-mode.com All Rights Reserved.
!****************************************************
!
program rosseland_mean
  implicit none
  real(8) :: a(3) = (/1.0_8, 2.0_8, 3.0_8/)
  interface
    real(8) function rmean(x)
      real(8) :: x(:)  ! 形状仮定配列
    end function rmean
  end interface

  write (*,*) rmean(a)

  stop
end program rosseland_mean

! Rosseland-mean 計算
!
! :param  integer x(:)
! :return read(8)
real(8) function rmean(x)
  implicit none
  real(8), intent(IN) :: x(:)  ! 形状仮定配列

  rmean = size(x) / sum(1.0_8 / x)
end function rmean
{% endhighlight %}

* [Gist - Fortran 95 source code to compute the rosseland-maen.(Ver.2)](https://gist.github.com/komasaru/92dbbc03ddc533889bdeb1b8cf95afae "Gist - Fortran 95 source code to compute the rosseland-mean.(Ver.2)")

### 2. ソースコードのコンパイル

``` text
$ gfortran -o rosseland_mean rosseland_mean.f95

$ gfortran -o rosseland_mean_2 rosseland_mean_2.f95
```

* interface 版の `rosseland_mean_2` では、引数 `x` に対して INTENT がミスマッチしている旨の警告が出力されるかもしれないが、問題ない。

### 3. 動作確認

``` text
$ ./rosseland_mean
   1.6363636363636365
```

* `rosseland_mean_2` も結果は同じ。

---

以上、

