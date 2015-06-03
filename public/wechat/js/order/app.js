$(function(){
	var toggle = 0;
	$("#date-picker").click(function(){
		if(0 == toggle){
			$("#date-picker").datepicker("open");
			toggle = 1;
		}
		else if(1 == toggle){
			$("#date-picker").datepicker("close");
			toggle = 0;
		}
	});
	$("#date-picker").datepicker().
    on("changeDate.datepicker.amui", function(event) {
        $("#order-date").text($('#date-picker').data("date"));
        }
    );
});
