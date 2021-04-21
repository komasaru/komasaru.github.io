---
layout   : single
title    : "Fortran - 二項係数の計算！"
published: true
date     : 2020-02-08 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Ruby
---

Fortran 95 で二項係数の計算をしてみました。（各種計算式を使用して）  
また、計算結果が多倍長になることを考慮し、多倍長演算ライブラリ FMLIB を使用しています。

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10.2 (64bit) での作業を想定。
* GCC 9.2.0 (GFortran 9.2.0) でのコンパイルを想定。
* 多倍長演算（多桁計算）には、 FMLIB を使用する。（後述 3 ）

### 1. 二項係数について

$$n$$ 個の物から $$r$$ 個のものを選ぶ組み合わせは $$_nC_r$$ 通りあり、 $$\displaystyle \binom{n}{r}$$ とも表す。また、二項級数（二項定理）の係数であることから、 $$\textbf{二項係数}$$とも呼ばれる。

以下、二項係数の主な重要性質。

$$
\begin{eqnarray}
\binom{n}{r} &=& _nC_r = \frac{_nP_r}{r!} = \frac{n!}{r!(n - r)!} \tag{1} \\
\binom{n}{r} &=& \binom{n}{n-r} \\
\binom{n}{0} &=& 1 \\
\binom{n}{r} &=& \binom{n-1}{r} + \binom{n-1}{r-1} \tag{2} \\
\binom{n}{r} &=& \frac{n}{r}\binom{n-1}{r-1} \tag{3} \\
\binom{n}{r} &=& \frac{n^{\underline{r}}}{r!} = \frac{n(n-1)(n-2)\cdots(n-(r-1))}{r(r-1)(r-2)\cdots1} = \prod_{i=1}^{r}\frac{n-i+1}{i} \tag{4} \\
&&(n^{\underline{r}}は下降階乗冪) \nonumber
\end{eqnarray}
$$

### 2. Fortran ソースコードの作成

* 4種の計算式を使用する。（前述の (1), (2), (3), (4)）  
  （使用する計算式（メソッド）の切り替えはコメント／アンコメントで）

まず、計算用モジュール。

File: `binom_coeff.f95`

{% highlight fortran linenos %}
!****************************************************
! 二項係数の計算
!
! DATE          AUTHOR          VERSION
! 2019.12.11    mk-mode.com     1.00 新規作成
!
! Copyright(C) 2019 mk-mode.com All Rights Reserved.
!****************************************************
!
module cst
  ! SP: 単精度(4), DP: 倍精度(8)
  integer,     parameter :: SP = kind(1.0)
  integer(SP), parameter :: DP = selected_real_kind(2 * precision(1.0_SP))
end module cst

module cmn
  use cst
  implicit none

  private
  public :: get_arg

contains
  ! コマンドライン引数(n, r)の取得
  !
  ! :param(out) integer(4) n
  ! :param(out) integer(4) r
  subroutine get_arg(n, r)
    implicit none
    integer(SP), intent(out) :: n, r
    character(8) :: a
    integer(SP)  :: ios

    n = 0
    r = 0
    if (iargc() == 2) then
      call getarg(1, a)
      read (a, *, iostat = ios) n
      if (ios /= 0) return
      call getarg(2, a)
      read (a, *, iostat = ios) r
      if (ios /= 0) return
    end if
  end subroutine get_arg

end module cmn

module comp
  use cst
  use FMZM
  implicit none
  private
  public :: binom_1, binom_2, binom_3, binom_4

contains
  ! 二項係数の計算(1)
  !   計算式: (n r) = n! / r!(n -r)!
  !
  ! :param(in) integer(4) n
  ! :param(in) integer(4) r
  ! :return    type(IM)   b
  function binom_1(n, r) result(b)
    use cst
    implicit none
    integer(SP), intent(in) :: n, r
    type(IM) :: b

    b = TO_IM('1')
    if (r == 0 .or. r == n) return
    b =  fact(n) / (fact(r) * fact(n - r))
  end function binom_1

  ! 二項係数の計算(2)
  !   計算式: (n r) = ((n - 1) r) + ((n - 1) (k - 1))
  !           (recursively)
  !
  ! :param(in) integer(4) n
  ! :param(in) integer(4) r
  ! :return    type(IM)   b
  recursive function binom_2(n, r) result(b)
    use cst
    implicit none
    integer(SP), intent(in) :: n, r
    type(IM) :: b

    b = TO_IM('1')
    if (r == 0 .or. r == n) return
    b = binom_2(n - 1, r) + binom_2(n - 1, r - 1)
  end function binom_2

  ! 二項係数の計算(3)
  !   計算式: (n r) = (n / r) * ((n - 1) (k - 1))
  !           (recursively)
  !
  ! :param(in) integer(4) n
  ! :param(in) integer(4) r
  ! :return    type(IM)   b
  recursive function binom_3(n, r) result(b)
    use cst
    implicit none
    integer(SP), intent(in) :: n, r
    type(IM) :: b

    b = TO_IM('1')
    if (r == 0 .or. r == n) return
    b = n * binom_3(n - 1, r - 1) / r
  end function binom_3

  ! 二項係数の計算(4)
  !   計算式: (n r) = Π(n - i + 1) / i  (i = 1, ..., r)
  !
  ! :param(in) integer(4) n
  ! :param(in) integer(4) r
  ! :return    type(IM)   b
  function binom_4(n, r) result(b)
    use cst
    implicit none
    integer(SP), intent(in) :: n, r
    integer(SP) :: i
    type(IM) :: b

    b = TO_IM('1')
    if (r == 0 .or. r == n) return
    do i = 1, r
      b = b * (n - i + 1) / i
    end do
  end function binom_4

  ! 階乗の計算
  !
  ! :param(in) integer(4)  x
  ! :return    type(IM)
  type(IM) function fact(x)
    use cst
    implicit none
    integer(SP), intent(in) :: x
    integer(SP) :: i

    fact = TO_IM('1')
    if (x == 0) return
    do i = 1, x
      fact = fact * i
    end do
  end function fact
end module comp

program binom_coeff
  use cst
  use cmn
  use comp
  use FMZM
  implicit none
  integer(SP) :: n, r
  type(IM)    :: b

  ! コマンドライン引数(n, r)取得
  call get_arg(n, r)
  if (n == 0 .and. r == 0) stop
  if (n < 0 .or. r < 0 .or. n < r) stop
  write (*, '("(", I5, " ", I5, ") = ")', advance='no') n, r

  ! 計算
  if (r * 2 > n) r = n - r
  b = binom_1(n, r)  ! binom_1 or 2 or 3 or 4
  call IMPRINT(b)
end program binom_coeff
{% endhighlight %}

* [Gist - Fortran 95 source code to calculate binomial coefficients.](https://gist.github.com/komasaru/d4a44bc15bfe812fef73682cd14e52d8 "Gist - Fortran 95 source code to calculate binomial coefficients.")

### 3. FMLIB の準備

コンパイルに使用するので、同じディレクトリ内に FMLIB のオプジェクト／モジュールファイルのリンクを貼っておく。（煩わしくないのなら、コンパイル時にフルパスで指定してもよい。また、 Makefile を作成してビルドする方法でも良いだろう）  

* FMLIB のインストールについては過去記事を参照→ [Fortran - 多倍長演算ライブラリ FMLIB のインストール！]({{site.baseurl}}/2019/02/02/fortran-fmlib-installation "Fortran - 多倍長演算ライブラリ FMLIB のインストール！")

### 4. コンパイル＆リンク

``` text
$ gfortran -c -Wunused -O2 binom_coeff.f95
$ gfortran -o binom_coeff fmsave.o fm.o fmzm90.o binom_coeff.o
```

### 5. プログラムの実行

* $$\displaystyle \binom{n}{r}$$ を $$(n\ r)$$ で表示。
* `r` が整数でない場合は `0` とみなす。
* ERROR の場合は、何も出力しない。
* 結果出力のフォーマットは FMLIB 標準を使用。

``` text
$ ./binom_coeff 0 1

$ ./binom_coeff 1 -1

$ ./binom_coeff 1 0.9
(    1     0) =
      1

$ ./binom_coeff 1.1 1

$ ./binom_coeff 1 0
(    1     0) =
       1

$ ./binom_coeff 1 1
(    1     1) =
       1

$ ./binom_coeff 10 2
(   10     2) =
       45

$ ./binom_coeff 100 3
(  100     3) =
       161700

$ ./binom_coeff 1000 4
( 1000     4) =
       41417124750

$ ./binom_coeff 5000 500
( 5000   500) =
       152383570502276241773112299038287011759805517717774989612063963324852197
      7213499605908842337110820488640167595440545082577673904733594530228810459
      6412151481279032572628587506952815691445272815864618334838578548489705130
      2963702456469661925649013938025675652103406710218905355077057732196294852
      2784729534964403925405652386524965860952572318327807635250586542453767148
      3891366080586181114673093555560987897570461892398850728174637647049432100
      8996284739018893410735106722857930028973378877130054931747509530956061693
      3594701759502335749628087140048422879219219349951217774485328751901915494
      7662908564688029518280662169283594314245494781713166908858338292805012574
      1393952210717943794438066831202814961683139272640

$ ./binom_coeff 5000 2500
( 5000  2500) =
       159371868534943837569102579293591908725712943416872973851142188872518373
      8249343168628721321987372082216725114025558627431929452538403647953823060
      0454556577691298731223139197739339645846143083224492991761486489258473048
      0023643569324440941033122054431815988922710259363445810754908935865678405
      3736247584401420310445473681941570500042422596205820826613570804985152082
      4960607972807738936458482894499881130290028489658358418222712925568554614
      8432527106563886001286107377899921899687103515889919865427858237130967767
      1306096769432314126537889059653739614763267148184153554042435532017355139
      7630020464441895106536721014270759750902584263727315940982234214301739743
      0156968769327523500761058075924169787048410094516380576648834071389764219
      7106542283174953794968649783206558992619899425465272314921564909489372873
      9354576215354622894873385925840937185218967602378468492022604595977596090
      7469935996353111971038349697595257112068688379060221973084397646998338508
      2049193547335825798706248498798896761744609761227753857586204130073377729
      9911585208214180922176383626728533535383779826850949403248877209443871900
      0803033475881532546647063138520719622744967680682146446102287294664405588
      2208785540986721560176252586558088366726782973824315529862858085233856576
      6233367598650344799146790065148746117755061771145797054498841333445350685
      8551684298754661646355592385908765031330761376539376966719050679737673751
      8707832888662700172790377793259351868797507163339600827270303879295319252
      652644612708041188699645673663207276383716320
```

### 6. ベンチマーク

正確に計測はしていないが、[Ruby 版]({{site.baseurl}}/2020/02/05/ruby-binomial-coefficients "Ruby - 二項係数の計算！")同様、 (2) が最も実行に時間がかかった。  
その他は  (4), (3), (1) の順で高速であった。

---

以上。

