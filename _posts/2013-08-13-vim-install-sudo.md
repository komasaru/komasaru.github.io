---
layout   : single
title    : "Vim - プラグイン sudo.vim のインストール！"
published: true
date     : 2013-08-13 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
- Vim
---

Vim を使用していて、root 権限のないファイルを `sudo vim` （vim を vi に alias している場合は `sudo vi`）で開く際に以下のようなメッセージが出力されることがあります。（補完プラグイン neocomplcache をインストールしている場合）

``` bash 
$ sudo vi /etc/my.cnf
neocomplcache disabled: "sudo vim" is detected and $HOME is set to your user's home. 
You may want to use the sudo.vim plugin, the "-H" option with "sudo" or 
set always_set_home in /etc/sudoers instead.
続けるにはENTERを押すかコマンドを入力してください
```

また、逆、すなわち root 権限のあるファイルを `sudo` せずに（一般ユーザで）開いた場合は、「読込専用」でファイルが開きます。

"sudo.vim" という Vim プラグインを使用すれば、このような場合に便利になるようです。

以下、"sudo.vim" 導入と導入前の調査についての記録です。

<!--more-->

#### 0. 前提条件

- Linux Mint 14 (64bit) での作業を想定。
- Vim 7.3.547 での作業を想定。
- Vim 補完プラグイン neocomplcache 導入済み。

#### 1. 調査・その１

まず、root 権限のないファイルを開く際に出力される冒頭で紹介のメッセージの意味について。

1. neocomplcache が無効になっている。
2. `sudo vim` が検出され、 `$HOME` が自分のホームディレクトリに設定されている。
3. "sudo.vim" プラグインを使用した方がよい。
4. もしくは、`sudo -H vim` でファイルを開いた方がよい。
5. もしくは、"/etc/sudoers" に `always_set_home` を設定した方がよい。

1 と 2 は、neocomplcache という補完プラグインは root 権限では有効になっていないと言っている。確かに、そのプラグインの設定は一般ユーザの設定ファイル ".vimrc" で有効化の設定を行なっている。

4 のようにしてファイルを開くと、ファイルは開くが ".vimrc" の設定が引き継がれない。

5 のように "/etc/sudoers" に `Defaults always_set_home` の記述を追加してファイルを開くと、4 と同様に ".vimrc" の設定が引き継がれない。

3 のように "sudo.vim" というプラグインを導入したほうが良さそうだ。

#### 2. 調査・その２

次に、root 権限のあるファイルを一般ユーザで開いて「読込専用」となってしまった場合、すぐに気づいて `sudo` を付与して開き直せば何ら問題はない。

しかし、気付かずにファイルを編集してしまい、最後に保存する時になって初めて保存できないことに気付くことがある。

そのような場合には、以下のようにすれば root 権限で保存できる。

``` bash 
:w !sudo tee %
```

- `:w` ... Vim の書き込みコマンド。
- `!` ... Vim で外部プログラム・コマンドを実行するための記号。
- `tee` ... 標準入力から読んだ内容を標準出力・ファイルに出力するコマンド。
- `%` ... 編集中のファイルそのもの。

つまり、「編集中のファイルの書き込み内容を root 権限で自分自身に出力し直して保存する」ということ。

ちなみに、これだと保存時にファイルの内容が表示されてしまう。以下のようにすれば、保存時の内容表示はされなくなる。

``` bash 
:w !sudo tee >/dev/null %
```

#### 3. sudo.vim インストール

上記の調査その１・その２の結果から、"sudo.vim" プラグインを使用すると、便利になるようだ。

インストールは、「[sudo.vim - Allows one to edit a file with prevledges from an unprivledged session. : vim online](http://www.vim.org/scripts/script.php?script_id=729 "sudo.vim - Allows one to edit a file with prevledges from an unprivledged session. : vim online")」からスクリプトをダウンロードして、"~/.vim/plugin" に配置する。

もしくは、Vundle を導入しているのなら、"~/.vimrc" に以下を追記して `:BundleInstall` すれば、"~/.vim/bundle" にインストールされる。（他の Vim プラグイン管理プラグインを使用している場合もある程度同様に）

``` vim 
Bundle 'vim-scripts/sudo.vim'
```

#### 4. sudo.vim 使い方

一般ユーザで開いてしまった root 権限のあるファイルを、root 権限で「上書き」保存するには以下のようにする。

``` bash 
:w sudo:%
```

一般ユーザで開いてしまった root 権限のあるファイルを、root 権限で「別名」保存するには以下のようにする。

``` bash 
:w sudo:<filename>
```

一般ユーザで開いてしまった root 権限のあるファイルを、root 権限で開き直すには以下のようにする。

``` bash 
:e sudo:%
```

#### 5. その他

"sudo.vim" をインストールしても、冒頭で紹介したメッセージ（root 権限のないファイルを `sudo vim` で開く際に表示される neocomplcache 関連のメッセージ）は出力されてしまう。

原因の "neocomplcache.vim" を編集すれば、メッセージ出力は抑制させることができるようだが。。。

あくまでも「root 権限では補完機能は効きませんよ（そういう設定になっていませんよ）」という警告だということで、割りきることにする。

#### 参考サイト

- [sudo.vim - Allows one to edit a file with prevledges from an unprivledged session. : vim online](http://www.vim.org/scripts/script.php?script_id=729 "sudo.vim - Allows one to edit a file with prevledges from an unprivledged session. : vim online")
- [vim-scripts/sudo.vim](https://github.com/vim-scripts/sudo.vim "vim-scripts/sudo.vim")

---

Vim はプラグインを導入すれば、何かと作業が便利になり重宝しますが、やはり調整が必要になる部分も発生してきます。

以上。

