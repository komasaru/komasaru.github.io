---
layout   : single
title    : "GIS - GMT で出力した PostScript ファイルを JPEG, PNG に変換！"
published: true
date     : 2014-12-21 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- GIS
- 地図
- GMT
---

GMT (The Generic Mapping Tools) で生成した画像ファイルは PostScript 形式となりますが、このままだとファイルサイズが大きく Web サイトに掲載するには負荷になります。

以下、 JPEG 形式、もしくは PNG 形式に変換する方法についての備忘録です。

（当方、 GIS についてはそれほど精通している訳でもありません。ご承知おきください）

<!--more-->

### 0. 前提条件

- Linux Mint 17(64bit) で作業することを想定。
- GMT 5.1.1 での作業を想定。（GMT 4 系は未確認）
- 環境等によっては、以下で紹介しているオプション指定とは異なる結果になるかも知れない。
- 参考までに、当記事最後に ImageMagick `convert` コマンドでの変換方法も記録している。

### 1. PS ファイルを JPEG 形式に変換

以下のように、 PS ファイルを指定して `ps2raster` コマンドを実行するだけ。  
（デフォルトの解像度は 300dpi で大きいので、 `-E100` で解像度を 100dpi に指定している（元の ps 画像と同じサイズの画像に変換するには正確に計算すべきだが））

``` text
$ ps2raster hogehoge.ps -E100
```

"hogehoge.jpg" ファイルが作成されるはずである。  
当方の場合、 2.6MB ほどの PS ファイルが 100KB ほどの JPEG ファイルになった。  

※もしも、作成された JPEG 画像が90度回転するようなら、 `-P`（ポートレート）オプションを使用するとよい。

### 2. PS ファイルを PNG 形式に変換

以下のように、 PS ファイルを指定して `ps2raster` コマンドを `-Tg` オプションを付与して実行するだけ。
（デフォルトの解像度は 300dpi で大きいので、 `-E100` で解像度を 100dpi に指定している（元の ps 画像と同じサイズの画像に変換するには正確に計算すべきだが））

``` text
$ ps2raster hogehoge.ps -Tg -E100
```

"hogehoge.png" ファイルが作成されるはずである。  
当方の場合、 2.6MB ほどの PS ファイルが 28KB ほどの JPEG ファイルになった。  

### 3. ImageMagick の convert コマンドの場合

`ps2raster` コマンドではなく ImageMagick の `convert` コマンドを使用する場合、以下のようにすれば変換できる。  
（デフォルトでは元の ps ファイルより低解像度になるため、 `-density 100` で 100dpi にしている（元の ps 画像と同じサイズの画像に変換するには正確に計算すべきだが））

``` text
$ convert -density 100 hogehoge.ps hogehoge.png
```

（細かいことを言えば、もっと詳細にオプション指定すべきであるが）

---

普段は PS ファイルで出力し、Web 公開等に使用する際に変換すると良いでしょう。

以上。

