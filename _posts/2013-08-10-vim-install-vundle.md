---
layout   : single
title    : "Vim - Vundle インストール！"
published: true
date     : 2013-08-10 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
- Vim
---

高機能テキストエディタ Vim には、多数のプラグインが存在しますが、インストール方法がいくつかあリ混在すると管理が煩雑になってしまいます。

今回は、Vim プラグインを管理するプラグインについてです。

Vim プラグインを管理するプラグインには [Vundle](https://github.com/gmarik/vundle "Vundle"), [NeoBundle](https://github.com/Shougo/neobundle.vim "NeoBundle"), [pathogen](https://github.com/tpope/vim-pathogen "pathoten") 等色々存在しますが、今回は [Vundle](https://github.com/gmarik/vundle "Vundle") をインストールしてみました。

以下、作業記録です。

<!--more-->

#### 0. 前提条件

- Linux Mint 14 (64bit) での作業を想定。
- 作業を行う Vim は 7.3.547
- git が使用できるよう環境である。

#### 1. Vundle インストール

以下のように、`git clone` でインストールする。

``` bash 
$ git clone https://github.com/gmarik/vundle.git ~/.vim/bundle/vundle
```

#### 2. 設定ファイル編集

Vim 設定ファイル .vimrc を以下のように編集する。  
以下の例では、"tpope/vim-fugitive" という Git を管理する GitHub 上に置いてあるリポジトリをインストールするように設定している。

File: `~/.vimrc`

{% highlight vim linenos %}
" Vi との互換性を取らない（Vim の独自拡張機能を使う為）
set nocompatible
" ファイル形式の検出を無効化
filetype off

" Vundle 自身も Vundle で管理
set rtp+=~/.vim/bundle/vundle/
call vundle#rc()
Bundle 'gmarik/vundle'

" GitHub リポジトリ
Bundle 'tpope/vim-fugitive'

" GitHub vim-srcipts
"Bundle 'xxxx.vim'

" GitHub 以外のリポジトリ
"Bundle 'git://xxxx/xxxx/xxxx.git'

" ファイル形式検出、プラグイン、インデントを ON
filetype plugin indent on
{% endhighlight %}

#### 3. Vim 再起動

設定有効化のために Vim を再起動する。

#### 4. プラグインインストール

Vim コマンドモードで以下のように実行することで、".vimrc" に記載したプラグインがインストールされる。

``` bash 
:BundleInstall
```

`Done!` が表示されれば成功。

また、今後プラグインを追加する場合は、".vimrc" に `Bundle 'hoge'` のように追加後 `:BundleInstall` を行えばよい。

#### 5. プラグインアップデート

Vim にインストールしているプラグインをアップデートするには以下のようにする。

``` bash 
:BundleInstall!
```

#### 参考サイト

- [gmarik/vundle](https://github.com/gmarik/vundle "gmarik/vundle")

---

これで、Vim プラグインの管理が楽になりました。

以上。

