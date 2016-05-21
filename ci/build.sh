#!/usr/bin/env bash
npm install -g electron-packager
apt-get update
apt-get install zip -y
electron-packager nbb nbb --platform=linux,win32,darwin --arch=x64 --version=1.1.1
DATE=$(date +%Y%m%d%H%M%S)
zip -q -r $(DATE)_nbb-linux-x64.zip nbb-linux-x64/*
zip -q -r $(DATE)_nbb-win32-x64.zip nbb-win32-x64/*
zip -q -r $(DATE)_nbb-darwin-x64.zip nbb-darwin-x64/*
mv *.zip package/
