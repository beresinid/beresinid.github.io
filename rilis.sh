#!/bin/bash
# Naikkan versi cache lalu kirim ke GitHub Pages: ./rilis.sh "pesan"
set -e; cd "$(dirname "$0")"
v=$(grep -o 'v=[0-9]*' index.html | head -1 | cut -d= -f2); n=$((v+1))
sed -i '' "s/v=$v/v=$n/g" index.html sw.js; sed -i '' "s/beresin-v$v/beresin-v$n/" sw.js
git add -A; git commit -qm "${1:-Update} (v$n)"; git push -q
echo "Rilis v$n → https://vamosshott18-cloud.github.io/beresin/ (aktif ±1 menit)"
