---
layout   : single
title    : "C++ - yaml-cpp で YAML をパース！"
published: true
date     : 2014-10-14 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- C言語
---

C++ で YAML ファイルの内容を解析する方法についての記録です。  
（YAML の詳細についてはここでは説明しませんが、簡単に言えばテキストの設定ファイルだと思っていればよい）

（C++ にそれほど精通している訳でもありません。ご承知おきください）

<!--more-->

### 0. 前提条件

* Linux Mint 17(64bit) での作業を想定。（CentOS 等でも同様）
* yaml-cpp はソースをビルドしてインストールする。
* ビルドに必要な cmake がインストール済みであること。
* libboost-dev がインストール済みであること。（CentOS なら boost-devel）

### 1. アーカイブ取得＆展開

``` text
$ wget https://yaml-cpp.googlecode.com/files/yaml-cpp-0.5.1.tar.gz
$ tar zxvf yaml-cpp-0.5.1.tar.gz
```

### 2. ビルド

ビルド用ディレクトリを作成して作業。

``` text
$ cd yaml-cpp-0.5.1
$ mkdir build
$ cd build
$ cmake ..
$ make
$ sudo make install
```

ビルドに成功すると、"/usr/local/lib/" ディレクトリにライブラリファイル "libyaml-cpp.a" が配置される。さらに、"/usr/local/include/yaml-cpp/" というディレクトリも作成され各種ヘッダファイルが配置される。

### 3. YAML ファイル作成

テスト用として以下のような（１段入れ子になった） YAML ファイル "config.yml" を作成。

File: `config.yml`

{% highlight bash linenos %}
db:
  hostname: 127.0.0.1
  database: hoge
  username: fuga
  password: foobar
{% endhighlight %}

ちなみに、ループ構造にするなら以下のようにすればよい。（設定値の間にスペースがある場合はダブルクォーテーションで括る）

File: `config.yml`

{% highlight bash linenos %}
employee:
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

### 4. テストコード作成

テスト用として以下のようなソースコードを作成。  
（ループ構造になっているものも（`size()` で件数を取得するなどして）容易に処理できる）

File: `YamlCpp.cpp`

{% highlight c linenos %}
/**
 * Get yaml informations by yaml-cpp.
 */
#include "string"
#include "yaml-cpp/yaml.h"

using namespace std;

int main(int argc, char* argv[]){
  try{
    YAML::Node config = YAML::LoadFile("config.yml");
    string hostname = config["db"]["hostname"].as<string>();
    string database = config["db"]["database"].as<string>();
    string username = config["db"]["username"].as<string>();
    string password = config["db"]["password"].as<string>();
    cout << "* DB Setting:\n"
         << "  - HOSTNAME: " << hostname << "\n"
         << "  - DATABASE: " << database << "\n"
         << "  - USERNAME: " << username << "\n"
         << "  - PASSWORD: " << password << endl;
  }
  catch(YAML::Exception& e) {
      cerr << e.what() << endl;
  }
  return 0;
}
{% endhighlight %}

* [Gist - C++ source code to get yaml informations by yaml-cpp.](https://gist.github.com/komasaru/6972caa0f09cd39f1b1a "Gist - C++ source code to get yaml informations by yaml-cpp.")

### 5. テストコードコンパイル

（`-Wall` は警告も出力するオプション、`-O2` は最適化のオプション、`-lyaml-cpp` は yaml-cpp ライブラリを読み込むオプション）

``` text
$ g++ -Wall -O2 -o YamlCpp YamlCpp.cpp -lyaml-cpp
```

### 6. テストコード実行

``` text
$ ./YamlCpp
* DB Setting:
  - HOSTNAME: 127.0.0.1
  - DATABASE: hoge
  - USERNAME: fuga
  - PASSWORD: foobar
```

### 参考サイト

* [yaml-cpp - A YAML parser and emitter for C++](https://code.google.com/p/yaml-cpp/ "yaml-cpp - A YAML parser and emitter for C++")

---

ソースコード内に直接記入せず、外部のテキストファイルに記入してフレキシブルに変更できるのがメリットになるかと思います。  
当方も実際にフレキシブルに変更したい設定などに使用しています。

以上。

