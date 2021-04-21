---
layout   : single
title    : "CentOS 7.0 - リポジトリ追加！"
published: true
date     : 2014-08-06 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
---

「CentOS 7.0 - リポジトリ追加」についての記録です。

（旧バージョンでの作業記録を更新しました。興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

- CentOS 7.0-1406(x86_64) を NetInstall で最小限インストールしている。
- サーバ用途なので、作業は基本的に全て一般ユーザから root になって行う。
- 主に「[CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")」を参照。

### 1. yum-priorities インストール

標準と追加したリポジトリの両方で提供されるパッケージの場合に、追加したリポジトリで提供されるパッケージで上書きされないようにする。

``` text
# yum -y install yum-plugin-priorities
```

そして、以下のように追記する。（`[centosplus]` は元々 `enabled=0` で無効になっているの追記不要）

File: `/etc/yum.repos.d/CentOS-Base.repo`

{% highlight bash linenos %}
[base]
name=CentOS-$releasever - Base
mirrorlist=http://mirrorlist.centos.org/?release=$releasever&arch=$basearch&repo=os
#baseurl=http://mirror.centos.org/centos/$releasever/os/$basearch/
gpgcheck=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-CentOS-7
priority=1  # <= 追加

#released updates
[updates]
name=CentOS-$releasever - Updates
mirrorlist=http://mirrorlist.centos.org/?release=$releasever&arch=$basearch&repo=updates
#baseurl=http://mirror.centos.org/centos/$releasever/updates/$basearch/
gpgcheck=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-CentOS-7
priority=1  # <= 追加

#additional packages that may be useful
[extras]
name=CentOS-$releasever - Extras
mirrorlist=http://mirrorlist.centos.org/?release=$releasever&arch=$basearch&repo=extras
#baseurl=http://mirror.centos.org/centos/$releasever/extras/$basearch/
gpgcheck=1  # <= 追加
{% endhighlight %}

### 2. RPMforge リポジトリ追加

今後使用することがあるであろう RPMforge リポジトリを導入する。

``` text
# wget http://pkgs.repoforge.org/rpmforge-release/rpmforge-release-0.5.3-1.el7.rf.x86_64.rpm
                                   # <= パッケージファイルダウンロード
# rpm -ivh rpmforge-release-*.rpm  # <= パッケージインストールインストール
# rm -f rpmforge-release-*.rpm     # <= パッケージファイル削除
# yum -y update rpmforge-release   # <= rpmforge-release アップデート
```

### 3. EPEL リポジトリ追加

今後使用することがあるであろう EPEL リポジトリを導入する。（当記事執筆時点では 7.0 は Beta 版）

``` text
# wget http://ftp.riken.jp/Linux/fedora/epel/beta/7/x86_64/epel-release-7-0.2.noarch.rpm
                                   # <= パッケージファイルダウンロード
# rpm -ivh epel-release-*.rpm  # <= パッケージインストールインストール
# rm -f epel-release-*.rpm     # <= パッケージファイル削除
# yum -y update epel-release   # <= epel-release アップデート
```

### 4. 補足

yum-priorities を導入せずに意識的に自分でリポジトリを指定したい場合、普段は以下のように追加したリポジトリは無効化しておき、

File: `/etc/yum.repos.d/rpmforge.repo`

{% highlight bash linenos %}
enabled=0
{% endhighlight %}

追加したリポジトリを使用する際に以下のようにする。

``` text
# yum --enablerepo=rpmforge install xxxx
```

---

以上。

