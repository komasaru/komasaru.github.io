---
layout   : single
title    : "Fortran - 2D フラクタルの描画！"
published: true
date     : 2018-12-02 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Fortran
---

Fortran 95 で、複素数の収束による方法で 2D フラクタルを描画してみました。

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* GCC 6.3.0 (GFortran 6.3.0) でのコンパイルを想定。
* ここでは 2D フラクタルそのものの説明はしない。

### 1. ソースコードの作成

* PGM 画像の生成には C 言語を使用。
* 計算式は、複素平面上で 1 の 4 乗根に収束する  
  $$z_{next}=\frac{3}{4}z+\frac{1}{4z^{3}}\ (z:複素数)$$  
  を想定。

File: `fractal.f95`

{% highlight fortran linenos %}
!****************************************************
! 2D フラクタルの描画
! : 複素数の収束による描画
!
! date          name            version
! 2018.10.09    mk-mode.com     1.00 新規作成
!
! Copyright(C) 2018 mk-mode.com All Rights Reserved.
!****************************************************
!
program fracta1
  implicit none
  ! SP: 単精度(4), DP: 倍精度(8)
  integer,      parameter :: SP = kind(1.0)
  integer(SP),  parameter :: DP = selected_real_kind(2 * precision(1.0_SP))
  real(DP),     parameter :: B_LEFT   = 0.0_DP
  real(DP),     parameter :: B_RIGHT  = 1.0_DP
  real(DP),     parameter :: B_BOTTOM = 0.0_DP
  real(DP),     parameter :: B_TOP    = 1.0_DP
  integer(SP),  parameter :: WIDTH    = 700
  integer(SP),  parameter :: HEIGHT   = 700
  real(DP)    :: x, y
  integer(SP) :: i, j, r
  integer(1) :: raw(1:WIDTH)

  call put_head(WIDTH, HEIGHT, 255)                ! 画像出力の初期化 (C)
  do j = 1, HEIGHT                                 ! 縦ピクセル数分くりかえし
    y = (B_BOTTOM - B_TOP) / HEIGHT * j + B_TOP    ! 虚部を計算
    do i = 1, WIDTH                                ! 横ピクセル数分くりかえし
      x = (B_RIGHT - B_LEFT) / WIDTH * i + B_LEFT  ! 実部を計算
      r = converge(x, y)                           ! 点 (x, y) を分類
      raw(i) = r                                   ! 結果を蓄積
    end do
    call put_raw(raw, WIDTH)                       ! 1 行分出力 (C)
  end do

  stop
contains
  ! 点の分類を計算する関数
  !
  ! :param  real(8) x
  ! :param  real(8) y
  ! :return integer r
  function converge(x, y) result(r)
    real(DP)    :: x, y
    complex(DP) :: z, old
    integer(SP) :: r                           ! result(r) で r を結果変数に

    z = x + (0.0_DP, 1.0_DP) * y               ! (x, y) を複素数に変換
    r = -1                                     ! r < 0 を未決定状態とみなす
    do while(r < 0)                            ! 決定するまで繰り返し
      old = z                                  ! 現在の値を記憶
      z = z * (3.0_DP / 4) + 1 / (4 * (z**3))  ! 1ステップの計算
      if (abs(z - old) < 0.01_8) then          ! 差が 0.01 以下なら収束
        if ( real(z) >  0.5_DP) r =  64        !  1 に収束、結果は 暗灰
        if (aimag(z) >  0.5_DP) r = 127        !  i に収束、結果は 中灰
        if ( real(z) < -0.5_DP) r = 191        ! -1 に収束、結果は 明灰
        if (aimag(z) < -0.5_DP) r = 255        ! -i に収束、結果は 白
      else
        if (abs(z) > 1.0e4_DP) r = 0           ! あまり遠くへ行ったら発散、黒
      end if
    end do
  end function converge
end program fracta1
{% endhighlight %}

File: `pgmout.c`

{% highlight c linenos %}
/*
 * PGM 出力用
 */

#include <stdio.h>
int Width, Height, Max;

void put_head_(int *width, int *height, int *max){
    printf("P5\n%d %d\n%d\n", *width, *height, *max);
}

void put_raw_(char *a, int *width){
    fwrite(a, 1, *width, stdout);
}
{% endhighlight %}

* [Gist - Fortran 95 source code to generate 2D-fractal by complex convergence method.](https://gist.github.com/komasaru/b030efd9eb25a274f31f35817a3d9b3d "Gist - Fortran 95 source code to generate 2D-fractal by complex convergence method.")

### 2. ソースコードのビルド

今回は Makefile を作成してビルド（コンパイル＋リンク＋実行可能ファイル作成）する。（以下は、当方の記述例）

まず、 Makefile の作成。

File: `Makefile`

{% highlight text linenos %}
FC = gfortran
CFLAGS = -c -O
TARGET = fractal
OBJS = fractal.o

.SUFFIXES: .f95

all: $(TARGET)

$(TARGET): $(OBJS)
	$(FC) -o $@ $(OBJS)

.f95.o:
	$(FC) $(CFLAGS) $<

clean:
	@rm -f $(TARGET) $(OBJS)
{% endhighlight %}

* Makefile 内の行頭にあるインデントは「タブ」であること。

そして、ビルド。

``` text
$ make
```

### 3. 動作確認

``` text
$ ./fractal | tee fractal.pgm | display
```

PGM 画像 `fractal.pgm` が作成＆表示される。

![FRACTAL]({{site.baseurl}}/images/2018/12/02/FRACTAL.png "FRACTAL")

---

以上、

