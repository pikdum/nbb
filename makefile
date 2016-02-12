all:
	make clean
	make win
	make win-update
	make clean
	make linux
	make linux-update
	make darwin
	make darwin-update
	make clean

logo:
	convert logo.png -define icon:auto-resize=64,48,32,16 bin/nbb-win32-x64/logo.ico
	cd bin/nbb-win32-x64 && \
		wine ~/code/resource_hacker/ResourceHacker.exe -addoverwrite "nbb.exe", "nbb.exe", "logo.ico", ICONGROUP, MAINICON, 0 && \
		wine ~/code/resource_hacker/ResourceHacker.exe -addoverwrite "nbb.exe", "nbb.exe", "logo.ico", ICONGROUP, IDR_MAINFRAME, 1033 && \
		wine ~/code/resource_hacker/ResourceHacker.exe -addoverwrite "nbb.exe", "nbb.exe", "logo.ico", ICONGROUP, 1, 0

win:
	electron-packager . nbb --platform=win32 --arch=x64 --out="bin" --ignore="bin" --version=0.36.7 --overwrite --name="nbb"
	make logo

win-update:
	cd bin/nbb-win32-x64 && zip nbb_win.zip * -r && scp nbb_win.zip root@db.kuudere.moe:/root/kuudere.moe/forum-frontend/ && rm nbb_win.zip

linux:
	electron-packager . nbb --platform=linux --arch=x64 --out="bin" --ignore="bin" --version=0.36.7 --overwrite --name="nbb"

linux-update:
	cd bin/nbb-linux-x64 && zip nbb_linux.zip * -r && scp nbb_linux.zip root@db.kuudere.moe:/root/kuudere.moe/forum-frontend/ && rm nbb_linux.zip

darwin:
	electron-packager . nbb --platform=darwin --arch=x64 --out="bin" --ignore="bin" --version=0.36.7 --overwrite --name="nbb"

darwin-update:
	cd bin/nbb-darwin-x64 && zip nbb_osx.zip * -r && scp nbb_osx.zip root@db.kuudere.moe:/root/kuudere.moe/forum-frontend/ && rm nbb_osx.zip

clean:
	rm -f core
	rm -rf bin/*
