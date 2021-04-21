---
layout   : single
title    : "Linux - sudo でパスワード要求しない！"
published: sudo
date     : 2014-04-17 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
- LinuxMint
---

Linux の一般ユーザで root 権限のコマンドを実行する際に `sudo` をコマンドを使用します。  
デフォルトでは実行時にパスワードが要求されますが、場合によってはパスワード要求を不要にしたい場合もあります。

以下、備忘録です。

<!--more-->

### 0. 前提条件

- Linux Mint 14(64bit) での作業を想定しているが、他のディストリビューションでも同様と思われる。
- "/etc/sudoers" や "/etc/sudoers.d" 配下のファイルの設定を誤ると大変なことになるらしい！**厳重注意！**

### 1. sudoers 確認

まず、以下のコマンドで `sudo` コマンドの設定を確認してみる。

``` text
$ sudo visudo
```

デフォルトでは以下のようになっているはず。（環境により多少異なる）

File: `/etc/sudoers`

{% highlight bash linenos %}
#
# This file MUST be edited with the 'visudo' command as root.
#
# Please consider adding local content in /etc/sudoers.d/ instead of
# directly modifying this file.
#
# See the man page for details on how to write a sudoers file.
#
Defaults»-env_reset
Defaults»-secure_path="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

# Host alias specification

# User alias specification

# Cmnd alias specification

# User privilege specification
root»-ALL=(ALL:ALL) ALL

# Members of the admin group may gain root privileges
%admin ALL=(ALL) ALL

# Allow members of group sudo to execute any command
%sudo»ALL=(ALL:ALL) ALL

# See sudoers(5) for more information on "#include" directives:

#includedir /etc/sudoers.d
{% endhighlight %}

### 2. 設定追加

"/etc/sudoers" を直接編集しても良いだろうが、"/etc/sudoers.d" ディレクトリ配下に個別の設定ファイルを作成する方が良さそう。  
（ちなみに、**"/etc/sudoers" 内の `#includedir /etc/sudoers.d` 行頭の `#` はコメントではないので削除しないこと**）

特定のユーザに対して一切パスワード要求をしないようにする場合は以下のとおり。  
（書式は `ユーザ名 ホスト名=(権限) コマンド` で）

File: `/etc/sudoers.d/hoge`

{% highlight bash linenos %}
hoge  ALL=(ALL) NOPASSWD:ALL
{% endhighlight %}

特定のユーザ、特定のコマンドに対してパスワード要求をしないようにする場合は以下のとおり。（以下は "shutdown" コマンドの例）  
（書式は `ユーザ名 ホスト名=(権限) コマンド` で）

File: `/etc/sudoers.d/hoge`

{% highlight bash linenos %}
hoge  ALL=(ALL) NOPASSWD:/sbin/shutdown
{% endhighlight %}

指定したいコマンドが複数ある場合はカンマで区切るか、行を分ける。

File: `/etc/sudoers.d/hoge`

{% highlight bash linenos %}
hoge  ALL=(ALL) NOPASSWD:/sbin/shutdown, NOPASSWD:/usr/bin/find
{% endhighlight %}

か、以下のように。

File: `/etc/sudoers.d/hoge`

{% highlight bash linenos %}
hoge  ALL=(ALL) NOPASSWD:/sbin/shutdown
hoge  ALL=(ALL) NOPASSWD:/usr/bin/find
{% endhighlight %}

ちなみに、 "/etc/sudoers" ファイル内に `%admin` 等の設定があるが、"hoge" ユーザが "admin" グループに属している場合は、まず `%admin` の設定が有効になり、それから追加の設定が有効になる。

"sudoers" で設定済みのグループに属さない一般ユーザで、特定のコマンド以外はパスワード要求するように設定するには、以下のようにする。

File: `/etc/sudoers.d/hoge`

{% highlight bash linenos %}
hoge  ALL=(ALL) PASSWD:ALL, NOPASSWD:/sbin/shutdown
{% endhighlight %}

### 3. パーミッション設定

そして、パーミッションを設定する。（このファイルのパーミッションは `0440` でなければならないので）

``` text
$ sudo chmod 440 /etc/sudoers.d/hoge
```

再度このファイルを編集する場合は、`chmod +w` 等で書き込み権限を付与してからでないと編集できないので注意。

### 4. 動作確認

実際にコマンドラインで `sudo` コマンドを使ってコマンドを入力して確認する。  
パスワード要求されなくなっていれば成功である。

### 5. その他

当方の場合、「一般ユーザである時間のかかるコマンドを実行して、その処理が終了したら `shutdown` する」ために、今回のような設定をしている。  
実際には、コマンドラインで以下のように実行する場合。（"hoge.sh" が時間のかかる処理）

``` text
$ ./hoge.sh ; sudo shutdown -h now
```

---

ちょっとしたことですが、設定しておくだけで格段に便利になります。

ただ、本来 root 権限で実行されるべきコマンドがパスワード要求されなくなるので、そのことを充分把握しておくことも必要です。

以上。

