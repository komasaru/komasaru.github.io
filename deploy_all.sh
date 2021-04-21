#!/bin/bash

# Deploy (Jekyll - Home server)
cd ~/jekyll
rake deploy

# DB Insert
./md2db.rb

# Deploy (Octopress - GitHub Pages)
cd ~/octopress_gh
bundle exec rake deploy

# Start Firefox
firefox -new-tab https://www.mk-mode.com/blog/

