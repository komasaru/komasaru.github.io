---
layout   : single
title    : "Linux - シェルスクリプトで Twitter アカウント ID を取得！"
published: true
date     : 2013-09-28 00:20:00 +0900
comments : true
categories:
- PC_Tips
- SNS
tags:
- Linux
- Twitter
- JavaScript
---

Twitter API を使用せず、特定の Twitter アカウントの ID （数字だけのID）を取得する方法についてです。  
今回紹介する方法だと、アカウント ID を取得するだけのことに API 認証までしなくてもよいです。

実際には、シェルスクリプトで HTML を解析する方法になっています。（前回の「[Linux - シェルスクリプトで天気予報取得！]({{site.baseurl}}/2013/09/27/linux-webscraping-by-shellscript "Linux - シェルスクリプトで天気予報取得！")」の応用です）

最終的にワンライナー（１行完結のスクリプト）にしているが、以下で順を追って説明します。  
また、後半ではブラウザ ＋ JavaScript でアカウント ID を取得する方法も紹介しています。

<!--more-->

#### 0. 前提条件

- Linux Mint 14 (64bit) での作業を想定。
- bash もしくは zsh での作業を想定。（当方、動作確認済み）
- `curl`, `grep`, `sed` コマンドの詳細は説明しない。（特に難しいオプションは使用していない）
- 正規表現の詳細は説明しない。（特に難しい正規表現は使用していない）
- 取得元サイトの HTML ソースは予期せず変更されることがあるので注意。
- Twitter のアカウントには、以下の３つがあることを理解しておく。
    * 半角英数字・記号からなる一意の「アカウント名」
    * 任意の「表示名」
    * 数字だけからなる一意の「アカウント ID」

#### 1. HTML 取得

調べたいアカウントの Twitter ページの URL は `https://twitter.com/hoge` なので、`curl` コマンドで以下のようにして HTML を取得する。（"hoge" は調べたいアカウントのアカウント名（API で言うところの screen_name））

``` bash 
$ curl https://twitter.com/hoge
```

ページの HTML が全部取得される。

#### 2. 必要な行のみ抽出

取得された HTML から、`grep` コマンドで必要な部分のみ抽出する。  
HTML ソースを眺めると分かると思うが、`<div class="profile-card-inner" data-screen-name="hoge" data-user-id="999999999">` という行を抽出すればよい。  
なので、`profile-card-inner` という文字列が存在する行のみを抽出するようにする。  
（"data-screen-name" や "data-user-id" を含む行を抽出してもよいが、それらは複数行存在する。１行しか存在しない "profile-card-inner" を含む行を抽出する方が簡素な処理になるだろう）

``` bash 
curl https://twitter.com/hoge | grep -e "profile-card-inner"
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
 14  181k   14 26536    0     0  25541      0  0:00:07  0:00:01  0:00:06 31292    <div class="profile-card-inner" data-screen-name="hoge" data-user-id="999999999">
100  181k  100  181k    0     0   108k      0  0:00:01  0:00:01 --:--:--  122k
```

ただし、`curl` コマンドが標準エラー出力に余分な情報も出力する。

#### 3. 標準エラー出力を抑制

`curl` コマンドによる余分な出力情報を破棄するため、以下のようにする。（標準エラー出力を破棄するようにする）

``` bash 
$ curl https://twitter.com/hoge 2> /dev/null | grep -e "profile-card-inner"
    <div class="profile-card-inner" data-screen-name="hoge" data-user-id="999999999">
```

#### 4. 該当の数字文字列を抽出

取得した行内の "data-user-id" に設定されている数字を `sed` コマンド＋正規表現で抽出する。

``` bash 
$ curl https://twitter.com/hoge 2> /dev/null | grep -e "profile-card-inner" | sed -e 's/^.*data-user-id="\(.*\)">$/ID: \1/'
ID: 999999999
```

これで完成である。

#### 5. その他（ブラウザで JavaScript を使用する方法）

HTML 内の指定の属性の値を取得するという意味で考えると、JavaScript を使用してアカウント ID を取得することもできる。

以下のような文字列を URL としてブラウザのお気に入りに登録する。

``` text 
javascript:(function(){window.alert('ID:'+$('.profile-card-inner[data-user-id]').attr('data-user-id'));})()
```

そして、アカウント ID を調べたいアカウントのページ（`https://twitter.com/hoge`）を開き、ブックマークから実行する（先ほどの登録したリンクを開く）と、ダイアログが開いてアカウント ID が表示される。

---

他にも方法はあるかも知れませんが、当方はこれらで落ち着いています。  
ブラウザ＋ JavaScript でアカウント ID を調べるほうが多いかも知れませんが。。。

ただ、当然ながら処理するアカウントが大量にある場合などは、定石とおり Twitter API で認証して取得する方法が良いでしょう。

以上。

