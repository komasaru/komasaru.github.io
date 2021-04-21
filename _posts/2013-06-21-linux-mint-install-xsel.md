---
layout   : single
title    : "Linux Mint - xsel でクリップボード使用！"
published: true
date     : 2013-06-21 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
- LinuxMint
- 端末
---

デフォルトのコマンドライン端末でのコピペ操作は、便利ではないもののそれほど大きな不便も感じていませんでした。  
しかし、まれに不便を感じることもあります。当方の場合、特に仮想端末ソフト tmux を使用する時です。

その不便を解消するための事前準備として、X でのクリップボード利用を便利にするコマンド `xsel` についてまとめておきました。

<!--more-->

#### 0. 前提条件

- Linux Mint 14 での作業を想定。  
  （ただし、操作方法そのものに関しては他の Unix 系 OS でも同じ。インストール方法は異なれど）

#### 1. 事前情報

X のセレクションバッファ（選択部分の格納領域）について理解しておく必要がある。  
X のセレクションバッファには以下の３種類のバッファがある。

1. PRIMARY
2. SECONDARY
3. CLIPBOARD

1 はマウスで選択して反転表示になった部分が格納されるバッファで、3 はマウスで選択して反転表示になった部分を右クリックでコピーすることで格納されるバッファ。2 は一般的なアプリでは使用しないようだ。  

#### 2. xsel インストール

`xsel` はLinux標準のコマンドではないので、別途インストールする必要がある。  
以下のようにインストールする。  
（Synaptic パッケージマネージャでインストールしてもよい。また、ソースをビルドしてインストール方法も。  
ちなみに、CentOS(Redhat 系)の yum の場合、デフォルトリポジトリに `xsel` は存在しなかった）

``` bash 
$ sudo apt-get install xsel
```

#### 3. xsel インストール確認

以下のコマンドでバージョンを表示してインストールできているか確認する。

``` bash 
$ xsel --version
xsel version 1.2.0 by Conrad Parker <conrad@vergenet.net>
```

#### 4. オプション一覧確認

`xsel` コマンドのオプション一覧を確認してみる。

``` bash 
$ xsel --help
Usage: xsel [options]
Manipulate the X selection.

By default the current selection is output and not modified if both
standard input and standard output are terminals (ttys).  Otherwise,
the current selection is output if standard output is not a terminal
(tty), and the selection is set from standard input if standard input
is not a terminal (tty). If any input or output options are given then
the program behaves only in the requested mode.

If both input and output is required then the previous selection is
output before being replaced by the contents of standard input.

Input options
  -a, --append          Append standard input to the selection
  -f, --follow          Append to selection as standard input grows
  -i, --input           Read standard input into the selection

Output options
  -o, --output          Write the selection to standard output

Action options
  -c, --clear           Clear the selection
  -d, --delete          Request that the selection be cleared and that
                        the application owning it delete its contents

Selection options
  -p, --primary         Operate on the PRIMARY selection (default)
  -s, --secondary       Operate on the SECONDARY selection
  -b, --clipboard       Operate on the CLIPBOARD selection

  -k, --keep            Do not modify the selections, but make the PRIMARY
                        and SECONDARY selections persist even after the
                        programs they were selected in exit.
  -x, --exchange        Exchange the PRIMARY and SECONDARY selections

X options
  --display displayname
                        Specify the connection to the X server
  -t ms, --selectionTimeout ms
                        Specify the timeout in milliseconds within which the
                        selection must be retrieved. A value of 0 (zero)
                        specifies no timeout (default)

Miscellaneous options
  -l, --logfile         Specify file to log errors to when detached.
  -n, --nodetach        Do not detach from the controlling terminal. Without
                        this option, xsel will fork to become a background
                        process in input, exchange and keep modes.

  -h, --help            Display this help and exit
  -v, --verbose         Print informative messages
  --version             Output version information and exit

Please report bugs to <conrad@vergenet.net>.
```

#### 5. 使用方法

端末内で選択した文字列をクリップボードに格納するには、文字列選択後に以下のコマンドを実行する。

``` bash 
$ xsel -bi
```

ファイルの中身をクリップボードに格納するには、以下のようにする。

``` bash 
$ cat hoge.txt | xsel -bi
```

クリップボードの内容を標準出力に出力するには、以下のようにする。

``` bash 
$ xsel -bo
```

`-b` を省略すると "PRIMARY" セレクションを指定したことになるになるので注意。  
また、`-b` は `--clipboard`、`-i` は `--input`、`-o` は `--output`  と置き換えてもよい。

当然、クリップボードに格納すれば、vi エディタ等へもペーストできる。

---

コマンドでクリップボードが利用できるので、便利になる局面もあるのではないでしょうか？  
ちなみに、当方は上記のコマンドを直接使用するのではなく、仮想端末ソフト `tmux` でキーバインドに組み入れて使用する予定です。

以上。

