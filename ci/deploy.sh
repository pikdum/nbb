#!/usr/bin/env bash
echo "$3" > key
scp -o StrictHostKeyChecking=no -i key package/* ${1}@${2}:/var/www/files/nbb/
