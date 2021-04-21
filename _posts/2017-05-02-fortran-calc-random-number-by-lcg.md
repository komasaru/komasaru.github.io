---
layout   : single
title: 'Fortran - 一様乱数（線形合同法）！'
published: true
date     : 2017-05-02 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Fortran
---

以前、線形合同法を使用して一様乱数を生成する C++ コードや Ruby スクリプトを紹介しました。

* [C++ - 一様乱数（線形合同法）！]({{site.baseurl}}/2012/08/13/13002033/ "C++ - 一様乱数（線形合同法）！")
* [Ruby - 一様乱数（線形合同法）！]({{site.baseurl}}/2012/08/14/14002016/ "Ruby - 一様乱数（線形合同法）！")

今回は、同じアルゴリズムを Fortran90/95 で実装してみました。  
アルゴリズムについては、上記 C++ の記事を参照してください。

<!--more-->

### 0. 前提条件

* LMDE2(Linux Mint Debian Edition 2; 64bit) での作業を想定。
* GCC 6.3.0 (GFortran) でのコンパイルを想定。
* Fortran には長けていないので、コードに誤りがあるかもしれない。

### 1. Fortran コードの作成

File: `rndnum_lcg.f95`

{% highlight fortran linenos %}
!****************************************************
! 一様乱数計算（by 線形合同法）
! : 0 〜 1 の一様乱数を線形合同法により計算する
!
! date          name            version
! 2017.04.08    mk-mode.com     1.00 新規作成
!
! Copyright(C) 2017 mk-mode.com All Rights Reserved.
!****************************************************
!

! 線形合同法計算モジュール
module lcg
  implicit none
  private           ! default
  public :: SP, DP  ! constants
  public :: rnd     ! function
  integer, parameter :: SP = kind(1.0)
  integer, parameter :: DP = selected_real_kind(2 * precision(1.0_SP))
  integer, parameter :: A  = 1103515245
  integer, parameter :: C  = 12345
  integer, parameter :: M  = 2147483647  ! 2 ** 31 - 1
  integer(8)         :: x  = 12345       ! 初期値 x_0

contains

  function rnd()
    real(DP) :: rnd

    x   = mod(A * x + C, M)
    rnd = real(x, DP) / (M - 1)
  end function rnd
end module lcg

! 主処理
program rndnum_lcg
  use lcg
  implicit none
  integer :: i
  integer :: loop_max = 100

  do i = 1 , loop_max
    print '(I3, ": ", f10.8)', i, rnd()
  end do
end program rndnum_lcg
{% endhighlight %}

* [Gist - Fortran code to calculate random numbers by lcg method. ](https://gist.github.com/komasaru/b63ae0b11da502ba31401edf8bb6b139 "Gist - Fortran code to calculate random numbers by lcg method. ")

### 2. コンパイル

``` text
$ gfortran rndnum_lcg.f95 -o rndnum_lcg
```

### 3. 実行

``` text
$ ./rndnum_lcg
  1: 0.65515700
  2: 0.08291848
  3: 0.71884191
  4: 0.19905231
  5: 0.26209552
       :
 ===< 中略 >===
       :
 96: 0.60848267
 97: 0.10214267
 98: 0.26031423
 99: 0.88920532
100: 0.63261615
```

---

学生時代に使用した Fortran （当時は大文字の FORTRAN77 ）を思い出すべく、簡単なコードを書いてみた次第です。（当時覚えたことはほとんど忘れているので、初心者レベル）

少し前に円周率計算を行ったことはありますが、いずれは、他の複雑な計算等も行ってみたいと考えております。

以上。

