---
layout   : single
title    : "C++ - 2つの時刻の平均！"
published: true
date     : 2021-02-10 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- C++
- カレンダー
---

2つの timespec 型の時刻の平均を求める処理を実装してみました。

と言っても、単純な四則演算（＆剰余）です。

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10.6 (64bit) での作業を想定。
* GCC 9.2.0 (G++ 9.2.0) (C++17) でのコンパイルを想定。

### 1. C++ ソースコードの作成

ここでは、実行部分のみ掲載。（全てのコードは GitHub リポジトリとして公開している）

* timespec 型なので、ナノ秒(`1.0e9`)単位で計算可。
* timespec を `2` で除算する際の作業用変数（秒部分、ナノ秒部分）に `long int` 型を使用している。（環境や場合によっては不具合があるかもしれない。適宜変更すること）

File: `mean_time.cpp`

{% highlight c linenos %}
/***********************************************************
 2つの時刻(timespec)の平均を計算

    DATE        AUTHOR       VERSION
    2021.02.06  mk-mode.com  1.00 新規作成

  Copyright(C) 2020 mk-mode.com All Rights Reserved.

  ----------------------------------------------------------
  引数 : JST_1 JST_2
           書式：最大23桁の数字
                 （先頭から、西暦年(4), 月(2), 日(2), 時(2), 分(2), 秒(2),
                             1秒未満(9)（小数点以下9桁（ナノ秒）まで））
***********************************************************/
#include <cstdlib>   // for EXIT_XXXX
#include <ctime>
#include <iomanip>
#include <iostream>
#include <string>

/*
 * @brief      Time addition
 *
 * @param[in]  時刻A (timespec)
 * @param[in]  時刻B (timespec)
 * @return     時刻  (timespec)
 */
struct timespec time_add(struct timespec ts_a, struct timespec ts_b) {
  struct timespec ts;

  try {
    ts.tv_sec  = ts_a.tv_sec  + ts_b.tv_sec;
    ts.tv_nsec = ts_a.tv_nsec + ts_b.tv_nsec;
    if(ts.tv_nsec >= 1e9){
      ++ts.tv_sec;
      ts.tv_nsec -= 1e9;
    }
    if (ts.tv_nsec < 0) {
      --ts.tv_sec;
      ts.tv_nsec += 1e9;
    }
  } catch (...) {
    throw;
  }

  return ts;
}

/*
 * @brief      Mean of 2 Timespec
 *
 * @param[in]  時刻A (timespec)
 * @param[in]  時刻B (timespec)
 * @return     時刻  (timespec)
 */
struct timespec time_mean(struct timespec ts_a, struct timespec ts_b) {
  struct timespec ts;
  long int a; // 商
  long int r; // 剰余

  try {
    ts = time_add(ts_a, ts_b);
    a = ts.tv_sec / 2;
    r = ts.tv_sec - a * 2;
    ts.tv_sec   = a;
    ts.tv_nsec += r * 1e9;
    ts.tv_nsec /= 2;
    if (ts.tv_nsec < 0) {
      ts.tv_nsec += 1e9;
      --ts.tv_sec;
    }
  } catch (...) {
    throw;
  }

  return ts;
}

/*
 * @brief      日時文字列生成
 *
 * @param[in]  日時 (timespec)
 * @return     日時文字列 (string)
 */
std::string gen_time_str(struct timespec ts) {
  struct tm t;
  std::stringstream ss;
  std::string str_tm;

  try {
    localtime_r(&ts.tv_sec, &t);
    ss << std::setfill('0')
       << std::setw(4) << t.tm_year + 1900 << "-"
       << std::setw(2) << t.tm_mon + 1     << "-"
       << std::setw(2) << t.tm_mday        << " "
       << std::setw(2) << t.tm_hour        << ":"
       << std::setw(2) << t.tm_min         << ":"
       << std::setw(2) << t.tm_sec         << "."
       << std::setw(9) << ts.tv_nsec;
    return ss.str();
  } catch (...) {
    throw;
  }
}

int main(int argc, char* argv[]) {
  unsigned int    i;
  std::string     tm_str;
  unsigned int    s_tm;    // size of time string
  unsigned int    s_nsec;  // size of nsec string
  struct tm       t;
  struct timespec ts[2];   // 時刻 A, B
  struct timespec ts_m;    // 時刻 A, B の平均

  try {
    // 日付取得
    if (argc < 3) {
      std::cout << "[USAGE] ./mean_timespec JST_1 JST_2" << std::endl;
      return EXIT_SUCCESS;
    }

    // コマンドライン引数より取得
    for (i = 0; i < 2; ++i) {
      tm_str = argv[i + 1];
      s_tm = tm_str.size();
      if (s_tm > 23) { 
        std::cout << "[ERROR] Over 23-digits!" << std::endl;
        return EXIT_FAILURE;
      }
      t = {};
      std::istringstream is(tm_str);
      is >> std::get_time(&t, "%Y%m%d%H%M%S");
      ts[i].tv_sec  = mktime(&t);
      ts[i].tv_nsec = 0;
      s_nsec = s_tm - 14;
      if (s_tm > 14) {
        ts[i].tv_nsec = std::stod(
            tm_str.substr(14, s_nsec) + std::string(9 - s_nsec, '0'));
      }
    }
    std::cout << "    TIME-A: " << gen_time_str(ts[0]) << std::endl;
    std::cout << "    TIME-B: " << gen_time_str(ts[1]) << std::endl;

    // 2つの時刻の平均を変換
    ts_m = time_mean(ts[0], ts[1]);
    std::cout << "MEAN(A, B): " << gen_time_str(ts_m) << std::endl;
  } catch (...) {
      std::cerr << "EXCEPTION!" << std::endl;
      return EXIT_FAILURE;
  }

  return EXIT_SUCCESS;
}
{% endhighlight %}

* [GitHub Gist - C++ source code to calculate a mean of 2 timespecs.](https://gist.github.com/komasaru/234f735691d67b481973059dcbf67d50 "GitHub - C++ source code to calculate a mean of 2 timespecs.")

### 2. ソースコードのコンパイル

``` text
$ g++ -std=c++17 -Wall -O2 --pedantic-errors -o mean_time mean_time.cpp
```

### 3. 動作確認

コマンドライン引数に時刻文字列を2つ、それぞれ最大23桁(`YYYYMMDDHHMMSSNNNNNNNNN`)で指定して実行。

``` text
$ ./mean_time 20210201 20210210
    TIME-A: 2021-02-01 00:00:00.000000000
    TIME-B: 2021-02-10 00:00:00.000000000
MEAN(A, B): 2021-02-05 12:00:00.000000000

$ ./mean_time 20210201000000123456789 20210210123456
    TIME-A: 2021-02-01 00:00:00.123456789
    TIME-B: 2021-02-10 12:34:56.000000000
MEAN(A, B): 2021-02-05 18:17:28.061728394

$ ./mean_time 20210210123456123456790 20210210123456123456788
    TIME-A: 2021-02-10 12:34:56.123456790
    TIME-B: 2021-02-10 12:34:56.123456788
MEAN(A, B): 2021-02-10 12:34:56.123456789

```

* 単純に平均を計算しているだけなので、指定する2つの時刻の大小は問わない。

---

自作カレンダーツールで使用したく、今回、試験的に作成してみた次第です。

以上。

