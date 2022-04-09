npx imba build --baseurl . server.imba
npx touch dist/public/.nojekyll
echo worldgeni.us > dist/public/CNAME
npx gh-pages --no-history --dotfiles --dist dist/public
