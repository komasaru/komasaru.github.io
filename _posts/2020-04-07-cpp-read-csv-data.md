---
layout   : single
title    : "C++ - CSV データ読み込み！"
published: true
date     : 2020-04-07 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- C++
---

かつて、 C++ で CSV データを読み込む方法について記録しました。

* [C++ - CSV データ読み込み！]({{site.baseurl}}/2017/03/11/cpp-read-csv-data "C++ - CSV データ読み込み！")

今回も同様のことをしてみましたが、ある（古めの）書籍に掲載されていたものをほぼそのまま実装してみました。

* [プログラミング作法 - Amazon.co.jp](https://www.amazon.co.jp/gp/product/4756136494/ref=as_li_tl?ie=UTF8&tag=komasaru-22&camp=247&creative=1211&linkCode=as2&creativeASIN=4756136494&linkId=c7d4dc669c329df55d6a79e777ce9478 "プログラミング作法 - Amazon.co.jp")

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10.3 (64bit) での作業を想定。
* GCC 9.2.0 (G++ 9.2.0) (C++17) でのコンパイルを想定。
* カンマ前後のスペースは除去しない。

### 1. C++ コードの作成

File: `csv.hpp`

{% highlight c linenos %}
#ifndef TEST_CSV_CSV_HPP_
#define TEST_CSV_CSV_HPP_

#include <iostream>
#include <string>
#include <vector>

// CSV クラス
class Csv {  // カンマで区切られた値を読んで解析する
  std::istream& fin;               // 入力ファイルポインタ
  std::string line;                // 入力行
  std::vector<std::string> field;  // フィールド文字列
  unsigned int nfield;             // フィールド数
  std::string fieldsep;            // セパレータ文字
  int split();
  int endofline(char);
  int advplain(const std::string& line, std::string& fld, int);
  int advquoted(const std::string& line, std::string& fld, int);

public:
  Csv(std::istream& fin = std::cin, std::string sep = ",") :
      fin(fin), fieldsep(sep) {}
  int getline(std::string&);
  std::string getfield(unsigned int n);
  int getnfield() const { return nfield; }
};

#endif
{% endhighlight %}

File: `csv.cpp`

{% highlight c linenos %}
#include "csv.hpp"

#include <iostream>
#include <string>
#include <vector>

// getline: 1行取得し、必要に応じて伸張
int Csv::getline(std::string& str) {
  char c;

  for (line = ""; fin.get(c) && !endofline(c); )
    line += c;
  split();
  str = line;

  return !fin.eof();
}

// endofline: \r, \n, \r\n, EOF をチェックして捨てる
int Csv::endofline(char c) {
  int eol;

  eol = (c == '\n' || c == '\n');
  if (c == '\r') {
    fin.get(c);
    if (!fin.eof() && c != '\n')
      fin.putback(c);  // 読みすぎ
  }

  return eol;
}

// split: 行をフィールド単位に分割
int Csv::split() {
  std::string fld;
  unsigned int i, j;

  nfield = 0;
  if (line.length() == 0)
    return 0;
  i = 0;
  do {
    if (i < line.length() && line[i] == '"')
      j = advquoted(line, fld, ++i);  // クォートをスキップ
    else
      j = advplain(line, fld, i);
    if (nfield >= field.size())
      field.push_back(fld);
    else
      field[nfield] = fld;
    nfield++;
    i = j + 1;
  } while (j < line.length());

  return nfield;
}

// advquoted: クォートでくくられたフィールド: 次のセパレータのインデックスを返す
int Csv::advquoted(const std::string& s, std::string& fld, int i) {
  unsigned int j;

  fld = "";
  for (j = i; j < s.length(); j++) {
    if (s[j] == '"' && s[++j] != '"') {
      unsigned int k = s.find_first_of(fieldsep, j);
      if (k > s.length())  // セパレータが見つからなかった
        k = s.length();
      for (k -= j; k-- > 0; )
        fld += s[j++];
      break;
    }
    fld += s[j];
  }

  return j;
}

// advplain: クォートでくくられていないフィールド: 次のセパレータのインデックスを返す
int Csv::advplain(const std::string& s, std::string& fld, int i) {
  unsigned int j;

  j = s.find_first_of(fieldsep, i);  // セパレータを探す
  if (j > s.length())                // 見つからなかった
    j = s.length();
  fld = std::string(s, i, j - i);

  return j;
}

// getfield: n番目のフィールドを返す
std::string Csv::getfield(unsigned int n) {
  if (n < 0 || n >= nfield)
    return "";
  else
    return field[n];
}
{% endhighlight %}

File: `test_csv.cpp`

{% highlight c linenos %}
/*********************************************
 * CSV 読み込みテスト                        *
 *********************************************/
#include "csv.hpp"

#include <iostream>
#include <string>
#include <vector>

// TestCsv main: Csv クラスのテスト
int main(void) {
  std::string line;
  Csv csv;

  while (csv.getline(line) != 0) {
    std::cout << "line = '" << line << "'\n";
    for (int i = 0; i < csv.getnfield(); i++)
      std::cout << "field[" << i << "] = '"
                << csv.getfield(i) << "'\n";
  }
}
{% endhighlight %}

* [GitHub Gist - C++ source code to read csv data(v2).](https://gist.github.com/komasaru/ "GitHub Gist - C++ source code to read csv data(v2).")

### 2. コンパイル

今回は Makefile を作成してコンパイルする。（インデントは、実際は、スペースではなくタブ文字）

File: `Makefile`

``` text
gcc_options = -std=c++17 -Wall -O2 --pedantic-errors

test_csv: test_csv.o csv.o
  g++ $(gcc_options) -o $@ $^

test_csv.o : test_csv.cpp
  g++ $(gcc_options) -c $<

csv.o : csv.cpp
  g++ $(gcc_options) -c $<

run : test_csv
  ./test_csv

clean :
  rm -f ./test_csv
  rm -f ./*.o

.PHONY : run clean
```

コンパイル。

``` text
$ make
```

* 再コンパイルする場合は、 `make clean` をしてから。

### 3. CSV データサンプル

テスト用に CSV データファイルを作成する。（ファイル名： `sample.csv`）

File: `sample.csv`

{% highlight text linenos %}
20110106,-0.2
20110512,-0.3
20111104,-0.4
20120209,-0.5
20120510,-0.6
20120701, 0.4
20121025, 0.3
20130131, 0.2
20130411, 0.1
20130822, 0.0
20131121,-0.1
20140220,-0.2
20140508,-0.3
20140925,-0.4
20141225,-0.5
20150319,-0.6
20150528,-0.7
20150701, 0.3
20150917, 0.2
20151126, 0.1
20160131, 0.0
20160324,-0.1
20160519,-0.2
20160901,-0.3
{% endhighlight %}

### 4. 実行

ファイルをリダイレクトして、実行。

``` text
$ ./test_csv < sample.csv
line = '20110106,-0.2'
field[0] = '20110106'
field[1] = '-0.2'
line = '20110512,-0.3'
field[0] = '20110512'
field[1] = '-0.3'
line = '20111104,-0.4'
field[0] = '20111104'
field[1] = '-0.4'
line = '20120209,-0.5'
field[0] = '20120209'
field[1] = '-0.5'
line = '20120510,-0.6'
field[0] = '20120510'
field[1] = '-0.6'
line = '20120701, 0.4'
field[0] = '20120701'
field[1] = ' 0.4'
line = '20121025, 0.3'
field[0] = '20121025'
field[1] = ' 0.3'
line = '20130131, 0.2'
field[0] = '20130131'
field[1] = ' 0.2'
line = '20130411, 0.1'
field[0] = '20130411'
field[1] = ' 0.1'
line = '20130822, 0.0'
field[0] = '20130822'
field[1] = ' 0.0'
line = '20131121,-0.1'
field[0] = '20131121'
field[1] = '-0.1'
line = '20140220,-0.2'
field[0] = '20140220'
field[1] = '-0.2'
line = '20140508,-0.3'
field[0] = '20140508'
field[1] = '-0.3'
line = '20140925,-0.4'
field[0] = '20140925'
field[1] = '-0.4'
line = '20141225,-0.5'
field[0] = '20141225'
field[1] = '-0.5'
line = '20150319,-0.6'
field[0] = '20150319'
field[1] = '-0.6'
line = '20150528,-0.7'
field[0] = '20150528'
field[1] = '-0.7'
line = '20150701, 0.3'
field[0] = '20150701'
field[1] = ' 0.3'
line = '20150917, 0.2'
field[0] = '20150917'
field[1] = ' 0.2'
line = '20151126, 0.1'
field[0] = '20151126'
field[1] = ' 0.1'
line = '20160131, 0.0'
field[0] = '20160131'
field[1] = ' 0.0'
line = '20160324,-0.1'
field[0] = '20160324'
field[1] = '-0.1'
line = '20160519,-0.2'
field[0] = '20160519'
field[1] = '-0.2'
line = '20160901,-0.3'
field[0] = '20160901'
field[1] = '-0.3'
```

リダイレクトなしで実行した場合は、1行ずつ、直接入力する。（終了は `CTRL-C`）

``` text
$ ./test_csv
1,22,333,aaa,bbb
line = '1,22,333,aaa,bbb'
field[0] = '1'
field[1] = '22'
field[2] = '333'
field[3] = 'aaa'
field[4] = 'bbb'
2,"ABC","DEF",9
line = '2,"ABC","DEF",9'
field[0] = '2'
field[1] = 'ABC'
field[2] = 'DEF'
field[3] = '9'
^C
```

---

あちこちで利用できるでしょう。

以上。

