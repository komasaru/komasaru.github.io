---
layout   : single
title    : "Linux - curl コマンドで IP アドレス等を確認！"
published: true
date     : 2016-06-02 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
---

curl コマンドを使用して、自身（やその他）のグローバル IP アドレスやホスト名等を確認する方法についての備忘録です。

<!--more-->

### 0. 前提条件

* 当方、Linux Mint 17.2(64bit) で動作を確認。
* curl コマンドが導入済みであること。（大抵は既インストールのはず）

### 1. コマンドの実行

`curl` コマンドで URL に `ipinfo.io` を指定するだけ。

``` text
$ curl ipinfo.io
{
  "ip": "aaa.bbb.ccc.ddd",
  "hostname": "vvvv.wwww.xxxx.yyyy.zzzz.infoweb.ne.jp",
  "city": "Tokyo",
  "region": "Tokyo",
  "country": "JP",
  "loc": "35.6850,139.7514",
  "org": "AS2510 FUJITSU LIMITED",
  "postal": "100-0001"
}
```

<table class="common">
  <tr><th>キー</th><th>説明</th></tr>
  <tr><td>ip</td><td>グリーバルIPアドレス</td></tr>
  <tr><td>hostname</td><td>ホスト名</td></tr>
  <tr><td>city</td><td>対象組織のある都市の名称</td></tr>
  <tr><td>region</td><td>対称組織のある地域の名称</td></tr>
  <tr><td>country</td><td>対称組織のある国のコード (ISO 3166-1 alpha-2準拠)</td></tr>
  <tr><td>loc</td><td>対象組織のある場所の緯度と経度</td></tr>
  <tr><td>org</td><td>対象組織の名称</td></tr>
  <tr><td>postal</td><td>郵便番号</td></tr>
</table>

また、`ipinfo.io` の後ろに `/aaa.bbb.ccc.ddd` のように IP アドレスを指定すれば、その IP アドレスの情報が返ってくる。

``` text
curl ipinfo.io/8.8.8.8
{
  "ip": "8.8.8.8",
  "hostname": "google-public-dns-a.google.com",
  "city": "Mountain View",
  "region": "California",
  "country": "US",
  "loc": "37.3845,-122.0881",
  "org": "AS15169 Google Inc.",
  "postal": "94040"
}
```

---

何かと有用でしょう。

以上。

