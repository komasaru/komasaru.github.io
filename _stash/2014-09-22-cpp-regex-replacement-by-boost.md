---
layout   : single
title    : "C++ - Boost で正規表現置換！"
published: true
date     : 2014-09-22 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- C言語
- 正規表現
---

前回、前々回 C++ で Boost(Regex) ライブラリを利用して正規表現マッチングを行う方法について紹介しました。

- [C++ - Boost で正規表現マッチング！]({{site.baseurl}}/2014/09/20/cpp-regex-matching-by-boost "C++ - Boost で正規表現マッチング！")
- [C++ - Boost で正規表現マッチング（Iterator 版）！]({{site.baseurl}}/2014/09/21/cpp-regex-matching-using-iterator-by-boost "C++ - Boost で正規表現マッチング（Iterator 版）！")

今回は正規表現でマッチした部分を置換する方法についてのの記録です。

（C++ にそれほど精通している訳でもありません。ご承知おきください）

<!--more-->

### 0. 前提条件

- Linux Mint 17 での作業を想定。
- g++(c++) のバージョンは 4.8.2
- boost-regex-dev パッケージ導入済み。（`apt-get` 等で）

### 1. C++ ソースコード作成

以下のようにソースコードを作成した。  

File: `BoostRegexI.cpp`

{% highlight c linenos %}
/*
 * Replacement of regular expressions by boost.
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
    string       sSrc;          // Source string
    string       sFmtA, sFmtS;  // Replace string (All, Sub)
    boost::regex reA, reS;      // Regular expression (All, Sub)
    string       result;        // Result
    bool regexReplaceA(string, boost::regex, string);  // All replace
    bool regexReplaceS(string, boost::regex, string);  // Sub replace

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
    sSrc  = "RedHatEnterpriseリナックス CentOS サイエンティフィックLinux Fedora VineLinux";
    reA   = "Linux";                   // All matching - Regular expression
    sFmtA = "リナックス";              // All matching - Replace string
    reS   = "([^ ]+)(Linux)";          // Sub matching - Regular expression
    sFmtS = "(?1****)(?2リナックス)";  // Sub matching - Replace string
}

/*
 * Main Process
 */
bool Proc::execMain()
{
    try {
        // Replace (All match)
        if (!regexReplaceA(sSrc, reA, sFmtA)) return false;

        // Replace (Sub match)
        if (!regexReplaceS(sSrc, reS, sFmtS)) return false;
    } catch (char *e) {
        cerr << "[EXCEPTION] " << e << endl;
        return false;
    }
    return true;
}

// Replace (All match)
bool Proc::regexReplaceA(string sSrc, boost::regex re, string sFmt)
{
    try {
        cout << "[Source string]\n  " << sSrc << "\n"
             << "[Replace]\n  " << re << " -> "
             << sFmt << endl;
        result = boost::regex_replace(sSrc, re, sFmt);
        cout << "[Result]\n  " << result << endl;
    } catch (char *e) {
        cerr << "[EXCEPTION] " << e << endl;
        return false;
    }
    cout << endl;
    return true;
}

// Replace (Sub match)
bool Proc::regexReplaceS(string sSrc, boost::regex re, string sFmt)
{
    try {
        cout << "[Source string]\n  " << sSrc << "\n"
             << "[Replace]\n  " << re << " -> "
             << sFmt << endl;
        result = boost::regex_replace(
            sSrc, re, sFmt, boost::match_default | boost::format_all
        );
        cout << "[Result]\n  " << result << endl;
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

- [Gist - C++ source code to replace regular expressions by boost.](https://gist.github.com/komasaru/23a5c9a18abb0f21a280 "Gist - C++ source code to replace regular expressions by boost.")

### 2. C++ ソースコンパイル

以下のコマンドで C++ ソースをコンパイルする。  
（`-Wall` 警告も出力するオプション、`-O2` 最適化のオプション、`-lboost_regex` boost_regex ライブラリを読み込むオプション）

``` text
$ g++ -Wall -O2 -o BoostRegexR BoostRegexR.cpp -lboost_regex
```

何も出力されなければ成功。

### 3. 実行

実際に、実行してみる。

``` text
 ./BoostRegexR
[Source string]
  RedHatEnterpriseリナックス CentOS サイエンティフィックLinux Fedora VineLinux
[Replace]
  Linux -> リナックス
[Result]
  RedHatEnterpriseリナックス CentOS サイエンティフィックリナックス Fedora Vineリナックス

[Source string]
  RedHatEnterpriseリナックス CentOS サイエンティフィックLinux Fedora VineLinux
[Replace]
  ([^ ]+)(Linux) -> (?1****)(?2リナックス)
[Result]
  RedHatEnterpriseリナックス CentOS ****リナックス Fedora ****リナックス
```

---

当方の場合、正規表現マッチングは意外と頻繁に使用するので、後学のために記録しておいた次第です。

以上。

