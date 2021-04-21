---
layout   : single
title    : "Linux Mint - tmux インストール！"
published: true
date     : 2013-06-05 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
- LinuxMint
- 端末
- tmux
---

当方、Linux Mint では今まで標準の「GNOME端末」ではなく、"Terminator" という画面分割等の可能な端末ソフトを使用していました。

今回、何かと便利そうな仮想端末管理ソフト [tmux(Terminal MUltipleXer)](http://tmux.github.io/ "tmux") を導入してみました。

同様のソフトで、"GNU Screen" というものもあります（使用したことありません）が、色々調べてみると "tmux" の方が良さそうに感じました。（"GNU Screen" から "tmux" へ移行している方々が多かったので。）

<!--more-->

#### 0. 前提条件

- Linux Mint 14 (64bit) での作業を想定。（Unix 系なら同じだと思う）
- パッケージインストールする。
- インストールする tmux のバージョンは 1.6

#### 1. インストール

`apt-get` でインストールする。（"Synaptic パッケージマージャ" でもよい）

``` text 
$ sudo apt-get install tmux
```

#### 2. インストール確認

インストールされているかバージョンを表示して確認してみる。

``` text 
$ tmux -V
tmux 1.6
```

#### 3. 設定

デフォルトでも使用可能だが、若干殺風景なのでデザインをカスタマイズしたり、キーバインド等の設定を行う。  
設定ファイルは ".tmux.conf" で、作成場所はユーザホームディレクトリ。  
以下は当方の例で、

- プリフィックスをデフォルトの `CTRL-b` から `CTRL-t` に変更、
- 設定ファイル変更後、プリフィックス + `r` で即設定反映、
- vi のキーマップを使用、
- マウスでタブやペインを選択できるように、
- マウスでスクロールバックできるように、
- プリフィックス + `H` で表示履歴をファイル出力開始、プリフィックス + `h` でファイル出力停止、  
  （出力ファイルのフォーマットは "tmux-{Session番号}-{Tag番号}-{Pane番号}_YYmmdd_HHMMSS`_{Window名}.log" とした）

等行うように設定している。

File: `~/.tmux.conf`

{% highlight bash linenos %}
# ==== Basic
# Default shell
set-option -g default-shell /bin/bash
set-option -g default-command /bin/bash  # <= .bashrc を引き継ぐために必要
# Allow UTF-8
set-window-option -g utf8 on
# Disable ESC delay
set-option -s escape-time 0

# ==== Reload config (r)
bind-key r source-file ~/.tmux.conf; display-message "Reload Config!!"

# ==== Key mappings
# Vi binding
set-window-option -g mode-keys vi
# Prefix (^T)
unbind C-b
set-option -g prefix ^T

# ==== Color setting
# Enable 256 color
set-option -g default-terminal "screen-256color"
# Status line
set-option -g status-fg white
set-option -g status-bg black
# Pane border
set-option -g pane-border-fg colour245
set-option -g pane-active-border-fg colour39

# ==== Title of terminal
set-option -g set-titles on
set-option -g set-titles-string "tmux.#I.#W"

# ==== Status line
# Update interval
set-option -g status-interval 5
# Left
set-option -g status-left-length 30
set-option -g status-left '#[fg=yellow]#h[#S:#I.#P] #[default]'
# main
set-option -g window-status-format "[#I #W #F]"
set-option -g window-status-current-format "#[fg=white,bg=green][#I #W #F]#[default]"
# Right
set-option -g status-right-length 150
set-option -g status-right '#[fg=white,bg=blue,bold]%Y/%m/%d(%a) %H:%M#[default]'

# ==== Pane active border
set-option -g pane-active-border-fg black
set-option -g pane-active-border-bg blue

# ==== Log output
bind-key H pipe-pane -o 'cat >> $HOME/.tmux/tmux-#S-#I-#P_`date +%Y%m%d_%H%M%S`_#W.log' \; display-message 'Started logging to $HOME/.tmux/tmux-#S-#I-#P_`date +%Y%m%d_%H%M%S`_#W.log'
bind-key h pipe-pane \; display-message 'Ended logging to $HOME/.tmux/tmux-#S-#I-#P_`date +%Y%m%d_%H%M%S`_#W.log'

# ==== Mouse
set-option -g mode-mouse on
set-option -g mouse-select-pane on
set-option -g mouse-select-window on
set-option -g mouse-resize-pane on

# ==== Scroll back
#set-option -g history-limit 10000  # default:2000
{% endhighlight %}

今後実際に tmux を使用してみて、さらに設定を変更する可能性は十分ある。

- [tmux config(setting) file.](https://gist.github.com/komasaru/5574812 "tmux config(setting) file.")

#### 3-2. 256色設定について

色の指定は `black`, `red`, `green`, `yellow`, `blue`, `magenta`, `cyan`, `white` か `colour0` - `colour255` で行う。  
`colour0` - `colour255` がどんな色かは以下のようなシェルスクリプトを実行することで確認可能。

File: `~/tmux_colour256.sh`

{% highlight bash linenos %}
#!/bin/bash

for fgbg in 38 48  #Foreground/Background
do
    for color in {0..255}  #Colors
    do
        #Display the color
        echo -en "\e[${fgbg};5;${color}m ${color}\t\e[0m"
        #Display 10 colors per lines
        if [ $((($color + 1) % 10)) == 0 ] ; then
            echo #New line
        fi
    done
    echo #New line
done

exit 0
{% endhighlight %}

![TMUX_COLOUR_256]({{site.baseurl}}/images/2013/06/05/TMUX_COLOUR_256.png "TMUX_COLOUR_256")

#### 4. 実行

tmux を実行してみる。  

``` text 
$ tmux -2
```

オプションの `-2` は、256色で起動するオプション。（当方の環境では必要だった）

以下は、タブを複数開いたり、ウィンドウを分割したりした例。

![TMUX_EXAMPLE]({{site.baseurl}}/images/2013/06/05/TMUX_EXAMPLE.png "TMUX_EXAMPLE")

#### 5. キー設定の確認

よく使用するであろうものは以下の通り。  
以下はカスタマイズしていない場合の例。  
以下のキー押下の前にプリフィックス（デフォルト：`CTRL-b`、当方：`CTRL-t`）を押下する。

<table class="common">
  <tr>
    <th>キーバインド</th><th>動作</th>
  </tr>
  <tr>
    <td>c (create)</td><td>新ウインドウを作成</td>
  </tr>
  <tr>
    <td>n (next)</td><td>次ウインドウへ移動</td>
  </tr>
  <tr>
    <td>p (prev)</td><td>前ウインドウへ移動</td>
  </tr>
  <tr>
    <td>w (windows)</td><td>ウインドウ一覧を表示</td>
  </tr>
  <tr>
    <td>,</td><td>ウインドウに名前をつける</td>
  </tr>
  <tr>
    <td>%</td><td>ウインドウを縦分割して新ペインを作成</td>
  </tr>
  <tr>
    <td>"</td><td>ウインドウを横分割して新ペインを作成</td>
  </tr>
  <tr>
    <td>o</td><td>次のペインに移動</td>
  </tr>
  <tr>
    <td>カーソルキー</td><td>カーソルキーの方向のペインに移動</td>
  </tr>
  <tr>
    <td>q + 番号</td><td>番号のペインに移動（q 押下後に一瞬ペイン番号が表示される）</td>
  </tr>
  <tr>
    <td>[</td><td>コピーモード開始（Spaceキー：開始位置指定、Enterキー：終了位置指定）</td>
  </tr>
  <tr>
    <td>]</td><td>ペースト</td>
  </tr>
  <tr>
    <td>?</td><td>キーバインド一覧表示</td>
  </tr>
</table>

#### 6. 所感

GNU Screen さえ使用したことがないので、tmux のキーバインドに慣れるには時間がかかりそうに感じた。  
ただ、tmux では使用中のウィンドウ・ペイン構成（セッション）をデタッチすることで保存ができ、tmux 起動時にアタッチすることで復元されることが最大のメリットであることは、先人の方々のおっしゃるとおりだと感じた。  
また、当方はあまり使用する機会はないが、別々のウィンドウ・ペインから同一のセッションにアクセスでき、画面入出力の同期がとれるのも素晴らしい機能だと感じた。

#### 7. 参考サイト

- [tmux](http://tmux.github.io/ "tmux")
- [第127回　ターミナルマルチプレクサ tmuxを使ってみよう：Ubuntu Weekly Recipe｜gihyo.jp … 技術評論社](http://gihyo.jp/admin/serial/01/ubuntu-recipe/0127 "第127回　ターミナルマルチプレクサ tmuxを使ってみよう：Ubuntu Weekly Recipe｜gihyo.jp … 技術評論社")

---

「いまさら、tmux？」というような感じがしないでもないが、ぜひとも使いこなせるようになりたいと思った次第です。

以上。

