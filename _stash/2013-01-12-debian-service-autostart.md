---
layout   : single
title    : "Debian 系 Linux - サービス自動起動設定！"
published: true
date     : 2013-01-12 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
---

CentOS や Scientific Linux 等の Redhat 系 Linux では、CUI モードでのサービス自動起動設定は `chkconfig` コマンドを使用します。
一方、Ubuntu や Linux Mint 等の Debian 系 Linux では、`update-rc.d` コマンドを使用します。

以下、`update-rc.d` コマンドについての記録です。

<!--more-->

### 0. 前提条件

作業・確認した環境は Linux Mint 14 Nadia (64Bit) だが、Debian 系 Linux なら同じはずである。

### 1. ランレベル

まず、サービス自動起動で重要なランレベルは、Debian 系 Linux では、以下のような割り当てとなっている。

<table class="common">
  <tr>
    <th>ランレベル</th><th>説明</th>
  </tr>
  <tr>
    <td class="center">0</td><td>システム停止</td>
  </tr>
  <tr>
    <td class="center">1</td><td>シングルユーザモード</td>
  </tr>
  <tr>
    <td class="center">2</td><td>マルチユーザモード</td>
  </tr>
  <tr>
    <td class="center">3</td><td>2 に同じ</td>
  </tr>
  <tr>
    <td class="center">4</td><td>2 に同じ</td>
  </tr>
  <tr>
    <td class="center">5</td><td>2 に同じ</td>
  </tr>
  <tr>
    <td class="center">6</td><td>システム再起動</td>
  </tr>
</table>

ちなみに、RedHat 系 Linux では、以下のような割当となっている。

<table class="common">
  <tr>
    <th>ランレベル</th><th>説明</th>
  </tr>
  <tr>
    <td class="center">0</td><td>システム停止</td>
  </tr>
  <tr>
    <td class="center">1</td><td>シングルユーザモード</td>
  </tr>
  <tr>
    <td class="center">2</td><td>マルチユーザモード（ネットワーク無し）</td>
  </tr>
  <tr>
    <td class="center">3</td><td>マルチユーザモード（テキストログインモード）</td>
  </tr>
  <tr>
    <td class="center">4</td><td>未使用（ユーザ定義可能）</td>
  </tr>
  <tr>
    <td class="center">5</td><td>マルチユーザモード（GUIログインモード）</td>
  </tr>
  <tr>
    <td class="center">6</td><td>システム再起動</td>
  </tr>
</table>

### 2. update-rc.d コマンドについて

`update-rc.d` コマンドの使用方法は以下の通り。（HELP の内容）

``` bash 
$ update-rc.d --help
usage: update-rc.d [-n] [-f] <basename> remove
       update-rc.d [-n] <basename> defaults [NN | SS KK]
       update-rc.d [-n] <basename> start|stop NN runlvl [runlvl] [...] .
       update-rc.d [-n] <basename> disable|enable [S|2|3|4|5]
    -n: not really
    -f: force

The disable|enable API is not stable and might change in the future.
```

### 3. 自動起動設定

詳細にオプション指定も可能だが、通常は自動起動の設定や解除程度しか使用しないので、まずは自動起動の設定について。  
例えば `apache2` というサービスをシステム起動時に自動起動するように設定する場合。

``` bash 
$ sudo update-rc.d apache2 defaults
 Adding system startup for /etc/init.d/apache2 ...
   /etc/rc0.d/K20apache2 -> ../init.d/apache2
   /etc/rc1.d/K20apache2 -> ../init.d/apache2
   /etc/rc6.d/K20apache2 -> ../init.d/apache2
   /etc/rc2.d/S20apache2 -> ../init.d/apache2
   /etc/rc3.d/S20apache2 -> ../init.d/apache2
   /etc/rc4.d/S20apache2 -> ../init.d/apache2
   /etc/rc5.d/S20apache2 -> ../init.d/apache2
```

### 4. 自動起動設定解除

次に、システム起動時自動起動するようになっているサービスを解除する場合。

``` bash 
$ sudo update-rc.d -f apache2 remove
 Removing any system startup links for /etc/init.d/apache2 ...
   /etc/rc0.d/K09apache2
   /etc/rc1.d/K09apache2
   /etc/rc2.d/K09apache2
   /etc/rc3.d/K09apache2
   /etc/rc4.d/K09apache2
   /etc/rc5.d/K09apache2
   /etc/rc6.d/K09apache2
```

### 5. sysv-rc-conf について

視覚的に、また詳細にランレベルを設定したいなら、`sysv-rc-conf` という「端末用 SysV init ランレベル設定ツール」を使うとよい。  
端末で以下のようにすれば起動できる。

``` bash 
$ sudo sysv-rc-conf
```

![SYSV_RC_CONF]({{site.baseurl}}/images/2013/01/12/SYSV_RC_CONF_1.png "SYSV_RC_CONF")

### 参考サイト

- [The Debian GNU/Linux FAQ - Customizing your installation of Debian GNU/Linux](http://www.debian.org/doc/manuals/debian-faq/ch-customizing.en.html#s-booting "The Debian GNU/Linux FAQ - Customizing your installation of Debian GNU/Linux")
- [ランレベルとは](http://www.atmarkit.co.jp/flinux/rensai/linuxtips/156whatrunlv.html "ランレベルとは")

---

当方、Redhat 系での `chkconfig` コマンドに慣れていて、しばらく使用しないと忘れてしまいそうなので記録しておいた次第です。

以上。

