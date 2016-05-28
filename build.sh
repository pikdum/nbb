#!/usr/bin/env bash
electron-packager . nbb --platform=linux,win32,darwin --arch=x64 --version=1.1.1
zip -q -r nbb-linux-x64.zip nbb-linux-x64/*
zip -q -r nbb-win32-x64.zip nbb-win32-x64/*
zip -q -r nbb-darwin-x64.zip nbb-darwin-x64/*
