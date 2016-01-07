all:
	make clean
	make win
	make win-update
	make clean
	make linux
	make linux-update
	make clean

logo:
	convert logo.png -define icon:auto-resize=64,48,32,16 build/nbb/win64/logo.ico
	cd build/nbb/win64 && wine ~/code/resource_hacker/ResourceHacker.exe -addoverwrite "nbb.exe", "nbb.exe", "logo.ico", ICONGROUP, MAINICON, 0 && wine ~/code/resource_hacker/ResourceHacker.exe -addoverwrite "nbb.exe", "nbb.exe", "logo.ico", ICONGROUP, IDR_MAINFRAME, 1033

win:
	nwbuild -p win64 -v 0.12.3 .
	make logo

win-update:
	cd build/nbb/win64 && zip nbb_win.zip * -R && scp nbb_win.zip root@db.kuudere.moe:/root/kuudere.moe/forum-frontend/ && rm nbb_win.zip

linux:
	nwbuild -p linux64 -v 0.12.3 .

linux-update:
	cd build/nbb/linux64 && zip nbb_linux.zip * -R && scp nbb_linux.zip root@db.kuudere.moe:/root/kuudere.moe/forum-frontend/ && rm nbb_linux.zip

clean:
	rm -rf build
