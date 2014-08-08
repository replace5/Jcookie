# Jcookie

  cookie合并解决方案
  突破cookie数量限制，在有限的空间内写入更多cookie
=======================
# Demo

```javascript
var cookie = Jcookie('testcookiename');
cookie.cookie('ttt', 123, 3600);   // 以常规方式存入cookie
cookie.cookie('ttt');              // 以常规方式取出cookie
cookie.cookie('ttt', '', -1);      // 以常规方式移除cookie

cookie.set('aaa', 123， 3600);     // 以合并的方式存入cookie
cookie.set('bbb', 123);            // 以合并的方式存入session
cookie.get('aaa');                 // 以合并的方式取出cookie或session
cookie.remove('aaa');              // 以合并的方式移除cookie或session
```