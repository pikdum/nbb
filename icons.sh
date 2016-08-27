#!/usr/bin/env bash
mkdir -p build
cp img/icon.png build/
cd build
cp icon.png 1024x1024.png
convert icon.png -define icon:auto-resize=256,128,64,48,32,16 logo.ico
for i in 512 256 128 32 16; do
	convert 1024x1024.png -resize ${i}x${i} ${i}x${i}.png
done
png2icns icon.icns 16x16.png 32x32.png 128x128.png 256x256.png 512x512.png 1024x1024.png
