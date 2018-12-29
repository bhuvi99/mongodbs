It need Garbage collector. so we need to specify --expose-gc argument. and we need to specify system number

node: 
	node --expose-gc index.js 1
pm2:
	pm2 --no-autorestart start index.js --name opendb5 --node-args="--expose-gc" -- 1  --no-autorestart
