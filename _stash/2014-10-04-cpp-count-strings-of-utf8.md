---
layout   : single
title    : "C++ - UTF-8 文字列の文字数をカウント！"
published: true
date     : 2014-10-04 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- C言語
---

C++ で UTF-8 の文字列の文字数をカウントする方法についての記録です。

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

File: `CntStrUtf8.cpp`

{% highlight c linenos %}
#include <iostream>
#include <string.h>

using namespace std;

/*
 * [CLASS] Proc
 */
class Proc
{
    int cntByte(unsigned char);  // Count bytes

public:
    int cntStr(const char*);     // Count stings
};

/*
 * Count strings
 */
int Proc::cntStr(const char *cStr)
{
   int i = 0, iCnt = 0;

   while (cStr[i] != '\0') {
       iCnt++;
       i += cntByte(cStr[i]);
   }

   return iCnt;
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
    const char* cStr = "これは文字数 Count の ﾃｽﾄ です。";
    int iCnt;

    try {
        Proc objMain;
        iCnt = objMain.cntStr(cStr);
        cout << "* " << cStr << "\n"
             << "  => " << strlen(cStr) << " Bytes, "
             << iCnt << " Strings" << endl;
    } catch (const char* e) {
        cerr << "[EXCEPTION] " << e << endl;
        return 1;
    }
    return 0;
}
{% endhighlight %}

- [Gist - C++ source code to count strings of UTF-8.](https://gist.github.com/komasaru/4eb39e3ff397f6babdb8 "Gist - C++ source code to count strings of UTF-8.")

### 3. コンパイル

作成した C++ ソースコードをコンパイルする。  

``` text
# g++ -Wall -O2 -o CntStrUtf8 CntStrUtf8.cpp
```

何も出力されなければ成功。

### 4. 動作確認

以下のようにして実行してみる。  
バイト数と文字数が出力される。（ちなみに、全角日本語と半角カタカナは１文字３バイト、半角英数字は１文字１バイト）

``` text
$ ./CntStrUtf8
* これは文字数 Count の ﾃｽﾄ です。
  => 48 Bytes, 22 Strings
```

### 5. 参考サイト

- [RFC 3629](http://tools.ietf.org/html/rfc3629#page-3 "RFC 3629 Page-3")

---

C, C++ 等で文字列を多用する場合に役立ちそうな話題でした。

以上。

