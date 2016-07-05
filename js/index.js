// JSEE JavaScript Document
// Author HOUZHENYU
$(function(){
	var contextPath = 'D:/work/workspace/jsee/';
	$(".menu-box").children().bind({
		onmouseover:function(){
			this.style.color='#000';
		},
		onmouseout:function(){
			this.style.color='#FFF'
		}
	});
	//jsee文档
	$(".menu-box1").bind({
		onclick:function(){
			window.location.href=contextPath + "/document_Element.html";
		}
	});
	//下载
	$(".menu-box2").bind({
		onclick:function(){
			window.location.href=contextPath + "/menu_download.html";
		}
	});
	//JS-SVG
	$(".menu-box5").bind({
		onclick:function(){
			window.location.href=contextPath + "/menu_book.html";
		}
	});
	//案例
	$(".menu-box6").bind({
		onclick:function(){
			window.location.href=contextPath + "/demo/menu_Map.html";
		}
	});
	//关于我们
	$(".menu-box4").bind({
		onclick:function(){
			window.location.href=contextPath + "/menu_aboutme.html";
		}
	});	
	//首页加载时动画
	$("#content").setOpacity(0).setCss({width:"0px",height:"100px"}).animate({width:"1002px",height:"560px",opacity:1},1500);
});