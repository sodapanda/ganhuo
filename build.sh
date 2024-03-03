rm -fr public
rm -fr electron_app/public
npm run build
mv public electron_app/. 