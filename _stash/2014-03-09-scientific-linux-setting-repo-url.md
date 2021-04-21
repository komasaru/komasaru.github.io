---
layout   : single
title    : "Scientific Linux - yum リポジトリ接続先変更！"
published: true
date     : 2014-03-09 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- ScientificLinux
---

Scientific Linux で yum を使用してパッケージをインストールしたりアップデートしたりする際に、デフォルトでは海外のサイトへつながってしまいます。

気にならないならそれでもよいのですが、当方は気になるので国内のサーバへ変更しています。

以下、当方の設定例です。

<!--more-->

### 0. 前提条件

- Scientific Linux 6.5(x86_64) での作業を想定。  
  （CentOS 等 Redhat 系ディストリビューションな同様に設定可能）
- yum-fastestmirror パッケージは使用しない。
- 取り急ぎ sl, sl-security リポジトリのみ対応する。（`enabled=1` で有効にしているもののみ）

### 1. 設定ファイル編集

設定ファイル "/etc/yum.repos.d/sl.repo" を以下のように編集する。  
既存の `baseurl` を国内サーバの URL に変更している。（以下では、接続先を「北陸先端科学技術大学院大学(JAIST)」に設定しているが、「KDDI」や「理研」等でもよいし、複数設定してもよい。）  
また、`mirrorlist` は `yum-fastestmirror` でミラーサイトの一覧を取得する場合に参照されるので、 `yum-fastestmirror` を導入していなければ `mirrorlist` は不要。（有ってもよいが、無意味にミラーサイトへ接続に行き、戸惑うかも知れない）  
`yum-fastestmirror` を導入しているのなら、 `mirrorlist` も国内サーバの URL に変更するとよい。  
 （`[sl-source]` は `enabled=0` にしているので今回は編集しない）

File: `/etc/yum.repos.d/sl.repo`

{% highlight bash linenos %}
[sl]
name=Scientific Linux $releasever - $basearch
#baseurl=http://ftp.scientificlinux.org/linux/scientific/$releasever/$basearch/os/
#               http://ftp1.scientificlinux.org/linux/scientific/$releasever/$basearch/os/
#               http://ftp2.scientificlinux.org/linux/scientific/$releasever/$basearch/os/
#               ftp://ftp.scientificlinux.org/linux/scientific/$releasever/$basearch/os/
baseurl=http://ftp.jaist.ac.jp/pub/Linux/scientific/$releasever/$basearch/os/
#mirrorlist=http://ftp.scientificlinux.org/linux/scientific/mirrorlist/sl-base-6.txt
#mirrorlist=http://ftp.jaist.ac.jp/pub/Linux/scientific/mirrorlist/sl-base-6.txt
enabled=1
gpgcheck=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-sl file:///etc/pki/rpm-gpg/RPM-GPG-KEY-sl6 file:///etc/pki/rpm-gpg/RPM-GPG-KEY-cern

[sl-security]
name=Scientific Linux $releasever - $basearch - security updates
#baseurl=http://ftp.scientificlinux.org/linux/scientific/$releasever/$basearch/updates/security/
#               http://ftp1.scientificlinux.org/linux/scientific/$releasever/$basearch/updates/security/
#               http://ftp2.scientificlinux.org/linux/scientific/$releasever/$basearch/updates/security/
#               ftp://ftp.scientificlinux.org/linux/scientific/$releasever/$basearch/updates/security/
baseurl=http://ftp.jaist.ac.jp/pub/Linux/scientific/$releasever/$basearch/updates/security/
#mirrorlist=http://ftp.scientificlinux.org/linux/scientific/mirrorlist/sl-security-6.txt
#mirrorlist=http://ftp.jaist.ac.jp/pub/Linux/scientific/mirrorlist/sl-security-6.txt
enabled=1
gpgcheck=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-sl file:///etc/pki/rpm-gpg/RPM-GPG-KEY-sl6 file:///etc/pki/rpm-gpg/RPM-GPG-KEY-cern

[sl-source]
name=Scientific Linux $releasever - Source
baseurl=http://ftp.scientificlinux.org/linux/scientific/$releasever/SRPMS/
               http://ftp1.scientificlinux.org/linux/scientific/$releasever/SRPMS/
               http://ftp2.scientificlinux.org/linux/scientific/$releasever/SRPMS/
               ftp://ftp.scientificlinux.org/linux/scientific/$releasever/SRPMS/
enabled=0
gpgcheck=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-sl file:///etc/pki/rpm-gpg/RPM-GPG-KEY-sl6 file:///etc/pki/rpm-gpg/RPM-GPG-KEY-cern
{% endhighlight %}

同様に設定ファイル "/etc/yum.repos.d/sl-other.repo" も編集してもよい。  
但し、`enabled=0` のリポジトリは `yum` コマンド使用時に `--enablerepo=xxx` しないと有効にならないことを理解しておくこと

### 2. キャッシュクリア

念の為、古いパッケージのキャッシュを削除しておく。

``` text
# yum clean all
```

### 3. その他

今回は上記のようにして国内サーバに接続するように設定したが、 `yum-fastestmirror` パッケージをインストールして自動で近場のサーバに接続するようにしてもよいだろう。  
その際、近場でも「日本」に限定するように設定することも可能。

---

これで、常に「近く」て「自分の信頼しているサーバ」に接続するようになり安心感が増します。

以上。

