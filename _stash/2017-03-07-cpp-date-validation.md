---
layout   : single
title    : "C++ - 日付妥当性チェック！"
published: true
date     : 2017-03-07 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- C++
---

日付の妥当性をチェックする C++ コードです。

<!--more-->

### 0. 前提条件

* LMDE2 (Linux Mint Debian Edition 2) での作業を想定。
* g++ 4.9.2 でのコンパイルを想定。
* チェックは8桁数字で行うので、チェック可能範囲は西暦0年1月1日〜西暦9999年12月31日。
* 当方、 C++ に長けていないので、綺麗なコーディングではないかもしれない。

### 1. C++ コードの作成

簡単なソースコードなので1ファイルで作成してもよかったが、今後部品として再利用することも考慮してヘッダ・ソース・実行ファイルに分割している。

【ヘッダファイル】

File: `validation.hpp`

{% highlight text linenos %}
/**
 * @file   validation.hpp
 * @briaf  Validation クラス用ヘッダファイル
 *
 * @date   2017-01-09 新規作成
 * @author mk-mode.com
 */
#ifndef INCLUDED_VALIDATION_HPP
#define INCLUDED_VALIDATION_HPP
#include <string>

/**
 * @class Validation
 * @brief 妥当性チェッククラス
 */
class Validation
{
    static const int DAYS_IN_MONTH[];
    std::string date, year, month, day;
    bool isLeapYear(int);
    int  daysInMonth(int, int);
    bool isDigit();

public:
    Validation(std::string);  // コンストラクタ
    bool isValid();           // 妥当性チェック
};
#endif
{% endhighlight %}

【ソースファイル】

File: `validation.cpp`

{% highlight c linenos %}
/**
 * @file   validation.cpp
 * @briaf  Validation クラス
 *
 * @date   2017-01-09 新規作成
 * @author mk-mode.com
 */
#include <cstdlib>
#include <iostream>
#include <string>
#include <ctype.h>
#include "validation.hpp"

using namespace std;

/**
 * @brief 定数（月内日数）
 */
const int Validation::DAYS_IN_MONTH[] = {
    31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31
};

/**
 * @brief     コンストラクタ
 *
 * @param[in] 日付(string; YYYYMMDD形式)
 * @return    <none>
 */
Validation::Validation(string date)
{
    this->date  = date;
    this->year  = date.substr(0, 4);
    this->month = date.substr(4, 2);
    this->day   = date.substr(6, 2);
}

/**
 * @brief     数字チェック
 *
 * @param[in] <none>
 * @return    真偽
 * @retval    true  数字
 * @retval    false 数字以外あり
 */
bool Validation::isDigit()
{
    unsigned int i;
    for (i = 0; i < year.length(); i++)
        if (isdigit(year[i]) == 0) return false;
    for (i = 0; i < month.length(); i++)
        if (isdigit(month[i]) == 0) return false;
    for (i = 0; i < day.length(); i++)
        if (isdigit(day[i]) == 0) return false;
    return true;
}

/**
 * @brief     うるう年チェック
 *
 * @param[in] 年(int)
 * @return    真偽
 * @retval    true  うるう年
 * @retval    false 平年
 */
bool Validation::isLeapYear(int y)
{
    return (y % 400 == 0) || ((y % 4 == 0) && (y % 100 != 0));
}

/**
 * @brief     月内日数取得
 *
 * @param[in] 年(int)
 * @param[in] 月(int)
 * @return    月内日数(int)
 */
int Validation::daysInMonth(int y, int m)
{
    if (m < 1 || 12 < m) return 0;
    if (m == 2 && isLeapYear(y) == true) return 29;
    return DAYS_IN_MONTH[m - 1];
}

/**
 * @brief     日付妥当性チェック
 *
 * @param[in] <none>
 * @return    真偽
 * @retval    true  妥当
 * @retval    false 不当
 */
bool Validation::isValid()
{
    int y = atoi(year.c_str());
    int m = atoi(month.c_str());
    int d = atoi(day.c_str());
    if (!isDigit()) return false;
    if (m < 1 || m > 12 || d < 1 || d > daysInMonth(y, m)) return false;
    return true;  // Valid
}
{% endhighlight %}

【実行ファイル】

File: `date_validation.cpp`

{% highlight c linenos %}
/**
 * @file   date_validation.cpp
 * @briaf  日付妥当性チェック
 *
 * @date   2017-01-09 新規作成
 * @author mk-mode.com
 */
// コマンドライン引数： YYYYMMDD
#include <iostream>
#include "validation.hpp"

using namespace std;

/**
 * @brief     メイン処理
 *
 * @param[in] argc 引数の数
 * @param[in] argv 引数の値の配列
 * @return    return code
 * @retval    0 正常終了
 * @retval    1 異常終了
 */
int main(int argc, char* argv[])
{
    string date;

    try {
        // コマンドライン引数取得
        if (argc < 2) {
            cout << "Please input in the format of YYYYMMDD." << endl;
            return 1;
        }
        date = argv[1];
        cout << date << ": ";

        // コマンドライン引数の長さチェック
        if (date.length() != 8) {
            cout << "Invalid!" << endl;
            return 1;
        }

        // 日付妥当性チェック
        Validation objValid(date);
        if (!objValid.isValid()) {
            cout << "Invalid!" << endl;
            return 1;
        }
    }
    catch (...) {
        cout << "EXCEPTION!" << endl;
        return 1;
    }

    // Not invalid
    cout << "Valid!" << endl;
    return 0;
}
{% endhighlight %}

* [GitHub Gist - C++ source code to check date validation.](https://gist.github.com/komasaru/a47bd66ca693f0757708834fd39f4b6a "GitHub Gist - C++ source code to check date validation.")

### 2. コンパイル

``` text
$ g++ -Wall -O2 date_validation.cpp validation.cpp -o date_validation
```

もしくは、

``` text
$ g++ -Wall -O2 -c validation.cpp -o validation.o
$ g++ -Wall -O2 -c date_validation.cpp -o date_validation.o
$ g++ -Wall -O2 date_validation.o validation.o -o date_validation
```

### 3. 実行

日付を `YYYYMMDD` の書式でコマンドライン引数に指定して実行する。

コマンドライン引数が8桁でなかったり、数字以外が含まれていたり、妥当な日付でない場合は `Invalid!` と出力する。

``` text
$ ./date_validation 20170228
20170228: Valid!

$ ./date_validation 20000229
20000229: Valid!

$ ./date_validation 20170229
20170229: Invalid!

$ ./date_validation 21000229
21000229: Invalid!

$ ./date_validation 20170000
20170000: Invalid!

$ ./date_validation 20171232
20171232: Invalid!

$ ./date_validation 201701234
201701234: Invalid!

$ ./date_validation 2017063a
2017063a: Invalid!
```

---

あちこちで利用できるでしょう。

以上。

