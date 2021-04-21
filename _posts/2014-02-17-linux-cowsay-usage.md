---
layout   : single
title    : "Linux - cowsay で Linux コマンド説明表示！"
published: true
date     : 2014-02-17 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
---

アスキーアートのキャラクタがメッセージをつぶやく `cowsay` という Linux コマンドについての備忘録です。

<!--more-->

### 0. 前提条件

- Linux Mint 14(64bit) での作業を想定。
- GNU bash 4.2.37, zsh 5.0.0 で動作確認。

### 1. cowsay について

"cowsay" とは、アスキーアート生成コマンドで、吹き出しでメッセージを表示させることができるものである。

### 2. cowsay インストール

`cowsay` コマンドがインストールされていなければ、インストールする。

``` text
$ sudo apt-get -y install cowsay
```

また、`fortune` コマンド（後述）もインストールされていなければ、インストールする。

``` text
$ sudo apt-get -y install fortune
```

### 3. cowsay 使用方法

ヘルプ表示。

``` text
$ cowsay -h
cowsay -h
cow{say,think} version 3.03, (c) 1999 Tony Monroe
Usage: cowsay [-bdgpstwy] [-h] [-e eyes] [-f cowfile] 
          [-l] [-n] [-T tongue] [-W wrapcolumn] [message]
```

`cowsay` コマンドに引数で文字列を与えて実行すると、「cow（牛）」がその文字列をつぶやく。

``` text
$ cowsay Hello!
cowsay Hello!
 ________
< Hello! >
 --------
        \   ^__^
         \  (oo)\_______
            (__)\       )\/\
                ||----w |
                ||     ||
```

`-bdgpstwy` オプションで「目」が変わる。

``` text
$ cowsay -b Hello!
cowsay -b Hello!
 ________
< Hello! >
 --------
        \   ^__^
         \  (==)\_______
            (__)\       )\/\
                ||----w |
                ||     ||
```

`-e eye_string` オプションで「目」を任意に設定できる。

``` text
$ cowsay -e ?? Hello!
cowsay -e ?? Hello!
 ________
< Hello! >
 --------
        \   ^__^
         \  (??)\_______
            (__)\       )\/\
                ||----w |
                ||     ||
```

`-l` オプションで設定可能なキャラクタの一覧を表示する。

``` text
$ cowsay -l
cowsay -l
Cow files in /usr/share/cowsay/cows:
apt beavis.zen bong bud-frogs bunny calvin cheese cock cower daemon default
dragon dragon-and-cow duck elephant elephant-in-snake eyes flaming-sheep
ghostbusters gnu head-in hellokitty kiss kitty koala kosh luke-koala
mech-and-cow meow milk moofasa moose mutilated pony pony-smaller ren sheep
skeleton snowman sodomized-sheep stegosaurus stimpy suse three-eyes turkey
turtle tux unipony unipony-smaller vader vader-koala www
```

`-f cowfile` オプションで「牛」以外になる。

``` text
$ cowsay -f daemon Hello!
cowsay -f daemon Hello!
 ________
< Hello! >
 --------
   \         ,        ,
    \       /(        )`
     \      \ \___   / |
            /- _  `-/  '
           (/\/ \ \   /\
           / /   | `    \
           O O   ) /    |
           `-^--'`<     '
          (_.)  _  )   /
           `.___/`    /
             `-----' /
<----.     __ / __   \
<----|====O)))==) \) /====
<----'    `--' `.__,' \
             |        |
              \       /
        ______( (_  / \______
      ,'  ,-----'   |        \
      `--{__________)        \/
```

### 4. 応用例（１）

ランダムな言葉を吹き出しに表示させてみる。

``` text
$ fortune | cowsay
fortune | cowsay
 ___________________________________
/ Repartee is something we think of \
| twenty-four hours too late.       |
|                                   |
\ -- Mark Twain                     /
 -----------------------------------
        \   ^__^
         \  (oo)\_______
            (__)\       )\/\
                ||----w |
                ||     ||
```

以下でも同様。

``` text
$ cowsay `fortune`
```

### 5. 応用例２

ターミナル起動時にランダムに Linux コマンドの説明を表示させるには、 ".bashrc"（bash の場合） 最終行にに以下のように記述すればよい。（zsh なら ".zshrc"）

File: `~/.bashrc`

{% highlight bash linenos %}
cowsay -f daemon $(whatis $(ls /bin) 2>/dev/null | shuf -n 1)
{% endhighlight %}

表示するキャラクタもランダムに設定したければ、以下のようにすればよい。（zsh なら ".zshrc"）

File: `~/.bashrc`

{% highlight bash linenos %}
cowsay -f $(ls /usr/share/cowsay/cows | shuf -n 1 | cut -d. -f1) $(whatis $(ls /bin) 2>/dev/null | shuf -n 1)
{% endhighlight %}

端末起動時に、以下のようにランダムに Linux コマンドを説明をしてくれる。

``` text
 _____________________________________
/ ip (8) - show / manipulate routing, \
\ devices, policy routing and tunnels /
 -------------------------------------
   \         ,        ,
    \       /(        )`
     \      \ \___   / |
            /- _  `-/  '
           (/\/ \ \   /\
           / /   | `    \
           O O   ) /    |
           `-^--'`<     '
          (_.)  _  )   /
           `.___/`    /
             `-----' /
<----.     __ / __   \
<----|====O)))==) \) /====
<----'    `--' `.__,' \
             |        |
              \       /
        ______( (_  / \______
      ,'  ,-----'   |        \
      `--{__________)        \/
```

---

今回は、かなり「ゆるい」話題でした。

以上。

