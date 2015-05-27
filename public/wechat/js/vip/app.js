$(function(){
	var flag = 0;
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