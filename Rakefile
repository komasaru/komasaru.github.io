require "rubygems"
require 'yaml'
require 'net/http'

# ## -- Rsync Deploy config -- ##
# # Be sure your public key is listed in your server's ~/.ssh/authorized_keys file
ssh_user       = "masaru@vostro.mk-mode.com"
ssh_port       = "6835"
document_root  = "/var/www/jekyll/"
rsync_delete   = true
rsync_args     = ""  # Any extra arguments to pass to rsync
deploy_default = "rsync"
# 
# # This will be configured for you when you run config_deploy
deploy_branch  = "gh-pages"

## -- Misc Configs -- ##

public_dir      = "_site"     # compiled site directory
source_dir      = "source"    # source file directory
stash_dir       = "_stash"    # directory to stash posts for speedy generation
posts_dir       = "_posts"    # directory for blog files


#######################
# Working with Jekyll #
#######################


# Usage: rake isolate[my-post]
desc "Move all other posts than the one currently being worked on to a temporary stash location (stash) so regenerating the site happens much more quickly."
task :isolate, :filename do |t, args|
  FileUtils.mkdir(stash_dir) unless File.exist?(stash_dir)
  Dir.glob("#{posts_dir}/*.*") do |post|
    FileUtils.mv post, stash_dir unless post.include?(args.filename)
  end
end


desc "Move all stashed posts back into the posts directory, ready for site generation."
task :integrate do
  puts "## Integrating post data"
  FileUtils.mv Dir.glob("#{stash_dir}/*.*"), "#{posts_dir}/"
end


desc "Removes the generated site and metadata, sass-cache files"
task :clean do
  puts "## Removing the generated site and metadata, sass-cache files"
  system "bundle exec jekyll clean"
end


desc "Build the Jekyll site"
task :build do
  puts "## Building the site with Jekyll"
  system "bundle exec jekyll build --future"
end
task :b => :build do
end
task :build_production do
  puts "## Building the site with Jekyll"
  system "JEKYLL_ENV=production bundle exec jekyll build --future"
end
task :b_p => :build_production do
end


desc "Preview the site in a web browser (after build)"
task :serve do
  puts "## Building, previewing the site in a web browser"
  system "bundle exec jekyll serve --future"
end
task :s => :serve do
end


desc "Preview the site in a web browser (without build)"
task :serve_without_build do
  puts "## Previewing the site in a web browser (without build)"
  system "bundle exec jekyll serve --skip-initial-build"
end
task :s_nb => :serve_without_build do
end


desc "Deploy the site"
task :deploy do
  Rake::Task["#{deploy_default}"].execute

  # PubSubHubbub
  #cfg = YAML.load_file('_config.yml')
  #cfg["hub_urls"].each do |hub_url|
  #  resp, data = Net::HTTP.post_form(
  #    URI.parse(hub_url),
  #    {'hub.mode' => 'publish','hub.url' => cfg["atom_feed"]["path"]}
  #  )
  #  raise "!! Hub notification error: #{resp.code} #{resp.msg}, #{data}" unless resp.code == "204"
  #  puts "## Notified hub (#{hub_url}) that feed #{cfg["atom_feed"]["path"]} has been updated"
  #end
end
task :d => :deploy do
end

desc "Rsync website data"
task :rsync do
  puts "## Deploying the site via Rsync"
  exclude = ""
  if File.exists?('./rsync-exclude')
    exclude = "--exclude-from '#{File.expand_path('./rsync-exclude')}'"
  end
  ok_failed system("rsync -avze 'ssh -p #{ssh_port}' #{exclude} #{rsync_args} #{"--delete" unless rsync_delete == false} #{public_dir}/ #{ssh_user}:#{document_root}")
end


desc "list tasks"
task :list do
  puts "Tasks: #{(Rake::Task.tasks - [Rake::Task[:list]]).join(', ')}"
  puts "(type rake -T for more detail)\n\n"
end


def ok_failed(condition)
  if (condition)
    puts "OK"
  else
    puts "FAILED"
  end
end

