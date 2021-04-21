---
layout   : single
title    : "Linux - シェルスクリプトで天気予報取得！"
published: true
date     : 2013-09-27 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
---

シェルスクリプトで Web スクレイピング（スパイダリング）してました。

今回は、試しに「[日本気象協会 tenki.jp](http://tenki.jp/ "日本気象協会 tenki.jp")」の「[島根 - 東部（松江）の天気](http://tenki.jp/forecast/city-92.html "島根 - 東部（松江）の天気")」を取得してみます。

最終的にワンライナーで取得できるようにしていますが、順を追って説明します。

<!--more-->

#### 0. 前提条件

- Linux Mint 14 (64bit) での作業を想定。
- bash もしくは zsh での作業を想定。（当方、動作確認済み）
- `curl`, `grep`, `sed`, `head`, `tail` コマンドの詳細は説明しない。（特に難しいオプションは使用していない）
- 正規表現の詳細は説明しない。（特に難しい正規表現は使用していない）
- 取得元サイトの HTML ソースは予期せず変更される場合があるので注意。

#### 1. HTML 取得

日本気象協会の島根県東部（松江市）の天気予報のページの URL は `http://tenki.jp/forecast/city-92.html` なので、`curl` コマンドで HTML を取得する。

``` bash 
$ curl http://tenki.jp/forecast/city-92.html
```

ページの HTML が全部取得される。

#### 2. 必要な行のみ抽出

取得された HTML から、`grep` コマンドで必要な部分のみ抽出する。  
HTML ソースを眺めると分かると思うが、`<p class="wethreDrtalIiconText">` という `<p>` タグ内に天気予報が記述されている。（今日と明日の２箇所）  
なので、`wethreDrtalIiconText` という文字列が存在する行のみを抽出するようにする。

``` bash 
$ curl http://tenki.jp/forecast/city-92.html | grep -e "wethreDrtalIiconText"
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0          <p class="wethreDrtalIiconText">曇</p>
          <p class="wethreDrtalIiconText">晴のち曇</p>
100 62641  100 62641    0     0   109k      0 --:--:-- --:--:-- --:--:--  140k
```

ただし、`curl` コマンドが標準エラー出力に余分な情報も出力する。

#### 3. 標準エラー出力を抑制

`curl` コマンドによる余分な出力情報を破棄するため、以下のようにする。（標準エラー出力を破棄するようにする）

``` bash 
$ curl http://tenki.jp/forecast/city-92.html 2> /dev/null | grep -e "wethreDrtalIiconText"
          <p class="wethreDrtalIiconText">曇</p>
          <p class="wethreDrtalIiconText">晴のち曇</p>
```

#### 4. HTML タグの除去

抽出した行には HTML タグがあるので、`sed` コマンド＋正規表現で除去する。  
`<[^>]*>` は、よくある HTML タグの正規表現。  
また、単一置換なので `-e` オプションは付けなくてもよい。（ただし、常に付ける癖を持っていた方がよい）

``` bash 
$ curl http://tenki.jp/forecast/city-92.html 2> /dev/null | grep -e "wethreDrtalIiconText" | sed -e 's/<[^>]*>//g'
          曇
          晴のち曇
```

#### 5. 行頭のスペース除去

`sed` コマンド＋正規表現で行頭の半角スペースを除去する。  
以下では、半角スペース以外の文字列部分を取得して、その文字列の前に "今日の天気（松江市）" という文字列を追加している。  
半角スペースを削除するだけなら `sed -e 's/ //g'` でよい。

``` bash 
$ curl http://tenki.jp/forecast/city-92.html 2> /dev/null | grep -e "wethreDrtalIiconText" | sed -e 's/<[^>]*>//g' -e 's/^ *\(.*\)$/今日の天気（松江市）：\1/'
今日の天気（松江市）：曇
今日の天気（松江市）：晴のち曇
```

#### 6. 当日分のみ抽出

前項では、今日の天気と明日の天気の２行が表示されてしまうので、`head` コマンドで今日の天気だけを表示するようにする。

``` bash 
$ curl http://tenki.jp/forecast/city-92.html 2> /dev/null | grep -e "wethreDrtalIiconText" | sed '-e s/<[^>]*>//g' -e 's/^ *\(.*\)$/今日の天気（松江市）：\1/' | head -n1
今日の天気（松江市）：曇
```

これで、完成です。

ちなみに、明日の天気を取得したければ以下のようにするとよいでしょう。（`head` コマンドと `tail` コマンドで、取得した２行のうちの最後から１行目を抽出する。また、行頭に付与する文字列も適宜変更する。）

``` bash 
$ curl http://tenki.jp/forecast/city-92.html 2> /dev/null | grep -e "wethreDrtalIiconText" | sed '-e s/<[^>]*>//g' -e 's/^ *\(.*\)$/明日の天気（松江市）：\1/' | head -n2 | tail -1
明日の天気（松江市）：晴のち曇
```

---

今回は上記のような方法で天気予報を取得しましたが、 `sed` コマンドで一気に日本語文字列を取得するような方法もあるでしょう。

簡単な Web スクレイピングなら、シェルスクリプトだけでも実現できることが確認できました。何かと応用できるでしょう。

以上。

