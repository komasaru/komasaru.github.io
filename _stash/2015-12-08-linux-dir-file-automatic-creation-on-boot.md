---
layout   : single
title    : "Linux - マシン起動時にディレクトリ・ファイルを自動作成！"
published: true
date     : 2015-12-08 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
---

Linux で、マシン起動時に自動でディレクトリやファイルを作成する方法についての備忘録です。

<!--more-->

### 0. 前提条件

* CentOS 6.7(i386) での作業を想定。（他の Linux ディストリビューションでも同様のはず）

### 1. はじめに

* 今回の作業は、 `/etc/tmpfiles.d/*.conf` ファイルを作成することで実現する。
  （環境によっては、 `/run/tmpfiles.d/*.conf`, `/usr/lib/tmpfiles.d/*.conf` ファイル）
* `/etc/tmpfiles.d/*.conf` ファイル内の書式は以下のとおり。（詳細は「[参考サイト](http://www.unix.com/man-page/centos/5/tmpfiles.d/ "CentOS 7.0 - man page for tmpfiles.d (centos section 5) - Unix & Linux Commands")」参照  
  `Type Path Mode UID GID Age Argument`

### 2. 作成例

当方が使用する頻度が高いもののみについて、作成例を挙げる。

#### 2-1. ディレクトリが存在しなければ作成する例

「ディレクトリ：/tmp/test_dir, パーミッション：1777, 所有者：root, グループ：root, 有効期限：５日」でディレクトリを作成する例。

File: `/etc/tmpfiles.d/test_1.conf`

{% highlight bash linenos %}
d /tmp/test_dir 1777 root root 5d
{% endhighlight %}

#### 2-2. ディレクトリが存在しなければ作成し、存在していれば空にする例

「ディレクトリ：/home/foo/test_dir, パーミッション：0755, 所有者：root, グループ：root, 有効期限：無限」でディレクトリを作成する例。

File: `/etc/tmpfiles.d/test_2.conf`

{% highlight bash linenos %}
D /home/foo/test_dir 0755 root root -
{% endhighlight %}

#### 2-3. ファイルが存在しなければ作成する例

「ファイル：/home/foo/test.txt, パーミッション：0777, 所有者：root, グループ：root, 有効期限：無限、ファイル内容：空」でファイルを作成する例。

File: `/etc/tmpfiles.d/test_3.conf`

{% highlight bash linenos %}
f /home/foo/test.txt 0777 root root -
{% endhighlight %}

#### 2-4. ファイルが存在しなければ作成し、存在していれば空にする例

「ファイル：/home/foo/test.txt, パーミッション：0777, 所有者：root, グループ：root, 有効期限：無限、ファイル内容："This is a tmpfiles.d test!"」でファイルを作成する例。

File: `/etc/tmpfiles.d/test_4.conf`

{% highlight bash linenos %}
F /home/foo/test.txt 0777 root root - "This is a tmpfiles.d test!"
{% endhighlight %}

### 3. 参考サイト

* [CentOS 7.0 - man page for tmpfiles.d (centos section 5) - Unix & Linux Commands](http://www.unix.com/man-page/centos/5/tmpfiles.d/ "CentOS 7.0 - man page for tmpfiles.d (centos section 5) - Unix & Linux Commands")

---

意外とよく使用する機能だけど、使用方法について説明しているサイトがあまりないので、備忘録として残しておいた次第です。

以上。

