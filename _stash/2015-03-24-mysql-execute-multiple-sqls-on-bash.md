---
layout   : single
title    : "MariaDB(MySQL) - シェル(Bash)スクリプトで複数 SQL 実行！"
published: true
date     : 2015-03-24 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- MariaDB
- MySQL
- シェル
- bash
---
こんにちは。

シェルスクリプト（今回は Bash）内で MariaDB(MySQL) の SQL を実行する際、 `-e` or `--execute` オプションを使用することが多いと思います。

しかし、複数の SQL（特にトランザクション処理）を実行する際、このオプションではワンライナーにするしかありません。

別ファイルにした SQL を取り込むことも可能ですが、それだと Bash の引数が渡せません。

以下、Bash スクリプト内でワンライナーにせず、ヒアドキュメントを使用して複数 SQL を実行する例です。（Bash 引数渡しも可）

<!--more-->

### 0. 前提条件

* Bash スクリプトを想定。

### 1. Bash スクリプト

以下のような Bash スクリプトを作成する。  
ヒアドキュメント内に Bash 引数が渡せる。また、トランザクションも効く。

File: `tesh.sh`

{% highlight bash linenos %}
DB=test_db
USER=foo
PW=xxxx
TBL1=test_tbl_1
TBL2=test_tbl_2
TBL3=test_tbl_3

mysql -u $USER -p$PW $DB <<EOS
START TRANSACTION;

UPDATE $TBL1 SET col = 'aaaa' WHERE id = 1;
UPDATE $TBL2 SET col = 'bbbb' WHERE id = 2;
UPDATE $TBL3 SET col = 'cccc' WHERE id = 3;

COMMIT;
EOS
{% endhighlight %}

MariaDB(MySQL) のバージョンによっては、`mysql` コマンドで直接パスワードを指定すると Bash スクリプト実行時にセキュリティに関する警告が出るかも知れませんが問題ありません。

---

Bash スクリプトのみで複数の SQL 文を実行したい場合に役立つと思います。

以上。

