---
layout   : single
title    : "Debian 10 (buster) - Git インストール（ソースビルド）！"
published: true
date     : 2020-01-14 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- Git
---

Debian GNU/Linux 10 (buster) に Git サーバをソースをビルドしてインストールする方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10 (buster) での作業を想定。
* Git 2.23.0 （当記事執筆時点で最新）を Git サーバとしてインストールすることを想定。
* アーカイブ保存先は `/usr/local/src` を想定。
* クライアントからアクセスがあった時だけサーバを起動するために xinetd を使用する。
* root ユーザでの作業を想定。

### 1. 依存パッケージのインストール

``` text
# apt -y install xinetd libcurl4-gnutls-dev libexpat1-dev \
gettext libz-dev libssl-dev
```

### 2. アーカイブファイルの取得＆展開

``` text
# cd /usr/local/src
# wget https://www.kernel.org/pub/software/scm/git/git-2.23.0.tar.gz
# tar zxvf git-2.23.0.tar.gz
```

ちなみに、最新版のソースを使用したければ、以下のように取得すればよい。

``` text
# git clone https://github.com/git/git
```

### 3. ビルド＆インストール

``` text
# cd git-2.23.0
# make prefix=/usr/local all
# make prefix=/usr/local install
```

### 4. インストールの確認

``` text
# git --version
git version 2.23.0
```

### 5. xinetd 設定ファイルの作成

デフォルトでは存在しないので作成する。

File: `/etc/xinetd.d/git`

{% highlight bash linenos %}
service git
{
        disable         = no
        socket_type     = stream
        wait            = no
        user            = nobody
        server          = /usr/local/libexec/git-core/git-daemon
        server_args     = --base-path=/var/lib/git --export-all --user-path=public_git --syslog --inetd --verbose
        log_on_failure  += USERID
}
{% endhighlight %}

### 6. Xinetd の再起動

``` text
# systemctl restart xinetd
```

### 7. リポジトリの作成

作成先は `/etc/xinetd.d/git` の `--base-path` に指定している `/var/lib/git/` とした。（以下は `test.git` という Git リポジトリを作成する例）

``` text
# cd /var/lib/
# mkdir -p git/public_git
# cd git/public_git
# git --bare init --shared test.git
Initialized empty shared Git repository in /var/lib/git/public_git/test.git/
```

### 8. Git 用グループの作成

``` text
# groupadd git
```

### 9. 権限の変更

リポジトリの所有者・所有グループを変更する。

``` text
# chown -R root:git .
```

### 10. リポジトリのディレクトリを確認

現状のリポジトリ内を確認してみる。

``` text
合計 32
-rw-rw-r-- 1 root git   23 10月  2 12:05 HEAD
drwxrwsr-x 2 root git 4096 10月  2 12:05 branches
-rw-rw-r-- 1 root git  126 10月  2 12:05 config
-rw-rw-r-- 1 root git   73 10月  2 12:05 description
drwxrwsr-x 2 root git 4096 10月  2 12:05 hooks
drwxrwsr-x 2 root git 4096 10月  2 12:05 info
drwxrwsr-x 4 root git 4096 10月  2 12:05 objects
drwxrwsr-x 4 root git 4096 10月  2 12:05 refs
```

### 11. 動作確認

ここではクライアント側からの操作について説明はしないが、各種作業を行い問題がないことを確認しておく。  
(`git status`, `git add`, `git clone`, `git push`, `git pull` etc.)

### 12. 参考サイト

* [Git - Downloads](http://git-scm.com/downloads "Git - Downloads")
* [Git - Git のインストール](http://git-scm.com/book/ja/v1/%E4%BD%BF%E3%81%84%E5%A7%8B%E3%82%81%E3%82%8B-Git%E3%81%AE%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB "Git - Git のインストール")

---

以上。

