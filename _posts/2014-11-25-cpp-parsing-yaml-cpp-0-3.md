---
layout   : single
title    : "C++ - yaml-cpp 0.3 系で YAML をパース！"
published: true
date     : 2014-11-25 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- C言語
---

Linux Mint 17 や CentOS 7.0 では C++ 用 YAML パーサ yaml-cpp の最新版 0.5 系 をインストールして使用出来ましたが、CentOS 6.6 では 0.5 系のインストールができなかったので、旧バージョンの 0.3 系をインストールして使用してみました。

使用方法も 0.5 系と 0.3 系では全く異なるため、今回別途記録しておいた次第です。

（C++ にそれほど精通している訳でもありません。ご承知おきください）

<!--more-->

### 0. 前提条件

* CentOS 6.6 (32bit) での作業を想定。
* `cmake` コマンドを使用するのでインストール済みであること。
* g++(GCC) 4.4.7 での作業を想定。
* libboost-dev がインストール済みであること。（CentOS なら boost-devel）

### 1. yaml-cpp 0.3.0 のインストール

EPEL リポジトリ等からも Yum インストール可能だが、今回は「[C++ - yaml-cpp で YAML をパース！]({{site.baseurl}}/2014/10/14/cpp-installation-yaml-cpp/ "C++ - yaml-cpp で YAML をパース！")」で紹介した方法でインストールする。  
詳細は過去記事参照。

* [C++ - yaml-cpp で YAML をパース！]({{site.baseurl}}/2014/10/14/cpp-installation-yaml-cpp/ "C++ - yaml-cpp で YAML をパース！")

### 2. YAML ファイル作成

テスト用として以下のような（１段入れ子になった） YAML ファイル "config.yml” を作成。

File: `config.yml`

{% highlight text linenos %}
- db:
  hostname: 127.0.0.1
  database: hoge
  username: fuga
  password: foobar
{% endhighlight %}

ちなみに、ループ構造にするなら以下のようにすればよい。（設定値の間にスペースがある場合はダブルクォーテーションで括る）

File: `config.yml`

{% highlight text linenos %}
- employee:
  - name:    foo
    address: "abcd 1234"
    phone:   111-1111-1111
  - name:    bar
    address: "efgh 5678"
    phone:   222-2222-2222
  - name:     buz
    address: "ijkl 90ab"
    phone:   333-3333-3333
{% endhighlight %}

### 3. テストコード作成

テスト用として以下のようなソースコードを作成。
（ループ構造になっているものも（size() で件数を取得するなどして）容易に処理できる）

File: `YamlCpp03.cpp`

{% highlight c linenos %}
/*
 * Getting yaml informations by yaml-cpp 0.3 series.
 */
#include <fstream>
#include <string>
#include "yaml-cpp/yaml.h"

using namespace std;

struct Db {
    string hostname;
    string database;
    string username;
    string password;
};

void operator >> (const YAML::Node& node, Db& db) {
    node["hostname"] >> db.hostname;
    node["database"] >> db.database;
    node["username"] >> db.username;
    node["password"] >> db.password;
}

int main(int argc, char* argv[]){
    try{
        ifstream fin("config2.yml");
        YAML::Parser parser(fin);
        YAML::Node doc;
        parser.GetNextDocument(doc);
        Db db;
        doc[0] >> db;
        cout << "* DB Setting:\n"
             << "  - HOSTNAME: " << db.hostname << "\n"
             << "  - DATABASE: " << db.database << "\n"
             << "  - USERNAME: " << db.username << "\n"
             << "  - PASSWORD: " << db.password << endl;
    } catch(YAML::ParserException& e) {
        cerr << e.what() << endl;
    }

    return 0;
}
{% endhighlight %}

* [Gist - C++ source code to get yaml informations by yaml-cpp 0.3 series.](https://gist.github.com/komasaru/65f24a68914709a6042c "Gist - C++ source code to get yaml informations by yaml-cpp 0.3 series.")

### 4. テストコードコンパイル

（-Wall は警告も出力するオプション、-O2 は最適化のオプション、-lyaml-cpp は yaml-cpp ライブラリを読み込むオプション）

``` text
# g++ -Wall -O2 -o YamlCpp YamlCpp.cpp -lyaml-cpp
```

### 5. テストコード実行

``` text
# ./YamlCpp3
* DB Setting:
  - HOSTNAME: 127.0.0.1
  - DATABASE: hoge
  - USERNAME: fuga
  - PASSWORD: foobar
```

### 6. 所感

yaml-cpp 0.5 系より 0.3 系の方が使いやすく（理解しやすく）感じた。

### 参考サイト

* [yaml-cpp – A YAML parser and emitter for C++](https://code.google.com/p/yaml-cpp/ "yaml-cpp – A YAML parser and emitter for C++")

---

これで、 CentOS 6 系でも C++ で Yaml ファイルの読み込みができるようになりました。

以上。

