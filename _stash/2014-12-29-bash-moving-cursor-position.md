---
layout   : single
title    : "Bash - スクリプトでカーソル位置移動！"
published: true
date     : 2014-12-29 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
---

Bash スクリプトで文字を出力する際に位置を指定したいことがあります。

terminfo データベースを使ってターミナル・セッションの初期化と操作を行うことのできる `tput` コマンドコマンドを使用することで、実現可能です。

以下、それについての備忘録です。

<!--more-->

### 0. 前提条件

* Linux Mint 17.1(64bit), CentOS 6.6, 7.0 で動作確認済み。
* Bash 4.3.11(Mint), 4.1.2(CentOS 6.6), 4.2.45(CentOS 7.0 で動作確認済み。
* `tput` コマンドの詳細については `man tput` 等を参照。

### 1. 例ー１

#### 1-1. Bash スクリプト作成

３つの例を１つのシェルファイル内に記載している。

その他の注目事項。

* `echo -n` は文字列出力後開業しない。
* `tput cub 19` はカーソル位置を19桁左に移動。
* `tput cuu 1` はカーソル位置を1行上に移動。
* `printf` での `\r` は CR(キャリッジリターン（復帰）、 `\n` は LF(ラインフィード（改行）。

File: `test_bash_cursor_1.sh`

{% highlight bash linenos %}
#!/bin/bash

# 1. 指定文字数左へ移動後に echo
#    ( 最後の echo 以外は改行しない )
#
echo -n `date +"%Y-%m-%d %H:%M:%S"`
for i in {0..4};
do
  sleep 1
  tput cub 19
  echo -n `date +"%Y-%m-%d %H:%M:%S"`
done;
tput cub 19
echo `date +"%Y-%m-%d %H:%M:%S"`
echo "-------------------"

# 2. 指定行数上へ移動後に echo
#    ( 毎回改行 )
#
echo `date +"%Y-%m-%d %H:%M:%S"`
for i in {0..4};
do
  sleep 1
  tput cuu 1
  echo `date +"%Y-%m-%d %H:%M:%S"`
done;
tput cuu 1
echo `date +"%Y-%m-%d %H:%M:%S"`
echo "-------------------"

# 3. 行の先頭へ復帰(CR(\r))後 printf
#    ( 最後の echo 以外は改行しない )
#
printf "%10s %8s" `date +"%Y-%m-%d %H:%M:%S"`
for i in {0..4};
do
  sleep 1
  printf "\r%10s %8s" `date +"%Y-%m-%d %H:%M:%S"`
done;
printf "\n"
{% endhighlight %}

* [Gist - Bash script to control cursor position.(Ex.1)](https://gist.github.com/komasaru/ef25eb2a1d6fa57146f6 "Gist - Bash script to control cursor position.")

#### 1-2. Bash スクリプト実行

３種類とも、改行されずに日時が出力される。

``` text
$ ./test_bash_cursor_1.sh
2014-12-14 00:46:37
-------------------
2014-12-14 00:46:42
-------------------
2014-12-14 00:46:47
```

### 2. 例ー２

#### 2-1. Bash スクリプト作成

スクリーンをクリア後、枠を作成してその中に日時を出力する例。

その他の注目事項。

* `tput clear` で画面クリア。
* `tput setb 1` で背景色を青に設定。
* `tput setf 6` で文字色を黄に設定。
* `tput bold` でフォントを太字に設定。
* `tput cup 2 4` でカーソルを３行目・５桁目に移動。
* `tput cud 2` でカーソルを３行下に移動。
* `tput init` で設定を初期化。

File: `test_bash_cursor_2.sh`

{% highlight bash linenos %}
#!/bin/bash

# Clear the screen
tput clear

# Write a frame
echo
echo "  +---------------------+"
echo "  |                     |"
echo "  +---------------------+"
echo

# Set font
tput setb 1
tput setf 6
tput bold

# Output date and time
for i in {0..4};
do
  sleep 1
  tput cup 2 4
  echo -n `date +"%Y-%m-%d %H:%M:%S"`
done;
tput cup 2 4
echo -n `date +"%Y-%m-%d %H:%M:%S"`

# Move the cursor position
tput cud 2
echo

# Reset tput setting
tput init
{% endhighlight %}

* [Gist - Bash script to control cursor position.(Ex.2)](https://gist.github.com/komasaru/789216cf9cf5e1aa339c "Gist - Bash script to control cursor position.")

#### 2-2. Bash スクリプト実行

画面クリア後に枠が出力され、その中に色付き太字で日時が表示される。（以下はハードコピーではないので、色付きでも太字でもない）

``` text

  +---------------------+
  | 2014-12-14 00:49:26 |
  +---------------------+

```

### 3. 参考サイト

* [9 UNIX / Linux tput Examples: Control Your Terminal Color and Cursor](http://www.thegeekstuff.com/2011/01/tput-command-examples/ "9 UNIX / Linux tput Examples: Control Your Terminal Color and Cursor")

---

いつか必要になることがあるかも知れない Tips でした。

以上。

