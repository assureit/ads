AssureIt
============

開発環境構築
------------

```
mysql -u root -p < ../server/misc/ASEserver.sql  
npm install -g typescript  
npm install -g express  
npm install -g mocha 

npm install  
```

ビルド
------------
```
tsc @compile_list
```


テスト
------------
```
mocha
```


実行
------------
```
npm start
```

もしくは

```
node app
```



本番環境構築
------------

```
npm install --production  
```
