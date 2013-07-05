AssureIt
============

開発環境構築
------------

```
mysql -u root -p < db/create_user_test.sql
mysql -u root -p ads < db/create_tables.sql
mysql -u root -p ads < db/initial_data.sql
 
cd app
// TODO: 下記のinstall -g作業を不要にする
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
mocha --recursive
```

テストデバッグ実行
------------
https://github.com/visionmedia/mocha/issues/247
```
npm -g install node-inspector
node-inspector
mocha --debug-brk --recursive
```
Launch http://127.0.0.1:8080/debug?port=5858 in Chrome.


実行
------------
```
npm start
```

もしくは

```
node app
```
OpenLDAPダミーサーバー起動方法
------------
Unitテストで認証確認等が必要な場合
```
npm run-script start_ldap
```
ブラウザで使用する場合
```
npm run-script start_ldap2
```

本番環境構築
------------

```
npm install --production  
```
