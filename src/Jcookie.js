(function(window, document) {
	function is_array(variable) {
		return Object.prototype.toString.call(variable).indexOf('Array') !== -1;
	}

	/**
	 * 字符串分割函数
	 */
	function string_split(string) {
		var c,
			cur_str = '',
			cache = [],
			result = [];
		for (var i = 0; i < string.length; i++) {
			c = string.charAt(i);
			switch(c) {
				case '\\':
					cur_str += string.charAt(++i);
					break;
				case '/':
					cache.push(cur_str);
					cur_str = '';
					break;
				case ',':
					cache.push(cur_str);
					cur_str = '';
					result.push(cache);
					cache = [];
					break;
				default:
					cur_str += c;
			}
		}

		if (cur_str.length) {
			cache.push(cur_str);
		}

		if (cache.length) {
			result.push(cache);
		}

		return result;
	}

	/**
	 * 字符串中存在分隔符则转义
	 */
	function slash(string) {
		return String(string).replace(/[\\/-]/g, '\\$&');
	}

	function Jc(name, domain, inter) {
		this.domain = domain || window.domain;
		this.name = name || this.domain.replace(/\./g, '') + 'jcookie';
		this.inter = Number(inter) || 5;
		this._timer = null;
		this._watch_keys = {};
	}
	var fn = Jc.prototype;
	fn.longlongtime = 60*60*24*365*100; //百年;
	/**
	 * cookie的存取函数，只传入那么为取，传入多个参数则为存
	 */
	fn.cookie = function (name, value, expires, path, domain, secure) {
		var d = new Date(),
			len = arguments.length;

		if (len > 1) {
			path = path || '/';
			expires = expires || 0;
			expires && d.setTime(d.getTime() + (expires * 1000));
			document.cookie = name + "=" + escape(value) + (expires ? ("; expires=" + d.toGMTString()) : "") + ("; path=" + path) + (domain ? ("; domain=" + domain) : "") + (secure ? "; secure" : "");
		} else {
			var v = document.cookie.match('(?:^|;)\\s*' + name + '=([^;]*)');
            return v ? unescape(v[1]) : null;
		}
	}
	/**
	 * 压缩cookie_map键属性对象
	 */
	fn._comile_map = function (cookie_map) {
		var cookie_string_arr = [],
			now = Math.round((new Date()).getTime() / 1000);

		for (var name in cookie_map) {
			if (!cookie_map.hasOwnProperty(name)) { continue; }

			if ( 'name' in cookie_map[name] &&
			 'value' in cookie_map[name] &&
			 'expires' in cookie_map[name] &&
			 cookie_map[name]['expires'] > now ) {

				cookie_string_arr.push(this._cookie_join(cookie_map[name]));
			}
		}

		return cookie_string_arr.join(',');
	}
	/**
	 * 拼接单个cookie的属性
	 * @param  {Object} cookie_data [单个cookie的属性]
	 * @return {String}             [拼接后的字符串]
	 */
	fn._cookie_join = function (cookie_data) {
		var cookie_arr = [];
		cookie_arr.push(slash(cookie_data.name));
		cookie_arr.push(slash(cookie_data.value));
		cookie_arr.push(Number(cookie_data.expires).toString(36));
		return cookie_arr.join('/');
	}
	/**
	 * 获取以合并方式存储的cookie键属性对 (expires过期的不会返回)
	 * @return {Object} [{name: {name: name, value: value, expires: expires}}]
	 */
	fn._getmap = function () {
		var expires,
			cookie_map = {},
			cookie_data = [],
			now = Math.round((new Date()).getTime() / 1000),
			cookie_string = this.cookie(this.name),
			cookie_arr = string_split(cookie_string);
		for (var i = 0, len = cookie_arr.length; i < len; i++) {
			cookie_data = cookie_arr[i];
			if (!is_array(cookie_data) || cookie_data.length < 3) { continue; }

			expires = parseInt(cookie_data[2], 36);
			if (expires > now) {
				cookie_map[cookie_data[0]] = {
					name: cookie_data[0],
					value: cookie_data[1],
					expires: expires
				}
			}
		}
		return cookie_map;
	}
	/**
	 * 将处理好的cookie字符串存入
	 */
	fn._setmap = function(cookie_map) {
		var cookie_map_string = this._comile_map(cookie_map);
		this.cookie(this.name, cookie_map_string, this.longlongtime, '/', this.domain);
	}
	/**
	 * 监听session函数
	 * @param  {String} name [session 名称]
	 */
	fn._watch  = function (name) {
		this._watch_keys[name] = 1;
		if (!this._timer) {
			this._timer = setInterval(function() {
				this._update();
			}, this.inter * 1000 - 1000);
		}
	}
	/**
	 * 更新监听的session的expires
	 */
	fn._update = function () {
		var i = 0,
			cookie_map = this._getmap();
		for (var name in cookie_map) {
			if (cookie_map.hasOwnProperty(name) && name in this._watch_keys) {
				cookie_map[name]['expires'] += this.inter;
				i++;
			}
		}
		if (!i) {
			clearInterval(this._timer);
			this._timer = null;
		}
		this._setmap(cookie_map);
	}
	/**
	 * 获取通过压缩方式存入的cookie
	 * @param  {String} name [cookie名]
	 * @return {String}      [cookie值]
	 */
	fn.get = function(name) {
		var cookie_map = this._getmap(),
			cookie_data = cookie_map[name];

		if (cookie_data && 'value' in cookie_data) {
			return cookie_data.value;
		}
		return '';
	}
	/**
	 * 以压缩合并的方式写入cookie
	 * @param {String} name    [cookie名]
	 * @param {String} value   [cookie值]
	 * @param {Number} expires [过期时间，单位为秒，如果不设置则为session，会根据inter轮询监听]
	 */
	fn.set = function(name, value, expires) {
		var cookie_map = this._getmap(),
			cookie_data = cookie_map[name] = {},
			now = Math.round((new Date()).getTime() / 1000);

		if (!expires) {
			expires = 20;
			this._watch(name);
		}

		cookie_data["name"] = name;
		cookie_data["value"] = value;
		cookie_data["expires"] = expires + now;

		this._setmap(cookie_map);
	}
	/**
	 * 移除以合并的方式存入的cookie (如果移除的为session，则会取消监听)
	 * @param  {String} name    [cookie名]
	 */
	fn.remove = function(name) {
		var cookie_map = this._getmap();

		if (name in cookie_map) {
			delete cookie_map[name];
		}

		if (name in this._watch_keys) {
			delete this._watch_keys[name];
		}

		this._setmap(cookie_map);
	}

	/**
	 * Jcookie构造工厂
	 * @param  {String} cookiename [合并的cookie的存储名称]
	 * @param  {String} domain     [cookie存储域名，若无跨域需求可不传入，默认值为当前域名]
	 * @param  {Number} inter      [session 轮询时间, 默认为5, 单位为秒]
	 * @return {Object}            [Jc对象]
	 */
	window["Jcookie"] = function(cookiename, domain, inter) {
		return new Jc(cookiename, domain, inter);
	}
})(window, document);