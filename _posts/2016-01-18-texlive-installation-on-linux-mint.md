---
layout   : single
title    : "Linux Mint - TeX Live 2015 インストール！"
published: true
date     : 2016-01-18 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- TeX
---

以前、組版処理ソフトの$$\TeX Live 2015$$ を CentOS にインストールする方法については記事にしました。

* [CentOS - TeX Live 2012 インストール！ - mk-mode BLOG]({{site.baseurl}}/2012/09/15/15002016/ "CentOS - TeX Live 2012 インストール！ - mk-mode BLOG")

今回は、Linux Mint へインストールする方法についてです。（実際のところ、ほぼ同じですが）

<!--more-->

### 0. 前提条件

* Linux Mint 17.2(64bit) での作業を想定。
* パッケージ管理システムを使用したインストールではなく、アーカイブを取得してのインストール。（パッケージ管理システムを使用したインストールがうまく行かなかったため）

### 1. アーカイブの取得

アーカイブファイルを取得して展開する。

``` text
$ wget http://ftp.jaist.ac.jp/pub/CTAN/systems/texlive/tlnet/install-tl-unx.tar.gz
$ tar zxvf install-tl-unx.tar.gz
```

### 2. インストールの開始

ディレクトリを移動後、[ミラーサイト一覧](https://oku.edu.mie-u.ac.jp/~okumura/texwiki/?TeX%20Live#tlnet "ミラーサイト一覧")から接続先を選んでインストールを開始する。（途中の問いには `I` で応答）

``` text
$ cd install-tl-*/
$ sudo ./install-tl --repository http://ftp.jaist.ac.jp/pub/CTAN/systems/texlive/tlnet/

====< 途中省略 >====

Actions:
 <I> start installation to hard disk
 <H> help
 <Q> quit

Enter command: I

====< 途中省略 >====

```

サーバの接続エラーが発生する場合は[接続先](https://oku.edu.mie-u.ac.jp/~okumura/texwiki/?TeX%20Live#tlnet "ミラーサイト一覧")を変更してみる。

### 3. 環境変数 PATH の設定

環境変数 PATH を設定する。（当方は `~/.bashrc` を編集）

File: `~/.bashrc`

{% highlight bash linenos %}
PATH="/usr/local/texlive/2015/bin/x86_64-linux:$PATH"
MANPATH="/usr/local/texlive/2015/texmf-dist/doc/man:$MANPATH"
{% endhighlight %}

そして、即時反映。

``` text
$ source ~/.bashrc
```

### 4. TeX Live インストールの確認

`tex` や `platex` 等のバージョンを確認してみる。

``` text
$ tex --version
TeX 3.14159265 (TeX Live 2015)
kpathsea version 6.2.1
Copyright 2015 D.E. Knuth.
There is NO warranty.  Redistribution of this software is
covered by the terms of both the TeX copyright and
the Lesser GNU General Public License.
For more information about these matters, see the file
named COPYING and the TeX source.
Primary author of TeX: D.E. Knuth.

$ platex --version
e-pTeX 3.14159265-p3.6-141210-2.6 (utf8.euc) (TeX Live 2015)
kpathsea version 6.2.1
ptexenc version 1.3.3
Copyright 2015 D.E. Knuth.
There is NO warranty.  Redistribution of this software is
covered by the terms of both the e-pTeX copyright and
the Lesser GNU General Public License.
For more information about these matters, see the file
named COPYING and the e-pTeX source.
Primary author of e-pTeX: Peter Breitenlohner.
```

### 5. 動作確認用 tex ファイルの作成

File: `test.tex`

{% highlight text linenos %}
\documentclass[14pt,a4j]{jsarticle}
%--余白の設定 ( A4サイズ: 290 * 210 ) の半分
\setlength{\voffset}{10mm}               %用紙上部の余白
\addtolength{\voffset}{-1in}             %はじめからある余白を消す
\setlength{\hoffset}{15mm}               %用紙左部の余白
\addtolength{\hoffset}{-1in}             %はじめからある余白を消す
\setlength{\topmargin}{0mm}              %上部余白からヘッダーまでの長さ
\setlength{\oddsidemargin}{0mm}          %左部余白から本文までの長さ
\setlength{\headheight}{0mm}             %ヘッダーの高さ
\setlength{\headsep}{0mm}                %ヘッダーから本文までの長さ
\setlength{\textheight}{29\baselineskip} %本文の高さ
\setlength{\textwidth}{270pt}            %本文の幅
\setlength{\marginparwidth}{0mm}         %注釈の幅
\setlength{\topskip}{0mm}                %本文の上部から一行目までの長さ
\setlength{\baselineskip}{11pt}          %行の高さ
%--PageStyle設定
\pagestyle{empty}

\begin{document}

\noindent
\section*{標準偏差}
【不偏分散】
\begin{eqnarray*}
単純移動平均 \ \ \overline{x} & = & \frac{1}{n}{\displaystyle\sum_{i=0}^{n-1} x_{i}}\\
標準偏差 \ \ \sigma & = & \sqrt{ \frac{1}{n-1}{\displaystyle\sum_{i=0}^{n-1} \left( x_{i} - \overline{x} \right)^{2}} } \\
& = & \sqrt{ \frac{1}{n\left(n-1\right)}\Biggl\{n\displaystyle\sum_{i=0}^{n-1}x_{i}^{2} - \left( \displaystyle\sum_{i=0}^{n-1}x_{i} \right)^{2}\Biggl\} }
\end{eqnarray*}\par
【標本分散】
\begin{eqnarray*}
単純移動平均 \ \ \overline{x} & = & \frac{1}{n}{\displaystyle\sum_{i=0}^{n-1} x_{i}}\\
標準偏差 \ \ \sigma & = & \sqrt{ \frac{1}{n}{\displaystyle\sum_{i=0}^{n-1} \left( x_{i} - \overline{x} \right)^{2}} } \\
& = & \sqrt{ \frac{1}{n^{2}}\Biggl\{n\displaystyle\sum_{i=0}^{n-1}x_{i}^{2} - \left( \displaystyle\sum_{i=0}^{n-1}x_{i} \right)^{2}\Biggl\} }
\end{eqnarray*}

\end{document}
{% endhighlight %}

### 6. PDF の作成

以下のようにして、PDF ファイル作成まで実行する。  
"test.tex" に間違いがなければ `platex` コマンドで "test.dvi" ファイルが作成され、`dvipdfmx` コマンドで "test.pdf" が作成されるはずです。

``` text
$ platex test.tex
This is e-pTeX, Version 3.14159265-p3.6-141210-2.6 (utf8.euc) (TeX Live 2015) (preloaded format=platex)
 restricted \write18 enabled.
entering extended mode
(./test.tex
pLaTeX2e <2006/11/10> (based on LaTeX2e <2015/10/01> patch level 2)
Babel <3.9m> and hyphenation patterns for 79 languages loaded.
(/usr/local/texlive/2015/texmf-dist/tex/platex/jsclasses/jsarticle.cls
Document Class: jsarticle 2014/02/07 okumura
) (./test.aux) [1] (./test.aux) )
Output written on test.dvi (1 page, 2304 bytes).
Transcript written on test.log.

$ dvipdfmx test.dvi
test.dvi -> test.pdf
[1]
8137 bytes written
```

### 7. PDF の確認

作成された PDF ファイルを確認してみる。（以下は公開の都合上 PNG 画像として切り取ったもの）

![TEXLIVE_2015_TEST]({{site.baseurl}}/images/2016/01/18/TEXLIVE_2015_TEST.png "TEXLIVE_2015_TEST")

### 8. その他

GUI ツールの $$\TeX Works$$ を導入するとより扱いやすいでしょう。

### 9. 参考サイト

* [Linux - TeX Wiki](https://oku.edu.mie-u.ac.jp/~okumura/texwiki/?Linux#texlive "Linux - TeX Wiki")

---

以上。

