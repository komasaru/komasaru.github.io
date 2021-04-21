#!/bin/bash

cd ~/jekyll
rake clean
rake b_p
./rsync_op.sh

cd ~/octopress_gh
bundle exec rake clean
bundle exec rake generate

