pkill -f sync-cip
export FILES_SYNC_ENV=LXCIPPPT401-CIP
nohup node sync-cip.js >> sync-cip.log&
