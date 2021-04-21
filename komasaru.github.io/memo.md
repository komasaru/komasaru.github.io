### 1. How to build.

#### 1-1. Jekyll

``` text
$ cd ~/jekyll
$ rake isolate\[9999-99-99\]
$ rake s
$ rake integrate
$ rake clean      # <= 以降、確認不要なら、 build_all.sh
$ rake b_p
$ ./rsync_op.sh
```

#### 1-2. Octopress (GitHub Pages)

``` text
$ cd ~/octopress_gh
$ bin/rake isolate\[9999-99-99\]
$ bin/rake preview
$ bin/rake integrate
$ bin/rake clean
$ bin/rake generate
```


### 2. How to deploy

``` text
$ cd ~/jekyll
$ rake deploy     # <= 以降、一括処理するなら、 deploy_all.sh
$ ./md2db.rb
$ cd ~/octopress_gh
$ bin/rake deploy
$ firefox -new-tab http://www.mk-mode.com/blog/
```

