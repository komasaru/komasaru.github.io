---
layout   : single
title    : "Fortran - 最大公約数の計算！"
published: true
date     : 2018-11-14 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Fortran
---

Fortran 95 で最大公約数の計算をしてみました。（単純なアルゴリズムですが）

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* GCC 6.3.0 (GFortran 6.3.0) でのコンパイルを想定。

### 1. ソースコードの作成

* 単なる作成例なので、2つの整数はソースコード内に直接記述している。（必要であれば、適宜書き換えること）
* ここで重要なのは、内部副プログラムの `gcd` 関数。

File: `gcd.f95`

{% highlight fortran linenos %}
!****************************************************
! 最大公約数計算
!
! date          name            version
! 2018.08.20    mk-mode.com     1.00 新規作成
!
! Copyright(C) 2018 mk-mode.com All Rights Reserved.
!****************************************************
!
program gcd_main
  implicit none

  write (*,*) gcd(144, 300)

  stop
contains
  ! 最大公約数計算
  !
  ! :param  integer a
  ! :param  integer b
  ! :return integer gcc
  integer function gcd(a, b)
    implicit none
    integer, intent(IN) :: a, b
    integer :: l, m, n

    m = a
    n = b

    do
      l = mod(m, n)
      if (l == 0) exit
      m = n
      n = l
    end do

    gcd = n

    return
  end function gcd
end program gcd_main
{% endhighlight %}

* [Gist - Fortran 95 source code to compute the G.C.D.](https://gist.github.com/komasaru/d62c2ac0115b6cd43ad7365c74d2d4c9 "Gist - Fortran 95 source code to compute the G.C.D.")

### 2. ソースコードのコンパイル

``` text
$ gfortran -o gcd gcd.f95
```

### 3. 動作確認

``` text
$ ./gcd
          12
```

---

以上、

