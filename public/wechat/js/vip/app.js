$(function(){
	var flag = 0;
	$("#card-container").click(function(){
		if(0 == flag){
			$("#card").removeClass("filp");
			$("#front").hide();
			$("#back").show();
			$("#card").addClass("filp");
			flag = 1;
		}
		else if(1 == flag){
			$("#card").removeClass("filp");
			$("#back").hide();
			$("#card").addClass("filp");
			$("#front").show();
			flag = 0;
		}
	});
});