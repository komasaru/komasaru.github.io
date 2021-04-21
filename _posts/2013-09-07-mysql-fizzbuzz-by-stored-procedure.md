---
layout   : single
title    : "MySQL - ストアドプロシージャで FizzBuzz！"
published: true
date     : 2013-09-07 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- MySQL
---

MySQL のストアドプロシージャを使用して FizzBuzz を出力することを試行してみました。  
ふと思い付いて試してみた次第です。

以下、２種類のストアドプロシージャを紹介します。

<!--more-->

#### 0. 前提条件

- MySQL サーバは 5.6.13 を想定。
- MySQL クライアントは 5.5.31 を想定しているが、サーバと同じバージョンであれば問題ない。  
  （通常はサーバとクライアントのバージョンは同じはずであるが、当方は意図的に異なるバージョンにしている）
- テーブルに `INSERT` する意味はないので、テーブルは作成しないが、DB は用意しておく。  
  （既存の DB があればそれでよい。当方は `test` という DB を使用している）

#### 1. ストアドプロシージャ・その１

FizzBuzz の基本的なアルゴリズムに則って、単純にループして処理を行なうロジックとしている。

File: `fizzbuzz_1.sql`

{% highlight sql linenos %}
USE test;
DROP PROCEDURE IF EXISTS fizzbuzz;
delimiter //
CREATE PROCEDURE fizzbuzz(n INT)
BEGIN
    DECLARE i INT DEFAULT 1;
    WHILE i <= n DO
        SELECT CASE
               WHEN i % (3 * 5) = 0 THEN 'FizzBuzz'
               WHEN i %      5  = 0 THEN 'Buzz'
               WHEN i %      3  = 0 THEN 'Fizz'
               ELSE i
               END;
        SET i = i + 1;
    END WHILE;
END
//
CALL fizzbuzz(100);
DROP PROCEDURE fizzbuzz;
{% endhighlight %}

#### 2. ストアドプロシージャ・その２

FizzBuzz の基本的なアルゴリズムに則ってはいるが、ループ処理ではなく再帰的に処理を行うロジックとしている。

File: `fizzbuzz_2.sql`

{% highlight sql linenos %}
USE test;
DROP PROCEDURE IF EXISTS fizzbuzz;
delimiter //
CREATE PROCEDURE fizzbuzz(n INT)
BEGIN
    IF n > 1 THEN
        CALL fizzbuzz(n-1);
    END IF;

    SELECT CASE
           WHEN n % (3 * 5) = 0 THEN 'FizzBuzz'
           WHEN n %      5  = 0 THEN 'Buzz'
           WHEN n %      3  = 0 THEN 'Fizz'
           ELSE n
           END;
END
//
CALL fizzbuzz(100);
DROP PROCEDURE fizzbuzz;
{% endhighlight %}

#### 3. ストアドプロシージャ実行

ストアドプロシージャ・その１、その２ともに、以下のようにして実行する。  
**ただし、「その２」でエラーになる場合は後述の説明も参照のこと**

``` bash 
$ mysql -N -u root -p < fizzbuzz_1.sql
$ mysql -N -u root -p < fizzbuzz_2.sql
```

`-N` はカラム名を出力しないオプション。

**【その２でエラーになる場合】**

ストアドプロシージャ・その２は、MySQL の環境によってはエラーで実行できないかもしれない。

``` text 
ERROR 1456 (HY000) at line 18: Recursive limit 0 (as set by the max_sp_recursion_depth variable) was exceeded for routine fizzbuzz
```

とエラーとなる場合、MySQL が再帰的に処理できない設定になっている（システム変数 `max_sp_recursion_depth` の値が `0` になっている）からである。  
設定ファイル "/etc/my.cnf" の `mysqld` セクションに以下のような記述を追加する。

``` bash 
[mysqld]
max_sp_recursion_depth  = 128
```

また、それでも、

``` text 
ERROR 1436 (HY000) at line 18: Thread stack overrun:  402160 bytes used of a 524288 byte stack, and 128000 bytes needed.  Use 'mysqld --thread_stack=#' to specify a bigger stack.
```

とエラーとなる場合、スレッドスタックの割り当てが小さいからであるので、設定ファイル "/etc/my.cnf" の `mysqld` セクションの `thread_stack` の値を大きくしてみる。

``` bash 
[mysqld]
thread_stack            = 1024K  #192K
```

#### 4. 実行結果

ストアドプロシージャ・その１，その２を実行すると以下のように出力されるはずである。

``` text 
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

---

FizzBuzz 自体は、各種プログラミング言語でよくやること（プログラマーの基礎中の基礎）で、いかに短いコーディングができるかを競い合ったりもします。

今回は、プログラミン言語ではなく SQL でもできるかどうか、急に思い立って試してみた次第です。

以上。

