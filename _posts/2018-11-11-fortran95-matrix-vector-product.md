---
layout   : single
title    : "Fortran - 行列とベクトルの積の計算！"
published: true
date     : 2018-11-11 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Fortran
---

Fortran 95 で行列とベクトルの積を計算してみました。

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* GCC 6.3.0 (GFortran 6.3.0) でのコンパイルを想定。

### 1. ソースコードの作成

* 組み込み関数を使用しない場合は、使用する場合の方をコメントアウト、使用しない場合の方をコメント解除すること。

File: `mv_product.f95`

{% highlight fortran linenos %}
!****************************************************
! 行列とベクトルの積を計算
! : y = A x
!
! date          name            version
! 2018.08.15    mk-mode.com     1.00 新規作成
!
! Copyright(C) 2018 mk-mode.com All Rights Reserved.
!****************************************************
!
program mv_product
  implicit none
  integer :: i, j, n
  integer, parameter :: nmax = 100
  real(kind=8) :: a(nmax, nmax), x(nmax), y(nmax), tmp

  write (*,*) 'Input a dimension:'
  read (*,*) n

  write (*,*) 'Input a vector:'
  read (*,*) (x(i), i = 1, n)

  write (*,*) 'Input a matrix:'
  do i = 1, n
    read (*,*) (a(i, j), j = 1, n)
  end do

  ! 組み込み関数を使用しない場合
  !do i = 1, n
  !  tmp = 0
  !  do j = 1, n
  !    tmp = tmp + a(i, j) * x(j)
  !  end do
  !  y(i) = tmp
  !end do
  !
  ! 組み込み関数を使用する場合
  y(1:n) = matmul(a(1:n, 1:n), x(1:n))

  write (*,*) (y(i), i = 1, n)

  stop
end program mv_product
{% endhighlight %}

* [Gist - Fortran 95 source code to compute the product of matrix and vetor.](https://gist.github.com/komasaru/373c0b2f2e9e22ff38d3736bc5c71329 "Gist - Fortran 95 source code to compute the product of matrix and vetor.")

### 2. ソースコードのコンパイル

``` text
$ gfortran -o mv_product mv_product.f95
```

### 3. 動作確認

``` text
$ ./mv_product
 Input a dimension:
3
 Input a vector:
1
2
3
 Input a matrix:
1
2
3
4
5
6
7
8
9
   14.000000000000000        32.000000000000000        50.000000000000000
```

もしくは、以下のようなテキストファイルを用意し、そのファイルを読み込ませる。

File: `mv.dat`

{% highlight text linenos %}
4
 1.0 -2.0  3.0  4.0
 2.0  1.0 -3.0  2.0
 3.0  4.0  5.0  6.0
-1.0  2.0  0.0  3.0
 2.0 -6.0 -7.0  5.0
{% endhighlight %}

``` text
$ ./mv_product < mv.dat
 Input a dimension:
 Input a vector:
 Input a matrix:
  -1.0000000000000000        34.000000000000000        7.0000000000000000       13.000000000000000
```

---

以上、

