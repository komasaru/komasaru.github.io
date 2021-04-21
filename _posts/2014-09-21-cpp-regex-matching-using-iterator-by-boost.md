---
layout   : single
title    : "C++ - Boost で正規表現マッチング（Iterator 版）！"
published: true
date     : 2014-09-21 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- C言語
- 正規表現
---

前回 C++ で Boost(Regex) ライブラリを利用して正規表現マッチングを行う方法について紹介しました。

- [C++ - Boost で正規表現マッチング！]({{site.baseurl}}/2014/09/20/cpp-regex-matching-by-boost "C++ - Boost で正規表現マッチング！")

今回はイテレータを使用したバージョンについての記録です。

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
 * Matching regular expressions using iterators by boost.
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
    string       sSrcC, sPtnC;                 // Source string, Regex pattern (char)
    string       sSrcW, sPtnW;                 // Source string, Regex pattern (wchar)
    boost::regex reC, reW;                     // Regular expression
    bool regexIterator(string, boost::regex);  // Iterator matching

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
    sSrcC = "RedHatEnterpriseLinux CentOS ScientificLinux Fedora VineLinux";
    sSrcW = "レッドハットリナックス セントオーエス サイエンティフィックリナックス ヴァインリナックス";
    reC   = "([^ ]+)Linux";
    reW   = "([^ ]+)リナックス";
}

/*
 * Main Process
 */
bool Proc::execMain()
{
    try {
        // Iterator matching (char)
        if (!regexIterator(sSrcC, reC)) return false;

        // Iterator matching (wchar)
        if (!regexIterator(sSrcW, reW)) return false;
    } catch (char *e) {
        cerr << "[EXCEPTION] " << e << endl;
        return false;
    }
    return true;
}

// Iterator matching
bool Proc::regexIterator(string sSrc, boost::regex re)
{
    try {
        cout << "[Source string] " << sSrc << "\n"
             << "[Regex pattern] " << re   << endl;
        boost::sregex_iterator iter(sSrc.begin(), sSrc.end(), re);
        boost::sregex_iterator last;
        if (iter->size() == 0) {
            cout << "[ Unmatched ]" << endl;
        } else {
            cout << "[ Matched ]" << endl;
            while (iter != last) {
                for (size_t i = 0; i < iter->size(); ++i) {
                    cout << i << ':' << iter->position(i) << ','
                         << iter->length(i) << ':'
                         << iter->str(i) << ' ';
                }
                cout << endl;
                ++iter;
            }
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

- [Gist - C++ source code to match regular expressions using iterators by boost.](https://gist.github.com/komasaru/6d9a8754f59d7831ae9c "Gist - C++ source code to match regular expressions using iterators by boost.")

### 2. C++ ソースコンパイル

以下のコマンドで C++ ソースをコンパイルする。  
（`-Wall` 警告も出力するオプション、`-O2` 最適化のオプション、`-lboost_regex` boost_regex ライブラリを読み込むオプション）

``` text
$ g++ -Wall -O2 -o BoostRegexI BoostRegexI.cpp -lboost_regex
```

何も出力されなければ成功。

### 3. 実行

実際に、実行してみる。

``` text
$ ./BoostRegexI
[Source string] RedHatEnterpriseLinux CentOS ScientificLinux Fedora VineLinux
[Regex pattern] ([^ ]+)Linux
[ Matched ]
0:0,21:RedHatEnterpriseLinux 1:0,16:RedHatEnterprise
0:29,15:ScientificLinux 1:29,10:Scientific
0:52,9:VineLinux 1:52,4:Vine

[Source string] レッドハットリナックス セントオーエス サイエンティフィックリナックス ヴァインリナックス
[Regex pattern] ([^ ]+)リナックス
[ Matched ]
0:0,33:レッドハットリナックス 1:0,18:レッドハット
0:56,45:サイエンティフィックリナックス 1:56,30:サイエンティフィック
0:102,27:ヴァインリナックス 1:102,12:ヴァイン

```

---

当方の場合、正規表現マッチングは意外と頻繁に使用するので、後学のために記録しておいた次第です。

以上。

