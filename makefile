all:
	rm -rf build
	nwbuild -p linux64,win64 -v 0.12.3 .
	cd build/nbb/win64 && zip nbb_win.zip * -R
	cd build/nbb/linux64 && zip nbb_linux.zip * -R
	scp build/nbb/win64/nbb_win.zip build/nbb/linux64/nbb_linux.zip root@db.kuudere.moe:/root/kuudere.moe/forum-frontend/
