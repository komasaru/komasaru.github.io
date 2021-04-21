---
layout   : single
title    : "Linux - 大量ユーザの一括作成、パスワード一括変更！"
published: true
date     : 2014-11-09 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
---

Linux で一般ユーザを追加作成する際 `useradd`, `adduser` コマンドを使用すると思いますが、一度に大量に作成したい場合に面倒に感じてしまいます。

一括作成の方法は様々なサイト等で紹介されていますが、その方法だけでは `useradd`, `adduser` で登録した場合と状態が異なります。  
"/etc/skel" ディレクトリ配下がコピーされないのです。（以前は、パスワードの暗号(HASH)化方式も異なっていたが、現在は `useradd`, `adduser` で登録した場合も（下記の方法で）一括登録した場合も SHA-512 がデフォルトとなっているので相違（問題）はない）

以下、一括作成する方法についての記録です。（パスワード一括変更方法、暗号化方式の変更方法も）

<!--more-->

### 0. 前提条件

* Linux Mint 17(64bit), CentOS 7.0(64bit) での作業を想定。
* 以下では、ユーザ一括作成とディレクトリコピーを一度に行うようにしているが、好みに合わせて変更してください。
* Linux でのユーザ管理についての基本的な知識がある。

### 1. 作成ユーザ一覧作成

一括作成するユーザの一覧をテキストファイルに作成する。  
（ファイル名は任意。ここでは、"addusers.txt" としている）

* 書式は "/etc/passwd" と同じで `ユーザー名:パスワード:ユーザID:グループID:フルネーム:ホームディレクトリ:ログインシェル` である。
* 「ユーザID」と「グループID」は、省略すると自動で設定される。明示的に指定したければ入力する。（グループの作成方法はここでは省略）
* 空行を作らないこと。（特に、最終行に改行のみの行を作らない）

File: `addusers.txt`

{% highlight text linenos %}
foo:foo_password::::/home/foo:/bin/bash
bar:bar_password::::/home/bar:/bin/bash
baz:baz_password::::/home/baz:/bin/bash
{% endhighlight %}

### 2. シェルスクリプト作成

ユーザ作成、 "/etc/skel" ディレクトリ配下のコピーを行うシェルスクリプトを以下のように作成する。（当方の例）

File: `addusers.sh`

{% highlight bash linenos %}
#!/bin/bash

FILE_U="addusers.txt"
FILE_P="/etc/passwd"

newusers $FILE_U

for line in `cat $FILE_U`
do
    user_name=`echo $line | cut -d ':' -f 1`
    txt=`cat $FILE_P | grep -e "^$user_name"`
    user_id=`echo $txt | cut -d ':' -f 3`
    group_id=`echo $txt | cut -d ':' -f 4`
    home_dir=`echo $txt | cut -d ':' -f 6`
    echo "USER_ID:${user_id} GROUP:${group_id} HOME_DIR:$home_dir"
    cp -rf /etc/skel/* $home_dir/
    chown -R $user_id  $home_dir
    chgrp -R $group_id $home_dir
done
{% endhighlight %}

上記のスクリプトで「ユーザID」、「グループID」等を "/etc/passwd" から取得しているのは、作成した一覧ファイルで指定しないことがあるため。

### 3. シェルスクリプト実行

以下のように実行する。

``` text
$ ./addusers.sh
USER:1001 GROUP:1002 HOME_DIR:/home/foo
USER:1002 GROUP:1003 HOME_DIR:/home/bar
USER:1003 GROUP:1004 HOME_DIR:/home/baz
```

### 4. 確認

ユーザが作成されたか確認してみる。

``` text
$ cat /etc/passwd
        :
===< 途中省略 >===
        :
foo:x:1001:1002::/home/foo:/bin/bash
bar:x:1002:1003::/home/bar:/bin/bash
baz:x:1003:1004::/home/baz:/bin/bash
```

パスワードが登録暗号化されているか確認してみる。（以下の暗号は架空）

``` text
$ sudo cat /etc/shadow
        :
===< 途中省略 >===
        :
foo:$6$Mp.vm7n3$Q1fpBDt.3KRtR2n2BujOLScDA3ZI8ubeNU8FA1DdYDvZKOryQPYGYtIDwufwF85OrhiHnsyDpys0KJ2y/W534/:16361:0:99999:7:::
bar:$6$B.Jyyj3J$EfTjMikFXUJrWvPEV7Z1HGySBl.KFofhqXyGK46wBGJgpUuyy.1snhPGgNUz97dewVV50XfKv92tB/JeyzyZS1:16361:0:99999:7:::
baz:$6$qv9zbLuG$usgfPu.fUgCDFjG3mYYdN.mXYjRXfCwdG0PSBthVa9q5kKVBavf0kJNq/vrmoPLRJSow1P.GdIhm3M4qCInnT.:16361:0:99999:7:::
```

暗号化されたパスワードの先頭が `$6$`(SHA-512) であることを確認する。

ちなみに、 `:` 区切りで以下のように設定されている。（`man shadow` 等参照）

1. ユーザ（ログイン）名
2. 暗号化されたパスワード  
  1, 3 カラム目の `$` で囲まれた数字が  
  `1` なら、MD5  
  `2a` なら、Blowfish （本流の glibc には入っていない。いくつかの Linux ディストリビューションで追加されている）  
  `5` なら、SHA-256 （glibc 2.7 以降）  
  `6` なら、SHA-512 （glibc 2.7 以降）
3. 1970-01-01 から最後にパスワードが変更された日までの日数
4. パスワードが変更可能となるまでの日数
5. パスワードを変更しなくてはならなくなる日までの日数
6. パスワード有効期限が来る前に、ユーザが警告を受ける日数
7. パスワード有効期限が過ぎてからアカウントが使用不能になるまでの日数
8. 1970-01-01からアカウントが使用不能になる日までの日数
9. 予約フィールド

さらに、 "/home" ディレクトリ配下にユーザディレクトリが作成されて、 "/etc/skel" ディレクトリ配下がコピーされ、適切なパーミッション設定になっているか確認する。

``` text
$ ls -l /home/
drwx------   5 foo       foo         42 10月 19 03:54 foo
drwx------   5 bar       bar         42 10月 19 03:54 bar
drwx------   5 baz       baz         42 10月 19 03:54 baz

$ ls -l /home/foo/
合計 0
drwx------ 5 foo foo 36 10月 19 03:54 Maildir
drwxr-xr-x 2 foo foo 22 10月 19 03:54 etc
drwxr-xr-x 2 foo foo  6 10月 19 03:54 samba
```

### 5. パスワード一括変更

ユーザの一括作成同様、パスワードも一括変更が可能。

以下のような、ユーザ名と変更後パスワードを `:` でつなげたテキストファイルを作成し、

File: `chpasswd.txt`

{% highlight text linenos %}
hoge:hogehoge1234
fuga:fugafuga2345
{% endhighlight %}

以下のように実行すれば良い。

``` text
# chpasswd < chpasswd.txt
```

> **但し、古いバージョンのディストリビューションではパスワード暗号化方式の違いにより、パスワードの先頭から８文字しか認識しない場合もあるので注意。  
> パスワード暗号化方式を変更する等対処すること。**

### 6. パスワード暗号化方式を変更する場合

（通常、パスワード暗号化方式を変更する機会はないと思われる。以下は、変更せざるを得なくなった場合のみ）

少し前までは "/etc/login.defs" の `ENCRYPT_METHOD` の値を `SHA512`, `SHA256`, `MD5` 等に変更することでパスワード暗号化方式が変更できていた。  
（更に前は、暗号化方式を MD5 にしたい場合は `MD5_CRYPT_ENAB yes` とするなどしていた）  

しかし、現在は "/etc/login.defs" の設定は PAM に取って代わっているため、 "/etc/login.defs" を編集しても期待する結果にはならない。

Linux Mint の場合は、 "/etc/pam.d/passwd", "/etc/pam.d/chpasswd" が include している "/etc/pam.d/common-password" を以下のように編集して暗号化方式を変更することができる。（以下は SHA-256 に変更する例）

File: `/etc/pam.d/common-password`

{% highlight bash linenos %}
password»-[success=1 default=ignore]»-pam_unix.so obscure sha256
{% endhighlight %}

CentOS の場合は、以下のようにすることで暗号化方式を変更することができる。（但し、 SELinux が有効であること）（以下は SHA-256 に変更する例）

File: `/etc/pam.d/system-auth-ac`

{% highlight bash linenos %}
# authconfig --test | grep hashing       # <= 現在の暗号化方式確認
 password hashing algorithm is sha512

# authconfig --passalgo=sha256 --update  # <= 暗号化方式を SHA-256 に変更
getsebool:  SELinux is disabled          # <= SELinux の状態を出力しているだけなので問題なし

# authconfig --test | grep hashing       # <= 現在の暗号化方式確認
 password hashing algorithm is sha256
{% endhighlight %}

### 参考サイト

* [Man page of CRYPT](http://linuxjm.sourceforge.jp/html/LDP_man-pages/man3/crypt.3.html "Man page of CRYPT")
* [Man page of LOGIN.DEFS](http://linuxjm.sourceforge.jp/html/shadow/man5/login.defs.5.html "Man page of LOGIN.DEFS")

---

当方の場合、自宅サーバでユーザを追加する機会が多いので記録しておいた次第です。（主にメールアカウント追加）

以上。

