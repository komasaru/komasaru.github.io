---
layout   : single
title    : "JPL 天文暦バイナリデータの仕様！"
published: true
date     : 2016-04-22 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- カレンダー
---

NASA の機関である JPL(Jet Propulsion Laboratory) が惑星探査用に編纂・発行している月・惑星の暦の最新版 DE430 には、テキスト形式のデータの他にバイナリ形式のデータが存在します。実際には１つにまとめたバイナリ形式のデータファイルを参照することが多いようです。

今回は DE430 のバイナリ形式データの仕様について、 FORTRAN77 プログラムを解析して理解できた内容についての記録です。

<!--more-->

### 1. DE430 バイナリ形式データの仕様

* Intel x86, IA64 等の環境では、エンディアンはリトルエンディアンである。
* テキスト形式データを JPL 提供の FORTRAN77 プログラム等でマージ＆バイナリ化した場合は `KSIZE` の値が設定されているが、 JPL が提供するバイナリ形式データでは `KSIZE` の値が設定されていない。（別途テキスト形式ファイルを参照して `KSIZE` 値を得る必要がある）
* ヘッダ部分は 4 * KSIZE バイトのレコード２個で構成されている。
* ヘッダ部分の後ろに係数の一覧が格納されている

以下、仕様。（項目名のアルファベットは FORTRAN77 プログラムで使用されている変数。データ型は FORTRAN77 でのもの）

<table class="common">
  <tr>
    <th>オフセット</th><th>項目名</th><th>データ型</th><th>項目数</th><th>備考</th>
  </tr>
  <tr>
    <td>4 * KSIZE * 0</td>
    <td>TTL（タイトル）</td>
    <td>CHARACTER * 84</td>
    <td>3</td>
    <td>84 byte * 3</td>
  </tr>
  <tr>
    <td></td>
    <td>CNAM（定数名）</td>
    <td>CHARACTER * 6</td>
    <td>400</td>
    <td>6 byte * 400</td>
  </tr>
  <tr>
    <td></td>
    <td>SS（ユリウス日（開始、終了）、分割日数）</td>
    <td>DOUBLE PRECISION</td>
    <td>3</td>
    <td>8 byte * 3</td>
  </tr>
  <tr>
    <td></td>
    <td>NCON（定数の数）</td>
    <td>INTEGER</td>
    <td>1</td>
    <td>4 byte * 1</td>
  </tr>
  <tr>
    <td></td>
    <td>AU（天文単位）</td>
    <td>DOUBLE PRECISION</td>
    <td>1</td>
    <td>8 byte * 1</td>
  </tr>
  <tr>
    <td></td>
    <td>EMRAT（地球と月の質量比）</td>
    <td>DOUBLE PRECISION</td>
    <td>1</td>
    <td>8 byte * 1</td>
  </tr>
  <tr>
    <td></td>
    <td>IPT（オフセット、係数の数、サブ区間数）（水星〜月・章動）</td>
    <td>INTEGER</td>
    <td>3 * 12</td>
    <td>4 byte * 3 * 12</td>
  </tr>
  <tr>
    <td></td>
    <td>NUMDE（DEバージョン番号）</td>
    <td>INTEGER</td>
    <td>1</td>
    <td>4 byte * 1</td>
  </tr>
  <tr>
    <td></td>
    <td>IPT（オフセット、係数の数、サブ区間数）（月・秤動）</td>
    <td>INTEGER</td>
    <td>1</td>
    <td>4 byte * 3 * 1</td>
  </tr>
  <tr>
    <td></td>
    <td>パディング領域</td>
    <td></td>
    <td></td>
    <td>4 * KSIZE byte の残りの部分</td>
  </tr>
  <tr>
    <td>4 * KSIZE * 1</td>
    <td>CVAL（定数値）</td>
    <td>DOUBLE PRECISION</td>
    <td>NCON の値</td>
    <td>8 byte * NCON 値</td>
  </tr>
  <tr>
    <td></td>
    <td>パディング領域</td>
    <td></td>
    <td></td>
    <td>4 * KSIZE byte の残りの部分</td>
  </tr>
  <tr>
    <td>4 * KSIZE * 2</td>
    <td>CVAL（係数値）</td>
    <td>DOUBLE PRECISION</td>
    <td></td>
    <td>8 byte の連続<br /> 最初の2項目はそのインデックスに<br /> おけるユリウス日（開始、終了）<br /> 3項目目以降が系数値<br/>さらに、これの繰り返し</td>
  </tr>
</table>

* 系数値の並びはテキスト形式データと同じ。（[月・惑星の暦 JPL DE430 について！ - mk-mode BLOG]({{site.baseurl}}/2016/04/14/about-jpl-de430 "月・惑星の暦 JPL DE430 について！ - mk-mode BLOG")を参照）

---

以上。

