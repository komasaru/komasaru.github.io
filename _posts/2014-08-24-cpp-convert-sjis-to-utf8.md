---
layout   : single
title    : "C++ - ShiftJIS -> UTF-8 変換！"
published: true
date     : 2014-08-24 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- C言語
---

気分転換に CentOS サーバ構築以外の話題にします。

C++ で ShiftJIS で書かれたテキストファイルを UTF-8 に変換する方法についての記録（簡単な例）です。

（それほど洗練されたソースコードでもありません。ご承知おきください）

<!--more-->

### 0. 前提条件

- Linux Mint 17 での作業を想定。
- g++(c++) のバージョンは 4.8.2

### 1. C++ ソースコード作成

以下のようにソースコードを作成した。  
"sjis.txt" という ShiftJIS で書かれたテキストファイルを読み込んで、UTF-8 に変換した内容で "utf8.txt" に保存する。

File: `SjisToUtf8.cpp`

{% highlight c linenos %}
/***********************************************************
 * 文字コード変換 (ShiftJIS -> UTF-8)
 **********************************************************/
#include <fstream>
#include <iostream>          // for cout, endl
#include <stdio.h>           // for fopen
#include <string.h>          // for strlen
#include <iconv.h>           // for iconv

#define ENC_SRC "Shift_JIS"  // Encoding ( Src )
#define ENC_DST "UTF-8"      // Encoding ( Dst )
#define FILE_S  "sjis.txt"   // Textfile ( Src )
#define FILE_D  "utf8.txt"   // Textfile ( Dst )
#define B_SIZE  1024         // Buffer size

using namespace std;

/*
 * [CLASS] Process
 */
class Proc
{
    // Private Declaration
    ifstream ifs;
    ofstream ofs;
    string   sLine;
    char     sSrc[B_SIZE], sDst[B_SIZE];
    bool     bRet;
    bool     convert();

public:
    int execMain();  // Main Process
};

/*
 * Main Process
 */
int Proc::execMain()
{
    try {
        // Open In-file
        ifs.open(FILE_S);
        if (ifs.fail()) {
            cerr << "[ERROR] Could not open " << FILE_S << endl;
            return 1;
        }

        // Open Out-file
        ofs.open(FILE_D);
        if (ofs.fail()) {
            cerr << "[ERROR] Could not open " << FILE_D << endl;
            return 1;
        }

        // Convert for each lines
        while (getline(ifs, sLine)) {
            bRet = convert();
            if (bRet) {
                ofs << sDst << endl;
            } else {
                cerr << "[ERROR] Convert failed!" << endl;
            }
        }
    } catch (char *e) {
        cerr << "EXCEPTION : " << e << endl;
        return 1;
    }
    return 0;
}

/*
 * Convert for each lines
 */
bool Proc::convert()
{
    char    *pSrc, *pDst;
    size_t  nSrc, nDst;
    iconv_t icd;

    try {
        strcpy(sSrc, sLine.c_str());
        pSrc = sSrc;
        pDst = sDst;
        nSrc = strlen(sSrc);
        nDst = B_SIZE - 1;
        while (0 < nSrc) {
            icd = iconv_open(ENC_DST, ENC_SRC);
            iconv(icd, &pSrc, &nSrc, &pDst, &nDst);
            iconv_close(icd);
        }
        *pDst = '\0';

        return true;
    } catch (char *e) {
        cerr << "EXCEPTION : " << e << endl;
        return false;
    }
}

/*
 * Execution
 */
int main(){
    try {
        Proc objMain;
        int iRetCode = objMain.execMain();
        if (iRetCode == 0) {
            cout << "SUCCESS!" << endl;
        } else {
            cout << "FAILED!"  << endl;
        }
    } catch (char *e) {
        cerr << "EXCEPTION : " << e << endl;
        return 1;
    }
    return 0;
}
{% endhighlight %}

- [Gist - C++ source code to convert ShiftJIS to UTR-8.](https://gist.github.com/komasaru/93df247231e6ddcd766c "Gist - C++ source code to convert ShiftJIS to UTR-8.")

### 2. C++ ソースコンパイル

以下のコマンドで C++ ソースをコンパイルする。  
（`-Wall` 全ての警告を出力するオプション、 `-O2` 最適化のオプション）

``` text
$ g++ -Wall -O2 SjisToUtf8.cpp -o SjisToUtf8
```

何も出力されなければ成功。

### 3. 実行

実際に、実行してみる。

``` text
$ ./GetHtml
```

同じディレクトリ内に作成された "utf8.txt" というテキストファイル（文字コード）を確認する。

---

ShiftJIS で書かれている Web サイトを UTF-8 で扱いたい場合などに有益ではないでしょうか。

実際、当方は Web スクレイピングする際に使用しています。

以上。

