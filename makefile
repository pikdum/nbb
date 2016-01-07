all:
	rm -rf build
	nwbuild -p linux64,win64,osx64 -v 0.12.3 .
	cd build/nbb/win64 && zip nbb_win.zip * -R
	cd build/nbb/linux64 && zip nbb_linux.zip * -R
	cd build/nbb/osx64 && zip nbb_osx.zip * -R
	cd build/nbb/ && scp win64/nbb_win.zip linux64/nbb_linux.zip osx64/nbb_osx.zip root@db.kuudere.moe:/root/kuudere.moe/forum-frontend/
