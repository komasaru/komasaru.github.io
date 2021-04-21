---
layout   : single
title    : "Vim - プラグイン管理を Vundle から NeoBundle へ移行！"
published: true
date     : 2013-08-25 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
- Vim
---

以前、高機能テキストエディタ Vim のプラグイン管理のプラグイン Vundle について紹介しました。

- [Vim - Vundle インストール！ - mk-mode BLOG](http://www.mk-mode.com/octopress/2013/08/10/vim-install-vundle/ "Vim - Vundle インストール！ - mk-mode BLOG")

しかし、Vundle より新しく機能強化されている NeoBundle というプラグインもあります。（<del>作者は Vundle と同じ方</del>　Vundle と似たようなプラグインですが、作者は異なるようです。（2013/08/26 修正））

当方も今回、 Vundle から NeoBundle に移行しましたので、その際の記録を残しておきます。  
（当然、Vundle だけでなく他のプラグイン管理プラグインからの移行や、新たにプラグイン管理プラグインを導入しようという方にも参考になるかと思います）

<!--more-->

#### 0. 前提条件

- Linux Mint 14 (64bit) での作業を想定。
- 作業を行う Vim は 7.3.547
- git が使用できるよう環境である。
- Vundle がインストール済みである。
- プラグイン管理プラグインについては不勉強なので、詳細は説明しない（できない）。  
  インストール方法と最低限の設定方法についてのみ記載する。

#### 1. Vundle 関連削除

まず、Vundle でインストールしたプラグインの格納されているディレクトリ "~/.vim/bundle" を削除する。

``` bash 
$ rm -rf ~/.vim/bundle
```

#### 2. NeoBundle インストール

新たにディレクトリ "~/.vim/bundle" を作成し、そのディレクトリに NeoBundle をインストールする。

``` bash 
$ mkdir -p ~/.vim/bundle
$ git clone git://github.com/Shougo/neobundle.vim ~/.vim/bundle/neobundle.vim
```

#### 3. Vim 設定ファイル編集

Vim 設定ファイル ".vimrc" 内の Vundle 関連部分を以下のように変更する。

``` vim 
" viとの互換性をとらない（vimの独自拡張機能を使う為）
set nocompatible
" ファイル形式の検出を無効化
filetype off

if has('vim_starting')
  " neobudle.vimの関数を呼ぶためにインストールしたディレクトリを指定
  set runtimepath+=~/.vim/bundle/neobundle.vim/
endif

" NeoBundle 管理開始（プラグインインストールディレクトリを指定）
call neobundle#begin(expand('~/.vim/bundle/'))

" NeoBundle 自体を管理
NeoBundleFetch 'Shougo/neobundle.vim'

" 管理するプラグイン
NeoBundle 'Shougo/neocomplcache'
NeoBundle 'tpope/vim-fugitive'
NeoBundle 'gregsexton/gitv'
NeoBundle 'vim-scripts/sudo.vim'

" NeoBundle 管理終了
call neobundle#end()

" ファイル形式検出、プラグイン、インデントを ON
filetype plugin indent on

" インストールチェック
NeoBundleCheck
```

#### 4. プラグインインストール

Vim を再起動し、コマンドモードで以下のように実行すると、設定ファイルに記述したプラグインがインストールされる。  
（GVim だと、再帰同時にプラグインをインストールするかダイアログが表示される）

``` bash 
:NeoBundleInstall
```

#### 5. その他

よく使用するであろうコマンドは以下のとおり。（その他のコマンドは `help NeoBundle` で確認可能）

- `NeoBundleList`  
  ... インストール済みプラグイン一覧を表示。
- `NeoBundleInstall`  
  ... プラグインのインストール。引数としてプラグイン名を指定すればそのプラグインがインストールされる。
- `NeoBundleInstall!`  
  ... インストール済みのプラグインのアップデート。引数としてプラグイン名を指定すればそのプラグインがアップデートされる。
- `NeoBundleUpdate`  
  ... `NeoBundleInstall!` と同じ。

#### 参考サイト

- [Shougo/neobundle.vim](https://github.com/Shougo/neobundle.vim "Shougo/neobundle.vim")

---

Vim の各種プラグインを導入するにあたって色々なサイトを参考にした際、Vundle を使用する方法で説明しているサイトが多かったため、当方も Vundle を導入して利用していました。  
その際にプラグイン管理のプラグインについてもう少し調べていれば、とも思いました。  
しかし、そういうものもあるということが自身の知識の引き出しに蓄積されたので無駄ではなかったかとも。

以上。

