# Jcookie

    更合理的cookie存取方案
    突破cookie数量限制，在有限的空间内写入更多cookie

=======================

## Demo

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

##应用场景
    Jcookie兼顾普通的存取方式，同时为了处理IE6等浏览器的cookie20个cookie的限制，采取了合并压缩的放入存入cookie；
    在同一个域名下，用合并压缩方式存入多个cookie，只占有一个cookie位置;
    更合理的session解决方案，某些浏览器的session过期时间不准确，多窗口浏览器session混乱等问题;
    Jcookie的session过期时间为5s，Jcookie只会在设置session的页面去维护session;
    当当前页面关闭时，5s后session自动过期，当然这个时间是可以调整的。
