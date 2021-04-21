---
layout   : single
title    : "Ruby, Rails - ISS 軌道（位置／速度）計算ページ！"
published: true
date     : 2018-09-11 00:20:00 +0900
comments : true
categories:
- Webサイト
tags:
- Ruby
- Rails
- Python
- 人工衛星
---

前回、 Python で ISS（きぼう）の軌道（位置／速度）計算をしました。

今回は、当方の Rails 製 Web サイト上で計算できるようにしました。（但し、裏での計算は Python を使用）  
また、10秒間隔で48時間分の軌道を確認するための JSON データも公開するようにしました。

そのページの紹介のみです。

<!--more-->

### 0. 公開ページ

* [mk-mode SITE : ISS（きぼう）軌道計算](https://www.mk-mode.com/rails/iss/ "mk-mode SITE : ISS（きぼう）軌道計算")
* [JSON データ](https://www.mk-mode.com/rails/iss/iss.json "JSON データ")

### 1. ページのイメージ

![ISS_ORBIT_1]({{site.baseurl}}/images/2018/09/11/ISS_ORBIT_1.png "ISS_ORBIT_1")
![ISS_ORBIT_2]({{site.baseurl}}/images/2018/09/11/ISS_ORBIT_2.png "ISS_ORBIT_2")

### 2. 注意事項

* 軌道計算ページで指定する日時は JST（日本標準時）。
* 「計算」実行後、裏で Python で計算している。
* 計算の流れが把握できるよう、途中経過も出力している。
* 計算に使用する測地系（楕円体）は WGS84 である。
* JSON データは、当方サーバでの処理の都合上、日時の指定は不可としている。
* JSON データは10秒間隔で48時間分（17,280件）あるので、ブラウザ等で開く際は重さに注意。

---

以上。

