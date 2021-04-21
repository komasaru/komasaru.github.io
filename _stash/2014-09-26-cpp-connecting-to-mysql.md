---
layout   : single
title    : "C++ - MariaDB(MySQL) への接続！"
published: true
date     : 2014-09-26 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- C言語
- MariaDB
- MySQL
---

C++ から MariaDB(MySQL) へ接続する方法についての記録です。

（C++ にそれほど精通している訳でもありません。ご承知おきください）

<!--more-->

### 0. 前提条件

- Linux Mint 17 での作業を想定。
- libmysqlclient-dev パッケージを使用するのでインストール済みであること。
- g++(c++) のバージョンは 4.8.2
- MySQL 5.6.19 へ接続することを想定。（MariaDB も同様）
- MySQL サーバのポートはデフォルトの 3306 を想定。

### 1. C++ ソースコード作成

以下のようにソースコードを作成してみた。（最低限これだけ知っていれば大丈夫であろうという基本的なコーディング）  
他に知りたいことがあれば後述の参考サイト等で調べてみればよい。

（ちなみに、以下のソースコードでは "mysql" スキーマに存在するテーブル名を取得している）

File: `Mysql.cpp`

{% highlight c linenos %}
/*
 * Example to connect to MariaDB(MySQL)
 */
#include <iostream>
#include <mysql/mysql.h>
#include <string>

using namespace std;

/*
 * [CLASS] Process
 */
class Proc
{
    const char* MY_HOSTNAME;
    const char* MY_DATABASE;
    const char* MY_USERNAME;
    const char* MY_PASSWORD;
    const char* MY_SOCKET;
    enum {
        MY_PORT_NO = 3306,
        MY_OPT     = 0
    };
    MYSQL     *conn;
    MYSQL_RES *res;
    MYSQL_ROW row;

public:
    Proc();           // Constructor
    bool execMain();  // Main Process
};

/*
 * Proc - Constructor
 */
Proc::Proc()
{
    // Initialize constants
    MY_HOSTNAME = "localhost";
    MY_DATABASE = "mysql";
    MY_USERNAME = "root";
    MY_PASSWORD = "7621mizuiko3701";
    MY_SOCKET   = NULL;
}

/*
 * Main Process
 */
bool Proc::execMain()
{
    try {
        // Format a MySQL object
        conn = mysql_init(NULL);

        // Establish a MySQL connection
        if (!mysql_real_connect(
                conn,
                MY_HOSTNAME, MY_USERNAME,
                MY_PASSWORD, MY_DATABASE,
                MY_PORT_NO, MY_SOCKET, MY_OPT)) {
            cerr << mysql_error(conn) << endl;
            return false;
        }

        // Execute a sql statement
        if (mysql_query(conn, "SHOW TABLES")) {
            cerr << mysql_error(conn) << endl;
            return false;
        }

        // Get a result set
        res = mysql_use_result(conn);

        // Fetch a result set
        cout << "* MySQL - SHOW TABLES in `"
             << MY_DATABASE << "`" << endl;
        while ((row = mysql_fetch_row(res)) != NULL)
            cout << row[0] << endl;

        // Release memories
        mysql_free_result(res);

        // Close a MySQL connection
        mysql_close(conn);
    } catch (char *e) {
        cerr << "[EXCEPTION] " << e << endl;
        return false;
    }
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

- [Gist - C++ source code to connect to MariaDB(MySQL).](https://gist.github.com/komasaru/c9c6c03bda4629283808 "Gist - C++ source code to connect to MariaDB(MySQL).")

### 2. C++ ソースコードのコンパイル

以下のようにしてコンパイルする。

``` text
$ g++ -Wall -O2 -o Mysql Mysql.cpp -I/usr/local/mysql/include -L/usr/local/mysql/lib -lmysqlclient
```

もしくは、以下のように `mysql_config` を使用して include, lib ディレクトリのオプション文字列を取得してもよい。

``` text
$ g++ -Wall -O2 -o Mysql Mysql.cpp $(mysql_config --cflags) $(mysql_config --libs)
```

エラーが出力されなければ成功である。

### 3. 実行

実際に実行してみる。

``` text
$ ./Mysql
* MySQL - SHOW TABLES in `mysql`
columns_priv
db
event
func
general_log
help_category
help_keyword
help_relation
help_topic
innodb_index_stats
innodb_table_stats
ndb_binlog_index
plugin
proc
procs_priv
proxies_priv
servers
slave_master_info
slave_relay_log_info
slave_worker_info
slow_log
tables_priv
time_zone
time_zone_leap_second
time_zone_name
time_zone_transition
time_zone_transition_type
user
```

### 4. 参考サイト

- [MySQL :: MySQL 5.1 リファレンスマニュアル :: 23.2.3 C API機能の説明](http://dev.mysql.com/doc/refman/5.1/ja/c-api-functions.html "MySQL :: MySQL 5.1 リファレンスマニュアル :: 23.2.3 C API機能の説明")

---

　

以上。

