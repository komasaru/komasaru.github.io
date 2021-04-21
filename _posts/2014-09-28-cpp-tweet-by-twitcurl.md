---
layout   : single
title    : "C++ - twitcurl でツイート！"
published: true
date     : 2014-09-28 00:20:00 +0900
comments : true
categories:
- プログラミング
- SNS
tags:
- C言語
- Twitter
---

C++ で twitcurl ライブラリを使用して Twitter へポストする方法についての記録です。

（C++ にそれほど精通している訳でもありません。ご承知おきください）

<!--more-->

### 0. 前提条件

- Linux Mint 17 での作業を想定。
- g++(c++) のバージョンは 4.8.2
- Twitter の Consumer Key, Secret, OAuth Access Token, Secret が取得済みであることを想定。
- Twitter の Consumer Key, Secret, OAuth Access Token, Secret が未取得の場合の処理やツイート以外の処理を実装することも可能だが、今回はツイートに限定した処理にしている。詳細は参考サイトのコーディング例を参照のこと。

### 1. 必要パッケージインストール

twitcurl ライブラリのインストールに必要なパッケージが未インストールならインストールする。

``` text
$ sudo apt-get install g++ subversion
```

さらに libcurl4-dev パッケージも必要だが、これは `libcurl4-openssl-dev`, `libcurl4-nss-dev`, `libcurl4-gnutls-dev` が提供する仮想パッケージなので、どれもインストールされてなければ、どれか一つをインストールする。

``` text
$ sudo apt-get install libcurl4-openssl-dev
```

### 2. twitcurl ライブラリインストール

ソースを取得しビルド・インストールする。

``` text
$ svn co http://twitcurl.googlecode.com/svn/trunk/libtwitcurl
$ cd libtwitcurl
$ make
$ sudo make install
```

### 3. C++ ソースコード作成

File: `twitcurl.cpp`

{% highlight c linenos %}
/**
 * Tweet by twitcurl
 */
#include <iostream>
#include <string>
#include <twitcurl.h>

using namespace std;

/*
 * [CLASS] Process
 */
class Proc
{
    twitCurl twitterObj;
    string strConsumerKey, strConsumerSecret;
    string strAccessTokenKey, strAccessTokenSecret;
    string strReplyMsg;
public:
    Proc();                 // Constructor
    bool execMain(string);  // Main Process
};

/*
 * Proc - Constructor
 */
Proc::Proc()
{
    // Initialize
    strConsumerKey       = "your_consumer_key";
    strConsumerSecret    = "your_consumer_secret";
    strAccessTokenKey    = "your_access_token_key";
    strAccessTokenSecret = "your_access_token_secret";
}

/*
 * Main Process
 */
bool Proc::execMain(string strString)
{
    try {
        // Set Twitter consumer key and secret,
        //   OAuth access token key and secret
        twitterObj.getOAuth().setConsumerKey(strConsumerKey);
        twitterObj.getOAuth().setConsumerSecret(strConsumerSecret);
        twitterObj.getOAuth().setOAuthTokenKey(strAccessTokenKey);
        twitterObj.getOAuth().setOAuthTokenSecret(strAccessTokenSecret);

        // Verify account credentials
        if (!twitterObj.accountVerifyCredGet()) {
            twitterObj.getLastCurlError(strReplyMsg);
            cerr << "\ntwitCurl::accountVerifyCredGet error:\n"
                 << strReplyMsg.c_str() << endl;
            return false;
        }

        // Post a message
        strReplyMsg = "";
        if (!twitterObj.statusUpdate(strString)) {
            twitterObj.getLastCurlError(strReplyMsg);
            cerr << "\ntwitCurl::statusUpdate error:\n"
                 << strReplyMsg.c_str() << endl;
            return false;
        }
    } catch (char *e) {
        cerr << "[EXCEPTION] " << e << endl;
        return false;
    }
    return true;
}

/*
 * Execution
 */
int main(int argc, char* argv[]){
    try {
        if (argc != 2) {
            cout << "Usage: ./Twitcurl sentence" << endl;
            return true;
        }
        Proc objMain;
        bool bRet = objMain.execMain(argv[1]);
        if (!bRet) cout << "ERROR!" << endl;
    } catch (char *e) {
        cerr << "[EXCEPTION] " << e << endl;
        return 1;
    }
    return 0;
}
{% endhighlight %}

- [Gist - C++ source code to tweet by twitcurl library.](https://gist.github.com/komasaru/ffe0397489947af90ae8 "Gist - C++ source code to tweet by twitcurl library.")

### 4. コンパイル

作成した C++ ソースコードをコンパイルする。  

``` text
$ g++ -Wall -O2 -o Twitcurl Twitcurl.cpp -ltwitcurl
```

何も出力されなければ成功。

### 5. 動作確認

以下のようにして実行してみる。  
第１引数にツイート文を指定するが、半角スペースが間に入る場合はダブルクォーテーションで括ること。

``` text
$ ./Twitcurl "これは C++ と TwitCurl によるテストツイートです。"
```

### 6. 参考サイト

ライブラリのインストールについては、

- [WikiHowToUseTwitcurlLibrary - twitcurl - How to use twitcurl library? - twitcurl is a pure C++ twitter API library based on cURL - Google Project Hosting](https://code.google.com/p/twitcurl/wiki/WikiHowToUseTwitcurlLibrary "WikiHowToUseTwitcurlLibrary - twitcurl - How to use twitcurl library? - twitcurl is a pure C++ twitter API library based on cURL - Google Project Hosting")

コーディング例については、

- [twitterClient.cpp - twitcurl - twitcurl is a pure C++ twitter API library based on cURL - Google Project Hosting](https://code.google.com/p/twitcurl/source/browse/trunk/twitterClient/twitterClient.cpp "twitterClient.cpp - twitcurl - twitcurl is a pure C++ twitter API library based on cURL - Google Project Hosting")

Twitter 社推奨の各プログラミング言語用のライブラリ一覧は、

- [Twitter Libraries - Twitter Developers](https://dev.twitter.com/docs/twitter-libraries "Twitter Libraries - Twitter Developers")

---

Twitter Bot を作成する際の参考になれば幸いです。

以上。

