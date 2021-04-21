---
layout   : single
title    : "C++ - JSON データの解析(by picojson)！"
published: true
date     : 2014-11-15 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- C言語
- JSON
---

GNU C++ で JSON データを読み込んで解析する方法についての記録です。

ライブラリは定番の、そしてヘッダファイルの配置だけで済む "picojson" を使用します。（他に JSON-C や rapidjson 等もあるかと思いますが）

<!--more-->

### 0. 前提条件

- Linux Mint 17(64bit) での作業を想定。

### 1. picojson 準備

"[kazuho/picojson - a header-file-only, JSON parser serializer in C++](https://github.com/kazuho/picojson "a header-file-only, JSON parser serializer in C++")" から "picojson.h" をダウンロードし適切な場所へ配置する。（今回は作成する C++ ソースと同じディレクトリへ配置した）

### 2. JSON データ準備

テスト読み込み用の JSON データファイルを作成。（文字エンコード: UTF-8）  
（整数、小数、文字列（日本語含む）、真偽、配列のデータを盛り込んでいる）

File: `test.json`

{% highlight text linenos %}
{
  "Test1": {
    "TestInt": 1234,
    "TestDbl": 0.1234,
    "TestStr": "JSON Test 一二三",
    "TestBln": true,
    "TestAry": [
      "JSON TEST 1-1",
      "JSON TEST 1-2",
      "JSON TEST 1-3"
    ]
  }
}
{% endhighlight %}

### 3. C++ ソースコード作成

テスト用に以下のようなコードを作成。

File: `PicoJson.cpp`

{% highlight c linenos %}
// g++ -Wall -O2 -o PicoJson picojson.h PicoJson.cpp
/*
 * C++ source code to parse json datas by picojson.
 */
#include <string>
#include <sstream>
#include <fstream>
#include <iostream>
#include "picojson.h"

using namespace std;
using namespace picojson;

int main() {
    // Declaration
    stringstream ss;
    ifstream     f;
    unsigned int i;

    // Read Json file
    f.open("test.json", ios::binary);
    if (!f.is_open()) return 1;
    ss << f.rdbuf();
    f.close();

    // Parse Json data
    value v;
    ss >> v;
    string err = get_last_error();
    if(!err.empty()) {
        cerr << err << endl;
        return -1;
    }
    object& o = v.get<object>()["Test1"].get<object>();
    cout << "TestInt: " << o["TestInt"].get<double>() << endl;
    cout << "TestDbl: " << o["TestDbl"].get<double>() << endl;
    cout << "TestStr: " << o["TestStr"].get<string>() << endl;
    cout << "TestBln: " << o["TestBln"].get<bool>()   << endl;
    array& aAry = o["TestAry"].get<array>();
    cout << "TestAry:" << endl;
    for (i = 0; i < aAry.size(); i++)
        cout << "\t" << aAry[i].get<string>() << endl;
}
{% endhighlight %}

ちなみに、整数取得用のメソッドはないが、 "double" で取得可能。

* [Gist - C++ source code to parse json datas by picojson.](https://gist.github.com/komasaru/47f6df894e79f04f1a21 "Gist - C++ source code to parse json datas by picojson.")

### 4. ビルド

作成した C++ を以下のようにビルド。（`-Wall` 警告も出力するオプション、`-O2` 最適化のオプション）

``` text
$ g++ -Wall -O2 -o PicoJson picojson.h PicoJson.cpp
```

### 5. 動作確認

確認のために実行。

``` text
$ ./PicoJson
TestInt: 1234
TestDbl: 0.1234
TestStr: JSON Test 一二三
TestBln: 1
TestAry:
        JSON TEST 1-1
        JSON TEST 1-2
        JSON TEST 1-3
```

### 9. 参考サイト

* [kazuho/picojson - a header-file-only, JSON parser serializer in C++](https://github.com/kazuho/picojson "a header-file-only, JSON parser serializer in C++")

---

Yaml 同様 Json データも何かとよく使用するため、記録しておいた次第です。（当方の場合、 Twitter API でよく使用する）

速度を重視した処理を行いたければ、"picojson" より高速と言われている "rapidjson" の導入を考えてもよいでしょう。

以上。

