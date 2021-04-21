---
layout   : single
title    : "C++ - Twitter Streaming API でツイート取得！"
published: true
date     : 2014-11-29 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- C言語
- Twitter
---

C++ で Twitter Streming API を使用してツイート等の情報を取得する方法についての記録（ソースコードの紹介）です。

（C++ にそれほど精通している訳でもありません。ご承知おきください）

<!--more-->

### 0. 前提条件

* Linux Mint 17 (64bit) での作業を想定。
* g++(GCC) 4.9.1 での作業を想定。
* libcurl4-dev (= libcurl4-openssl-dev or libcurl4-nss-dev or libcurl4-gnutls-dev) がインストール済みであること。
* liboauth-dev がインストール済みであること。

### 1. C++ ソースコード作成

以下のような C++ ソースコードを作成。  
（Public Streams / sample の情報を取得する例）

File: `TwitterStream.cpp`

{% highlight c linenos %}
/*
 * Getting timelines by Twitter Streaming API
 */
#include <iostream>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <oauth.h>
#include <curl/curl.h>
#include <sstream>

using namespace std;

size_t fncCallback(char* ptr, size_t size, size_t nmemb, string* stream) {
    int iRealSize = size * nmemb;
    stream->append(ptr, iRealSize);
    string str = *stream;
    cout << str << endl;
    return iRealSize;
}

class Proc
{
    const char* cUrl;
    const char* cConsKey;
    const char* cConsSec;
    const char* cAtokKey;
    const char* cAtokSec;
    CURL        *curl;
    char*       cSignedUrl;
    string      chunk;
public:
    Proc(const char*, const char*, const char*, const char*, const char*);
    void execProc();
};

// Constructor
Proc::Proc(
    const char* cUrl,
    const char* cConsKey, const char* cConsSec,
    const char* cAtokKey, const char* cAtokSec)
{
    this->cUrl     = cUrl;
    this->cConsKey = cConsKey;
    this->cConsSec = cConsSec;
    this->cAtokKey = cAtokKey;
    this->cAtokSec = cAtokSec;
}

void Proc::execProc()
{
    // ==== cURL Initialization
    curl_global_init(CURL_GLOBAL_ALL);
    curl = curl_easy_init();
    if (!curl) {
        cout << "[ERROR] curl_easy_init" << endl;
        curl_global_cleanup();
        return;
    }

    // ==== cURL Setting
    // - URL, POST parameters, OAuth signing method, HTTP method, OAuth keys
    cSignedUrl = oauth_sign_url2(
        cUrl, NULL, OA_HMAC, "GET",
        cConsKey, cConsSec, cAtokKey, cAtokSec
    );
    // - URL
    curl_easy_setopt(curl, CURLOPT_URL, cSignedUrl);
    // - User agent name
    curl_easy_setopt(curl, CURLOPT_USERAGENT, "mk-mode BOT");
    // - HTTP STATUS >=400 ---> ERROR
    curl_easy_setopt(curl, CURLOPT_FAILONERROR, 1);
    // - Callback function
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, fncCallback);
    // - Write data
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, (void *)&chunk);

    // ==== Execute
    int iStatus = curl_easy_perform(curl);
    if (!iStatus)
        cout << "[ERROR] curl_easy_perform: STATUS=" << iStatus << endl;

    // ==== cURL Cleanup
    curl_easy_cleanup(curl);
    curl_global_cleanup();
}

int main(int argc, const char *argv[])
{
    // ==== Constants - URL
    const char *URL = "https://stream.twitter.com/1.1/statuses/sample.json";
    // ==== Constants - Twitter kyes
    const char *CONS_KEY = "<YOUR_CONSUMER_KEY>";
    const char *CONS_SEC = "<YOUR_CONSUMER_SECRET>";
    const char *ATOK_KEY = "<YOUR_ACCESS_TOKEN>";
    const char *ATOK_SEC = "<YOUR_ACCESS_TOKEN_SECRET>";

    // ==== Instantiation
    Proc objProc(URL, CONS_KEY, CONS_SEC, ATOK_KEY, ATOK_SEC);

    // ==== Main proccess
    objProc.execProc();

    return 0;
}
{% endhighlight %}

* [Gist - C++ source code to get twitter timelines by Twitter Streaming API.](https://gist.github.com/komasaru/ "Gist - C++ source code to get twitter timelines by Twitter Streaming API.")

### 2. C++ ソースコードコンパイル

（`-Wall` は警告も出力するオプション、 `-O2` は最適化のオプション、 `-lcurl`, `-loauth` は curl, oauth ライブラリを読み込むオプション）

``` text
# g++ -Wall -O2 -o TwitterStream TwitterStream.cpp -lcurl -loauth
```

### 3. 動作確認

以下のように実行。（終了は `CTLR-C` で）

``` text
# ./TwitterStream

====< 延々に JSON データが出力される >====

```

### 参考サイト

* [Consuming the Twitter Public Stream with libcURL - Pixel Robotics](http://pixelrobotics.com/2013/01/consuming-the-twitter-public-stream-with-libcurl/ "Consuming the Twitter Public Stream with libcURL - Pixel Robotics")

---

Public Streams / sample でなく User Streams から取得するように変更したり、取得した JSON を解析する処理等を実装すれば有益なものになるでしょう。

以上。

