---
layout   : single
title: 'Fortran - ポインタを使用した連結リスト！'
published: true
date     : 2017-06-07 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Fortran
---

今回は、 Fortran95 でポインタを使用して連結リストを生成する方法についてです。

<!--more-->

### 0. 前提条件

* LMDE2(Linux Mint Debian Edition 2; 64bit) での作業を想定。
* GCC 6.3.0 (GFortran) でのコンパイルを想定。
* Fortran には長けていないので、コードに誤りがあるかもしれない。

### 1. Fortran コードの作成

File: `linked_list_by_pointer.f95`

{% highlight fortran linenos %}
!****************************************************
! 整数値を格納する連結リスト
! : pointer を使用する
!
! date          name            version
! 2017.05.17    mk-mode.com     1.00 新規作成
!
! Copyright(C) 2017 mk-mode.com All Rights Reserved.
!****************************************************
!
program linked_list
  implicit none
  type node
    type (node), pointer :: next_node
    integer value
  end type node
  integer num
  type (node), pointer :: first_node, new_node, p

  nullify (first_node)

  do
    print *, '0 か正の整数を入力してください（負の整数で終了）:'
    read *, num
    if (num < 0) exit

    allocate (new_node)
    new_node%next_node => first_node
    new_node%value = num
    first_node => new_node
  end do

  p => first_node
  print *, "================================"
  do while (associated(p))
    print *, p%value
    p => p%next_node
  end do
end program linked_list
{% endhighlight %}

* [Gist - Fortran code to generate linked-list by pointer.](https://gist.github.com/komasaru/f152528e6b35b1dc41eeea00f25708b9 "Gist - Fortran code to generate linked-list by pointer.")

### 2. コンパイル

``` text
$ gfortran linked_list_by_pointer.f95 -o linked_list_by_pointer
```

### 3. 実行

``` text
$ ./linked_list_by_pointer
 0 か正の整数を入力してください（負の整数で終了）:
30
 0 か正の整数を入力してください（負の整数で終了）:
20
 0 か正の整数を入力してください（負の整数で終了）:
10
 0 か正の整数を入力してください（負の整数で終了）:
0
 0 か正の整数を入力してください（負の整数で終了）:
-1
 ================================
           0
          10
          20
          30
```

---

学生時代に使用した Fortran （当時は大文字の FORTRAN77 ）を思い出すべく、簡単なコードを書いてみた次第です。（当時覚えたことはほとんど忘れているので、初心者レベル）

少し前に円周率計算を行ったことはありますが、いずれは、他の複雑な計算等も行ってみたいと考えております。

以上。

