#! /bin/sh

rm -rf distro
PACKAGE_ID=$(node -p -e "require('./package.json').name+'_'+require('./package.json').version")
echo $PACKAGE_ID
rsync -ma --exclude '*.ts' out src manifest.json package.json LICENSE README.md icons distro
cd distro
zip -r ../$PACKAGE_ID.zip .