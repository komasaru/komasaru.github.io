---
layout   : single
title    : "Vim - インデントを把握しやすくするプラグイン！"
published: true
date     : 2014-02-10 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Vim
---

高機能テキストエディタ Vim でインデントを把握しやすくするためのプラグインが存在するようです。

今までそれほど「インデントがもっと把握しやすかったらよかったら」と気にしたことはありませんでしたが、あればそれなりに便利ではないかと思い、導入してみました。

導入したのは、 vim-indent-guides というプラグインです。

<!--more-->

### 0. 前提条件

- Linux Mint 14 での作業を想定。
- Vim のプラグインを Neobundle で管理していることを想定。（参照「[Vim - プラグイン管理を Vundle から NeoBundle へ移行！]({{site.baseurl}}/2013/08/25/vim-install-neobundle/ "Vim - プラグイン管理を Vundle から NeoBundle へ移行！")」）

### 1. Vim 設定ファイル編集

今回は NeoBundle でプラグインをインストールするので、設定ファイル ".vimrc" に以下の記述を追加する。

File: `~/.vimrc`

{% highlight text linenos %}
NeoBundle 'nathanaelkane/vim-indent-guides'
{% endhighlight %}

### 2. プラグインのインストール

Vim エディタのコマンドモードで以下のように実行する。

``` text
:NeoBundleInstall
[neobundle/install] (1/1): |vim-indent-guides| git clone --recursive https://github.com/nathanaelkane/vim-indent-guides.git "/home/masaru/.vim/bundle/vim-indent-guides"
```

もしも以下のように出力されてインストールできなかった場合は、Vim を再起動しメッセージが促されるので、そのとおりに従ってみるよい。

``` text
[neobundle/install] Target bundles not found.
[neobundle/install] You may have used the wrong bundle name, or all of the bundles are already installed.
```

### 3. インストール確認

インストールされたかプラグインの一覧を表示してみる。

``` text
:NeoBundleList
neocomplcache
gitv
neobundle.vim
vim-indent-guides
vim-fugitive
sudo.vim
```

### 4. vim-indent-guides の設定

インストールしただけでは、"vim-indent-guides" は起動しないので、自動起動するよう "~/.vimrc" で設定する。また好み合わせてカラー設定等も行う。  
以下は当方の例で、目障りにならないような色合いにしている。

File: `~/.vimrc`

{% highlight text linenos %}
" vim-indent-guides
" Vim 起動時 vim-indent-guides を自動起動
let g:indent_guides_enable_on_vim_startup=1
" ガイドをスタートするインデントの量
let g:indent_guides_start_level=2
" 自動カラー無効
let g:indent_guides_auto_colors=0
" 奇数番目のインデントの色
autocmd VimEnter,Colorscheme * :hi IndentGuidesOdd  guibg=#444433 ctermbg=black
" 偶数番目のインデントの色
autocmd VimEnter,Colorscheme * :hi IndentGuidesEven guibg=#333344 ctermbg=darkgray
" ガイドの幅
let g:indent_guides_guide_size = 1
{% endhighlight %}

ちなみに、Vim の設定で、`tabstop` と `shiftwidth` は同じ値に、 `expandtab` は有効にする必要がある。

### 5. 動作確認

Vim を再起動して、既存のソースコードを表示してみるなどする。  
以下は当方の例で、１つ目が GVim で２つ目が Vim である。

![VIM_INDENT_GUIDES_1]({{site.baseurl}}/images/2014/02/10/VIM_INDENT_GUIDES_1.png "VIM_INDENT_GUIDES_1")
![VIM_INDENT_GUIDES_2]({{site.baseurl}}/images/2014/02/10/VIM_INDENT_GUIDES_2.png "VIM_INDENT_GUIDES_2")

### 6. 参考サイト

- [nathanaelkane/vim-indent-guides](https://github.com/nathanaelkane/vim-indent-guides "nathanaelkane/vim-indent-guides")
- [Indent Guides - A plugin for visually displaying indent levels in Vim. : vim online](http://www.vim.org/scripts/script.php?script_id=3361 "Indent Guides - A plugin for visually displaying indent levels in Vim. : vim online")

---

ソースコードが縦に長くなった際にインテントを把握しやすくなるでしょう。  
（インデントにスペースではなく可視化したタブ文字を使用している場合は、あまり必要性は感じないかも知れませんね）

以上。

