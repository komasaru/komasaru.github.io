---
layout   : single
title    : "Fortran 95 - 円周率の計算（多倍長演算ライブラリ FMLIB 使用）！"
published: true
date     : 2019-02-08 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Fortran
---

Fortran 95 で多倍長演算ライブラリ FMLIB を使用して円周率を計算してみました。（Chudnovsky の公式、 BSA(Binary Splitting Algorithm) 法を使用）

<!--more-->

### 0. 前提条件

* LMDE 3 (Linuz Mint Debian Edition 3; 64bit) での作業を想定。
* GCC 6.3.0 でのビルド（コンパイル＆リンク）を想定。
* Fortran 用多倍長演算ライブラリ FMLIB がインストール済みであること。  
  （参照：「[Fortran - 多倍長演算ライブラリ FMLIB のインストール！]({{site.baseurl}}/2019/01/27/fortran-fmlib-installation "Fortran - 多倍長演算ライブラリ FMLIB のインストール！")」）

### 1.  Chudnovsky の公式について

当ブログ過去記事を参照のこと。

* [C++ - 円周率計算（Chudnovsky の公式使用）！]({{site.baseurl}}/2015/05/06/cpp-pi-computation-by-chudnovsky-bsa-with-gmp "C++ - 円周率計算（Chudnovsky の公式使用）！")

### 2. ソースコードの作成

File: `pi_chudnovsky.f95`

{% highlight fortran linenos %}
!****************************************************
! 円周率の計算
! * 多倍長演算ライブラリ FMLIB 使用
! * Chudnovsky の公式使用
!
! date          name            version
! 2018.11.18    mk-mode.com     1.00 新規作成
!
! Copyright(C) 2018 mk-mode.com All Rights Reserved.
!****************************************************
!
program pi_chudnovsky
  use fmzm
  implicit none
  ! 各種定数
  integer,      parameter :: SP = kind(1.0)
  integer(SP),  parameter :: DP = selected_real_kind(2 * precision(1.0_SP))
  integer(SP),  parameter :: UID   = 10        ! 出力ファイル用 UID
  character(*), parameter :: F_OUT = "PI.txt"  ! 結果出力ファイル
  ! (Digits per term) log(53360 ** 3) / log(10)
  real(DP),     parameter :: DIGIT_T = 14.181647462725476_DP
  ! (for Chudnovsky)
  integer(SP),  parameter :: CHD_A = 13591409
  integer(SP),  parameter :: CHD_B = 545140134
  integer(SP),  parameter :: CHD_C = 640320
  integer(SP),  parameter :: CHD_D = 426880
  integer(SP),  parameter :: CHD_E = 10005
  ! 各種変数
  character(16)    :: fmt_s          ! 結果出力フォーマット
  character(10**9) :: s              ! 結果文字列
  integer(SP)      :: digit          ! 計算桁数（小数点以下）
  integer(SP)      :: ios            ! ファイル IO ステータス
  integer(SP)      :: n              ! N 格納用
  real(DP)         :: t_0, t_1, t_2  ! 実行時間計算用
  type(IM)         :: a, b, c, d, e  ! Chudnovsky 用(A, B, C, D, E)
  type(IM)         :: c3_24          ! C**3 / 24 格納用
  type(FM)         :: pi             ! 円周率
  ! 構造型
  type :: t_pqt
    type(IM) :: p, q, t
  end type t_pqt

  ! 計算桁数取得
  write (*, '(A)', advance="no") "Number of digits to calculate: "
  read (* , '(I12)') digit
  if (digit == 0) stop
  print '(/, A, I0, A)', "#### PI COMPUTATION ( ", digit, "-digit )"

  ! 処理開始
  call FM_SET(digit + 2)

  ! 各種初期値計算
  ! * a, b, c, d, e: Chudnovsky 用
  ! * c3_24: C * C * C / 24 = 10939058860032000
  ! * n: 計算項数
  a = TO_IM(CHD_A)
  b = TO_IM(CHD_B)
  c = TO_IM(CHD_C)
  d = TO_IM(CHD_D)
  e = TO_IM(CHD_E)
  c3_24 = c**3 / 24
  n = int(digit / DIGIT_T)

  ! 実計算
  call cpu_time(t_0)
  call compute(n, pi)
  !call FMPRINT(pi)  ! <= FMLIB デフォルトのフォーマットで画面出力する場合

  ! 計算終了
  call cpu_time(t_1)
  print '("Duration of computaion: ", F8.3, " sec.")', t_1 - t_0

  ! 書き込み用テキストファイル OPEN
  ! * 以下では、作成済みのファイルを誤消去しないよう status を "new" にしているが、
  !   上書きするようにしたければ、 "replace" にする。
  open (unit   = UID,         &
      & iostat = ios,         &
      & file   = F_OUT,       &
      & action = "write",     &
      & form   = "formatted", &
      & status = "new")
      !& status = "replace")
  if (ios /= 0) then
    print '("[ERROR:", I0 ,"] Failed to open file: ", A)', ios, F_OUT
    stop
  end if

  ! ファイル出力
  write (fmt_s, '("F", I0, ".", I0)') digit + 2, digit
  call FM_FORM(fmt_s, pi, s)
  write (UID, '(A)') trim(s)

  ! 書き込み用テキストファイル CLOSE
  close(UID)

  ! 処理終了
  call cpu_time(t_2)
  print '("           file output: ", F8.3, " sec.")', t_2 - t_1
  print '("                 total: ", F8.3, " sec.")', t_2 - t_0

  stop
contains
  ! 計算
  ! * 級数展開の計算量削減のために BSA 法(Binary Splitting Algorithm) を使用
  ! * 計算結果を 10 ** digit で除算したものが真の値
  !
  ! :param(in)  integer(4) n: 計算項数
  !: param(out) type(IM)  pi: 円周率
  subroutine compute(n, pi)
    implicit none
    integer(SP), intent(in)  :: n
    type(FM),    intent(out) :: pi
    type(t_pqt) :: pqt

    call bsa(0, n, pqt)
    pi = d * sqrt(TO_FM(e)) * pqt%q / (a * pqt%q + pqt%t)
  end subroutine

  ! BSA 法
  !
  ! :param(in)    integer(4)  n_0: 左端項
  ! :param(in)    integer(4)  n_1: 右端項
  ! :param(inout) type(t_pqt) pqt: 構造型 PQT
  recursive subroutine bsa(n_0, n_1, pqt)
    implicit none
    integer(SP), intent(in)  :: n_0, n_1
    type(t_pqt), intent(out) :: pqt
    type(t_pqt) :: pqt_l, pqt_r  ! 左端〜中間項、中間〜右端項の PQT
    type(IM)    :: in_1          ! n_1 を IM 化したもの
    integer(SP) :: m             ! 中間項

    in_1 = TO_IM(n_1)
    if (n_0 + 1 == n_1) then
      pqt%p = (in_1 * 2 - 1) * (in_1 * 6 - 1) * (in_1 * 6 - 5)
      pqt%q = c3_24 * in_1 * in_1 * in_1
      pqt%t = (a + b * in_1) * pqt%p
      if (iand(n_1, 1) == 1) pqt%t = -pqt%t
    else
      m = int((n_0 + n_1) / 2)
      call bsa(n_0, m, pqt_l)
      call bsa(m, n_1, pqt_r)
      pqt%p = pqt_l%p * pqt_r%p
      pqt%q = pqt_l%q * pqt_r%q
      pqt%t = pqt_l%t * pqt_r%q + pqt_l%p * pqt_r%t
    end if
  end subroutine bsa
end program pi_chudnovsky
{% endhighlight %}

* [Gist - Fortran 95 source code to compute PI with FMLIB, using Chudnovsky formula.](https://gist.github.com/komasaru/719d3d789257805979bfad99cdba5bae "Gist - Fortran 95 source code to compute PI with FMLIB, using Chudnovsky formula.")

### 3. FMLIB の準備

コンパイルに使用するので、同じディレクトリ内に FMLIB のオプジェクト／モジュールファイルのリンクを貼っておく。（煩わしくないのなら、コンパイル時にフルパスで指定してもよい。また、 Makefile を作成してビルドする方法でも良いだろう）

### 4. コンパイル＆リンク

``` text
$ gfortran pi_chudnovsky.f95 -c -O3
$ gfortran fmsave.o fm.o fmzm90.o pi_chudnovsky.o -o pi_chudnovsky
```

### 5. 実行

（以下は、10万桁を計算する例）

``` text
$ ./pi_chudnovsky
Number of digits to calculate: 100000

#### PI COMPUTATION ( 100000-digit )
Duration of computaion:    0.284 sec.
           file output:    0.880 sec.
                 total:    1.164 sec.
```

### 6. 結果確認

`PI.txt` というテキストファイルが作成されるので確認する。

File: `PI.txt`

{% highlight text linenos %}
3.1415926535897932384626433832795028841971
       :
====< 中略 >====
       :
6999892256959688159205600101655256375679
{% endhighlight %}

「[円周率.jp - 10進数表記](http://xn--w6q13e505b.jp/value/decimal.html "円周率.jp - 10進数表記")」 と比較してみると、四捨五入の関係で最後の1桁のみことなるが、その他は一致している。

---

同様の計算を C++ で多倍長演算ライブラリ GMP を使用したり、 Ruby や Python で GMP のラッパライブラリを使用して行った場合と比べると、処理の開始〜終了に10倍以上の時間がかかる。  
FMLIB は、精度と引き換えに時間が犠牲になるようだ。

以上。

