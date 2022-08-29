#!/bin/sh

npm install --registry=https://registry.npm.taobao.org

version=`git rev-parse HEAD | cut -c1-10`

sed -i "s/^VUE_APP_VERSION.*/VUE_APP_VERSION = ${version}/" .env.production
sed -i "s/^VUE_APP_VERSION.*/VUE_APP_VERSION = ${version}-dev/" .env.development

npm run build:prod

git checkout .env.production
git checkout .env.development

