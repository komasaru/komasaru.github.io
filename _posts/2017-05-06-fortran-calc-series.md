---
layout   : single
title: 'Fortran - 級数計算！'
published: true
date     : 2017-05-06 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Fortran
---

今回は、 Fortran95 で級数を計算してみただけです。

<!--more-->

### 0. 前提条件

* LMDE2(Linux Mint Debian Edition 2; 64bit) での作業を想定。
* GCC 6.3.0 (GFortran) でのコンパイルを想定。
* Fortran には長けていないので、コードに誤りがあるかもしれない。

### 1. Fortran コードの作成

計算する級数は $$\displaystyle \sum_{i=1}^{N}\frac{1}{i}\cdot\frac{2}{i+1}\cdot\frac{3}{i+2}$$ で、 $$N=1000$$としている。

File: `series.f95`

{% highlight fortran linenos %}
!****************************************************
! 級数計算
! : SUM((1/i) * (2/(i+1)) * (3/(i+2))) を計算する
!
! date          name            version
! 2017.04.10    mk-mode.com     1.00 新規作成
!
! Copyright(C) 2017 mk-mode.com All Rights Reserved.
!****************************************************
!

program series
  implicit none
  integer, parameter :: terms = 1000
  real, dimension(terms) :: x, y, z
  integer :: i

  do i = 1, terms
     x(i) = 1.0 /  i
     y(i) = 2.0 / (i + 1)
     z(i) = 3.0 / (i + 2)
  end do

  print *, 'ANSWER = ', sum(x * y * z)

end program series
{% endhighlight %}

* [Gist - Fortran code to calculate series.](https://gist.github.com/komasaru/04d1d4dfe7ea5d0d2dc0a3d587fe59e2 "Gist - Fortran code to calculate series.")

### 2. コンパイル

``` text
$ gfortran series.f95 -o series
```

### 3. 実行

``` text
$ ./series
 ANSWER =    1.49998903
```

---

学生時代に使用した Fortran （当時は大文字の FORTRAN77 ）を思い出すべく、簡単なコードを書いてみた次第です。（当時覚えたことはほとんど忘れているので、初心者レベル）

少し前に円周率計算を行ったことはありますが、いずれは、他の複雑な計算等も行ってみたいと考えております。

以上。

