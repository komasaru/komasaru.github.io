---
layout   : single
title    : "bash - シェルスクリプトで FizzBuzz！"
published: true
date     : 2013-09-08 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- シェル
- bash
---

シェルスクリプト bash で FizzBuzz を出力することを試行してみました。  
ふと思い付いて試してみた次第です。

以下、備忘録です。

<!--more-->

#### 0. 前提条件

- Linux Mint 14 (64bit) での作業・動作確認を想定。
- bash 4.2.37 での作業・動作確認を想定。

#### 1. シェルスクリプト作成

FizzBuzz の基本的なアルゴリズムに則って単純にループして処理を行なうロジックは言わずもがななので、再帰的な処理を行うロジックとしてみた。

File: `fizzbuzz_1.sh`

{% highlight bash linenos %}
#!/bin/bash

function fizzbuzz() {
    if [ $1 -gt 1 ] ; then
        fizzbuzz $(($1 - 1))
    fi
    if [ $(($1 % (3 * 5))) -eq 0 ] ; then
        echo FizzBuzz
    elif [ $(($1 % 3)) -eq 0 ] ; then
        echo Fizz
    elif [ $(($1 % 5)) -eq 0 ] ; then
        echo Buzz
    else
        echo $1
    fi
    i=$((i + 1))
}

fizzbuzz 100
{% endhighlight %}

もしくは、少し記法を変えて以下のように。

File: `fizzbuzz_2.sh`

{% highlight bash linenos %}
#!/bin/bash

function fizzbuzz() {
    exit
    if (( $1 > 1 )) ; then
        fizzbuzz `expr $1 - 1`
    fi
    if (( $1 % (3 * 5) == 0 )) ; then
        echo FizzBuzz
    elif (( $1 % 3 == 0 )) ; then
        echo Fizz
    elif (( $1 % 5 == 0 )) ; then
        echo Buzz
    else
        echo $1
    fi
    ((i++))
}

fizzbuzz 100
{% endhighlight %}

#### 2. シェルスクリプト実行

作成したシェルスクリプトを以下のように実行してみる。

``` bash 
$ ./fizzbuzz_1.sh
1
2
Fizz
4
Buzz
Fizz
7
8
Fizz
Buzz
11
Fizz
13
14
FizzBuzz
16
17
Fizz
19
Buzz
Fizz
22
23
Fizz
Buzz
26
Fizz
28
29
FizzBuzz
31
32
Fizz
34
Buzz
Fizz
37
38
Fizz
Buzz
41
Fizz
43
44
FizzBuzz
46
47
Fizz
49
Buzz
Fizz
52
53
Fizz
Buzz
56
Fizz
58
59
FizzBuzz
61
62
Fizz
64
Buzz
Fizz
67
68
Fizz
Buzz
71
Fizz
73
74
FizzBuzz
76
77
Fizz
79
Buzz
Fizz
82
83
Fizz
Buzz
86
Fizz
88
89
FizzBuzz
91
92
Fizz
94
Buzz
Fizz
97
98
Fizz
Buzz
```

fizzbuzz_2.sh も同じ結果となる。

---

FizzBuzz 自体は、各種プログラミング言語でよくやること（プログラマーの基礎中の基礎）で、いかに短いコーディングができるかを競い合ったりもします。

今回は、よくあるプログラミン言語ではなくシェルスクリプトでもできるかどうか、思い立って試してみた次第です。

以上。

