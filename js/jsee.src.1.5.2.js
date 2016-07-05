/**
+------------------------------------------------------------*
* Jsee.v1.5.2 Document
+------------------------------------------------------------*
* @Create 2013.9.1 14:35
* @Author houzhenyu
+------------------------------------------------------------*
*支持SVG标签的创建
+------------------------------------------------------------*
*/
(function(win){
	var Jsee;
/**
+------------------------------------------------------------*
* 以下内容为对处开放对象	
+------------------------------------------------------------*
*/	
	//+----------------------------------------------------
	//| 事件处理对象
	//+----------------------------------------------------
	win.Event = {
		//+----------------------------------------------------
		//| 兼容获取 window.event
		//+----------------------------------------------------
		//|	$(document).bind({		
		//|		onmousemove:function(){
		//|			//获取鼠标坐标
		//|			$("#xx").value = Event.fixEvent().clientX+","+Event.fixEvent().clientY	
		//|		}
		//|	});
		//+----------------------------------------------------------------------------------
		fixEvent : function(){
			if(!win.event){
				var r,eventExec = "arguments.callee.caller";
				while(!r){
					eventExec += ".caller";
					r = eval(eventExec+".arguments[0]");
					r && (r.toString() != '[object MouseEvent]') && (r = null);
				}
				return r;
			}
			return win.event;
		},
		//+----------------------------------------------------
		//|兼容获取 keycode
		//+----------------------------------------------------
		keyCode : function(){
			var ev = this.fixEvent();
			return ev.which||ev.keyCode;
		},
		//+----------------------------------------------------
		//|停止事件
		//+----------------------------------------------------
		stop : function (){
			var ev = this.fixEvent();
			if(document.all){
				//IE取消事件操作
				ev.returnValue = false;
			}else{
				//非IE
				ev.preventDefault();
			}	
		},
		//+----------------------------------------------------
		//|兼容获取触发事件的对象
		//+----------------------------------------------------
		element : function(){
			var ev = this.fixEvent();
			return ev.srcElement || ev.target;
		}
	}
	//+----------------------------------------------------
	//| 上下文对象
	//| 存一些常量、常用方法
	//+----------------------------------------------------
	win.PageContext = {};	
	//+----------------------------------------------------
	//|cookie对象
	//+----------------------------------------------------
	win.Cookie = {
		//+----------------------------------
		//设置cookie; name名,value值,time时间
		//1天 = 1*24*60*60*1000; 单位：毫秒
		//+----------------------------------
		put:function(name,value,time){
			_private_fn.setCookie(name,value,time);
		},
		//+----------------------------------
		//获取cookie
		//+----------------------------------
		get:function(name){
			_private_fn.getCookie(name);
		}	
	}
	//+-----------------------------------------------------------------------------------------
	//| Map 对象 2013-3-1 侯振宇<br/>
	//+-----------------------------------------------------------------------------------------
	//| 方法摘要,<br/>
	//| put(key, value) 在此映射中关联指定值与指定<br/>
	//| get(key) 返回指定键所映射的值；如果对于该键来说，此映射不包含任何映射关系，则返回 undefined<br/>
	//| each() 循环Map中所有数据集合<br/>
	//| size()   返回此映射中的键-值映射关系数<br/>
	//| remove() 从此映射中移除指定键的映射关系（如果存在）。<br/>
	//| clear()  从此映射中移除所有映射关系<br/>
	//| isEmpty() 如果此映射不包含键-值映射关系，则返回 true<br/>
	//+-----------------------------------------------------------------------------------------
	win.Map = function (){
		var jsonObject=jsonData="";
		
	// 向Map中存值 
		this.put=function(key,value)
		{
			jsonData+="\""+key+"\":\""+escape(value)+"\",";
		}
		
	// 从Map中取值
		this.get=function(key)
		{
			jsonObject = getJsonObject(jsonData);
			return  unescape(jsonObject[key]);
		}
		
	//  循环Map中所有数据 
		this.each=function(callback)
		{
			jsonObject = getJsonObject(jsonData);
			for(var i in jsonObject){
				callback&&callback.call(jsonObject,i,unescape(jsonObject[i]));
			}
			//return  jsonObject;
		}
		
	// Map存放数据的个数
		this.size=function()
		{
			var n = 0;
			if(jsonData!="")
			{
				n = jsonData.split(",").length - 1;
			}
			return n;
		}
	// 删除map中的一个键值对
		this.remove=function(key)
		{
			jsonObject = getJsonObject(jsonData);
			delete jsonObject[key];
			//重置Json数据,即Map重组
			jsonData = JsonObjectToStr(jsonObject);
		}
	// 清空Map对象 
		this.clear=function()
		{
			jsonObject = jsonData = "";
		}
	// 如果此映射不包含键-值映射关系，则返回 true 
		this.isEmpty=function()
		{
			if(jsonData == ""){
				return true;
			}else{
				return false;
			}
		}
		//私有方法 组建json对象
		function getJsonObject(jsondata)
		{
			if(jsondata!=null && jsondata.length>0)
			{
				//组拼后的json字符串最后会多一个','号 因此要删除
				jsondata = jsondata.substring(0,jsondata.length-1);
			}
			return eval("({"+jsondata+"})");
		}
		//私有方法 json对象 转 字符串
		function JsonObjectToStr(jObject)
		{
			var jstr = "";
			for(var k in jObject){
				jstr+="\""+k+"\":\""+jObject[k]+"\",";
			}
			return jstr;
		}
	}
	//+------------------------------------------------------------
	//| 线 程				
	//+------------------------------------------------------------
	//| @param run 线程要执行的任务方法
	//| @param Thread.name 线程名
	//| @param Thread.stop 停止线程
	//| @param Thread.start 起动线程
	//+------------------------------------------------------------
	win.Thread = function (run)
	{
		 var threadEntity = this;
		 this.name;//线程名
		 this.time = 1;//隔多久执行一次，单位毫秒
	// 停止线程
		this.stop = function()
		{
			if(this.name){
				clearInterval(this.name);
				this.name=null;
				run._index = null;
			}
		}
	// 起动线程
		this.start = function()
		{
			if(typeof run == "function")
			{
				this.name = setInterval(
				function(){
					//如果是sleep请求则run.index会有值，即不执行run方法
					if(!run._index){
						run.call(threadEntity);
					}else{
						//如果sleep的时间有值，则判断等待时间，无值则一直等下去，直到notify为止
						if(run._time){
							if((new Date().getTime()-run._index)>=run._time){
								run._index = null; //重新换醒线程
							}
						}
					}
					
				}
				,this.time)
			}	
		}
	// 设置执行线程的时间间隔
		this.setTime = function(time)
		{
			this.stop()
			this.time=time;
			this.start();	
		}
		//让线程暂停一会儿
		this.sleep = function(time)
		{
			if(!run._index){
				run._index = new Date().getTime(); 
				run._time = time;
			}
		}
		//换醒线程
		this.notify=function()
		{
			run._index = null;
		}
	}
//+------------------------------------------------------------
//|	* 			Timer				*
//+------------------------------------------------------------
//| @param fn 执行的任务方法
//| @param this.stop 	  停止Timer
//| @param Timer.start  起动Timer
//| @param time 程序执行的时间差,即开始 至 现在 单位毫秒
//+------------------------------------------------------------
//|案例：



//| var pp = document.getElementById("p1");
//| new Timer(
//|	function(time){
//|		if(time >= 600) {
//|			this.stop();
//|		}
//|		pp.innerHTML =parseFloat(pp.innerHTML)+1;   
//|	},100).start();
//+------------------------------------------------------------
	win.Timer=function (fn,delay)
	{
		var s = new Date().getTime(),timerEntity=this,timerId;
		this.time;//程序开始时间与当前时间差
		this.start = function()
		{
			this.time = new Date().getTime() - s;
			fn&&fn.call(timerEntity,this.time); //继承Timer并将时间差传入fn中,[注]在fn中如果需要用时间差，只接用time即可 
			if(timerId == "stop")return;
			setTimeout(arguments.callee,(delay||1000));
		};
		//停止Timer
		this.stop = function()
		{
			timerId = "stop";
		};
	}
/**
+------------------------------------------------------------*
* 数组扩展
+------------------------------------------------------------*	
*/	
//----------------------------------------------------
//|合并多个数组
//----------------------------------------------------
	Array.prototype.merge=function(v){
		this.concat(v);
	}
//----------------------------------------------------
//|将指定的元素添加到此列表的尾部 
//|index 不为空时，向指定位置添加
//----------------------------------------------------
	Array.prototype.add=function(v,index){
		if(typeof index == "number"){
			this.splice(index,0,v)
		}else{
			this.push(v);
		}
	}
//----------------------------------------------------
//|移除此列表中指定位置上的元素,并返回被当前被删除的值

//----------------------------------------------------
	Array.prototype.remove=function(index){
		if(typeof index == "number"){
			return this.splice(index,1);
		}
	}
//----------------------------------------------------------
//|移除此列表中首次出现的指定元素，并返回被移除元素的索引（如果存在）
//----------------------------------------------------------
	Array.prototype.removeValue=function(value){
		for(var i=0; i<this.length; i++){
			if(this[i]==value){
				this.splice(i,1);
				return i;
			}
		}
	}
//----------------------------------------------------------
//|用指定的元素替代此列表中指定位置上的元素
//----------------------------------------------------------
	Array.prototype.set=function(index,value){
		this.splice(index,1,value)
	}
//----------------------------------------------------------
//|返回此列表中指定位置上的元素,无或越界则undefind
//----------------------------------------------------------
	Array.prototype.get=function(index){
		return this[index];
	}
//----------------------------------------------------------
//|返回此列表中的元素数
//----------------------------------------------------------
	Array.prototype.size=function(){
		return this.length;
	}
//----------------------------------------------------------
//|如果此列表中包含指定的元素，则返回 元素索引
//----------------------------------------------------------
	Array.prototype.contains=function(entity){
		for(var i=0; i<this.length; i++){
			if(this[i]==entity)return i;
		}
		return false;
	}
//----------------------------------------------------------
//|移除此列表中的所有元素
//----------------------------------------------------------
	Array.prototype.clear=function(){
		this.splice(0,this.length);
	}	
//----------------------------------------------------------
//|如果此列表中没有元素返回值为0
//----------------------------------------------------------
	Array.prototype.isEmpty=function(){
		return this.length;
	}	
//----------------------------------------------------------
//|数组去重复
//----------------------------------------------------------
	Array.prototype.unique = function(){
		var n = {},r = [];
		for(var i = 0; i<this.length; i++){
			if(!n[this[i]]){
				n[this[i]] = 1;
				r.push(this[i]);
			}
		}
		return r;
	}
/**
+------------------------------------------------------------*
* 日期扩展
+------------------------------------------------------------*
*/
//+-----------------------------------------------------
//| 日期上加减
//+-----------------------------------------------------
// pattern 对日期操作的格式 ,支持 '+' or '-'
// 例如 '+'
//'+nY' //加n年
//'+nM' //加n月
//'+nD' //加n天
//'+nH' //加n小时
//'+nF' //加n分钟
//'+nS' //加n秒
//'+nE' //加n毫秒
// 返回Date类型
//+------------------------------------------------------
Date.prototype.vary = function (pattern)
{	
	var dateModel = this;
	var prefix = pattern.substring(0,1); // + or  -
	var suffix = pattern.substring(pattern.length,pattern.length-1).toUpperCase(); // 单位
	var n = pattern.substring(1,pattern.length-1);//增减量
	
	if(prefix == "+")
	{
		if(suffix == "Y") dateModel.setFullYear(dateModel.getFullYear()+parseFloat(n));
		if(suffix == "M") dateModel.setMonth(dateModel.getMonth()+parseFloat(n));
		if(suffix == "D") dateModel.setDate(dateModel.getDate()+parseFloat(n));
		if(suffix == "H") dateModel.setHours(dateModel.getHours()+parseFloat(n));
		if(suffix == "F") dateModel.setMinutes(dateModel.getMinutes()+parseFloat(n));
		if(suffix == "S") dateModel.setSeconds(dateModel.getSeconds()+parseFloat(n));
		if(suffix == "E") dateModel.setMilliseconds(dateModel.getMilliseconds()+parseFloat(n));
	}
	if(prefix == "-")
	{
		if(suffix == "Y") dateModel.setFullYear(dateModel.getFullYear()-parseFloat(n));
		if(suffix == "M") dateModel.setMonth(dateModel.getMonth()-parseFloat(n));
		if(suffix == "D") dateModel.setDate(dateModel.getDate()-parseFloat(n));
		if(suffix == "H") dateModel.setHours(dateModel.getHours()-parseFloat(n));
		if(suffix == "F") dateModel.setMinutes(dateModel.getMinutes()-parseFloat(n));
		if(suffix == "S") dateModel.setSeconds(dateModel.getSeconds()-parseFloat(n));
		if(suffix == "E") dateModel.setMilliseconds(dateModel.getMilliseconds()-parseFloat(n));		
	}
	return dateModel;
}
//+------------------------------------------------------------------
//| 日期月份模板
//+------------------------------------------------------------------
Date.monthTemplate={
		en:{'Jan':'01','Feb':'02','Mar':'03','Apr':'04','May':'05','Jun':'06','Jul':'07','Aug':'08','Sep':'09','Oct':'10','Nov':'11','Dec':'12'},
		cn:{'一':'01','二':'02','三':'03','四':'04','五':'05','六':'06','七':'07','八':'08','九':'09','十':'10','十一':'11','十二':'12'},
		xen:{'1':'Jan','2':'Feb','3':'Mar','4':'Apr','5':'May','6':'Jun','7':'Jul','8':'Aug','9':'Sep','10':'Oct','11':'Nov','12':'Dec'},
		xcn:{'1':'一','2':'二','3':'三','4':'四','5':'五','6':'六','7':'七','8':'八','9':'九','10':'十','11':'十一','12':'十二'}
	};
//+------------------------------------------
//返回日期字符串
//+------------------------------------------
//date.format("yyyy-MM-dd hh:mm:ss")
//date.format("MM/dd/yyyy hh:mm:ss")
//date.format("yyyy/MM/dd hh:mm")
//等.
//[注]yyyy,MM,dd,hh,mm,ss这些是不可变的
//+------------------------------------------
Date.prototype.format = function(pattern){
	var time='',yyyy='0000',MM='00',dd='00',hh='00',mm='00',ss='00',d = this.toString().split(" ");
	MM=Date.monthTemplate.en[d[1]];
	dd='0'+parseFloat(d[2]);
	if(document.all){
		yyyy=d[5];
		time=d[3].split(':');
	}else{
		yyyy=d[3];
		time=d[4].split(':');
	}
	hh=time[0];
	mm=time[1];
	ss=time[2];
	//处理返回结果
	pattern=pattern.replace(/yyyy/,yyyy)
				.replace(/MM/,MM)
				.replace(/dd/,dd)
				.replace(/hh/,hh)
				.replace(/mm/,mm)
				.replace(/ss/,ss);
	return pattern;
}
//+-----------------------------------------------------------
//|获得一个月中的最后一天是28号29号还是30号31号
//+-----------------------------------------------------------
Date.prototype.lastDayOfMonth=function (){
    var days=0;
    switch(this.getMonth()+1){
		case 1: 
		case 3: 
		case 5: 
		case 7: 
		case 8: 
		case 10: 
		case 12: days=31;break;
		case 4: 
		case 6: 
		case 9: 
		case 11: days=30;break;
		case 2: this.getFullYear().isLeapYear()?days=29:days=28;break;
    }
    return days;
}
/**
+------------------------------------------------------------*
* 字符串扩展
+------------------------------------------------------------*	
*/
//+---------------------------------------------------------------------	
//|替换所有
//+---------------------------------------------------------------------	
String.prototype.replaceAll = function(a,b) {return this.replace(eval("/"+a+"/g"),b);}
//+---------------------------------------------------------------------	
//|去所有空格
//+---------------------------------------------------------------------	
String.prototype.trims = function() {return this.replace(/[ ]/g,"");}
//+---------------------------------------------------------------------
//|去两边空格
//+---------------------------------------------------------------------
String.prototype.trim = function() {return this.replace(/^\s+|\s+$/g,"");}
//+---------------------------------------------------------------------
//|去左边空格
//+---------------------------------------------------------------------
String.prototype.ltrim = function() {return this.replace(/^\s+/,"");}
//+---------------------------------------------------------------------
//|去右边空格
//+---------------------------------------------------------------------
String.prototype.rtrim = function() {return this.replace(/\s+$/,"");}
//+---------------------------------------------------------------------
//|截取字符串函数
//+---------------------------------------------------------------------
//|start 开始位置
//|end 结束位置
//+---------------------------------------------------------------------
String.prototype.subString = function(start,end)
{
	var text = "";
	if(arguments.length==2&&arguments[1]>=0){
		text = this.substring(arguments[0],arguments[1]);
	}else if(arguments.length==2&&arguments[1]<0){
		text = this.substring(arguments[0],this.length+arguments[1]);
	}else if(arguments.length==1&&arguments[0]<0){
		text = this.substring(0,this.length+arguments[0]);
	}else if(arguments.length==1&&arguments[0]>=0){
		text = this.substring(arguments[0]);
	}
	return text;
}
//+---------------------------------------------------------------------
//|检查输入的字符是否在给定的字符串内
//+---------------------------------------------------------------------
//|character:为给定的字符,缺省值为"A~Za~z0~9"
//+---------------------------------------------------------------------
String.prototype.isBelong =function(character)
{
  var checkokpass="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  if(character) checkokpass = character;
  for (i=0; i<this.length; i++) 
  {
       ch=this.charAt(i);
       for (j=0;j<checkokpass.length; j++)
	   {
			if (ch==checkokpass.charAt(j))
			break;
       }
      if (j==checkokpass.length)
	  {
		  return false; //函有特别字符时返回false
		  break;
      }
  }
   return true;
}
//+---------------------------------------------------------------------
//|验证邮件
//+---------------------------------------------------------------------
String.prototype.isEmail = function()
{
  var myReg = /^[_a-zA-Z0-9_-_._-]+@([_a-zA-Z0-9_-]+\.)+[a-zA-Z]{2,3}$/;
  return myReg.test(this);
}
//+---------------------------------------------------------------------
//| 可以将html字符串代码转换成DOM节点对象
//+---------------------------------------------------------------------
//|'例：
//|var htmlStr = "<div>内容1</div><div>内容2</div>";
//|var newDom = htmlStr.toDom(); //转换后的节点对象都是newDom的子节点
//|var nDom = Element(newDom).child();
//|nDom.eq(0).innerHTML;//结果为: 内容1
//|nDom.eq(1).innerHTML;//结果为: 内容2
//+---------------------------------------------------------------------
String.prototype.toDom = function()
{
	var domEntity = document.createElement("div");
	domEntity.innerHTML = this;
	return domEntity;
}
//+---------------------------------------------------------------------
//检查输入内容是否包含中文
//+---------------------------------------------------------------------
//|包含返回结果为true
//+---------------------------------------------------------------------
String.prototype.isChinese = function()
{
	return escape(this).indexOf("%u")!=-1;
}
//+---------------------------------------------------------------------
//检查输入是否整数
//+---------------------------------------------------------------------
String.prototype.isInteger = function()
{
	return /^\d+$/.test(this);
}
//+---------------------------------------------------------------------
//检查输入是否数
//+---------------------------------------------------------------------
String.prototype.isNumber = function()
{
	return /^\d+(\.\d+)?$/.test(this);
}

//+---------------------------------------------------------------------
//字符串日期格式转日期类型
//+---------------------------------------------------------------------
//<br/> <b>a.可以转换的时间格式为以下几种类型</b>
//<br/>   yyyy-MM
//<br/>   yyyy-MM-dd
//<br/>   yyyy-MM-dd hh
//<br/>   yyyy-MM-dd hh:mm 
//<br/>   yyyy-MM-dd hh:mm:ss
//+---------------------------------------------------------------------
String.prototype.toDate = function (){
	return _private_fn.stringToDate(this.split(" "));
}
//+-------------------------------------------------
//|求两个[指定格式]日期字符串的日期相隔长度，返回毫秒数
//|yyyy-MM-dd hh:mm:ss
//+-------------------------------------------------
String.prototype.distance=function(d){
	return _private_fn.string_Date_Tool(this,d,1);
}
//+-------------------------------------------------
//|求两个[指定格式]日期字符大小,返回值为true,false,eq
//|yyyy-MM-dd hh:mm:ss
//+-------------------------------------------------
String.prototype.check=function(d){
	return _private_fn.string_Date_Tool(this,d,0,1);
}
//+-------------------------------------------------
//判断是否为闰年 如: '2016'.isLeapYear() = true;
//+-------------------------------------------------
String.prototype.isLeapYear=function (){
	if((this %4==0 && this %100!=0) || (this %400==0)) return true;
    return false;
}
//+-------------------------------------------------
//|获取字符串字节长度
//+-------------------------------------------------
//|英文、数字、符号均为一个字节,汉字为两个
//+-------------------------------------------------
//|"1sS#符".byteSize();结果为6
//+-------------------------------------------------
String.prototype.byteSize = function() {
	var n = 0,a = this.split("");
	for(var i=0; i<a.length; i++){
		if(a[i].charCodeAt(0)<299){
			n++;
		}else{
			n+=2;
		}
	}
	return n;
}
/**
+-------------------------------------------------
* 分隔字符串
+-------------------------------------------------
* 功能一: 按字符串长度分隔
* 功能二: 按字符串字节长度分隔
* 功能三: 可以指定分隔模式
+-------------------------------------------------
* @param len 分隔长度
* @param f 1按字节分隔；0按字符串分隔

* @param p 匹配分隔模式
* 	[注] 以p分隔出的每一项必需小len值
+-------------------------------------------------
*/

String.prototype.cut = function(len,f,p) {
	var zv=p?this.split(p):this.split('');
	var m=0,curlen=0,frontmsgtext="",msgtext="",msgbox=[];
	//递归出每一条短信
	(function(){
		if(m < zv.length){
			curlen = f?msgtext.byteSize():msgtext.length;
			if(curlen<len){
				frontmsgtext = msgtext;//记录前一次内容
				msgtext += zv[m];
			}else{
				//一条短信结束,存储数据,重置msgtext临时变量
				msgbox.push(frontmsgtext);
				m-=2; msgtext = ""; frontmsgtext = ""; 
			}
			m++; arguments.callee();
		}else{
			//最后一条短信
			curlen = f?msgtext.byteSize():msgtext.length;
			if(curlen>len){
				 msgbox.push(frontmsgtext);
				 msgbox.push(msgtext.substring(frontmsgtext.length));
			}else{
				msgbox.push(msgtext);
			}
			msgtext = ""; frontmsgtext = "";
		}
	})();	
	return msgbox;	
}


/**
+-------------------------------------------------------------------------------*
*对外开方部分
+-------------------------------------------------------------------------------*	
*/
	Jsee = win.Jsee = win.$ =function(o){
		return Jsee.fn.init(o);
	}
	
	Jsee.isJson="";
	Jsee.isArray="";
	Jsee.isEmpty="";
	Jsee.isFunction="";
	Jsee.equal="";
	Jsee.ajax="";
	Jsee.isHtmlElement="";
	Jsee.isJsee = "";
//+------------------------------------------------------------
//| 浏览器对象
//+------------------------------------------------------------
	Jsee.browser={};
//+------------------------------------------------------------
//| 对外开方的方法
//+------------------------------------------------------------
	Jsee.fn = Jsee.prototype = {
//+------------------------------------------------------------
//| 初始化选择器
//+------------------------------------------------------------
//| @param o 选择器参数
//| 	可以为：对象，方法，指定字符串等
//| @return Jsee对象
//+------------------------------------------------------------		
		init:function(o){
			this.pre_entity=this.r_entity = _private_fn.choiceCore(o);
			return this;
		},
//+------------------------------------------------------------
//| 获取集合中指定对象
//+------------------------------------------------------------
//| @param i 对象数组索引
//| @return dom对象
//+------------------------------------------------------------	
		eq:function(i){
			if(this.r_entity.length) this.r_entity = this.r_entity[i];			
			return this;
		},
//+------------------------------------------------------------
//| 获取当前选择器中存放的DOM对象
//| 调用此方法后就不能再继续选择器中的方法，可以获取对象自身的属性和方法
//+------------------------------------------------------------	
		entity:function(){
			return this.r_entity;
		},
//+------------------------------------------------------------
//| 获取集合长度
//+------------------------------------------------------------	
		size:function(){
			if(typeof this.r_entity.length!='undefined'){
				return this.r_entity.length;
			}else{
				return 1;
			}
		},
//+--------------------------------------
//| 校验是否包含指定类名
//+---------------------------------------
//| 对一个对象有效
//+---------------------------------------
		hasClass:function(name){
			 return _private_fn.hasClass(this.r_entity,name);
		},
//+--------------------------------------
//| 添加指定类名
//+---------------------------------------
		addClass:function(name){
			_private_fn.innerFor(
				this.r_entity,
				function(){
					_private_fn.addClass(this,name);	
				}
			);
			 return this;
		},
//+--------------------------------------
//| 移除指定类名
//+---------------------------------------
//| 对一组对象有效
//+---------------------------------------
		removeClass:function (name)
		{
			_private_fn.innerFor(
				this.r_entity,
				function(){
					_private_fn.removeClass(this,name);	
				}
			);
		   return this;
		},
//+------------------------------------------------------------------------------
//| 获取对象的样式
//| [对一个对象有效]
//+------------------------------------------------------------------------------
		getCss:function(pro){
			return _private_fn.getElmCss(this.r_entity,pro);
		},
//+------------------------------------------------------------------------------
//| 设置对象的样式 
//| [对一组对象有效]
//+------------------------------------------------------------------------------
//| params css对象键值对形式如{key:value}
//+------------------------------------------------------------------------------
		setCss:function(params) {
			_private_fn.innerFor(
				this.r_entity,
				function(){	
					_private_fn.setElmCss(this,params);
				}
			);	
			return this;
		},
//+------------------------------------------------------------------------------
//| 设置对象的innerHTML内容 
//| [对一组对象有效]
//+------------------------------------------------------------------------------
//| v html字符串
//+------------------------------------------------------------------------------		
		setHtml:function(v){
			_private_fn.innerFor(
				this.r_entity,
				function(){	
					this.innerHTML = v;
				}
			);	
			return this;
		},
//+------------------------------------------------------------------------------
//| 获取对象的innerHTML内容
//| [对一个对象有效]
//+------------------------------------------------------------------------------
		getHtml:function(){
			return this.r_entity.innerHTML;
		},
//+------------------------------------------------------------------------------
//| 设置input对象的value内容 
//| [对一组对象有效]对象只能为[input/textarea]
//+------------------------------------------------------------------------------
//| v value内容
//+------------------------------------------------------------------------------		
		setValue:function(v){
			_private_fn.innerFor(
				this.r_entity,
				function(){	
					this.value = v;
				}
			);	
			return this;
		},
//+------------------------------------------------------------------------------
//| 获取input对象的value内容 
//| [对一个对象有效]对象只能为[input/textarea]
//+------------------------------------------------------------------------------
		getValue:function(){
			return this.r_entity.value;
		},
		
//+------------------------------------------------------------------------------
//| 设置对象的属性值 
//| [对一组对象有效]
//+------------------------------------------------------------------------------
//| params 键值对象
//+------------------------------------------------------------------------------		
		setAttr:function(params){
			_private_fn.innerFor(
				this.r_entity,
				function(){	
					_private_fn.setElmAttr(this,params);
				}
			);	
			return this;
		},
//+------------------------------------------------------------------------------
//| 获取对象的属性值 
//| [对一个对象有效]
//+------------------------------------------------------------------------------
		getAttr:function(v){
			return _private_fn.getElmAttr(this.r_entity,v);
		},
//+------------------------------------------------------------------------------
//| 移除元素属性
//+------------------------------------------------------------------------------
		removeAttr:function(v){
			_private_fn.innerFor(
				this.r_entity,
				function(){	
					_private_fn.removeElmAttr(this,v);
				}
			);
			return this;
		},
//+------------------------------------------------------------------------------
//| 设置对象不透明度[对一组对象有效]
//+------------------------------------------------------------------------------
//| i不透明度(0~1)
//+------------------------------------------------------------------------------
		setOpacity:function (i) {
			_private_fn.innerFor(
				this.r_entity,
				function(){	
					_private_fn.setElmOpacity(this,i*100);
				}
			);
			return this;	
		},
//+------------------------------------------------------------------------------
//| 获取对象不透明度[对一个对象有效]
//+------------------------------------------------------------------------------
		getOpacity:function () {
			return _private_fn.getElmOpacity(this.r_entity)/100;
		},
//+------------------------------------------------------------------------------
//|获取元素在页面上坐标[对一个对象有效]
//+------------------------------------------------------------------------------
//|@return {x:坐标x,y:坐标y}
//+----------------------------------------------------	
		coord:function () {
			return _private_fn.getElmCoord(this.r_entity);
		},
//+------------------------------------------------------------------------------
//| 获取光标位置[对一个对象有效]
//+------------------------------------------------------------------------------
//| entity 为 input 或 textarea 对象
//+------------------------------------------------------------------------------
		getCursor:function(){
			return _private_fn.getElmCursorPosition(this.r_entity);
		},
//+------------------------------------------------------------------------------
//| 设置光标位置[对一个对象有效]
//+------------------------------------------------------------------------------
//| entity 为 input 或 textarea 对象
//+------------------------------------------------------------------------------
		setCursor:function(v){
			_private_fn.setElmCursorPosition(this.r_entity,v);
			return this;
		},
//+--------------------------------------------------------------------------------	
//| 对象克隆[对一个对象有效]破坏性操作
//+--------------------------------------------------------------------------------	
//| v 为true时 克隆节点以及节点下面的子内容
//| v 为false时或缺省时 克隆当前节点
//+--------------------------------------------------------------------------------	
		clone:function(v){
			this.pre_entity = this.r_entity;//缓存被破坏的对象
			this.r_entity = _private_fn.elmClone(this.r_entity,v);
			return this;
		},
//+--------------------------------------------------------------------------------	
//| 将指定对象变成当前对象的最后一个子节点[对一组对象有效]
//+--------------------------------------------------------------------------------	
//| 在当前对象内末尾添加新的子节点
//| o 选择器参数
//+--------------------------------------------------------------------------------	
		append:function(o){
			_private_fn.innerFor(
				this.r_entity,
				function(){	
					_private_fn.elmAppend(this,_private_fn.choiceCore(o));
				}
			);
			return this;
		},
//+--------------------------------------------------------------------------------	
//| 将当前对象添加到指定对象的最后一个子节点[对一组对象有效]
//+--------------------------------------------------------------------------------	
//| 在当前对象内末尾添加新的子节点
//| o 选择器参数[注]****************动画有问题**************************************
//+--------------------------------------------------------------------------------	
		appendTo:function(o){
			var currentity = this.r_entity;
			_private_fn.innerFor(
				_private_fn.choiceCore(o),
				function(){	
					_private_fn.elmAppend(this,currentity);
				}
			);
			return this;
		},
//+--------------------------------------------------------------------------------	
//| 破坏性操作后返回上一级对象
//+--------------------------------------------------------------------------------			
		end:function(){
			this.r_entity = this.pre_entity;
			return this;
		},
//+--------------------------------------------------------------------------------	
//| 移出对象[对一组对象有效]破坏性操作
//+--------------------------------------------------------------------------------	
		remove:function(){
			//this.pre_entity = this.r_entity;
			_private_fn.innerFor(
				this.r_entity,
				function(){
					_private_fn.elmRemove(this);
				}
			);
			return this
		},
//+--------------------------------------------------------------------------------	
//| 清空对象内容[对一组对象有效]
//+--------------------------------------------------------------------------------	
		empty:function(){
			_private_fn.innerFor(
				this.r_entity,
				function(){
					this.innerHTML&&(this.innerHTML="");
					this.value&&(this.value="");
				}
			);
			return this;
		},
//+--------------------------------------------------------------------------------	
//| 在对象前面插入[对一组对象有效]
//+--------------------------------------------------------------------------------	
//| o 选择器参数
//+--------------------------------------------------------------------------------	
		insertBefore:function(o){
			_private_fn.innerFor(
				this.r_entity,
				function(){
					_private_fn.elmInsertBefore(this,_private_fn.choiceCore(o));
				}
			);
			return this;
		},
//+--------------------------------------------------------------------------------	
//| 在对象后面插入[对一组对象有效]
//+--------------------------------------------------------------------------------	
//| o 选择器参数
//+--------------------------------------------------------------------------------	
		insertAfter:function(o){
			_private_fn.innerFor(
				this.r_entity,
				function(){
					_private_fn.elmInsertAfter(this,_private_fn.choiceCore(o));
				}
			);
			return this;
		},
//+--------------------------------------------------------------------------------	
//| 替换对象[对一组对象有效] 破坏性操作
//+--------------------------------------------------------------------------------	
//| o 选择器参数
//+--------------------------------------------------------------------------------	
		replaceAll:function(o){
			//this.pre_entity = this.r_entity;//缓存被破坏的对象
			_private_fn.innerFor(
				this.r_entity,
				function(){
					_private_fn.elmReplace(this,_private_fn.choiceCore(o));
				}
			);
			return this
		},
//+--------------------------------------------------------------------------------	
//| 获取对象父节点[对一个对象有效] 破坏性操作
//+--------------------------------------------------------------------------------	
//| o 选择器参数
//+--------------------------------------------------------------------------------	
		parent:function(o){
			this.pre_entity = this.r_entity;//缓存被破坏的对象
			if(o){
				var et =_private_fn.getElmChilds(
							_private_fn.getElmParent(
								_private_fn.getElmParent(this.r_entity)));
				this.r_entity = _private_fn.choiceCore(o,et);
			}else{
				this.r_entity = _private_fn.getElmParent(this.r_entity);
			}
			return this
		},
//+--------------------------------------------------------------------------------	
//| 获取同辈相邻上一个节点[对一个对象有效] 破坏性操作
//+--------------------------------------------------------------------------------	
		prev:function(){
			this.pre_entity = this.r_entity;//缓存被破坏的对象
			this.r_entity = _private_fn.getElmPrev(this.r_entity);
			return this;
		},
//+--------------------------------------------------------------------------------	
//|  获取同辈相邻下一个节点[对一个对象有效] 破坏性操作
//+--------------------------------------------------------------------------------	
		next:function(){
			this.pre_entity = this.r_entity;//缓存被破坏的对象
			this.r_entity = _private_fn.getElmNext(this.r_entity);
			return this;
		},
//+--------------------------------------------------------------------------------	
//|  获取第一个子节点[对一个对象有效] 破坏性操作
//+--------------------------------------------------------------------------------	
		first:function(){
			this.pre_entity = this.r_entity;//缓存被破坏的对象
			this.r_entity = _private_fn.getElmFirst(this.r_entity);
			return this;
		},
//+--------------------------------------------------------------------------------	
//|  获取最后一个子节点[对一个对象有效] 破坏性操作
//+--------------------------------------------------------------------------------	
		last:function(){
			this.pre_entity = this.r_entity;//缓存被破坏的对象
			this.r_entity = _private_fn.getElmLast(this.r_entity);
			return this;
		},
//+--------------------------------------------------------------------------------	
//|  获取子节点不包括孙节点[对一个对象有效] 破坏性操作
//+--------------------------------------------------------------------------------	
//| o选择器参数
//+--------------------------------------------------------------------------------	
		children:function(o){
			this.pre_entity = this.r_entity;//缓存被破坏的对象
			if(o){
				this.r_entity = _private_fn.choiceCore(o,_private_fn.getElmChilds(this.r_entity));
			}else{
				this.r_entity = _private_fn.getElmChilds(this.r_entity);
			}
			return this;
		},
//+--------------------------------------------------------------------------------	
//|  获取子节点及孙节点[对一个对象有效] 破坏性操作
//+--------------------------------------------------------------------------------	
//| o选择器参数
//+--------------------------------------------------------------------------------	
		find:function(o){
			this.pre_entity = this.r_entity;//缓存被破坏的对象
			if(o){
				this.r_entity = _private_fn.choiceCore(o,_private_fn.getElmAllChild(this.r_entity));
			}else{
				this.r_entity = _private_fn.getElmAllChild(this.r_entity);
			}
			return this;
		},
/**
+------------------------------------------------------------------------------
* 事件绑定 [可以对一组对象进行设置]
+------------------------------------------------------------------------------
* param 为 事件对象 存放事件类型与回调方法
* [注] 鼠标右键事件 oncontextmenu
+--------------------------------------------------------------------------------
* 使用案例
+--------------------------------------------------------------------------------
$(function(){
	//页面加载完成后对所有input绑定以下三个事件
	$("input").bind({
		onmouseover:function(){
			//方法中的this指向当前对象
			this.style.background="green";
		},
		onmouseout:function(){
			$(this).setCss({background:"yellow"});
		},
		onkeydown:function(){
			alert("您按下的键盘码为："+Event.keyCode());
		},
		oncontextmenu:function(){
			alert("右键成功");
			//Event.stop();//屏蔽右键
		},
		onmousemove:function(){
			//获取鼠标坐标
			$("#xx").value = Event.fixEvent().clientX+","+Event.fixEvent().clientY	
		}	
	});
});
+----------------------------------------------------------------------------------------
*/
		bind:function(param){
			_private_fn.innerFor(this.r_entity,function(){
				var _this = this;
				for(var key in param){
					(function(o,type,callback){
						var cback = function(){callback.apply(o);};
						if (o.attachEvent) {
						// IE6+
							o.attachEvent(type, cback, false);
						} else if (o.addEventListener) {
							// chrome,firefox
							o.addEventListener(type.substring(2), cback, false);
						} else {
							o[type] = cback;
						}		  
					
					})(_this,key,param[key]);
					//_private_fn.bind(_this,key,function(){param[key].call(_this)});
				}
			});
			
			return this;
		},
//+--------------------------------------------------------------------------------
//| 事件委派
//+--------------------------------------------------------------------------------	
		live:function(param){
			_private_fn.innerFor(this.r_entity,function(){
				for(var key in param){
					_private_fn.live(this,key,param[key]);
				}
			});
			return this;
		},
//+--------------------------------------------------------------------------------
//| 从指定对象中进行关键字查询
//+--------------------------------------------------------------------------------	
		search:function(key,callback){
			_private_fn.innerFor(this.r_entity,function(){
				_private_fn.textSearch(this,key,callback);
			});
			return this;
		},
//+--------------------------------------------------------------------------------
//| 循环. json/array
//+--------------------------------------------------------------------------------	
		each:function(callback){
			var entity = this.r_entity;
			//单个html对象
			if(_private_fn.isHtmlElement(entity)) entity = [entity];
			//json
			if(_private_fn.isJson(entity)){
				for(var key in entity){
					callback.call(entity,key,entity[key]);
				}
				return this;
			}
			//array
			if(_private_fn.isArray(entity)){
				for(var i = 0; i<entity.length; i++){
					callback.call(entity,i,entity[i]);
				}
				return this;
			}
		},
//+--------------------------------------------------------------------------------
//| 拖动
//+--------------------------------------------------------------------------------	
//| callback可以有两个参数 第一个参数为left 第二个参数为top
//| left 指当前移动对象相对指定父节点内左侧距离 . top同理
//+--------------------------------------------------------------------------------	
/**********************************************************************************
//被移动的对象自动设置为绝对定位
//指定父节点为相对定位时,它会在父节点中移动
$("span").onDrag(function(left,top){
	//this.dragEnd() //结束移动事件
	if(top!=0){
		this.style.top =0;
	}
	if(left<0){
		this.style.left =0;
	}
	var rightEnd = parseFloat($(this).parent().getCss("width"))-parseFloat(this.style.width);
	if(left>rightEnd){
		this.style.left =rightEnd+"px";
	}
});
//以下为html内容
<div style="position:relative; border:1px solid red; height:10px; width:1000px; overflow:hidden">
	<span style="width:5px; position:absolute; left:0px; top:0px; height:10px; overflow:hidden; background:green; cursor:pointer;">&nbsp;</span>
</div>
**********************************************************************************/
		onDrag:function(callback){
			_private_fn.innerFor(this.r_entity,function(){
				_private_fn.rDrag.init(this,callback);	
			});
			return this;
		},
//+--------------------------------------------------------------------------------
//| 遮罩
//|参数为0时移除遮罩,不等于0时设置遮罩内容
//+--------------------------------------------------------------------------------	
		masker:function(){
			var i = 1,content = arguments[0];
			//参数为零时移除遮罩
			if(arguments.length==1&&parseFloat(arguments[0])==0){
				i=0;
			}
			_private_fn.innerFor(this.r_entity,
					function(){
						if(!i){
							_private_fn.Masker.hide(this);
						}else{
							_private_fn.Masker.show(this,content);
						}
					});
			return this;
		},
//+--------------------------------------------------------------------------------	
//| 淡入
//+--------------------------------------------------------------------------------	
//| param 缺省值1  取值范围0~1
//| speed 速度
//| callback 回调方法,callback 中this指向当前动画对象
//+--------------------------------------------------------------------------------	
		fadeIn:function(arg0,arg1,arg2){
			var param,speed,callback;
			_private_fn.fadeanimaprefix(arguments,function(a1,a2,a3){
				param = a1;speed=a2;callback=a3;
			});
			param *= 100;//不透明格式0-100
			_private_fn.innerFor(
				this.r_entity,
				function(){
					this.___fadev = 1;//淡入淡出标记
					if(!this.offsetHeight){
						this.style.visibility="visible";
						this.style.display="block"
					}
					_private_fn.setElmOpacity(this,0);
					_private_fn.animation(this).animate({opacity:param || 100},speed,callback);	
			});
			return this;
		},
//+--------------------------------------------------------------------------------	
//| 淡出
//+--------------------------------------------------------------------------------	
//| param 缺省值1  取值范围0~1
//| speed 速度
//| callback 回调方法,callback 中this指向当前动画对象
//+--------------------------------------------------------------------------------	
		fadeOut:function(arg0,arg1,arg2){
			var param,speed,callback;
			_private_fn.fadeanimaprefix(arguments,function(a1,a2,a3){
				param = a1;speed=a2;callback=a3;
			});
			param *= 100;//不透明格式0-100
			_private_fn.innerFor(
				this.r_entity,
				function(){
					this.___fadev = 0;
					if(!this.offsetHeight){
						this.style.visibility="visible";
						this.style.display="block"
					}
					_private_fn.animation(this).animate({opacity:param || 0},speed,function(){
						!param&&(this.style.display='none');
						callback&&callback.call(this);
						});	
			});
			return this;
		},
//+--------------------------------------------------------------------------------	
//| 淡入淡出切换
//+--------------------------------------------------------------------------------	
//| 显示与隐藏进行切换
//| speed 速度
//| callback 回调方法,callback 中this指向当前动画对象
//| 参数可以只有一个回调方法
//+--------------------------------------------------------------------------------			
	fadeToggle:function(speed,callback){
		if(typeof speed == "function"){callback = speed;speed = "";}
		
		_private_fn.innerFor(
			this.r_entity,
			function(){
				//fadein
				if(!this.___fadev&&!this.offsetHeight){
					this.___fadev = 1;
					//fadeIn.
					if(!this.offsetHeight){
						this.style.visibility="visible";
						this.style.display="block"
					}
					_private_fn.setElmOpacity(this,0);
					_private_fn.animation(this).animate({opacity:100},speed,callback);	
					return ;
				}
				//fadeout
				if(this.___fadev&&this.offsetHeight || !this.___fadev&&this.offsetHeight){
					this.___fadev = 0;
					if(!this.offsetHeight){
						this.style.visibility="visible";
						this.style.display="block"
					}
					_private_fn.animation(this).animate({opacity:0},speed,function(){
						this.style.display='none';
						callback&&callback.call(this);
						});
					return ;
				}		
		});
		return this;	
	},
//+--------------------------------------------------------------------------------	
//|伸展
//+--------------------------------------------------------------------------------	
//| param 缺省值 原始高度
//| speed 速度
//| callback 回调方法,callback 中this指向当前动画对象
//| 参数可以只有一个回调方法
//+--------------------------------------------------------------------------------	
	slideDown:function(arg0,arg1){
		var speed,callback;
		//识别参数
		if(arguments.length==1&&typeof arg0 == "function"){
			callback = arg0;
		}else if(arguments.length==1&&typeof arg0 != "function"){
			speed = arg0;
		}else if(arguments.length==2){
			speed = arg0;
			callback = arg1;
		}
		//设置每个对象的动画
		_private_fn.innerFor(this.r_entity,function(){
			//高度设置与初始化
			_private_fn.slideanimaheight(this,1);
			//执行动画
			_private_fn.animation(this).animate({
				marginTop:this._____mt,marginBottom:this._____mb,
				paddingTop:this._____pt,paddingBottom:this._____pb,
				borderTopWidth:this._____bt,borderBottomWidth:this._____bb,
				height:this._____height},speed,callback);
		});
		return this;
	},
//+--------------------------------------------------------------------------------	
//| 收缩	
//+--------------------------------------------------------------------------------	
//| param 缺省值 0
//| speed 速度
//| callback 回调方法,callback 中this指向当前动画对象
//| 参数可以只有一个回调方法
//+--------------------------------------------------------------------------------	
	slideUp:function(arg0,arg1){
		var speed,callback;
		//识别参数
		if(arguments.length==1&&typeof arg0 == "function"){
			callback = arg0;
		}else if(arguments.length==1&&typeof arg0 != "function"){
			speed = arg0;
		}else if(arguments.length==2){
			speed = arg0;
			callback = arg1;
		}
		//设置每个对象的动画
		_private_fn.innerFor(this.r_entity,function(){
			//高度设置与初始化
			_private_fn.slideanimaheight(this);
			
			//执行动画
			_private_fn.animation(this).animate({
				marginTop:0,marginBottom:0,
				paddingTop:0,paddingBottom:0,
				borderTopWidth:0,borderBottomWidth:0,
				height:0},speed,callback);
		});
		return this;		
	},
//+--------------------------------------------------------------------------------	
//| 伸展收缩切换
//+--------------------------------------------------------------------------------	
//| speed 速度
//| callback 回调方法,callback 中this指向当前动画对象
//| 参数可以只有一个回调方法
//+--------------------------------------------------------------------------------	
	slideToggle:function(arg0,arg1){
		var speed,callback;
		//识别参数
		if(arguments.length==1&&typeof arg0 == "function"){
			callback = arg0;
		}else if(arguments.length==1&&typeof arg0 != "function"){
			speed = arg0;
		}else if(arguments.length==2){
			speed = arg0;
			callback = arg1;
		}
		//设置每个对象的动画
		_private_fn.innerFor(this.r_entity,function(){
			//slideDown.
			if(!this._____slidev&&!this.offsetHeight||this._____slidev&&!this.offsetHeight){
				this._____slidev = 1;
				//高度设置与初始化
				_private_fn.slideanimaheight(this,1);
				//执行动画
				_private_fn.animation(this).animate({
					marginTop:this._____mt,marginBottom:this._____mb,
					paddingTop:this._____pt,paddingBottom:this._____pb,
					borderTopWidth:this._____bt,borderBottomWidth:this._____bb,
					height:this._____height},speed,callback);
				return ;	
			}
			//slideUp.
			if(this._____slidev&&this.offsetHeight || !this._____slidev&&this.offsetHeight){
				this._____slidev = 0;
				//高度设置与初始化
				_private_fn.slideanimaheight(this);
				//执行动画
				_private_fn.animation(this).animate({
					marginTop:0,marginBottom:0,
					paddingTop:0,paddingBottom:0,
					borderTopWidth:0,borderBottomWidth:0,
					height:0},speed,callback);

				return ;
			}
		});
		return this;
	},
//+--------------------------------------------------------------------------------	
//| 自定义动画
//+--------------------------------------------------------------------------------		
	animate:function(){
			var param,speed,callback,args = arguments;
			if(args.length==1&&typeof args[0] == "function"){
				//一个参数为function
				callback = args[0];
			}else if(args.length==1&&!_private_fn.isJson(args[0])){
				//一个参数为速度
				speed = args[0];
			}else if(args.length==1&&_private_fn.isJson(args[0])){
				//一个参数为不透明度
				param = args[0];
				if(param.opacity>=0)param.opacity *=100;
			}else if(args.length==2&&_private_fn.isJson(args[0])&&typeof args[1] == "function"){
				//第一个参数为不透明度，第二个参数为方法
				param = args[0];
				callback = args[1];
				if(param.opacity>=0)param.opacity *=100;
			}else if(args.length==2&&!_private_fn.isJson(args[0])&&typeof args[1] == "function"){
				//第一个参数为速度，第二个参数为方法
				speed = args[0];
				callback = args[1];
			}else if(args.length==2&&!_private_fn.isJson(args[0])&&_private_fn.isJson(args[1])){
				//第一个参数为速度，第二个参数为不透明度
				speed = args[0];
				param = args[1];
				if(param.opacity>=0)param.opacity *=100;
			}else if(args.length==2&&_private_fn.isJson(args[0])&&!_private_fn.isJson(args[1])){
				//第一个参数为不透明度，第二个参数为速度
				speed = args[1];
				param = args[0];
				if(param.opacity>=0)param.opacity *=100;
			}else if(args.length==3){
				param=args[0],speed=args[1],callback=args[2];
				if(param.opacity>=0)param.opacity *=100; 
			}
		//执行动画
		_private_fn.innerFor(this.r_entity,function(){
			_private_fn.animation(this).animate(param,speed,callback);
		});
		return this;
	}

//......................................................................................
// 待续。。。。。。
//......................................................................................	
		
		
	}
/**
+------------------------------------------------------------*
* Jsee私有方法
+------------------------------------------------------------*
* 此方法体内的所有方法不对外开方
+------------------------------------------------------------*		
*/	
	var _private_fn = {
		//+----------------------------------------------------
		//| 选择器核心
		//+----------------------------------------------------		
		choiceCore:function (o,entitys){
			//参数为方法
			if(typeof o == 'function'){
				this.loaded(o);
				return ;
			}
			//参数为对象
			if(typeof o == 'object'&&!o.length){
				return o;
			}
			//参数为数组对象
			if(this.isArray(o)){
				return this.filterEntitys(o);
			}
			//参数为*获取所有元素
			if(o == '*'){
				if(entitys)return this.filterEntitys(entitys);
				return this.filterEntitys(this.getAllElm());
			}
			//参数为ID
			if(/^#[^\s]+$/.test(o)){
				if(entitys){
					//从指定集合中获取
					return this.getElmNodesById(entitys,o.substring(1));
				}else{
					return this.getElmById(o.substring(1));
				}
			}
			//参数为class名
			if(/^\.[^\s]+$/.test(o)){
				if(entitys){
					//从指定集合中获取
					return this.filterEntitys(this.getElmNodesByClass(entitys,o.substring(1)));
				}else{
					return this.filterEntitys(this.getElmByClassName(o.substring(1)));
				}
			}
			//参数为标签名
			if(/^[a-zA-z0-9]+$/.test(o)){
				if(entitys){
					return this.filterEntitys(this.getElmNodesByTagName(entitys,o));
				}else{
					return this.filterEntitys(this.getElmByTagName(o));
				}
			}
			//参数为标签名和ID 如: div#id
			if(/^[a-zA-z0-9]+#[^\s]+$/.test(o)){
				o = o.split("#");
				if(entitys){
					return this.getElmNodesById(this.getElmNodesByTagName(entitys,o[0]),o[1]);
				}else{
					return this.getElmNodesById(this.getElmByTagName(o[0]),o[1]);
				}
			}
			//参数为标签名和类名 如: div.class
			if(/^[a-zA-z0-9]+\.[^\s]+$/.test(o)){
				o = o.split(".");
				if(entitys){
					return this.filterEntitys(this.getElmNodesByClass(this.getElmNodesByTagName(entitys,o[0]),o[1]));
				}else{
					return this.filterEntitys(this.getElmNodesByClass(this.getElmByTagName(o[0]),o[1]));
				}
			}
			//属性div[xx=xxx]
			if(/^[a-zA-z0-9]+\[+[^\s]+\]+$/.test(o)){
				var elm = /^[a-zA-z0-9][^\[]+/.exec(o).toString();//获取参数中的标签名，如div
				var elmattr = /\[+[^\]]+/.exec(o).toString().substring(1);//id='xxx'
				if(entitys){
					return this.filterEntitys(this.getElmNodesByAttr(this.getElmNodesByTagName(entitys,elm),elmattr));
				}else{
					return this.filterEntitys(this.getElmNodesByAttr(this.getElmByTagName(elm),elmattr));
				}
			}
			//属性[xx=xxx]
			if(/^\[+[^\s]+\]+$/.test(o)){
				var eattr = /\[+[^\]]+/.exec(o).toString().substring(1);//xx=xx
				if(entitys){
					return this.filterEntitys(this.getElmNodesByAttr(entitys,eattr));
				}else{
					return this.filterEntitys(this.getElmNodesByAttr(this.getAllElm(),eattr));
				}
			}
			//标签创建 如：<div>
			if(/^\<[^\>\<]+\>$/.test(o)){
				var tagnn = o.replace(/^\<+|\>+$/g,"").toLocaleLowerCase();
				//兼容处理SVG元素创建
				if(tagnn == "svg"||tagnn == "rect"||tagnn == "circle"||
					tagnn == "ellipse"||tagnn == "line"||tagnn == "polyline"||
						tagnn == "polygon"||tagnn == "path"){
					return document.createElementNS('http://www.w3.org/2000/svg',tagnn);
				}else{
					return document.createElement(tagnn);
				}
			}
			//html字符串创建
			if(/\<[^\>\<]+\>/.test(o)){
				//return this.getElmAllChild(o.toDom());//返回多个对象?
				return o.toDom();//返回一个对象?
			}
		},	
		//+-----------------------------------------
		//| 收缩动画高度存储
		//+-----------------------------------------
		slideanimaheight:function(obj,f){
			var _h = _private_fn.getElmCss(obj,'height');
			//存储原始高度
			if(!obj._____height){
				obj._____height = parseFloat(_h=='auto'?obj.clientHeight:_h);
				obj._____mt = parseFloat(_private_fn.getElmCss(obj,'marginTop'))||0;
				obj._____mb = parseFloat(_private_fn.getElmCss(obj,'marginBottom'))||0;
				obj._____pt = parseFloat(_private_fn.getElmCss(obj,'paddingTop'))||0;
				obj._____pb = parseFloat(_private_fn.getElmCss(obj,'paddingBottom'))||0;
				obj._____bt = parseFloat(_private_fn.getElmCss(obj,'borderTopWidth'))||0;
				obj._____bb = parseFloat(_private_fn.getElmCss(obj,'borderBottomWidth'))||0;
			} 
			//初始化数据
			obj.style["overflow"]="hidden";
			obj.style["display"] = "block";
			!_private_fn.getElmOpacity(obj)&&_private_fn.setElmOpacity(obj,100);//如果不透明度为零，则设置不透明度
			if(f){
				obj.style["height"]="0px";
				obj.style["marginTop"]="0px";
				obj.style["marginBottom"]="0px";
				obj.style["paddingTop"]="0px";
				obj.style["paddingBottom"]="0px";
				obj.style["borderTopWidth"]="0px";
				obj.style["borderBottomWidth"]="0px";
			}else{
				obj.style["height"]=obj._____height+"px";
				obj.style["marginTop"]=obj._____mt+"px";
				obj.style["marginBottom"]=obj._____mb+"px";
				obj.style["paddingTop"]=obj._____pt+"px";
				obj.style["paddingBottom"]=obj._____pb+"px";
				obj.style["borderTopWidth"]=obj._____bt+"px";
				obj.style["borderBottomWidth"]=obj._____bb+"px";
			}
		},
		//+-----------------------------------------
		//| 淡入淡出动画参数识别
		//+-----------------------------------------
		fadeanimaprefix:function(args,fn){
			var param,speed,callback;
			if(args.length==1&&typeof args[0] == "function"){
				//一个参数为function
				callback = args[0];
			}else if(args.length==1&&args[0] >1){
				//一个参数为速度
				speed = args[0];
			}else if(args.length==1&&args[0] <=1){
				//一个参数为不透明度
				param = args[0];
			}else if(args.length==2&&args[0] <=1&&typeof args[1] == "function"){
				//第一个参数为不透明度，第二个参数为方法
				param = args[0];
				callback = args[1];
			}else if(args.length==2&&args[0] >1&&typeof args[1] == "function"){
				//第一个参数为速度，第二个参数为方法
				speed = args[0];
				callback = args[1];
			}else if(args.length==2&&args[0] >1&&args[1] <=1){
				//第一个参数为速度，第二个参数为不透明度
				speed = args[0];
				param = args[1];
			}else if(args.length==2&&args[0] <=1&&args[1] >1){
				//第一个参数为不透明度，第二个参数为速度
				speed = args[1];
				param = args[0];
			}else if(args.length==3){
				param=args[0],speed=args[1],callback=args[2];
			}
			fn.call(this,param,speed,callback);
		},
		//+-----------------------------------------
		//| 校验对象是否为json对象
		//+-----------------------------------------
		isHtmlElement:function(obj){
			return typeof obj.length=='undefined'&&typeof obj == 'object'&&obj.tagName&&obj.parentNode;
		},	
		//+-----------------------------------------
		//| 校验对象是否为json对象
		//+-----------------------------------------
		isJson:function(obj){
			return typeof obj == 'object' && typeof obj.length!='number' && this.objToString(obj) == "[object object]";
		},
		//+-----------------------------------------
		//| 校验对象是否为数组
		//+-----------------------------------------
		isArray:function(obj){
			return typeof obj == 'object' 
			&& typeof obj.length!='undefined' 
			&& (this.objToString(obj) == "[object array]" || this.objToString(obj)=='[object nodelist]'|| this.objToString(obj) == "[object object]");
		},
		//+-----------------------------------------
		//| 校验对象是否为数组
		//+-----------------------------------------
		objToString:function(obj){
			return Object.prototype.toString.call(obj).toLowerCase()
		},
		//+-----------------------------------------
		//| 比较对象是否相等
		//| 可以比较string/number/json/array
		//+-----------------------------------------
		equal:function(m,o){
				//内部校验公共体
				var _this=this,_check = function(a1,a2){
							if(_this.isArray(a2)&&_this.isArray(a1)&&_this.equal(a1,a2))return true;
							if(_this.isJson(a2)&&_this.isJson(a1)&&_this.equal(a1,a2))return true;
							if(_this.isJson(a2)&&_this.isArray(a1)||_this.isJson(a2)&&_this.isArray(a1))return false;
							if(typeof a2 != 'string' && typeof a2 != 'number'&& typeof a2 != typeof a1)return false;
							if(a1!=a2)return false;
							return true;
				}
				//比较字符串或数
				if((typeof o == 'string'||typeof o == 'number')&&(typeof m == 'string'||typeof m == 'number')) return (m == o);
				//比较数组
				if(this.isArray(o)&&this.isArray(m)){
					if(m.length==o.length){
						//先排序再比较
						var a1=m,a2=o;
						a1 = a1.sort();//调用sort方法后，数组本身会被改变，即影响原数组
						a2 = a2.sort();
						for(var i = 0; i<a1.length; i++){
							if(!_check(a1[i],a2[i]))return false;
						}
						return true;
					}else{
						return false;
					}
				}
				//比较json对象
				if(this.isJson(o)&&this.isJson(m)){
					if(this.isEmpty(m)&&this.isEmpty(o))return true;
					if(this.isEmpty(m)&&!this.isEmpty(o))return false;
					if(!this.isEmpty(m)&&this.isEmpty(o))return false;
					//都不为空
					for(var k in o){
						if(!_check(o[k],m[k]))return false;
					}
					return true;
				}
				//两者类型不同
				return false;
		},
		//+-----------------------------------------
		//| 校验对象是否为空
		//| 对象可以为string/json/array/null
		//+-----------------------------------------
		isEmpty:function(o){
			//数字
			if(typeof o == 'number')return false;
			//null对象
			if(this.objToString(o)=='[object null]'){
				return true;
			}
			//字符串和null字符串
			if(typeof o == 'string'){
				if(!o.trims().length||o=='null')return true;
				if(o.trims().length)return false;
			}
			//数组
			if(this.isArray(o)){
				if(o&&o.length){
					return false;
				}else{
					return true;
				}
			}
			//json对象
			if(this.isJson(o)){
				var b = true;
				for(var k in o){
					b = false; break;
				}
				return b;
			}
		},
		//+----------------------------------------------------
		//| 是否为方法
		//+----------------------------------------------------
		isFunction:function(fn){
			return (typeof fn == 'function');
		},
		//+----------------------------------------------------
		//| 是否为方法
		//+----------------------------------------------------
		isJsee:function(o){
			return (this.isJson(o)&&o.init&&o.search&&o.masker&&true);
		},
		//+----------------------------------------------------
		//| 内部使用的循环
		//| 主要处理一个对象和多个对象的设置
		//+----------------------------------------------------
		innerFor:function(et,callback){
			if(typeof et.length=='undefined') et = [et];
			for(var i = 0; i<et.length; i++){
				callback.call(et[i]);
			}
			
		},
		//+----------------------------------------------------
		//o为数组，如果长度为1则返回一个对象
		//+----------------------------------------------------
		filterEntitys:function(o){
			if(o&&o.length==1)return o[0];
			return o;
		},
		//+----------------------------------------------------
		//获取所有元素
		//+----------------------------------------------------
		getAllElm:function(o){
			return document.all||document.getElementsByTagName("*");
		},
		//+----------------------------------------------------
		//根据ID获取对象
		//+----------------------------------------------------
		getElmById:function(o){
			return document.getElementById(o);
		},
		//+----------------------------------------------------
		//|根据标签名获取对象
		//+----------------------------------------------------
		getElmByTagName:function(o){
			return document.getElementsByTagName(o);
		},
		//+----------------------------------------------------
		//|根据类名获取对象
		//|参数只能为一个类名
		//|一个元素可以有多个类，只要有一个符合就能被匹配到。
		//+----------------------------------------------------
		getElmByClassName:function(o){
			var cNames,cName,r = [],elems = document.all||document.getElementsByTagName("*");
			for(var i = 0; i<elems.length; i++){
				cName = elems[i].className;//获取当前对象的类名
				if(cName){
					cNames = cName.split(" ");//类名存在，则进行拆分
					for(var j = 0; j<cNames.length; j++){
						if(cNames[j]&&cNames[j]==o){
							r.push(elems[i]);//类名存在且与指定的名相同，则存储对象
						}
					}
				}
			}
			elems=cNames=cName=null;
			return r;
		},
		//+----------------------------------------------------
		//|获取父节点
		//+----------------------------------------------------
		getElmParent:function (o){
			var r = o.parentNode;
			while(!r.tagName) {
				r = r.parentNode;
				if(!r)return;
			}
			return r;
		},
		//+----------------------------------------------------
		//|获取同辈相邻上一个节点
		//+----------------------------------------------------
		getElmPrev:function (o){
			var r = o.previousSibling;
			while(!r.tagName) {
				r = r.previousSibling;
				if(!r)return;//没有上一个节点
			}
			return r;
		},
		//+----------------------------------------------------
		//|获取同辈相邻下一个节点
		//+----------------------------------------------------
		getElmNext:function(o){
			var r = o.nextSibling;
			while(!r.tagName) {
				r = r.nextSibling;
				if(!r)return;//没有下一个节点
			}
			return r;
		},
		//+----------------------------------------------------
		//|获取第一个子节点
		//+----------------------------------------------------
		getElmFirst:function(o){
			var r = o.firstChild;
			while(!r.tagName) {
				r = r.nextSibling;
				if(!r)return;
			}
			return r;
		},
		//+----------------------------------------------------
		//|获取最后一个子节点
		//+----------------------------------------------------
		getElmLast:function(o){
			var r = o.lastChild;
			while(!r.tagName) {
				r = r.previousSibling;
				if(!r)return;
			}
			return r;
		},
		//+----------------------------------------------------
		//|获取所有子节点不包括孙节点
		//+----------------------------------------------------
		getElmChilds:function(entity){
			var r = [],nodes = entity.childNodes;
			for(var i=0; i<nodes.length; i++) {
				if(nodes[i].tagName) r.push(nodes[i]);
			}
			return r;
		},
		//+----------------------------------------------------
		//|从节点集合中获取指定ID元素
		//|@param o 节点集合
		//|@param id ID字符串
		//+----------------------------------------------------
		getElmNodesById:function(o,_id){
			var r;
			if(o){
				for(var i=0; i<o.length; i++){
					if(o[i].id == _id){
						r=o[i];
						break;
					}			
				}
			}
			return r;
		},	
		//+----------------------------------------------------
		//|从节点集合中获取指定className元素
		//|@param o 节点集合
		//|@param clazz class字符串
		//+----------------------------------------------------
		getElmNodesByClass:function(o,clazz){
			var r=[];
			if(o){
				for(var i=0; i<o.length; i++){
					if(this.hasClass(o[i],clazz))r.push(o[i]);			
				}
			}
			return r;
		},
		//+----------------------------------------------------
		//|从节点集合中获取指定属性元素
		//|@param o 节点集合
		//|@param name 属性名与值字符串,必需用'='号相连 如：id=box2
		//+----------------------------------------------------
		getElmNodesByAttr:function(o,name){
			var r=[],name=name.split('='),eattrval = name[1].replace(/^[\'|\"]+|[\'|\"]+$/g,"");//属性值,去掉参数中的'或"
			if(o){
				for(var i=0; i<o.length; i++){
					if(this.getElmAttr(o[i],name[0])==eattrval)r.push(o[i]);			
				}
			}
			return r;
		},
		//+----------------------------------------------------
		//|从节点集合中获取指定标签元素
		//|@param o 节点集合
		//|@param name 标签名
		//+----------------------------------------------------
		getElmNodesByTagName:function(o,name){
			var r=[];
			if(o){
				for(var i=0; i<o.length; i++){
					//传入的标签名转为大写比较
					if(o[i].tagName == name.toLocaleUpperCase())r.push(o[i]);			
				}
			}
			return r;
		},
		//+----------------------------------------------------
		//|获取所有子节点包括孙节点
		//+----------------------------------------------------
		getElmAllChild:function(o){
			var chlids=o.getElementsByTagName("*"),r = [];
			for(var i=0; i<chlids.length; i++) {
				if(chlids[i].tagName) r.push(chlids[i]);
			}
			return r;
		},
		//+----------------------------------------------------
		//|对象属性获取
		//+----------------------------------------------------
		getElmAttr:function(o,name){
			if(name == "class"){
				return o.className;
			}else if(name == "style"){
				return o.style.cssText;
			}else{
				return o.getAttribute(name); 
			}
		},
		//+----------------------------------------------------
		//|对象属性设置
		//+----------------------------------------------------
		//|@param o
		//|@param params 属性键,值对象
		//+----------------------------------------------------
		setElmAttr:function(o,params){
			for(var key in params){
				if(key == "style"){
					o.style.cssText = params[key];
				}else if(key == "class"){
					o.className = params[key];
				}else{
					o.setAttribute(key, params[key]);
				}
			}
		},
		//+------------------------------------------------------------------------------
		//| 移除元素属性
		//+------------------------------------------------------------------------------
		removeElmAttr:function(entity,value){
				entity.removeAttribute(value);
		},	
		//+----------------------------------------------------
		//|css样式获取
		//+----------------------------------------------------
		//|@param element
		//|@param cssProperty 样式名
		//+----------------------------------------------------
		getElmCss:function (element, css_property) {
			var  xr = "",elm_style = element.currentStyle || win.getComputedStyle(element, null);
			if (elm_style.getPropertyValue) {
				// 处理非IE
				xr = elm_style.getPropertyValue(css_property);
			} else {
				// 处理IE
				if(css_property=="float")css_property = "styleFloat";
				// 将带有'-'样式属性转成驼峰写法 border-color <--> borderColor
				css_property = css_property.replace(/(\-+)\w/g, function(s) {
					// 将'-'字符后的字母大写
					return s.toUpperCase();
				}).replace("-", "");
				xr = elm_style.getAttribute(css_property);
			}
			// 将可用的值返回
			return xr ? xr : elm_style[css_property] ? elm_style[css_property]	: element.style[css_property];
		},
		//+----------------------------------------------------
		//|css样式设置
		//+----------------------------------------------------
		//|@param entity
		//|@param params 属性键,值对象
		//+----------------------------------------------------
		setElmCss:function (entity, params) {
			for(var key in params) {
				entity.style[key] = params[key];
			}
		},
		//+--------------------------------------
		//| 添加指定类名
		//+---------------------------------------
		addClass:function(entity,v){
			entity.className+=" "+v;
		},
		//+--------------------------------------
		//| 移除指定类名
		//+---------------------------------------
		removeClass:function (entity,name){	
			   if (new RegExp('(\\s|^)'+name+'(\\s|$)').test(entity.className)) {
				  entity.className=entity.className.replace(new RegExp('(\\s|^)'+name+'(\\s|$)'),' ').replace(/^\s+|\s+$/g, '');
			   }
		},
		//+--------------------------------------
		//| 校验是否包含指定类名
		//+---------------------------------------
		hasClass:function(o,name){
			 return new RegExp('(\\s|^)'+name+'(\\s|$)').test(o.className);
		},
		//+----------------------------------------------------
		//|设置对象不透明度
		//+----------------------------------------------------
		//|@param entity
		//|@param i 不透明度[0~100]
		//+----------------------------------------------------
		setElmOpacity:function (entity, i) {
			if (document.all) {
				var v = parseFloat(navigator.userAgent.match(/MSIE+[\d\s]+/).toString().replace(/MSIE /,""));
				if(v>9){
					//ie10不支持滤镜
					entity.style.opacity = i / 100;
				}else{
					entity.style.filter = 'alpha(opacity=' + i + ')';
				}
			} else {
				entity.style.opacity = i / 100;
			}
		},
		//+----------------------------------------------------
		//|获取对象不透明度
		//+----------------------------------------------------
		//|@param entity
		//+----------------------------------------------------		
		getElmOpacity:function(entity) {
			var opacitys;
			if (document.all) {
				var v = parseFloat(navigator.userAgent.match(/MSIE+[\d\s]+/).toString().replace(/MSIE /,""));
				if(v>9){
					//ie10不支持滤镜
					if(entity.style.opacity!=""){
						opacitys = entity.style.opacity * 100;
					}else{
						opacitys = 100;
					}
				}else{
					try {
						opacitys = entity.filters.alpha.opacity
					} catch (e) {
						entity.style['filter'] = 'alpha(opacity=100)';
						opacitys = 100;
					}
				}
				
			} else {
				//非IE不透明度的值为0~1,所以乘以100 统一返回
				if(entity.style.opacity!=""){
					opacitys = entity.style.opacity * 100;
				}else{
					opacitys = 100;
				}
			}
			return opacitys;
		},
		//+----------------------------------------------------
		//|获取元素在页面上坐标
		//+----------------------------------------------------
		//|@param entity
		//|@return {x:坐标x,y:坐标y}
		//+----------------------------------------------------				
		getElmCoord:function (entity){
			return {
				x:entity.getBoundingClientRect().left,
				y:entity.getBoundingClientRect().top
			}
		},
		//+----------------------------------------------------
		//|获取光标位置
		//+----------------------------------------------------
		//|@param entity 为 input 或 textarea 对象
		//|@return 光标位置 
		//+----------------------------------------------------		
		getElmCursorPosition:function (entity) {
			var CaretPos = 0;
			if (document.selection) { //IE
				entity.focus();
				var Sel = document.selection.createRange();
				Sel.moveStart('character', -entity.value.length);
				CaretPos = Sel.text.length;
			} else if (entity.selectionStart || entity.selectionStart == '0')
				// 非IE
				CaretPos = entity.selectionStart;
			return (CaretPos);
		},
		//+----------------------------------------------------
		//|设置光标位置
		//+----------------------------------------------------
		//|@param entity 为 input 或 textarea 对象
		//|@param pos 光标要移动的位置（从0开始）
		//+----------------------------------------------------		
		setElmCursorPosition:function (entity, pos) {
			if (entity.setSelectionRange) {
				entity.focus();
				entity.setSelectionRange(pos, pos);
			} else if (entity.createTextRange) {
				var range = entity.createTextRange();
				range.collapse(true);
				if (entity.tagName == "TEXTAREA") {
					range.moveEnd('character', pos - 1);
					range.moveStart('character', pos - 1);
				} else {
					range.moveEnd('character', pos);
					range.moveStart('character', pos);
				}
				range.select();
			}
		},
		//+----------------------------------------------------
		//|cookie设置
		//+----------------------------------------------------
		//| @param name cookie名
		//| @param value cookie 值
		//| @param expiredays cookie 过期时间 [单位]毫秒 ; 1天 =1*24*60*60*1000 
		//+--------------------------------------------------------------------
		setCookie:function (name, value, expiredays) {
			var todayDate = new Date();
			todayDate.setTime(todayDate.getTime() + expiredays);
			document.cookie = name + "=" + escape(value) + "; path=/; expires=" + todayDate.toGMTString() + ";"
		},
		//+----------------------------------------------------
		//|cookie获取
		//+----------------------------------------------------
		//| @param name cookie名
		//+----------------------------------------------------
		getCookie:function (name) {
			var nameOfCookie = name + "=";
			var x = 0;
			while (x <= document.cookie.length) {
				var y = (x + nameOfCookie.length);
				if (document.cookie.substring(x, y) == nameOfCookie) {
					if ((endOfCookie = document.cookie.indexOf(";", y)) == -1)
						endOfCookie = document.cookie.length;
					return unescape(document.cookie.substring(y, endOfCookie));
				}
				x = document.cookie.indexOf(" ", x) + 1;
				if (x == 0)
					break;
			}
			return "";
		},
		//+----------------------------------------------------
		//|事件委派
		//+----------------------------------------------------
		//| @param o
		//| @param type 事件类型如：onclick,onchange,onkeydown等
		//| @param callback 回调方法 [注]回调方法中的this指向当前触发事的对象
		//+-------------------------------------------------------------------
		live:function (o, type, callback) {
			if (o.attachEvent) {	//IE
				o.attachEvent(type, function (e) {
					var e = e || event;// e 兼容处理事件
					o.entity = e.target || e.srcElement;
					if (typeof callback == "function") {
						callback.call(o.entity);
					}
				}, false);
			} else { // 非IE
			//将type前缀on去掉，例如：onclick ->click
				o.addEventListener(type.substring(2), function (e) {
					var e = e || event;
					o.entity = e.target || e.srcElement;
					if (typeof callback == "function") {
						callback.call(o.entity);
					}
				}, false);
			}
		},
		//+----------------------------------------------------
		//|事件绑定
		//+----------------------------------------------------
		//| @param o
		//| @param type 事件类型如：onclick,onchange,onkeydown等
		//| @param callback 回调方法 
		//+-------------------------------------------------------------------
		bind:function (o, type, callback) {
			if (o.attachEvent) {
				// IE6+
				o.attachEvent(type, callback, false);
			} else if (o.addEventListener) {
				// chrome,firefox
				o.addEventListener(type.substring(2), callback, false);
			} else {
				o[type] = callback;
			}
		},
		//+----------------------------------------------------
		//|事件解绑
		//+----------------------------------------------------
		//| @param o
		//| @param type 事件类型如：onclick,onchange,onkeydown等
		//| @param callback 回调方法
		//| [注]解绑时，o和callback函数必须与绑定时的相同
		//+-------------------------------------------------------------------
		unbind:function (o, type, callback) {
			if (o.removeEventListener) {
				o.removeEventListener(type.substring(2), callback, false);
			} else if (o.detachEvent) {
				o.detachEvent(type, callback);
			} else {
				o[type] = null;
			}
		},
		//+----------------------------------------------------
		//|搜索关键字
		//+----------------------------------------------------
		//| content 被检索对象[注]只能为非表单对象
		//| key关键字
		//| callback 回调方法，可以处理搜索到内容的显示样式,缺省时搜索到的内容样式为红色加粗
		//+--------------------------------------------------------------------------------
		textSearch:function(content,key,callback){
				//检索后内容样式
				var r=content.innerHTML.replace(eval("/"+key+"/g"),function(text){
					if(callback){
						return callback.call(content,text);
					}else{
						//text为匹配的关键字,设置匹配值的样式为红色加粗
						return "<b style='color:red;'>"+text+"</b>";
					}
				});
				//将检索后的内容重新放入div中
				content.innerHTML = r;	
		},		
		//+--------------------------------------------------------------------------------	
		//| 将指定对象变成当前对象的最后一个子节点[可以对多个对象进行设置]
		//+--------------------------------------------------------------------------------	
		//| 在父级节点中的子节点的末尾添加新的节点
		//| o 节点对象
		//+--------------------------------------------------------------------------------	
		elmAppend:function(entity,o){
			if(typeof o == 'string')o = document.createTextNode(o);
				entity.appendChild(o);
		},	
		//+--------------------------------------------------------------------------------	
		//| 对象移出[可以对多个对象进行设置]
		//+--------------------------------------------------------------------------------	
		//| entity 移除的节点对象
		//+--------------------------------------------------------------------------------		
		elmRemove:function(entity){
			if(typeof entity == 'string')entity = document.createTextNode(entity);
			entity.parentNode.removeChild(entity);
		},	
		//+--------------------------------------------------------------------------------	
		//| 对象替换[可以对多个对象进行设置]
		//+--------------------------------------------------------------------------------	
		//| entity 被替换的节点对象
		//+--------------------------------------------------------------------------------		
		elmReplace:function(entity,o){
			if(typeof o == 'string')o = document.createTextNode(o);
			entity.parentNode.replaceChild(o,entity);
		},	
		//+--------------------------------------------------------------------------------	
		//| 对象替换[可以对多个对象进行设置]
		//+--------------------------------------------------------------------------------	
		//| entity 被替换的节点对象
		//+--------------------------------------------------------------------------------		
		elmInsertBefore:function(entity,o){
			if(typeof o == 'string')o = document.createTextNode(o);
			entity.parentNode.insertBefore(o,entity);
		},
		//+--------------------------------------------------------------------------------	
		//| 对象替换[可以对多个对象进行设置]
		//+--------------------------------------------------------------------------------	
		//| entity 被替换的节点对象
		//+--------------------------------------------------------------------------------		
		elmInsertAfter:function(entity,o){
		   if(typeof o == 'string')o = document.createTextNode(o);
		   if(this.getElmNext(entity)){
			   //在下一节点前插入
				entity.parentNode.insertBefore(o,this.getElmNext(entity));  
		   }else{
			   //当前节点为最后一个节点
			  	entity.parentNode.appendChild(o);
		   }
		},
		//+--------------------------------------------------------------------------------	
		//| 对象克隆[只能对一个对象进行克隆]
		//+--------------------------------------------------------------------------------	
		//| f 为true时 克隆节点以及节点下面的子内容
		//| f 为false时或缺省时 克隆当前节点
		//+--------------------------------------------------------------------------------	
		elmClone:function(entity,f){
			return entity.cloneNode(f);
		},
		//+--------------------------------------------------------------------------------	
		//| 当页面元素都加载完成后再执行 fn 的方法
		//+--------------------------------------------------------------------------------	
		loaded:function (fn) {
			//var completeindex = 1;
			if (typeof fn == "function") {
				//第一次加载时，创建数组，用来缓存页面加载完成后执行的方法
				if (!Jsee.___load_execFn) {
					Jsee.___load_execFn = new Array();
					//Jsee.___load_i=0;
				}
				Jsee.___load_execFn.push(fn);//将方法存入缓存器中
			}
		},
		//+----------------------------------------------------
		//|任意版块可拖拽
		//+----------------------------------------------------
		//|添加拖拽事件方法:
		//| var obj = document.getElementById(id);
		//| rDrag.init(obj);
		//+----------------------------------------------------
		rDrag:{
			 o:null,
			 init:function(o,callback){
			  o.onmousedown = this.start;
			  o.dragEnd = this.end;
			  callback&&(o.___cback = callback);
			 },
			 start:function(){
				var o,e = Event.fixEvent();
				e.preventDefault && e.preventDefault();
				_private_fn.rDrag.o = o = this;
				//this.style.position="absolute";
				o.x = e.clientX - _private_fn.rDrag.o.offsetLeft;
				o.y = e.clientY - _private_fn.rDrag.o.offsetTop;
				document.onmousemove = _private_fn.rDrag.move;
				document.onmouseup = _private_fn.rDrag.end;
			 },
			 move:function(){
				var oLeft,oTop,e = Event.fixEvent();
				oLeft = e.clientX - _private_fn.rDrag.o.x;
				oTop = e.clientY - _private_fn.rDrag.o.y;
				_private_fn.rDrag.o.style.left = oLeft + 'px';
				_private_fn.rDrag.o.style.top = oTop + 'px';
				_private_fn.rDrag.o.___cback&&_private_fn.rDrag.o.___cback.call(_private_fn.rDrag.o,oLeft,oTop);
			 },
			 end:function(){
			  _private_fn.rDrag.o = document.onmousemove = document.onmouseup = null;
			 }
		},
		//+----------------------------------------------------
		//|遮罩
		//+----------------------------------------------------		
		Masker:{
			show:function(o,contant){
				if(o.className=='____masker_mark'||o.__masker_n_)return ;
				var entity = o || document.body,//被遮罩对象
				htmlText=contant||"<center style='color:#FFF'>[Please set the mask content...]</center>",
				boxOfBg=document.createElement("div"),//半透明背景层
				boxOfContant=document.createElement("div"),//存放遮罩内容层
				boxStyle = "width:100%; overflow:hidden; position:absolute; top:0px; left:0px; ";//默认样式
						
				//使用默认样式
				//半透明背景样式
				boxOfBg.style.cssText = boxStyle;
				boxOfBg.style.background="#000";
				//内容背景样式
				boxOfContant.style.cssText= boxStyle;
				
				entity.style.position="relative";//设置被遮罩对象为相对布局
				entity.style.overflow="hidden";
				
				var h = entity.clientHeight; //获取被遮罩对象的高度
				if(entity == document.body && h<screen.height) h = screen.height;
				//设置遮罩层的高度与被遮罩的高度相同
				boxOfBg.style.height = h+"px";
				boxOfContant.style.height = h+"px";
				
				//设置类名
				boxOfBg.className="____masker_mark"; 
				boxOfContant.className="____masker_mark";
				
				//设置图层
				boxOfBg.style.zIndex="9999"; 
				boxOfContant.style.zIndex="10000";
				
				//初始化不透明度
				_private_fn.setElmOpacity(boxOfBg,0);
				_private_fn.setElmOpacity(boxOfContant,0);
				
				//设置遮罩内容
				boxOfContant.innerHTML = htmlText;
				
				//将遮罩添加到被遮罩元素内
				entity.appendChild(boxOfBg);
				entity.appendChild(boxOfContant);
				//缓存遮罩对象
				entity.___masker_bgEntity = boxOfBg;
				entity.___masker_bgCoEntity = boxOfContant;
				entity.__masker_n_=1;//遮罩标记
				//淡入遮罩
				
				_private_fn.animation(boxOfBg).animate({opacity:50});
				_private_fn.animation(boxOfContant).animate({height:h,opacity:100});	
			},
			hide:function(o){
				var entity = o || document.body;
				if(entity.__masker_n_){
					_private_fn.animation(entity.___masker_bgEntity).animate(
								{opacity:0},0,function(){_private_fn.elmRemove(this);	});
					_private_fn.animation(entity.___masker_bgCoEntity).animate(
								{opacity:0},0,function(){_private_fn.elmRemove(this);	});
					delete entity.__masker_n_;
				}
			}
		},	
		//+-------------------------------------------------------------------
		//|字符串转日期
		//|固定格式yyyy-MM-dd hh:mm:ss
		//+-------------------------------------------------------------------
		stringToDate:function(stimes){
			var dateModel;
			if(stimes.length == 1)
			{
				//yyyy-MM-dd or yyyy-MM
				var stime = stimes[0].split("-");
				
				if(stime.length == 2)
				{
					//yyyy-MM
					dateModel = new Date(stime[0],stime[1]-1);	
				}else if(stime.length==3){
					//yyyy-MM-dd
					dateModel = new Date(stime[0],stime[1]-1,stime[2]);
				}
				
			}else{
				//yyyy-MM-dd hh or yyyy-MM-dd hh:mm or yyyy-MM-dd hh:mm:ss
				var stime = stimes[0].split("-");
				var stimemin = stimes[1].split(":");
				if(stimemin.length == 1)
				{
					//yyyy-MM-dd hh
					dateModel = new Date(stime[0],stime[1]-1,stime[2],stimemin[0]);
				}else if(stimemin.length == 2){
					//yyyy-MM-dd hh:mm
					dateModel = new Date(stime[0],stime[1]-1,stime[2],stimemin[0],stimemin[1]);
				}else {
					//yyyy-MM-dd hh:mm:ss
					dateModel = new Date(stime[0],stime[1]-1,stime[2],stimemin[0],stimemin[1],stimemin[2]);
				}
			}
			return dateModel;		
		},
//+-----------------------------------------------------------------------
//|比较两个字符串日期的大小 distancefalg = true
//|获取两个字符串日期的距离 checkfalg = true;
//+-----------------------------------------------------------------------
		string_Date_Tool:function(sdate,edate,distancefalg,checkfalg){
			var distancenum = 0,checkval=false;;
			// 函数初始化
			var stimes = sdate.split(" ");
			var etimes = edate.split(" ");
			//校验并返回结果
			var eqtime = function (st,et)
			{			
				if(st == et)
				{
					// 时间相等返回 字符 'eq'
					return "eq";
				}else{
					//开始时间 大于 结束时间返回 true 
									  // 否则 false
					return st > et;
				}
			}
			if(stimes.length == 1 && etimes.length == 1)
			{
				//yyyy-MM-dd or yyyy-MM
				var stime = stimes[0].split("-");
	
				var etime = etimes[0].split("-");
				
				if(stime.length == 2 && etime.length == 2)
				{
					//yyyy-MM
					var st = new Date(stime[0],stime[1]).getTime();
					var et = new Date(etime[0],etime[1]).getTime();
					
					distancefalg&&(distancenum = st-et); //时间间隔
					if(checkfalg)checkval = eqtime(st,et);  		
				}else if(stime.length==3 && etime.length == 3){
					//yyyy-MM-dd
					var st = new Date(stime[0],stime[1],stime[2]).getTime();
					var et = new Date(etime[0],etime[1],etime[2]).getTime();
					
					distancefalg&&(distancenum = st-et); //时间间隔
					if(checkfalg)checkval = eqtime(st,et); 
				}
				
			}else{
				//yyyy-MM-dd hh or yyyy-MM-dd hh:mm or yyyy-MM-dd hh:mm:ss
				var stime = stimes[0].split("-");
				var etime = etimes[0].split("-");
				var stimemin = stimes[1].split(":");
				var etimemin = etimes[1].split(":");
				if(stimemin.length == 1 && etimemin.length == 1)
				{
					//yyyy-MM-dd hh
					var st = new Date(stime[0],stime[1],stime[2],stimemin[0]).getTime();
					var et = new Date(etime[0],etime[1],etime[2],etimemin[0]).getTime();
					
					distancefalg&&(distancenum = st-et); //时间间隔
					if(checkfalg)checkval = eqtime(st,et);  	
				}else if(stimemin.length == 2 && etimemin.length == 2){
					//yyyy-MM-dd hh:mm
					var st = new Date(stime[0],stime[1],stime[2],stimemin[0],stimemin[1]).getTime();
					var et = new Date(etime[0],etime[1],etime[2],etimemin[0],etimemin[1]).getTime();
					
					distancefalg&&(distancenum = st-et); //时间间隔
					if(checkfalg)checkval = eqtime(st,et);  
				}else {
					//yyyy-MM-dd hh:mm:ss
					var st = new Date(stime[0],stime[1],stime[2],stimemin[0],stimemin[1],stimemin[2]).getTime();
					var et = new Date(etime[0],etime[1],etime[2],etimemin[0],etimemin[1],etimemin[2]).getTime();
					
					distancefalg&&(distancenum = st-et); //时间间隔
					if(checkfalg)checkval = eqtime(st,et);  
				}
			}	
	
			if(distancenum)return Math.abs(distancenum);
			if(checkfalg)return checkval;
		
		},
		//+----------------------------------------------------
		//|浏览器类型
		//+----------------------------------------------------
		//| 初始化浏览器值: msie,firefox,chrome,opera,safari
		//+----------------------------------------------------
		__initBrowser:function(){
			var r,ua = navigator.userAgent.toLowerCase();
			ua.match(/msie ([\d.]+)/) ? Jsee.browser.msie = navigator.appVersion.split(";")[1].replace(/[ ]/g, ""):
			ua.match(/firefox\/([\d.]+)/) ? Jsee.browser.firefox=1 :
			ua.match(/chrome\/([\d.]+)/) ? Jsee.browser.chrome=1 :
			ua.match(/opera.([\d.]+)/) ? Jsee.browser.opera=1 :
			ua.match(/version\/([\d.]+).*safari/) ? Jsee.browser.safari=1 : 0;
		},
		//+----------------------------------------------------
		//|PageContext对象初始化
		//+----------------------------------------------------
		__initPageContext:function(){
			//根路径赋值
			PageContext.contextPath =
			(function(){
				var currUri = document.location.href,
				pathName = document.location.pathname,
				pos = currUri.indexOf(pathName),
				localhostPaht = currUri.substring(0, pos),
				projectName = pathName.substring(0, pathName.substring(1).indexOf('/') + 1);	
				return localhostPaht + projectName;
			})();
			//获取scrollTop	
			PageContext.scrollTop = function(){return document.documentElement.scrollTop || win.pageYOffset || document.body.scrollTop;}
			//获取URL中的参数
			PageContext.param = function(name){
				var p = {};
				var currUri = document.location.href;
				currUri = currUri.substring(currUri.indexOf("?")+1);
				if(currUri.indexOf("&")!=-1) p = eval("({"+currUri.split("&").toString().replace(/=/g,":")+"})");
				return p[name];
			}
			//字符串转码
			PageContext.encode = function(url){
				return encodeURI(url);
			}
			//字符串解码
			PageContext.decode = function(url){
				return decodeURI(url);
			}
			//浏览器窗口大小,返回宽高对象{width:x,heihgt:x}
			PageContext.winSize = function() {
				 var winWidth = win.innerWidth || document.body.clientWidth || document.documentElement.clientWidth;
				 var winHeight = win.innerHeight || document.body.clientHeight || document.documentElement.clientHeight;
				 //赋值
				 return {width:winWidth,height:winHeight};
			}			
		},
		//+----------------------------------------------------
		//|异步请求核心
		//+----------------------------------------------------
		asyncCore:function(url,callback,type,error){
//以下为核心内容----------------------		
			var xmlhttp;
			//1.
			if (window.XMLHttpRequest) {
				try {
					xmlhttp = new XMLHttpRequest();
					xmlhttp.overrideMimeType("text/html;charset=UTF-8");//设定以UTF-8编码识别数据
				} catch (e) {}
			} else if (window.ActiveXObject) {
				try {
					xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
				} catch (e) {
					try {
						xmlhttp = new ActiveXObject("Msxml2.XMLHttp");
					} catch (e) {
						try {
							xmlhttp = new ActiveXObject("Msxml3.XMLHttp");
						} catch (e) {}
					}
				}
			}
			//2.
			xmlhttp.onreadystatechange = function(){
					if (xmlhttp.readyState == 4) {//readystate 为4即数据传输结束
						try{
							//callback&&callback("抱歉，没找到此页面:"+ url +"");
							var err = 0,state = xmlhttp.status;
							if(state == 200){
								callback&&callback(xmlhttp.responseText);
							}else if(state == 100){
								err = "100:Continue";
							}else if(state == 101){
								err = "101:Switching protocols";
							}else if(state == 201){
								err = "201:Created";
							}else if(state == 202){
								err = "202:Accepted";
							}else if(state == 203){
								err = "203:Non-Authoritative Information";
							}else if(state == 204){
								err = "204:No Content";
							}else if(state == 205){
								err = "205:Reset Content";
							}else if(state == 206){
								err = "206:Partial Content";
							}else if(state == 300){
								err = "300:Multiple Choices";
							}else if(state == 301){
								err = "301:Moved Permanently";
							}else if(state == 302){
								err = "302:Found";
							}else if(state == 303){
								err = "303:See Other";
							}else if(state == 304){
								err = "304:Not Modified";
							}else if(state == 305){
								err = "305:Use Proxy";
							}else if(state == 307){
								err = "307:Temporary Redirect";
							}else if(state == 400){
								err = "400:Bad Request";
							}else if(state == 401){
								err = "401:Unauthorized";
							}else if(state == 402){
								err = "402:Payment Required";
							}else if(state == 403){
								err = "403:Forbidden";
							}else if(state == 404){
								err = "404:Not Found";
							}else if(state == 405){
								err = "405:Method Not Allowed";
							}else if(state == 406){
								err = "406:Not Acceptable";
							}else if(state == 407){
								err = "407:Proxy Authentication Required";
							}else if(state == 408){
								err = "408:Request Timeout";
							}else if(state == 409){
								err = "409:Conflict";
							}else if(state == 410){
								err = "410:Gone";
							}else if(state == 411){
								err = "411:Length Required";
							}else if(state == 412){
								err = "412:Precondition Failed";
							}else if(state == 413){
								err = "413:Request Entity Too Large";
							}else if(state == 414){
								err = "414:Request-URI Too Long";
							}else if(state == 415){
								err = "415:Unsupported Media Type";
							}else if(state == 416){
								err = "416:Requested Range Not Suitable";
							}else if(state == 417){
								err = "417:Expectation Failed";
							}else if(state == 500){
								err = "500:Internal Server Error";
							}else if(state == 502){
								err = "502:Bad Gateway";
							}else if(state == 501){
								err = "501:Not Implemented";
							}else if(state == 503){
								err = "503:Service Unavailable";
							}else if(state == 504){
								err = "504:Gateway Timeout";
							}else if(state == 505){
								err = "505:HTTP Version Not Supported";
							}else{
								err = state+":other error";
							}
							if(err&&error)error(err);//请求错误时执行
						} catch(e){
							error&&error("Sending request failed:"+e);//请求错误时执行
							//callback&&callback("抱歉，发送请求失败，请重试 " + e);
						}
				   }
			}
			//3.
			xmlhttp.open(type?type:"GET", url, true);
			xmlhttp.send(null);			 
		},
//+-------------------------------------------------------------------------------------
//| 自定义动画
//+-------------------------------------------------------------------------------------
/*
 1：功能说明 
 2：支持级联动画调用； 
 3：支持delay动画队列延迟； 
 4：支持opacity透明度变化； 
 5：支持+= -= *= /=操作； 
 6：支持单位操作(px, %);  [注] 默认单位为像素{width:200} 等同于 {width:"200px"}
 opacity--透明度变化 支持+= -= *= /=操作。
 以毫秒为单位；[可选 默认500毫秒]; 
 案例：
//animates(arg1,arg2,arg3)
//arg1, 动画参数,json对象{width:"200px",height:"300px",top:"400px"} [注]opacity 为0至100 
//arg2, 完成动画的总时间
//arg3  完成动画时的动作
Animation(document.getElementById("box")).animate({width:"200px",height:"300px",opacity:100},3500,function(){alert("动画执行完成")});
Animation(document.getElementById("box2")).delays(1000).animate({opacity:100},3500);
 */
		animation:function (entity) {
			var elem = entity, //对象 
			f = 0, _this = {}, lazy = 10, lazyque = 10, // f动画计数器 lazy动画延迟 lazyque队列延迟 
			// 算法 你可以改变他来让你的动画不一样 
			tween = function(t, b, c, d) {
				return -c * (t /= d) * (t - 2) + b
		
			},
			// adv 用于+= -= *= /=操作 ,如果没有符号则返回 val-b
			// val +250
			// b 200 将会变成250
			adv = function(val, b) {
				var va, re = /^([+-\\*\/]=)([-]?[\d.]+)/;
				if (re.test(val)) {
					var reg = val.match(re);
					reg[2] = parseFloat(reg[2]);
					switch (reg[1]) {
					case '+=':
						va = reg[2];
						break;
					case '-=':
						va = -reg[2];
						break;
					case '*=':
						va = b * reg[2] - b;
						break;
					case '/=':
						va = b / reg[2] - b;
						break;
					}
					return va;
				}
				return parseFloat(val) - b;
			};
			// elem.animates 读取用于当前dom元素上的动画队列 
			elem.animates = elem.animates || [];
			// 统一队列入口 用于方便设置延迟，与停止 
			_this.entrance = function(fn, ags, lazytime) {
				//fn 调用函数 ags 参数 lazytime 延迟时间 
				setTimeout(function() {
					fn(ags[0], ags[1], ags[2]);
				}, (lazytime || 0));
			}
		
			// 队列操作 
			_this.queue = function() {
				if (elem.animates && ++f == elem.animates[0].length) {
					f = 0;// 清空计数器 
					elem.animates[0].callback ? elem.animates[0].callback.apply(elem)
							: false;
					// 判断是否有动画在等待执行 
					if (elem.animates.length > 1) {
						elem.animates[0].callback = elem.animates[1].callback;
						elem.animates = entity.animates || [];// 从dom对象上获取最新动画队列
						elem.animates.shift();// 清除刚执行完的动画队列 
						entity.animates = elem.animates;// 把新的队列更新到dom 
						var ea = elem.animates[0];
						// 循环播放队列动画 
						for ( var i = 0; i < ea.length; i++) {
							ea[i][0] === 'opacity' ? _this.entrance(_this.alpha, [
									ea[i][1], ea[i][2] ], lazyque) : _this.entrance(
									_this.execution, [ ea[i][0], ea[i][1], ea[i][2] ],
									lazyque);
						}
					} else {
						elem.animates.length = 0; // 队列清除 
						entity.animates.length = 0; // 队列清除 
					}
				}
			}
			//设置lazy方法，以后的队列动画延迟时间 
			_this.delays = function(val) {
				lazyque = val;
				return _this;
			}
			//动画变化 
			_this.execution = function(key, val, t) {
				var s = (new Date()).getTime(), d = t || 500,
				b = parseFloat(_private_fn.getElmCss(elem, key)) || 0, c = adv(val, b), // adv用于设置高级操作比如 += -= 等等
				un;// 单位 默认单位为像素 
				try {
					un = val.match(/\d+(.+)/)[1]
				} catch (e) {
					un = "px";
				}
				(function() {
					var t = (new Date()).getTime() - s;
					if (t > d) {
						t = d;
						elem.style[key] = parseFloat(tween(t, b, c, d)) + un;
						_this.queue(); // 操作队列 
						return _this;
					}
					elem.style[key] = parseFloat(tween(t, b, c, d)) + un;
					// arguments.callee 匿名函数递归调用 
					setTimeout(arguments.callee, lazy);
				})();
			}
			// 入口 
			_this.animate = function(sty, t, fn) {
				// sty,t,fn 分别为 变化的参数key,val形式,动画用时,回调函数 
				var len = elem.animates.length;// len查看动画队列长度 
				elem.animates[len] = [];
				elem.animates[len].callback = fn;
				//多key 循环设置变化 
				for ( var i in sty) {
					elem.animates[len].push([ i, sty[i], t ]);
					if (len == 0) {
						i == 'opacity' ? _this.entrance(_this.alpha, [ sty[i], t ],
								lazyque) : _this.entrance(_this.execution, [ i, sty[i],
								t ], lazyque);
					}
				}
				entity.animates = elem.animates;//把新的动画队列添加到dom元素上 
				return _this;
			}
			// 透明度变化的代码 
			_this.alpha = function(val, t) {
				val = val / 100;
				var s = (new Date()).getTime(), d = t || 500, b, c;
		
				//获取不透明度getOpacity
				b = _private_fn.getElmOpacity(elem) / 100;
				c = adv(val, b) * 100;
				(function() {
					var t = (new Date()).getTime() - s;
		
					if (t > d) {
						t = d;
						//设置不透明度setOpacity
						_private_fn.setElmOpacity(elem, tween(t, (100 * b), c, d));
						_this.queue(); // 队列控制 
						return _this;
					}
					//设置不透明度
		
					_private_fn.setElmOpacity(elem, tween(t, (100 * b), c, d));
					setTimeout(arguments.callee, lazy);
				})()
		
			}
			return _this;
		}
		
		
//private fn end.		
	}

/**
+------------------------------------------------------------*
* 以下内容为框架初始化相关操作	
+------------------------------------------------------------*
*/
	//+-------------------------------------------------------
	//|初始化浏览器属性
	//+-------------------------------------------------------
	_private_fn.__initBrowser();
	//+-------------------------------------------------------
	//|初始化PageContext对象
	//+-------------------------------------------------------
	_private_fn.__initPageContext();
	
//+-----------------------------------------
//| 校验对象是否为json对象
//+-----------------------------------------
Jsee.isJson = function(obj){
	return _private_fn.isJson(obj);
}
//+-----------------------------------------
//| 校验对象是否为数组
//+-----------------------------------------
Jsee.isArray = function(obj){
	return _private_fn.isArray(obj);
}
/*
//+-----------------------------------------
//| 比较对象是否相等
//+-----------------------------------------
//|可以比较以下类型数据
//| string/number/array/json
//+-----------------------------------------
*/
Jsee.equal = function(a1,a2){
	return _private_fn.equal(a1,a2);
}
/*
//+-----------------------------------------
//| 校验对象是否为空
//+-----------------------------------------
//|可以比较以下类型数据
//| string/array/json/null[注]null字符串为空
//+-----------------------------------------
*/
Jsee.isEmpty = function(obj){
	return _private_fn.isEmpty(obj);
}
//+-----------------------------------------
//| 校验对象是否为方法
//+-----------------------------------------
Jsee.isFunction = function(fn){
	return _private_fn.isFunction(fn);
}
//+-----------------------------------------
//| 校验对象是否为html对象
//+-----------------------------------------
Jsee.isHtmlElement = function(o){
	return _private_fn.isHtmlElement(o);
}
//+-----------------------------------------
//| 校验对象是否为JSEE对象
//+-----------------------------------------
Jsee.isJsee = function(o){
	return _private_fn.isJsee(o);
}
//+-----------------------------------------
//| ajax请求
//+-----------------------------------------
Jsee.ajax = function(param){
	if(_private_fn.isJson(param)){
		_private_fn.asyncCore(
			  param.url,
			  param.callback,
			  param.type,
			  param.error);
	}
}
//+-----------------------------------------
//| 页面加载完成后执行相应方法
//+-----------------------------------------
_private_fn.bind(window,'onload',function(){
	if (Jsee.___load_execFn.length) {
		//遍历每个将要执行的方法
		for (var key=0; key<Jsee.___load_execFn.length; key++) {
			Jsee.___load_execFn[key]();//执行方法

			//Jsee.___load_execFn.splice(key, 1);//移除执行后的方法
		}
		Jsee.___load_execFn = null;
		delete Jsee.___load_execFn;
	}
});	
})(window);