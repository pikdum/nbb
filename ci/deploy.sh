#!/usr/bin/env bash
cat "$3" > key
scp -i key package/* ${1}@${2}:/var/www/files/nbb/
