// JSEE JavaScript Document
// Author HOUZHENYU
$(function(){
	$("#fn_menu").children().bind({
		onmouseover:function(){
			if(this.className!="m-title"){
				var p = {background:"yellow",color:"#000",fontWeight:"bold"};
				$(this).setCss(p).find().setCss(p);
			}
			
		},
		onmouseout:function(){
			if(this.className!="m-title"){
				var p = {background:"none",color:"#FFF",fontWeight:"normal"};
				$(this).setCss(p).find().setCss(p);
			}
		}
	});
	$("#fn_menu").next().find('dd').each(function(i,o){
		if(i%2==0)o.className='dd_bg';
	})
});