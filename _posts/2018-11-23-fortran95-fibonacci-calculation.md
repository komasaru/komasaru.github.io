---
layout   : single
title    : "Fortran - フィボナッチ数列の計算！"
published: true
date     : 2018-11-23 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Fortran
---

Fortran 95 でフィボナッチ数列の計算をしてみました。

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* GCC 6.3.0 (GFortran 6.3.0) でのコンパイルを想定。

### 1. ソースコードの作成

* 今回は、初項 0, 1, 長さ 20 のフィボナッチ数列を計算することを想定。

File: `fibonacci.f95`

{% highlight fortran linenos %}
!****************************************************
! フィボナッチ数列計算
!
! date          name            version
! 2018.08.20    mk-mode.com     1.00 新規作成
!
! Copyright(C) 2018 mk-mode.com All Rights Reserved.
!****************************************************
!
program fibonacci_main
  implicit none

  print *, fibonacci(0, 1, 20)

  stop
contains
  ! フィボナッチ数列の計算
  ! * 初項 f1, f2, 長さ n のフィボナッチ数列を返す
  !
  ! :param(in) integer f1
  ! :param(in) integer f2
  ! :param(in) integer n
  ! :return    integer fibonacci(1:n)
  recursive function fibonacci(f1, f2, n)
    implicit none
    integer, intent(in) :: f1, f2, n
    integer :: fibonacci(1:n)
    integer :: i

    fibonacci(1) = f1
    fibonacci(2) = f2

    do i = 3, n
      fibonacci(i) = fibonacci(i - 1) + fibonacci(i - 2)
    end do
  end function fibonacci
end program fibonacci_main
{% endhighlight %}

* [Gist - Fortran 95 source code to compute the Fibonacci-series.](https://gist.github.com/komasaru/89e3b2b6cf2ef3ec3251168c018186b1 "Gist - Fortran 95 source code to compute the Fibonacci-series.")

以下は、内部副プログラムではなく、外部副プログラム(interface)を使用するバージョン。

File: `fibonacci_2.f95`

{% highlight fortran linenos %}
!****************************************************
! フィボナッチ数列計算
!
! date          name            version
! 2018.08.20    mk-mode.com     1.00 新規作成
!
! Copyright(C) 2018 mk-mode.com All Rights Reserved.
!****************************************************
!
program fibonacci_main
  implicit none
  ! インタフェースブロックには引数と関数の戻り値の情報を記述する。
  interface
    function fibonacci(f1, f2, n)
      integer :: f1, f2, n
      integer :: fibonacci(1:n)  ! 戻り値は長さ n の整数配列
    end function fibonacci
  end interface

  print *, fibonacci(0, 1, 20)

  stop
end program fibonacci_main

! フィボナッチ数列の計算
! * 初項 f1, f2, 長さ n のフィボナッチ数列を返す
!
! :param(in) integer f1
! :param(in) integer f2
! :param(in) integer n
! :return    integer fibonacci(1:n)
recursive function fibonacci(f1, f2, n)
  implicit none
  integer, intent(in) :: f1, f2, n
  integer :: fibonacci(1:n)
  integer :: i

  fibonacci(1) = f1
  fibonacci(2) = f2

  do i = 3, n
    fibonacci(i) = fibonacci(i - 1) + fibonacci(i - 2)
  end do
end function fibonacci
{% endhighlight %}

* [Gist - Fortran 95 source code to compute the Fibonacci-series.(Ver.2)](https://gist.github.com/komasaru/a97bf5a7aa9fef1f7767db919b3f040d "Gist - Fortran 95 source code to compute the Fibonacci-series.(Ver.2)")

### 2. ソースコードのコンパイル

``` text
$ gfortran -o fibonacci fibonacci.f95

$ gfortran -o fibonacci_2 fibonacci_2.f95
```

* interface を使用した `fibonacci_2` では、引数 `f1` に対して INTENT がミスマッチしている旨の警告が出力されるかもしれないが、問題ない。

### 3. 動作確認

``` text
$ ./fibonacci
           0           1           1           2           3           5         8          13          21          34          55          89     144         233         377         610         987        1597        2584        4181
```

* `fibonacci_2` も結果は同じ。

---

以上、

