---
layout   : single
title    : "Ruby, Rails - 元号一覧ページについて！"
published: true
date     : 2017-06-11 00:20:00 +0900
comments : true
categories:
- Webサイト
tags:
- Ruby
- Rails
- カレンダー
---

日本の元号の一覧ページを作成して、公開しております。

今回はそのページの紹介と、元号を集計してみた結果の紹介です。（最近、天皇退位の特例法案が話題なので）

<!--more-->

### 1. 公開ページ

* [mk-mode SITE : 元号一覧](http://www.mk-mode.com/rails/calendar/gengo "mk-mode SITE : 元号一覧")

### 2. 注意事項

* 元号の開始日と終了日は、1582年10月4日までは「ユリウス暦」、1582年10月15日以降は「グレゴリオ暦」である。

### 3. 集計

#### 3.1 件数

* 総件数: 250
  - 文字数が2個の元号: 243  
    ※うち、南北朝: 28 （北: 18, 南: 10）
  - 文字数が4個の元号: 5
  - 元号のない期間: 2

#### 3.2 文字出現回数

<table class='common'>
  <tr><th class='right'>回数</th><th>文字</th></tr>
  <tr><td class='right'>29</td><td>永</td></tr>
  <tr><td class='right'>27</td><td>天、元</td></tr>
  <tr><td class='right'>21</td><td>治</td></tr>
  <tr><td class='right'>20</td><td>応</td></tr>
  <tr><td class='right'>19</td><td>和、長、正、文</td></tr>
  <tr><td class='right'>17</td><td>安</td></tr>
  <tr><td class='right'>16</td><td>延、暦</td></tr>
  <tr><td class='right'>15</td><td>寛、徳、保</td></tr>
  <tr><td class='right'>14</td><td>承</td></tr>
  <tr><td class='right'>13</td><td>仁</td></tr>
  <tr><td class='right'>12</td><td>平、嘉</td></tr>
  <tr><td class='right'>10</td><td>宝、康、建</td></tr>
  <tr><td class='right'> 9</td><td>慶、久</td></tr>
  <tr><td class='right'> 8</td><td>弘、貞、享</td></tr>
  <tr><td class='right'> 7</td><td>禄、明</td></tr>
  <tr><td class='right'> 6</td><td>大</td></tr>
  <tr><td class='right'> 5</td><td>亀</td></tr>
  <tr><td class='right'> 4</td><td>寿、万</td></tr>
  <tr><td class='right'> 3</td><td>化、養、神、観、喜、中、政</td></tr>
  <tr><td class='right'> 2</td><td>雲、護、武</td></tr>
  <tr><td class='right'> 1</td><td>白、雉、朱、鳥、銅、霊、老、感、勝、字、景、同、祥、斉、衡、昌、泰、祚、福、禎、乾、亨、興、国、授、至、吉、昭、成</td></tr>
</table>

---

以上。

