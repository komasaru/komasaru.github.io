---
layout   : single
title    : "Google App Engine SDK for Python！"
published: true
date     : 2013-11-18 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Google
- Python
---

Google 提供の Web アプリケーション作成ツール Google App Engine（略して GAE） の環境を簡単に整えてみました。  
PHP, Python, Java, Go 等が対応しているようですが、今回は Python 版環境を整備します。

<!--more-->

### 0. 前提条件

- Linux Mint 14(64bit) での作業を想定。
- Python 2.7.3 がインストール済みであると想定。

### 1. アーカイブダウンロード

「[Downloads - Google App Engine — Google Developers](https://developers.google.com/appengine/downloads?hl=ja&csw=1#Google_App_Engine_SDK_for_Python "Downloads - Google App Engine — Google Developers")」から "google_appengine_1.8.6.zip" をダウンロードし、展開しておく。（展開する場所は、ユーザのルートとした）

### 2. デモアプリ起動

コンソール上で展開したディレクトリへ移動し、以下のように実行する。

``` text 
$ python dev_appserver.py demos/python/guestbook
Allow dev_appserver to check for updates on startup? (Y/n):
dev_appserver will check for updates on startup.  To change this setting, edit /home/masaru/.appcfg_nag
INFO     2013-10-18 05:15:36,240 sdk_update_checker.py:245] Checking for updates to the SDK.
INFO     2013-10-18 05:15:36,806 sdk_update_checker.py:273] The SDK is up to date.
WARNING  2013-10-18 05:15:37,051 simple_search_stub.py:1009] Could not read search indexes from /tmp/appengine.guestbook.masaru/search_indexes
INFO     2013-10-18 05:15:37,053 api_server.py:139] Starting API server at: http://localhost:44594
INFO     2013-10-18 05:15:37,068 dispatcher.py:171] Starting module "default" running at: http://localhost:8080
INFO     2013-10-18 05:15:37,069 admin_server.py:117] Starting admin server at: http://localhost:8000
```

アップデートの確認をするかどうか聞かれるのでそのままエンターを押下する。

### 3. 動作確認

ブラウザで `http://127.0.0.1:8080/` にアクセスすると、画面が表示される。  
テキストボックスに何か文字列を入力し "Sign Guestbook" ボタンをクリックするとテキストボックスの丈夫に入力した文字列が表示される。

![GAE_PYTHON_DEMO]({{site.baseurl}}/images/2013/11/18/GAE_PYTHON_DEMO.png "GAE_PYTHON_DEMO")

終了は、コンソール上で `CTRL` + `C` を押下する。

### 参考サイト

- [Google App Engine — Google Developers](https://developers.google.com/appengine/?hl=ja "Google App Engine — Google Developers")

---

実際、あるデモアプリを動かすために今回 Google App Engine for Python 環境を整備しましたが、現在はそのアプリのバージョンや Python, Google App Engine のバージョンの整合性の関係で、結局うまく動作しませんでした。（そのデモアプリに関しては）

今後、Google App Engine を使用するかどうかは不明ですが、念の為に記録として残しておいた次第です。

以上。

