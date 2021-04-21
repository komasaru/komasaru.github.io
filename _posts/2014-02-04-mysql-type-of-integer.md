---
layout   : single
title    : "MySQL(MariaDB) - 整数型の範囲！"
published: true
date     : 2014-02-04 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- MySQL
- MariaDB
---

データベースサーバ MySQL(MariaDB) の整数型の範囲について、よく参照するのでメモとして残しておきます。

<!--more-->

### １. 整数型範囲一覧

<table class="common">
  <tr>
    <th>タイプ</th>
    <th>サイズ（byte）</th>
    <th>最小値<br />(Signed/Unsigned)</th>
    <th>最大値<br />(Signed/Unsigned)</th>
  </tr>
  <tr>
    <td>TINYINT</td>
    <td class="right">1</td>
    <td class="right">-128<br />0</td>
    <td class="right">127<br />255</td>
  </tr>
  <tr>
    <td>SMALLINT</td>
    <td class="right">2</td>
    <td class="right">-32768<br />0</td>
    <td class="right">32767<br />65535</td>
  </tr>
  <tr>
    <td>MEDIUMINT</td>
    <td class="right">3</td>
    <td class="right">-8388608<br />0</td>
    <td class="right">8388607<br />16777215</td>
  </tr>
  <tr>
    <td>INT</td>
    <td class="right">4</td>
    <td class="right">-2147483648<br />0</td>
    <td class="right">2147483647<br />4294967295</td>
  </tr>
  <tr>
    <td>BIGINT</td>
    <td class="right">8</td>
    <td class="right">-9223372036854775808<br />0</td>
    <td class="right">9223372036854775807<br />18446744073709551615</td>
  </tr>
</table>

### 2. 注意

Mysql(MariaDB) では、 `INT(4)` のように型指定の後に整数値を指定できるが、これは「バイト数」ではなく「表示桁数」である。  
`INT(4)` などと数字を指定したからと言って、カラムに格納できる値の範囲が制限されたりすることはない。  
つまり、 `INT(4)` と指定しても、実際には11桁（INT型の最大値）まで登録できる。

では、 `(?)` のカッコ内の数字は何なのか？  
オプション属性の ZEROFILL を使用すると、足りない桁は `0`（ゼロ） が埋め込まれる（ゼロパディングされる）。 `(?)` のカッコ内の数字は、その際の桁数である。  
`INT(4) ZEROFILL` に `9` という数字を格納すると `0009` と表示されるということ。

### 参考サイト

- [MySQL :: MySQL 5.6 Reference Manual :: 11.2 Numeric Types](http://dev.mysql.com/doc/refman/5.6/en/numeric-types.html "MySQL :: MySQL 5.6 Reference Manual :: 11.2 Numeric Types")
- [MySQL :: MySQL 5.1 リファレンスマニュアル :: 10.2 数値タイプ](http://dev.mysql.com/doc/refman/5.1/ja/numeric-types.html "MySQL :: MySQL 5.1 リファレンスマニュアル :: 10.2 数値タイプ")

---

テーブル設計する際によく参照するので記録しておいた次第です。

以上。

