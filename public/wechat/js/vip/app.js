$(function(){
	var flag = 0;
	// 后面让动画延时执行
	$("#card").click(function(){
		if(0 == flag){
			$("#card").removeClass("filp");
			$("#front").removeClass("filpc");
			$("#front").hide();
			$("#back").show();
			$("#card").addClass("filp");
			$("#back").addClass("filpc");
			flag = 1;
		}
		else if(1 == flag){
			$("#back").removeClass("filpc");
			$("#card").removeClass("filp");
			$("#back").hide();
			$("#card").addClass("filp");
			$("#front").show();
			$("#front").addClass("filpc");
			flag = 0;
		}
	});
});

// register date
$(function(){
	var toggle = 0;
	$("#date-picker-container").click(function(){
		if(0 == toggle){
			$("#date-picker").datepicker("open");
			toggle = 1;
		}
		else if(1 == toggle){
			$("#date-picker").datepicker("close");
			toggle = 0;
		}
	});
});