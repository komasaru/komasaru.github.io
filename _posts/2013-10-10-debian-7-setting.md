---
layout   : single
title    : "Debian 7 Wheezy - サーバ初期設定！"
published: true
date     : 2013-10-10 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
---

Debian GNU/Linux 7.1.0 をサーバ用途・最小構成でインストールした後の初期設定についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。

<!--more-->

### 0. 前提条件

- 「[Debian GNU/Linux 7.1.0 - インストール（サーバ用途・最小構成）！]({{site.baseurl}}/2013/10/09/debian-7-install-for-small-server/ "Debian GNU/Linux 7.1.0 - インストール（サーバ用途・最小構成）！")」の方法でインストールが完了していることを想定。
- ユーザ名は "masaru" とする。
- コマンドラインプロンプト `#` は root ユーザ、 `$` は一般ユーザであることを理解しておく。  
  コメントしての `#` と混同しないよう注意する。
- 現時点では、日本語は文字化けするので、一時的に `export LANG=C` しておく。

### 1. 管理用ユーザの設定

root でログインし、インストール時に作成した一般ユーザを管理ユーザにし、 root になれるよう設定する。

``` bash 
# usermod -G adm masaru

# vi /etc/pam.d/su

# 15行目当たり、コメント解除し編集
auth       required   pam_wheel.so  group=adm
```

ちなみに、RedHat 系の場合 `adm` ではなく `wheel` である。

あとは、通常は一般ユーザでログインし、必要に応じて root ユーザになって作業を行う。

### 2. コマンドエイリアスの設定

よく使用するコマンド＋オプションのエイリアスを設定しておく。  
取り急ぎ、当方がよく使用するコマンドのみ。

root に適用する場合は、root ユーザでログインして以下のように設定する。

``` bash 
# vi /etc/profile      # <= 編集

# 最終行に追加
alias ll='ls -l'

# source /etc/profile  # <= 即時適用
```

各ユーザに適用する場合は、各ユーザでログインして以下のように設定する。

File: `各ユーザに適用する場合`

{% highlight bash linenos %} 
$ vi .bashrc      # <= 編集
# 最終行に追加
alias ll='ls -l'

$ source .bashrc  # <= 即時適用
{% endhighlight %}

### 3. コマンドプロンプト変更

root では、コマンドプロンプトがデフォルトで以下のように表示される。  
ディレクトリが深くなるとコマンドプロンプトも長くなってしまう。

``` bash 
root@vbox:~# cd /var/lib/apt/mirrors/partial
root@vbox:/var/lib/apt/mirrors/partial#
```

"/etc/profile" に以下を追記する。（好みに応じて編集する）

File: `/etc/profile`

{% highlight bash linenos %}
PS1='[\u@\h \W]\$ '
{% endhighlight %}

以下のコマンドで即時反映する。（マシン再起動でもよい）

``` bash 
# source /etc/profile
```

以下のようなコマンドプロントになる。  
ディレクトリが深くなっても一番深いディレクトリ名のみ表示されるので、コマンドプロンプトが長くなることはない。

``` bash 
[root@vbox ~]# cd /var/lib/apt/mirrors/partial
[root@vbox partial]#
```

### 4. IPv6 無効化

IPv6 は使用しないので無効にしておく。

``` bash 
# vi /etc/sysctl.conf  # <= 編集
# 最終行に追加
net.ipv6.conf.all.disable_ipv6 = 1

# sysctl -p            # <= 即時反映
net.ipv6.conf.all.disable_ipv6 = 1

# ifconfig             # <= IPv6 が無効になっていることを確認
```

### 5. システム最新化

システムの各種パッケージのバージョンが古い可能性もあるので、最新化しおく。

``` bash 
# aptitude update      # <= リスト最新化

# aptitude -y upgrade  # <= システム最新化
```

### 6. Vim インストール

テキストエディタ Vi の高機能版 Vim をインストール・設定する。

``` bash 
# aptitude -y install vim  # <= Vim インストール

# vi /etc/profile          # <= コマンドエイリアス適用
# 最終行に追加
alias vi='vim'

# source /etc/profile      # <= 即時適用
```

必要に応じて Vim 設定ファイル（"~/.vimrc" or "/etc/vim/vimrc"）を編集する。（ここでは説明しない）

### 7. sudo インストール

権限移譲を実現する sudo をインストール・設定する。

``` bash 
# aptitude -y install sudo  # <= sudo インストール

# visudo                    # <= 設定

# 最終行に追加（masaru に root 権限全てを付与）
masaru   ALL=(ALL)   ALL
```

保存は `CTRL + O` で、ファイル名を `sudoers` にする。  
終了は `CTRL + X` を押下する。

これで、一般ユーザでログイン時に `sudo ＜コマンド＞` で root でのコマンド実行が可能になる。  
通常はこれで充分だが、コマンド別に権限を詳細に設定すること等も可能である。（ここでは説明しない）

---

以上。

