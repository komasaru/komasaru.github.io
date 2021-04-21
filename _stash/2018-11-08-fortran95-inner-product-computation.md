---
layout   : single
title    : "Fortran - 内積の計算！"
published: true
date     : 2018-11-08 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Fortran
---

Fortran 95 でベクトルの内積を計算してみました。

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* GCC 6.3.0 (GFortran 6.3.0) でのコンパイルを想定。

### 1. ソースコードの作成

* 組み込み関数を使用しない場合は、使用する場合の方をコメントアウト、使用しない場合の方をコメント解除すること。

File: `inner_product.f95`

{% highlight fortran linenos %}
!****************************************************
! ベクトルの内積を計算
!
! date          name            version
! 2018.08.14    mk-mode.com     1.00 新規作成
!
! Copyright(C) 2018 mk-mode.com All Rights Reserved.
!****************************************************
!
program inner_product
  implicit none
  integer :: i, dim
  real(kind=8), allocatable :: v1(:), v2(:)
  real(kind=8) :: tmp

  write (*,*) 'Input dimension:'
  read (*,*) dim

  allocate(v1(dim), v2(dim))  ! メモリ確保

  write (*,*) 'Input vector 1:'
  read (*,*) v1(1:dim)

  write (*,*) 'Input vector 2:'
  read (*,*) v2(1:dim)

  ! 組み込み関数を使用しない場合
  ! tmp = 0
  ! do i = 1, dim
  !   tmp = tmp + v1(i) * v2(i)
  ! end do
  !
  ! 組み込み関数を使用する場合
  tmp = dot_product(v1, v2)

  write (*,*) 'Inner product of v1 and v2 = ', tmp

  deallocate(v1, v2)  ! メモリ解放

  stop
end program inner_product
{% endhighlight %}

* [Gist - Fortran 95 source code to compute inner-product of vetors.](https://gist.github.com/komasaru/977d19b1dcd8ad1ddd7ad4573714ca6e "Gist - Fortran 95 source code to compute inner-product of vetors.")

以下は、上記のコードをより Fortran らしく改良したもの。  
（組み込み関数をしない場合と使用する場合の2通りで計算。ベクトルはコード内に記述。内積計算部分を関数化）

File: `inner_product_2.f95`

{% highlight fortran linenos %}
!****************************************************
! ベクトルの内積を計算(Ver.2)
!
! date          name            version
! 2018.08.20    mk-mode.com     1.00 新規作成
!
! Copyright(C) 2018 mk-mode.com All Rights Reserved.
!****************************************************
!
program inner_product_2
  implicit none
  integer, parameter :: n = 3
  real(8) :: x(n) = (/ 1, 2, 3 /)
  real(8) :: y(n) = (/ 4, 5, 6 /)

  write (*,*) iprod(n, x, y)
  write (*,*) dot_product(x, y)  ! 組み込み関数で検算

  stop
contains
  ! 内積計算
  !
  ! :param(in)  integer(4) dim
  ! :param(in)  real(8) x(dim)
  ! :param(in)  real(8) y(dim)
  ! :return     real(8)
  real(8) function iprod(dim, x, y)
    implicit none
    integer, intent(IN) :: dim
    real(8), intent(IN) :: x(dim), y(dim)
    integer :: i

    iprod = 0
    do i = 1, dim
      iprod = iprod + x(i) * y(i)
    enddo
    return
  end function iprod
end program inner_product_2
{% endhighlight %}

* [Gist - Fortran 95 source code to compute inner-product of vetors(Ver.2).](https://gist.github.com/komasaru/abcef2d8dff24319269020ede8c624f4 "Gist - Fortran 95 source code to compute inner-product of vetors.(Ver.2)")

### 2. ソースコードのコンパイル

``` text
$ gfortran -o inner_product inner_product.f95
```

``` text
$ gfortran -o inner_product_2 inner_product_2.f95
```

### 3. 動作確認

``` text
$ ./inner_product
 Input dimension:
3
 Input vector 1:
1
2
3
 Input vector 2:
4
5
6
 Inner product of v1 and v2 =    32.000000000000000
```

``` text
$ ./inner_product_2
   32.000000000000000
   32.000000000000000
```

---

以上、

