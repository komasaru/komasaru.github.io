---
layout   : single
title    : "Fortran 2003 - オブジェクト指向のソース作成例！"
published: true
date     : 2019-09-20 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Fortran
---

Fortran の 2003 以降ではオブジェクト指向のプログラミンが可能となっております。

ソースの作成方法について記録しておきます。

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* GCC 6.3.0 (GFortran 6.3.0) でのコンパイルを想定。
* オブジェクト指向プログラミングの基礎的な知識があることを想定。

### 1. サンプルの仕様

* 直角三角形の底辺 A と高さ B を与えると、斜辺 C を計算して返すクラスを想定。

### 2. ソースコードの作成

* クラスも module として記述する。
* クラスの宣言に `type` を使用する。
* 変数やメソッド等は `type` 内で、 `private`（隠蔽）, `public`（公開） を意識しながら定義する。
* クラス内の sburoutine の第1引数にインスタンスを意味する `self` を指定する。
* インスタンスメソッドへのアクセスは、 `オブジェクト名%メソッド名` のように `%` を使用する。（構造体の使い方と同じ）  

File: `class_test.f03`

{% highlight fortran linenos %}
!****************************************************
! Fortran 2003 でのオブジェクト指向のテスト
!
!   date          name            version
!   2019.06.03    mk-mode.com     1.00 新規作成
!
! Copyright(C) 2019 mk-mode.com All Rights Reserved.
!****************************************************
!
module const
  ! SP: 単精度(4), DP: 倍精度(8)
  integer,     parameter :: SP = kind(1.0)
  integer(SP), parameter :: DP = selected_real_kind(2 * precision(1.0_SP))
end module const

module mod_class
  use const
  implicit none

  ! クラス comp の宣言
  type comp
    private
    real(DP) :: a = 0.0_DP
    real(DP) :: b = 0.0_DP
  contains
    private
    procedure, public :: comp_oblique
  end type comp

  ! コンストラクタの宣言
  interface comp
    module procedure init_comp
  end interface comp

contains
  ! コンストラクタ
  ! * インスタンス化時に取得した a, b をインスタンス変数に格納
  !
  ! :param(in)  real(8) a: 辺 A の長さ
  ! :param(in)  real(8) b: 辺 B の長さ
  ! :return    type(comp): インスタンス
  type(comp) function init_comp(a, b) result(this)
    implicit none
    real(DP), intent(in) :: a, b

    this%a = a
    this%b = b
  end function init_comp

  ! 斜辺の計算
  ! * 計算式: c = sqrt(a^2 + b^2)
  !
  ! :param(in)  type(comp) self: インスタンス
  ! :param(in)        real(8) c: 斜辺の長さ
  subroutine comp_oblique(self, c)
    implicit none
    class(comp) :: self
    real(DP)    :: c

    c = sqrt(self%a * self%a + self%b * self%b)
  end subroutine comp_oblique
end module mod_class

program class_test
  use const
  use mod_class
  implicit none
  type(comp) :: obj
  real(DP)   :: a, b, c

  write (*, '(A)', advance="no") "2 real numbers ? "
  read  (*, *) a, b
  obj = comp(a, b)
  call obj%comp_oblique(c)
  print '(A, F13.8)', "a = ", a
  print '(A, F13.8)', "b = ", b
  print '(A, F13.8)', "c = ", c
end program class_test
{% endhighlight %}

* [Gist - Fortran 2003 source code for testing object-oriented programming.](https://gist.github.com/komasaru/ "Fortran 2003 source code for testing object-oriented programming.")

### 3. ソースコードのコンパイル

$ gfortran -O -Wall -o class_test class_test.f03

### 4. 動作確認

``` text
$ ./class_test
2 real numbers ? 3 4
a =    3.00000000
b =    4.00000000
c =    5.00000000

$ ./class_test
2 real numbers ? 321 654
a =  321.00000000
b =  654.00000000
c =  728.53071315
```

---

以上。

