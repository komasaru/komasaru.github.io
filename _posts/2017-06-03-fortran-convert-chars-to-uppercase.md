---
layout   : single
title: 'Fortran - 英小文字->英大文字変換！'
published: true
date     : 2017-06-03 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Fortran
---

今回は、 Fortran95 で英文の小文字を全て大文字に変換する方法についてです。

<!--more-->

### 0. 前提条件

* LMDE2(Linux Mint Debian Edition 2; 64bit) での作業を想定。
* GCC 6.3.0 (GFortran) でのコンパイルを想定。
* Fortran には長けていないので、コードに誤りがあるかもしれない。

### 1. Fortran コードの作成

File: `to_uppercase.f95`

{% highlight fortran linenos %}
!****************************************************
! 英小文字->英大文字 変換
! : 入力文字列の英小文字を全て英大文字に変換して出力する
!
! date          name            version
! 2017.05.14    mk-mode.com     1.00 新規作成
!
! Copyright(C) 2017 mk-mode.com All Rights Reserved.
!****************************************************
!
program to_uppercase
  implicit none
  integer i
  character(len=100) line
  print *, "英文を入力してください(100文字超は切り捨て):"
  read '(a)', line
  do i = 1, len_trim(line)
    if (line(i:i) >= 'a' .and. line(i:i) <= 'z') then
      line(i:i) = char(ichar(line(i:i)) - 32)
    end if
  end do
  print '(a)', trim(line)
end program to_uppercase
{% endhighlight %}

逆に、英大文字を英小文字に変換するなら `if` 文の部分を以下のようにすればよい。

``` fortran
    if (line(i:i) >= 'A' .and. line(i:i) <= 'Z') then
      line(i:i) = char(ichar(line(i:i)) + 32)
    end if
```

* [Gist - Fortran code to convert chars to uppercase.](https://gist.github.com/komasaru/5b5417ac3b16779d49e4365c84413a68 "Gist - Fortran code to convert chars to uppercase.")

### 2. コンパイル

``` text
$ gfortran to_uppercase.f95 -o to_uppercase
```

### 3. 実行

``` text
$ ./to_uppercase
 英文を入力してください(100文字超は切り捨て):
This is a test of Forran95.
THIS IS A TEST OF FORRAN95.
```

---

学生時代に使用した Fortran （当時は大文字の FORTRAN77 ）を思い出すべく、簡単なコードを書いてみた次第です。（当時覚えたことはほとんど忘れているので、初心者レベル）

少し前に円周率計算を行ったことはありますが、いずれは、他の複雑な計算等も行ってみたいと考えております。

以上。

