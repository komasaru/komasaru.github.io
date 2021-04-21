---
layout   : single
title    : "C++ - Boost で正規表現マッチング！"
published: true
date     : 2014-09-20 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- C言語
- 正規表現
---

C++ で Boost(Regex) ライブラリを利用して正規表現マッチングを行う方法についての記録です。

C++ 4.9 以降であれば標準ライブラリで用意されていますが、今回は 4.8.2 の環境を想定しているので Boost を使用します。

（C++ にそれほど精通している訳でもありません。ご承知おきください）

<!--more-->

### 0. 前提条件

- Linux Mint 17 での作業を想定。
- g++(c++) のバージョンは 4.8.2
- boost-regex-dev パッケージ導入済み。（`apt-get` 等で）

### 1. C++ ソースコード作成

以下のようにソースコードを作成した。

File: `BoostRegex.cpp`

{% highlight c linenos %}
/*
 * Matching regular expressions by boost.
 */
#include <iostream>
#include <string>
#include <boost/regex.hpp>     // require "boost-regex-dev"

using namespace std;

/*
 * [CLASS] Process
 */
class Proc
{
    // Private Declaration
    const char    *cSrc, *cPtnA, *cPtnS; // Source string, Regex pattern (char*)
    string        sSrc, sPtn;            // Source string, Regex pattern (string)
    boost::regex  reA, reS;              // Regular expression
    boost::cmatch cm;                    // Match result (char*)
    boost::smatch sm;                    // Match result (string)
    string::const_iterator start, end;   // Iterator
    bool regexCharAll();                 // All matches (char*)
    bool regexStringAll();               // All matches (string)
    bool regexRangeAll();                // All matches (range)
    bool regexCharSub();                 // Sub matches (char*)
    bool regexStringSub();               // Sub matches (string)
    bool regexRangeSub();                // Sub matches (range)

public:
    Proc();           // Constructor
    bool execMain();  // Main Process
};

/*
 * Proc - Constructor
 */
Proc::Proc()
{
    // Initial settings
    cSrc  = "This is a test of regular expressions.";
    cPtnA = "(.*)\\s*(regular)\\s*(.*)";
    cPtnS = "re(.*)ar";
    sSrc  = cSrc;
    reA   = cPtnA;
    reS   = cPtnS;
    cout << "[Source string     ] " << cSrc  << "\n"
         << "[Regex pattern(All)] " << cPtnA << "\n"
         << "[Regex pattern(Sub)] " << cPtnS << "\n"
         << endl;
}

/*
 * Main Process
 */
bool Proc::execMain()
{
    try {
        // All mathces (char*)
        if (!regexCharAll())   return false;

        // All mathces (string)
        if (!regexStringAll()) return false;

        // All mathces (range)
        if (!regexRangeAll())  return false;

        // Sub mathces (char*)
        if (!regexCharSub())   return false;

        // Sub mathces (string)
        if (!regexStringSub()) return false;

        // Sub mathces (range)
        if (!regexRangeSub())  return false;
    } catch (char *e) {
        cerr << "[EXCEPTION] " << e << endl;
        return false;
    }
    return true;
}

// All matches (char*)
bool Proc::regexCharAll()
{
    cout << "* All match - char*\n";
    try {
        if (boost::regex_match(cSrc, cm, reA)) {
            cout << "  ==== Matched ====\n";
            for (size_t i = 0; i < cm.size(); ++i) {
                cout << "  [" << i << "] (pos = " << cm.position(i) << ", "
                     << "len = " << cm.length(i) << ") "
                     << cm.str(i) << "\n";
            }
        } else {
            cout << "  ==== Unmatched ====\n";
        }
    } catch (char *e) {
        cerr << "[EXCEPTION] " << e << endl;
        return false;
    }
    cout << endl;
    return true;
}

// All matches (string)
bool Proc::regexStringAll()
{
    cout << "* All match - string\n";
    try {
        if (boost::regex_match(sSrc, sm, reA)) {
            cout << "  ==== Matched ====\n";
            for (size_t i = 0; i < sm.size(); ++i) {
                cout << "  [" << i << "] (pos = " << sm.position(i) << ", "
                     << "len = " << sm.length(i) << ") "
                     << sm.str(i) << "\n";
            }
        } else {
            cout << "  ==== Unmatched ====\n";
        }
    } catch (char *e) {
        cerr << "[EXCEPTION] " << e << endl;
        return false;
    }
    cout << endl;
    return true;
}

// All matches (range)
bool Proc::regexRangeAll()
{
    cout << "* All match - range\n";
    try {
        start = sSrc.begin();
        end   = sSrc.end();
        if (boost::regex_match(start, end, sm, reA)) {
            cout << "  ==== Matched ====\n";
            for (size_t i = 0; i < sm.size(); ++i) {
                cout << "  [" << i << "] (pos = " << sm.position(i) << ", "
                     << "len = " << sm.length(i) << ") "
                     << sm.str(i) << "\n";
            }
        } else {
            cout << "  ==== Unmatched ====\n";
        }
    } catch (char *e) {
        cerr << "[EXCEPTION] " << e << endl;
        return false;
    }
    cout << endl;
    return true;
}

// Sub matches (char*)
bool Proc::regexCharSub()
{
    cout << "* Sub match - char*\n";
    try {
        if (boost::regex_search(cSrc, cm, reS)) {
            cout << "  ==== Matched ====\n";
            for (size_t i = 0; i < cm.size(); ++i) {
                cout << "  [" << i << "] (pos = " << cm.position(i) << ", "
                     << "len = " << cm.length(i) << ") "
                     << cm.str(i) << "\n";
            }
        } else {
            cout << "  ==== Unmatched ====\n";
        }
    } catch (char *e) {
        cerr << "[EXCEPTION] " << e << endl;
        return false;
    }
    cout << endl;
    return true;
}

// Sub matches (string)
bool Proc::regexStringSub()
{
    cout << "* Sub match - string\n";
    try {
        if (boost::regex_search(sSrc, sm, reS)) {
            cout << "  ==== Matched ====\n";
            for (size_t i = 0; i < sm.size(); ++i) {
                cout << "  [" << i << "] (pos = " << sm.position(i) << ", "
                     << "len = " << sm.length(i) << ") "
                     << sm.str(i) << "\n";
            }
        } else {
            cout << "  ==== Unmatched ====\n";
        }
    } catch (char *e) {
        cerr << "[EXCEPTION] " << e << endl;
        return false;
    }
    cout << endl;
    return true;
}

// Sub matches (range)
bool Proc::regexRangeSub()
{
    cout << "* Sub match - range\n";
    try {
        start = sSrc.begin();
        end   = sSrc.end();
        if (boost::regex_search(start, end, sm, reS)) {
            cout << "  ==== Matched ====\n";
            for (size_t i = 0; i < sm.size(); ++i) {
                cout << "  [" << i << "] (pos = " << sm.position(i) << ", "
                     << "len = " << sm.length(i) << ") "
                     << sm.str(i) << "\n";
            }
        } else {
            cout << "  ==== Unmatched ====\n";
        }
    } catch (char *e) {
        cerr << "[EXCEPTION] " << e << endl;
        return false;
    }
    cout << endl;
    return true;
}

/*
 * Execution
 */
int main(){
    try {
        Proc objMain;
        bool bRet = objMain.execMain();
        if (!bRet) cout << "ERROR!" << endl;
    } catch (char *e) {
        cerr << "[EXCEPTION] " << e << endl;
        return 1;
    }
    return 0;
}

{% endhighlight %}

- [Gist - C++ source code to match regular expressions by boost.](https://gist.github.com/komasaru/136c107f94dc2b08d2e3 "Gist - C++ source code to match regular expressions by boost.")

ちなみに、日本語対応版は以下。（`char` 部分を除いて同じコーディングで問題ない（以前は厳密に `wchar` 指定する必要があったが））

- [Gist - C++ source code to match regular expressions(wchar) by boost.](https://gist.github.com/komasaru/9c66c542b17fbbdfc8ba "Gist - C++ source code to match regular expressions(wchar) by boost.")

### 2. C++ ソースコンパイル

以下のコマンドで C++ ソースをコンパイルする。  
（`-Wall` 警告も出力するオプション、`-O2` 最適化のオプション、`-lboost_regex` boost_regex ライブラリを読み込むオプション）

``` text
$ g++ -Wall -O2 -o BoostRegex BoostRegex.cpp -lboost_regex
```

何も出力されなければ成功。

### 3. 実行

実際に、実行してみる。

``` text
$ ./BoostRegex
[Source string     ] This is a test of regular expressions.
[Regex pattern(All)] (.*)\s*(regular)\s*(.*)
[Regex pattern(Sub)] re(.*)ar

* All match - char*
  ==== Matched ====
  [0] (pos = 0, len = 38) This is a test of regular expressions.
  [1] (pos = 0, len = 18) This is a test of
  [2] (pos = 18, len = 7) regular
  [3] (pos = 26, len = 12) expressions.

* All match - string
  ==== Matched ====
  [0] (pos = 0, len = 38) This is a test of regular expressions.
  [1] (pos = 0, len = 18) This is a test of
  [2] (pos = 18, len = 7) regular
  [3] (pos = 26, len = 12) expressions.

* All match - range
  ==== Matched ====
  [0] (pos = 0, len = 38) This is a test of regular expressions.
  [1] (pos = 0, len = 18) This is a test of
  [2] (pos = 18, len = 7) regular
  [3] (pos = 26, len = 12) expressions.

* Sub match - char*
  ==== Matched ====
  [0] (pos = 18, len = 7) regular
  [1] (pos = 20, len = 3) gul

* Sub match - string
  ==== Matched ====
  [0] (pos = 18, len = 7) regular
  [1] (pos = 20, len = 3) gul

* Sub match - range
  ==== Matched ====
  [0] (pos = 18, len = 7) regular
  [1] (pos = 20, len = 3) gul
```

---

当方の場合、正規表現マッチングは意外と頻繁に使用するので、後学のために記録しておいた次第です。

以上。

