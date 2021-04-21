---
layout   : single
title    : "Linux Mint - zsh インストール！"
published: true
date     : 2013-06-23 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
- LinuxMint
- 端末
- シェル
- zsh
---

今まで、Linux ではシェルはデフォルトの bash を使っていました。  
しかし、究極で便利と噂（？）の zsh を使ってみたくなり、ついにというかやっとというか今更というか、ローカルマシンにインストール・設定してみました。

<!--more-->

#### 0. 前提条件

- Linux Mint 14 Nadia (64bit) での作業を想定しているが、他の Unix シェルの使用可能な OS や Linux ディストリビューションでも同様。  
- Git 導入済み。（既存の zsh 設定ファイル（"oh-my-zsh.sh"）導入に使用するため）
- zsh のインストールには apt パッケージを使用する。（ソースをビルドしてインストールする方法もあるが）

#### 1. zsh インストール

Synaptic パッケージマネージャでインストールするか、以下のようにしてインストールする。

``` text 
$ sudo apt-get install zsh
```

zsh がインストールできているか（使用出来るシェルの一覧にあるか）確認する。

``` text 
$ cat /etc/shells
# /etc/shells: valid login shells
/bin/sh
/bin/dash
/bin/bash
/bin/rbash
/usr/bin/tmux
/bin/zsh
/usr/bin/zsh
```

#### 2. ログインシェル変更

変更前に現在のログインシェルを確認してみる。  

``` text 
$ echo $SHELL
/bin/bash
```

bash になっていることが分かる。  
ログインシェルを zsh に変更するには以下のようにする。

``` text 
$ chsh -s /bin/zsh
```

もしくは `chsh` コマンドのみでインタラクティブに設定してもよい。  
そして、ログインシェルの変更を有効化するためにログインし直し、zsh に変更できているか確認してみる。

``` text 
$ echo $SHELL
/bin/zsh
```

zsh に変更できている。

ターミナルマルチプレクサ tmux を併用する場合、デフォルトシェルは変更せずに tmux 使用時のみ zsh を使用するようにするのが良いらしい。  
その場合は、ログインシェルは変更せず（上記のようにはせず）、tmux の設定ファイル ".tmux.conf" に以下のような記述を追加する。（tmux 上で bash を使用するような設定にしているのなら、zsh を利用するように変更する）

File: `.tmux.conf`

{% highlight text linenos %}
set-option -g default-shell /bin/zsh
set-option -g default-command /bin/zsh
{% endhighlight %}

#### 3. 設定ファイル準備

zsh の設定ファイル ".zshrc" を編集する。  
しかし、zsh 初心者が一から設定するのは骨が折れる作業になるので、便利にそのまま使える設定ファイル "oh-my-zsh.sh" を使用する。  
そして、細かな設定は実際に zsh を使用していきながら調整していくことにする。

``` text 
$ git clone git://github.com/robbyrussell/oh-my-zsh.git ~/.oh-my-zsh  
$ cp ~/.oh-my-zsh/templates/zshrc.zsh-template ~/.zshrc  
```

この設定には、もちろん「自動補完」の機能も含まれている。  
ちなみに、"oh-my-zsh.sh" を使用せずに直接 ".zshrc" を作成する場合に「自動補完」機能を実現するには以下のような記述をするらしい。

File: `~/.zshrc`

{% highlight text linenos %}
autoload -U compinit
compinit 
{% endhighlight %}

また、oh-my-zsh には予め多数のテーマが用意されていて、デフォルトでは `rubbyrussell` となっている。
[http://zshthem.es/all/](http://zshthem.es/all/ "http://zshthem.es/all/") で全テーマのスクリーンショットが確認できるので、気に入ったものに変更する。

File: `~/.zshrc`

{% highlight text linenos %}
ZSH_THEME="jtriley"
{% endhighlight %}

テーマと言ってもプロンプトの書式を設定しているだけなので、既存のテーマを参考にカスタマイズしたりしてもよい。

tmux を使用する場合は、コマンド入力履歴が全てのウィンドウ・ペインで共有化されてしまう（別のウィンドウ・ペインの履歴が表示されてしまう）ので、".zshrc" に以下のように追加して共有化しないようにする。

File: `~/.zshrc`

{% highlight text linenos %}
unsetopt share_history
{% endhighlight %}

そして、編集後の設定反映は再ログインするか以下のようにする。

``` text 
source ~/.zshrc
```

#### 4. 動作確認

端末を起動して実際に使用してみる。  
デザインが指定したテーマのものになっていることを確認する。  
また、自動補完機能を試してみる。  
（テーマによっては git が導入済みならブランチ名も表示される）

以下は、`cd` ＋半角スペース入力後 `Tab` キー押下で補完候補一覧が表示され、再度 `Tab` キー押下後矢印キーで選択しているところ。
![ZSH_1]({{site.baseurl}}/images/2013/06/23/ZSH_1.png "ZSH_1")

また、次のようにワイルドカード入力後 `Tab` キーを押下すると、
![ZSH_2]({{site.baseurl}}/images/2013/06/23/ZSH_2.png "ZSH_2")

しっかりと検索して候補が表示される。
![ZSH_3]({{site.baseurl}}/images/2013/06/23/ZSH_3.png "ZSH_3")

#### 5. 所感

自動補完ができるだけでもかなり便利に感じる。  
各種記事を参照すると他にも色々とできるようだし、究極の超高機能シェルであるということは実際に触る前から予感できる。

#### 6. 参考サイト

- [漢のzsh - コラム - 開発・SE - マイナビニュース](http://news.mynavi.jp/column/zsh/index.html "漢のzsh - コラム - 開発・SE - マイナビニュース")

---

今後、実際に使用してみて、テーマや各種設定を変更・カスタマイズしたりプラグインを導入したりするつもりです。

以上。

