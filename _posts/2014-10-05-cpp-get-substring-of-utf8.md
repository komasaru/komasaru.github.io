---
layout   : single
title    : "C++ - UTF-8 文字列から部分文字列を抽出！"
published: true
date     : 2014-10-05 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- C言語
---

C++ で UTF-8 の文字列から部分文字列を抽出する方法についての記録です。  
前回の「[C++ - UTF-8 文字列の文字数をカウント！]({{site.baseurl}}/2014/10/04/cpp-count-strings-of-utf8 "C++ - UTF-8 文字列の文字数をカウント！")」の応用です。

（C++ にそれほど精通している訳でもありません。ご承知おきください）

<!--more-->

### 0. 前提条件

- Linux Mint 17 での作業を想定。
- g++(c++) のバージョンは 4.8.2

### 1. UTF-8 について

UTF-8 について詳細に説明はしないが、UTF-8 の仕様では１バイト目の先頭からの連続するビット数(1 となっているビットの連続数）で１文字のバイト数が決まるということを理解しておく。  
さらに、このことから以下のように定義されていることも理解しておく。（参照・ [RFC 3629](http://tools.ietf.org/html/rfc3629#page-3 "RFC 3629 Page-3") ）

- １バイト目： 0x00 〜 0x7f →  1 バイト
- １バイト目： 0xc2 〜 0xdf →  2 バイト
- １バイト目： 0xe0 〜 0xef →  3 バイト
- １バイト目： 0xf0 〜 0xf7 →  4 バイト
- １バイト目： 0xf8 〜 0xfb →  5 バイト
- １バイト目： 0xfc 〜 0xfd →  6 バイト

### 2. C++ ソースコード作成

実際には、５、６バイトの文字は使用しないかも知れないが、実装しておいた。  
また、当てはまらない文字があれば、それは０バイトで計算するようにしている。

File: `SubStrUtf8.cpp`

{% highlight c linenos %}
#include <iostream>
#include <string.h>

using namespace std;

/*
 * [CLASS] Proc
 */
class Proc
{
    int cntByte(unsigned char);           // Count bytes

public:
    char* subStr(const char*, int, int);  // Get substring
};

/*
 * Get substring
 */
char* Proc::subStr(const char *cStr, int iStart, int iLength)
{
    static char cRes[1024];
    char* pRes = cRes;
    int i = 0, iPos = 0;
    int iByte;

    while (cStr[i] != '\0') {
        iByte = cntByte(cStr[i]);
        if (iStart <= iPos && iPos < iStart + iLength) {
            memcpy(pRes, (cStr + i), iByte);
            pRes += iByte;
        }
        i += iByte;
        iPos++;
    }
    *pRes = '\0';

    return cRes;
}

/*
 * Count bytes
 */
int Proc::cntByte(unsigned char cChar)
{
   int iByte;

   if ((cChar >= 0x00) && (cChar <= 0x7f)) {
       iByte = 1;
   } else if ((cChar >= 0xc2) && (cChar <= 0xdf)) {
       iByte = 2;
   } else if ((cChar >= 0xe0) && (cChar <= 0xef)) {
       iByte = 3;
   } else if ((cChar >= 0xf0) && (cChar <= 0xf7)) {
       iByte = 4;
   } else if ((cChar >= 0xf8) && (cChar <= 0xfb)) {
       iByte = 5;
   } else if ((cChar >= 0xfc) && (cChar <= 0xfd)) {
       iByte = 6;
   } else {
       iByte = 0;
   }

   return iByte;
}

/*
 * Execution
 */
int main(){
    const char* cStr = "ｺﾚﾊ 部分文字列取得の TEST です。";
    char* cRes;

    try {
        Proc objMain;
        cRes = objMain.subStr(cStr, 2, 13);
        cout << "* " << cStr << "\n"
             << "  => " << cRes << endl;
    } catch (const char* e) {
        cerr << "[EXCEPTION] " << e << endl;
        return 1;
    }
    return 0;
}
{% endhighlight %}

- [Gist - C++ source code to get substrings of UTF-8.](https://gist.github.com/komasaru/2ea923e58aa112f4122f "Gist - C++ source code to get substrings of UTF-8.")

### 3. コンパイル

作成した C++ ソースコードをコンパイルする。  

``` text
# g++ -Wall -O2 -o SubStrUtf8 SubStrUtf8.cpp
```

何も出力されなければ成功。

### 4. 動作確認

以下のようにして実行してみる。  
指定位置・長さの部分文字列が抽出されることを確認する。

``` text
* ｺﾚﾊ 部分文字列取得の TEST です。
  => ﾊ 部分文字列取得の TE
```

### 5. 参考サイト

- [RFC 3629](http://tools.ietf.org/html/rfc3629#page-3 "RFC 3629 Page-3")

---

C, C++ 等で文字列を多用する場合に役立ちそうな話題でした。

以上。

