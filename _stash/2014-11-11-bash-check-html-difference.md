---
layout   : single
title    : "Bash - Web サイト(HTML)差異チェックスクリプト！"
published: true
date     : 2014-11-11 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- bash
- シェル
---

Web サイトの表示内容がいつもと変わっていないかチェックするための簡単な Bash スクリプトです。

何か事象が発生した場合のみ Web サイトの表示が変更されるような場合、変更されていないかを都度手動でチェックしていては骨が折れます。  
スクリプトを作成して cron で定期的に起動させれば、後でまとめて確認もできます。

<!--more-->

### 0. 前提条件

- Linux Mint 17(64bit), CentOS 7.0(64bit) での作業を想定。
- Bash のバージョンは、4.3.11(Linux Mint), 4.2.45(CentOS) を想定。

### 1. Bash スクリプト作成

以下のような簡単な Bash スクリプトを作成。  
（１回目の起動で比較元になる HTML を取得、２回目以降保存 HTML との差異をチェック）

File: `check_html.sh`

{% highlight bash linenos %}
#!/bin/bash

# 定数定義
URL="http://www.foo.xxx/bar/baz/"  # チェックした Web サイトの URL
FILE_S="/path/to/saved.html"       # 前回取得 HTML のファイル
FILE_C="/path/to/current.html"     # 今回取得 HTML のファイル

# 当スクリプトの存在ディレクトリへ移動
cd /path/to/

# 前回取得 HTML ファイルが存在しなければ、新たに取得して終了
if [ ! -e $FILE_S ]; then
    curl -o $FILE_S $URL > /dev/null
    exit
fi

# 新規に HTML を取得
curl -o $FILE_C $URL > /dev/null

# 前回取得 HTML と今回取得 HTML を比較
diff $FILE_S $FILE_C

# ファイルに差異があれば、
# 今回取得ファイルをタイムスタンプ付きで保存
# さらに、今回取得ファイルを前回取得ファイルとして保存
if [ $? -ne 0 ]; then
    dt=`date '+%y%m%d_%H%M%S'`
    cp $FILE_C data/${dt}.html
    cp $FILE_C $FILE_S
fi
{% endhighlight %}

* [Gist - Bash script to check a difference between a saved-html and a current-html.](https://gist.github.com/komasaru/60697d7115b20c1d8c2d "Gist - Bash script to check a difference between a saved-html and a current-html.")

### 2. cron 登録

以下のように cron 登録。  
（以下は５分ごとにチェックする設定）

File: `/etc/cron.d/check_html`

{% highlight bash linenos %}
*/5 * * * * root /path/to/check_html.sh > /dev/null 2>&1
{% endhighlight %}

### 3. 動作確認

cron により定期的にチェックされ、HTML に差異があればタイムスタンプ付きのファイルが保存されることを確認する。

---

当方の場合、Web スクレイピングしようと考えた場合に、実際どのような HTML が発行される可能性があるのかを事前に調査するために使用しています。

以上。

