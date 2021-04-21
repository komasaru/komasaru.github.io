---
layout   : single
title    : "Fortran - べき剰余アルゴリズムの実装！"
published: true
date     : 2019-04-08 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Fortran
---

Fortran 95 で「べき剰余」のアルゴリズムを実装してみました。

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* GCC 6.3.0 (GFortran 6.3.0) でのコンパイルを想定。

### 1. アルゴリズムについて

当ブログ過去記事を参照のこと。

* [C++ - べき剰余アルゴリズムの実装！]({{site.baseurl}}/2015/05/13/cpp-implementation-of-modular-exponentiation "C++ - べき剰余アルゴリズムの実装！")
* [Ruby - べき剰余アルゴリズムの実装！]({{site.baseurl}}/2015/05/15/ruby-implementation-of-modular-exponentiation "Ruby - べき剰余アルゴリズムの実装！")
* [Python - べき剰余アルゴリズムの実装！]({{site.baseurl}}/2018/05/10/python-modular-exponentiation-computation "Python - べき剰余アルゴリズムの実装！")

### 2. ソースコードの作成

まず、比較のために非再帰的な記述方法で作成。

File: `modular_exponentiation_1.f95`

{% highlight fortran linenos %}
!****************************************************
! べき剰余計算(iterative)
!
!   date          name            version
!   2018.10.19    mk-mode.com     1.00 新規作成
!
! Copyright(C) 2018 mk-mode.com All Rights Reserved.
!****************************************************
!
program modulare_exponentiation
  implicit none
  ! SP: 単精度(4), DP: 倍精度(8)
  integer,     parameter :: SP = kind(1.0)
  integer(SP), parameter :: DP = selected_real_kind(2 * precision(1.0_SP))
  integer(SP), parameter :: b = 12345
  integer(SP), parameter :: e = 6789
  integer(SP), parameter :: m = 4567

  print '(I0, "^", I0, " mod ", I0 " = ", I0)', &
      & b, e, m, calc_mod_exp(b, e, m)

  stop
contains
  ! べき剰余計算
  ! * 奇数判定にはビットごとの論理積を使用
  ! * 2での除算には1ビット右シフトを使用
  !
  ! :param(in) integer(4)  b: B
  ! :param(in) integer(4)  e: E
  ! :param(in) integer(4)  m: M
  ! :return    integer(4) me: べき剰余
  function calc_mod_exp(b, e, m) result(me)
    implicit none
    integer(SP), intent(in) :: b, e, m
    integer(SP) :: me
    integer(SP) :: b_w, e_w, m_w  ! 計算用

    b_w = b
    e_w = e
    m_w = m
    me = 1
    do while (e_w > 0)
      if (iand(e_w, 1) == 1) me = mod(me * b_w, m_w)
      e_w = rshift(e_w, 1)
      b_w = mod(b_w * b_w, m_w)
    end do
  end function calc_mod_exp
end program modulare_exponentiation
{% endhighlight %}

* [Gist - Fortran 95 source code to compute modular exponetiation iteratively.](https://gist.github.com/komasaru/b14c8859b373794c014b8de6f483eb45 "Gist - Fortran 95 source code to compute modular exponetiation iteratively.")

次に、再帰的な記述方法で作成。

File: `modular_exponentiation_2.f95`

{% highlight fortran linenos %}
!****************************************************
! べき剰余計算(recursive)
!
!   date          name            version
!   2018.10.19    mk-mode.com     1.00 新規作成
!
! Copyright(C) 2018 mk-mode.com All Rights Reserved.
!****************************************************
!
program modulare_exponentiation
  implicit none
  ! SP: 単精度(4), DP: 倍精度(8)
  integer,     parameter :: SP = kind(1.0)
  integer(SP), parameter :: DP = selected_real_kind(2 * precision(1.0_SP))
  integer(SP), parameter :: b = 12345
  integer(SP), parameter :: e = 6789
  integer(SP), parameter :: m = 4567

  print '(I0, "^", I0, " mod ", I0 " = ", I0)', &
      & b, e, m, calc_mod_exp(b, e, m)

  stop
contains
  ! べき剰余計算
  ! * 奇数判定にはビットごとの論理積を使用
  ! * 2での除算には1ビット右シフトを使用
  !
  ! :param(in) integer(4)  b: B
  ! :param(in) integer(4)  e: E
  ! :param(in) integer(4)  m: M
  ! :return    integer(4) me: べき剰余
  recursive function calc_mod_exp(b, e, m) result(me)
    implicit none
    integer(SP), intent(in) :: b, e, m
    integer(SP) :: me

    me = 1
    if (e == 0) return
    me = calc_mod_exp(b, rshift(e, 1), m)
    me = mod(me * me, m)
    if (iand(e, 1) == 1) me = mod(me * b, m)
  end function calc_mod_exp
end program modulare_exponentiation
{% endhighlight %}

* [Gist - Fortran 95 source code to compute modular exponetiation recursively.](https://gist.github.com/komasaru/df263fa1287545ef2393cd15227e746b "Gist - Fortran 95 source code to compute modular exponetiation recursively.")

### 3. ソースコードのコンパイル

``` text
$ gfortran -o modular_exponentiation_1 modular_exponentiation_1.f95

$ gfortran -o modular_exponentiation_2 modular_exponentiation_2.f95
```

### 4. 動作確認

``` text
$ ./modular_exponentiation_1
12345^6789 mod 4567 = 62

$ ./modular_exponentiation_2
12345^6789 mod 4567 = 62
```

---

以上。

