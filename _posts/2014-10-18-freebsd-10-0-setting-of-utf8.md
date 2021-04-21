---
layout   : single
title    : "FreeBSD 10.0 - UTF-8 化！"
published: true
date     : 2014-10-18 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- FreeBSD
---

「FreeBSD 10.0 - UTF-8 化」についての記録です。

（旧バージョンでの個人の作業記録を更新しました。興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* インストール作業時に SSH サーバをインストールを行っている。
* 以下の作業は、リモート接続して行う。（リモートから `ssh vbox` で接続）
* リモート端末は、 Linux Mint 17 マシンを想定しているが、 Unix 系 OS なら同じ。
* 設定ファイル等のテキストファイルの編集には `vi` コマンドを使用。
* 作業はリモート接続で一般ユーザから root になって行う。
* 主に[FreeBSDサーバー構築マニュアル](http://freebsd.server-manual.com/ "FreeBSDサーバー構築マニュアル")を参照。

### 1. 設定ファイル編集

設定ファイルを編集する。

File: `/etc/login.conf`

{% highlight bash linenos %}

#russian|Russian Users Accounts:\
japanese|Japanese Users Accounts:\  # <= 変更

    #:charset=KOI8-R:\
    :charset=UTF-8:\                # <= 変更

    #:lang=ru_RU.KOI8-R:\
    :lang=ja_JP.UTF-8:\             # <= 変更
{% endhighlight %}

そして、 DB のハッシュ化。

``` text
# cap_mkdb /etc/login.conf
```

### 2. Vim インストール

まず、 Vim をインストール。

``` text
# cd /usr/ports/editors/vim
# make BATCH=yes NO_GUI=yes install clean
# rehash
# cd
```

".cshrc" を編集。

File: `~/.cshrc`

{% highlight bash linenos %}
alias h      history 25
alias j      jobs -l
alias la     ls -a
alias lf     ls -FA
alias ll     ls -lA
alias vi     vim     # <= 追加（エイリアスの設定）

#setenv  EDITOR vi
setenv  EDITOR vim   # <= 変更（標準エディタを Vim に変更）
{% endhighlight %}

".cshrc" の即時反映。

``` text
# source ~/.cshrc
```

そして、 ".vimrc" の編集。

```bash  ~/.vimrc
set encoding=utf-8  # <= 追加
```

### 3. 日本語マニュアル導入

まず、日本語マニュアルをインストール。

``` text
# cd /usr/ports/japanese/man
# make BATCH=yes install clean
# cd /usr/ports/japanese/man-doc
# make BATCH=yes install clean
# cd /usr/ports/misc/lv
# make BATCH=yes install clean
# cd
```

".cshrc" を編集。

File: `~/.cshrc`

{% highlight bash linenos %}
alias h      history 25
alias j      jobs -l
alias la     ls -a
alias lf     ls -FA
alias ll     ls -lA
alias vi     vim
alias man    'env LC_CTYPE=ja_JP.eucJP jman'  # <= 追加

#setenv  PAGER  more
setenv  PAGER  lv                             # <= 変更

setenv  LV     '-Ou8'                         # <= 追加
{% endhighlight %}

".cshrc" の即時反映。

``` text
# source ~/.cshrc
```

"manpath.config" を編集。

File: `/etc/manpath.config`

{% highlight bash linenos %}
MANPATH_MAP /bin /usr/share/man              # <= 追加
MANPATH_MAP /usr/bin /usr/share/man          # <= 追加
MANPATH_MAP /usr/bin /usr/share/openssl/man  # <= 追加
MANPATH_MAP /usr/local/bin /usr/local/man    # <= 追加
{% endhighlight %}

日本語マニュアルの確認。

``` text
# man man
MAN(1)                  FreeBSD 一般コマンドマニュアル                  MAN(1)

名称
     man - オンラインマニュアルのフォーマット、表示を行なう

書式
     man [-adfhkotw] [-m machine] [-p string] [-M path] [-P pager] [-S list]
         [section] name ...

解説
     man はオンラインマニュアルをフォーマットし、表示します。このバージョンで
     は、環境変数 MANPATH と PAGER を参照するので、各ユーザが固有のオンライン
     マニュアルを持つ事や、画面で見る際のページャを選ぶ事が可能です。セクショ
     ンを指定した場合、 man はそのセクションのみを探します。また、コマンドライ
     ンオプションや環境変数によって、検索するセクションの順序や、ソースファイ
     ルを処理するプリプロセッサを指定することもできます。システム管理者の設定
     によっては、ディスクスペースを節約するために、フォーマット済みのオンライ
     ンマニュアルを `/usr/bin/gzip -c' コマンドにより圧縮し格納するようにする
     ことも出来ます。

     オプションを以下に示します:

(stdin):
```

（終了は、 [SPACE] キー or "q" キー）

---

以上。

