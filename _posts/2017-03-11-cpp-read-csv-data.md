---
layout   : single
title    : "C++ - CSV データ読み込み！"
published: true
date     : 2017-03-11 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- C++
---

CSV データファイルを読み込む C++ コードです。

<!--more-->

### 0. 前提条件

* LMDE2 (Linux Mint Debian Edition 2) での作業を想定。
* g++ 4.9.2 でのコンパイルを想定。
* 当方、 C++ に長けていないので、綺麗なコーディングではないかもしれない。

### 1. C++ コードの作成

簡単なソースコードなので1ファイルで作成してもよかったが、今後部品として再利用することも考慮してヘッダ・ソース・実行ファイルに分割している。

【ヘッダファイル】

File: `csv.hpp`

{% highlight c linenos %}
/**
 * @file   csv.hpp
 * @brief  CSV 読み込み処理
 *
 * @date   2017-01-10 新規作成
 * @author mk-mode.com
 */
#ifndef INCLUDED_CSV_HPP
#define INCLUDED_CSV_HPP
#include <string>
#include <vector>

/**
 * @class Csv
 * @brief CSV 処理クラス
 */
class Csv
{
    //! CSV ファイル名
    std::string csv_file;

public:
    //! コンストラクタ
    Csv(std::string);
    //! CSV データ取得
    bool getCsv(std::vector<std::vector<std::string>>&, const char delim = ',');
};
#endif
{% endhighlight %}

【ソースファイル】

File: `csv.cpp`

{% highlight c linenos %}
/**
 * @file   csv.cpp
 * @brief  CSV 処理クラス
 *
 * @date   2017-01-10 新規作成
 * @author mk-mode.com
 */
#include <iostream>
#include <string>
#include <vector>
#include <fstream>
#include <sstream>
#include "csv.hpp"

using namespace std;

/**
 * @brief     コンストラクタ
 *
 * @param[in] CSVファイル(string)
 * @return    真偽(bool)
 * @retval    true  成功
 * @retval    false 失敗
 */
Csv::Csv(string csv_file)
{
    this->csv_file = csv_file;
}

/**
 * @brief      CSV データ取得
 *
 * @param[in]  CSV ファイル名(string&)
 * @param[out] CSV データ(vector<vector<string>>&)
 * @param[in]  デリミッタ(const char)
 * @return     真偽(bool)
 * @retval     true  成功
 * @retval     false 失敗
 */
bool Csv::getCsv(vector<vector<string>>& data, const char delim)
{
    // ファイルOPEN
    ifstream ifs(csv_file);
    if (!ifs.is_open()) return false;  // 読み込み失敗

    // ファイルREAD
    string buf;                 // 1行分バッファ
    while (getline(ifs, buf)) {
        vector<string> rec;     // 1行分ベクタ
        istringstream iss(buf); // 文字列ストリーム
        string field;           // 1列分文字列

        // 1列分文字列を1行分ベクタに追加
        while (getline(iss, field, delim)) rec.push_back(field);

        // １行分ベクタを data ベクタに追加
        if (rec.size() != 0) data.push_back(rec);
    }

    return true;  // 読み込み成功
}
{% endhighlight %}

【実行ファイル】

File: `read_csv.cpp`

{% highlight c linenos %}
/**
 * @file   read_csv.cpp
 * @brief  CSVファイル読込み
 *
 * @date   2017-01-10 新規作成
 * @author mk-mode.com
 */
#include <iostream>
#include <string>
#include <vector>
#include "csv.hpp"

using namespace std;

/**
 * @brief      メイン処理
 *
 * @param[in]  <none>
 * @param[out] <none>
 * @return     リターンコード(int)
 * @retval     0 正常終了
 * @retval     1 異常終了
 */
int main()
{
    const string csv_file = "sample.csv";  //! CSVファイル
    vector<vector<string>> data;           //! CSVデータ

    try {
        // CSVデータ取得
        Csv objCsv(csv_file);
        if (!objCsv.getCsv(data)) {
            cout << "[ERROR] 読込み失敗!" << endl;
            return 1;
        }

        // 内容出力
        for (unsigned int row = 0; row < data.size(); row++) {
            vector<string> rec = data[row];  // 1行
            for (unsigned int col = 0; col < rec.size(); col++) {
                cout << rec[col];  // 1列
                if (col < rec.size() - 1) cout << ",";  // 行末以外はカンマ出力
            }
            cout << endl;
        }
    }
    catch (...) {
        cout << "EXCEPTION!" << endl;
        return 1;
    }

    return 0;
}
{% endhighlight %}

* [GitHub Gist - C++ source code to read csv data.](https://gist.github.com/komasaru/ae60e06c57b95bcffdf85f7656a983f9 "GitHub Gist - C++ source code to read csv data.")

### 2. コンパイル

``` text
$ g++ -Wall -O2 read_csv.cpp csv.cpp -o read_csv -std=c++11
```

もしくは、

``` text
$ g++ -Wall -O2 -c csv.cpp -o csv.o -std=c++11
$ g++ -Wall -O2 -c read_csv.cpp -o read_csv.o -std=c++11
$ g++ -Wall -O2 read_csv.o csv.o -o read_csv
```

* `-std=c++11` は、テンプレートの右シフト問題対策。  
  （`vector<vector<string>>` の `>>` が右シフトと認識されないため）  
  `c++0x` でもよいが、 `c++03` はNG.  

### 3. CSV データサンプル

テスト用に CSV データファイルを作成する。（ファイル名： "sample.csv"）

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

``` text
$ ./read_csv
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
```

---

あちこちで利用できるでしょう。

以上。

