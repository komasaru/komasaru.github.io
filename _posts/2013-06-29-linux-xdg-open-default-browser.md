---
layout   : single
title    : "Linux - xdg-open で既定のブラウザが起動しない場合！"
published: true
date     : 2013-06-29 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
- LinuxMint
---

Linux でコマンド実行で Web ブラウザを起動させようと、`xdg-open` コマンド（実際はシェルスクリプト）に URL を引数として実行しても、既定のブラウザで起動しないことがあります。

ブラウザの設定や OS の「お気に入りのアプリ」設定等でも、既定のブラウザは希望のものに設定されていても。

以下、原因と対策についての記録です。

<!--more-->

#### 0. 前提条件

- Linux Mint 14 (64bit)での作業を想定。  
  （他の GNU 系や Redhat 系ディストリビューションも同様。GNU 系 Redhat 系以外は不明）
- ブラウザに関することなので、当然デスクトップ環境が利用できること。
- ブラウザが複数インストールされている。  
  （今回は、"Firefox" と "Google Chrome" がインストール済みで、"Firefox" を既定のブラウザに設定済み）

#### 1. 現象

まず、"Firefox" が「既定のブラウザ」に設定されていて、

![DEFAULT_BROWSER_1]({{site.baseurl}}/images/2013/06/29/DEFAULT_BROWSER_1.png "DEFAULT_BROWSER_1")

「お気に入りのアプリ」の設定でも "Firefox" がデフォルトに設定されている。

![DEFAULT_BROWSER_2]({{site.baseurl}}/images/2013/06/29/DEFAULT_BROWSER_2.png "DEFAULT_BROWSER_2")

それにも関わらず、 `xdg-open` コマンドで以下のように実行すると、

``` bash 
$ xdg-open http://www.mk-mode.com/
```

「既定のブラウザ」に設定していない "Google Chrome" で開いてしまう。

もちろん、普段は「既定のブラウザ」設定は正常に機能していて、`xdg-open` コマンド実行時だけこの現象に陥る。

#### 2. 原因

表面上は「既定のブラウザ」に設定されているように見えても、`update-alternative` コマンドで確認すると異なっている。  
「既定のブラウザ」に設定していない "Google Chrome" に `*` が付いて有効になっていることが原因のようだ。

``` bash 
$ sudo update-alternatives --config x-www-browser
[sudo] password for masaru:
alternative x-www-browser (/usr/bin/x-www-browser を提供) には 2 個の選択肢があります。

  選択肢    パス                  優先度  状態
------------------------------------------------------------
* 0            /usr/bin/google-chrome   200       自動モード
  1            /usr/bin/firefox         40        手動モード
  2            /usr/bin/google-chrome   200       手動モード

現在の選択 [*] を保持するには Enter、さもなければ選択肢の番号のキーを押してください: 
```

#### 3. 対策

「既定のブラウザ」に設定したいブラウザの選択肢番号を入力すればよい。

``` bash 
$ sudo update-alternatives --config x-www-browser
alternative x-www-browser (/usr/bin/x-www-browser を提供) には 2 個の選択肢があります。

  選択肢    パス                  優先度  状態
------------------------------------------------------------
* 0            /usr/bin/google-chrome   200       自動モード
  1            /usr/bin/firefox         40        手動モード
  2            /usr/bin/google-chrome   200       手動モード

現在の選択 [*] を保持するには Enter、さもなければ選択肢の番号のキーを押してください: 1
update-alternatives: using /usr/bin/firefox to provide /usr/bin/x-www-browser (x-www-browser) in 手動モード
```

再度確認すると、"Firefox" の番号に `*` が付いて有効になった。

``` bash 
$ sudo update-alternatives --config x-www-browser
alternative x-www-browser (/usr/bin/x-www-browser を提供) には 2 個の選択肢があります。

  選択肢    パス                  優先度  状態
------------------------------------------------------------
  0            /usr/bin/google-chrome   200       自動モード
* 1            /usr/bin/firefox         40        手動モード
  2            /usr/bin/google-chrome   200       手動モード

現在の選択 [*] を保持するには Enter、さもなければ選択肢の番号のキーを押してください:
```

実際に以下のコマンドを実行して "Firefox" でページが開けばOK.

``` bash 
$ xdg-open http://www.mk-mode.com/
```

#### 4. その他

`update-alternatives` コマンドは、Oracle Java と Open JDK の共存時にも使用している。  
以下、参考までに過去記事。

- [* Linux Mint - Oracle Java Development Kit インストール！](http://www.mk-mode.com/octopress/2012/11/08/08002058/ "* Linux Mint - Oracle Java Development Kit インストール！")

---

GUI と CUI で設定が異なることがあるんだね。という話でした。

以上。

