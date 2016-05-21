#!/usr/bin/env bash
echo "$3" > key
chmod 600 key
echo "$3"
cat key
scp -o StrictHostKeyChecking=no -i key package/* ${1}@${2}:/var/www/files/nbb/
