---
layout   : single
title: 'Fortran - 素数一覧の算出！'
published: true
date     : 2017-05-14 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Fortran
---

今回は、 Fortran95 で素数の一覧を算出する方法についてです。

<!--more-->

### 0. 前提条件

* LMDE2(Linux Mint Debian Edition 2; 64bit) での作業を想定。
* GCC 6.3.0 (GFortran) でのコンパイルを想定。
* Fortran には長けていないので、コードに誤りがあるかもしれない。

### 1. Fortran コードの作成

File: `prime_numbers.f95`

{% highlight fortran linenos %}
****************************************************
! 素数一覧
! : 入力値以下の素数を全て出力する
!
! date          name            version
! 2017.04.20    mk-mode.com     1.00 新規作成
!
! Copyright(C) 2017 mk-mode.com All Rights Reserved.
!****************************************************
!
program prime_numbers
  implicit none
  integer i, j, n
  logical is_prime
  print *, "自然数を入力してください N:"
  read *, n
  do i = 2, n
    is_prime = .true.
    do j = 2, int(sqrt(dble(i)))
      if (mod(i,j) == 0) then
        is_prime = .false.     ! 割り切れるので素数ではない
        exit
      end if
    end do
    if (is_prime) print *, i   ! もし素数ならば出力
  end do
end program
{% endhighlight %}

* [Gist - Fortran code to compute prime numbers.](https://gist.github.com/komasaru/11a2513001796fafd92de6f677732ec7 "Gist - Fortran code to compute prime numbers.")

### 2. コンパイル

``` text
$ gfortran prime_numbers.f95 -o prime_numbers
```

### 3. 実行

``` text
$ ./prime_numbers
 自然数を入力してください N:
100
           2
           3
           5
           7
          11
          13
          17
          19
          23
          29
          31
          37
          41
          43
          47
          53
          59
          61
          67
          71
          73
          79
          83
          89
          97
```

---

学生時代に使用した Fortran （当時は大文字の FORTRAN77 ）を思い出すべく、簡単なコードを書いてみた次第です。（当時覚えたことはほとんど忘れているので、初心者レベル）

少し前に円周率計算を行ったことはありますが、いずれは、他の複雑な計算等も行ってみたいと考えております。

以上。

