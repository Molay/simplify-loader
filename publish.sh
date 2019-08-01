#!/bin/sh

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR

mkdir -p tmp/dist

cp CHANGELOG CONTRIBUTING.md LICENSE package.json README.md tmp/
cp dist/* tmp/dist/

exit 1

npm publish --access=public tmp

rm -f tmp/dist/*
rmdir tmp/dist
rm -f tmp/*
rmdir tmp
