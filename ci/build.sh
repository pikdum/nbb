#!/usr/bin/env bash
npm install -g electron-packager
apt-get update
apt-get install zip -y
electron-packager nbb nbb --platform=linux,win32,darwin --arch=x64 --version=1.1.1
zip -r nbb-linux-x64.zip nbb-linux-x64/*
zip -r nbb-win32-x64.zip nbb-win32-x64/*
zip -r nbb-darwin-x64.zip nbb-darwin-x64/*
mv *.zip package/
