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

// sign 
$(function(){
	$("#sign-date").datepicker("open");
});

// message
 $(function(){
    // init() 初始化
    $("#msg-left").addClass("msg-color-click");
    $("#msg-right").addClass("msg-color-none");
    $("#detail-right").hide();

    // 选择
    $("#msg-left").click(function(){
      $("#msg-left").addClass("msg-color-click");
      $("#msg-right").addClass("msg-color-none");
      $("#msg-left").removeClass("msg-color-none");
      $("#msg-right").removeClass("msg-color-click");

      $("#detail-left").show();
      $("#detail-right").hide();
    });
    $("#msg-right").click(function(){
      $("#msg-left").addClass("msg-color-none");
      $("#msg-right").addClass("msg-color-click");
      $("#msg-left").removeClass("msg-color-click");
      $("#msg-right").removeClass("msg-color-none");

      $("#detail-left").hide();
      $("#detail-right").show();
    });
  });

 //  gift
 $(function(){
	var giftFlag = 0;
  $("#pic").click(function(){
    if(0 == giftFlag){
      $("#gift-detail").show();
      giftFlag = 1;
    }
    else if(1 == giftFlag){
      $("#gift-detail").hide();
      giftFlag = 0;
    }
  });
 });

 // index
 $(function(){
 	$("#index-op li").click(function(){
    // $(this).addClass("index-color");
  });
  $("#index-c-m").click(function(){
    window.location.href = "register.html";
  });
  $("#index-connect").click(function(){
    window.location.href = "wtai://wp/mc;13738015054";
  });
  $("#index-map").click(function(){
    window.location.href = "http://www.amap.com/";
  });
});

  $(function(){
	var qrcodeFlag = 0;
  $("#index-qrcode").click(function(){
    if(0 == qrcodeFlag){
      $("#index-qrcode-c").show();
      qrcodeFlag = 1;
    }
    else if(1 == qrcodeFlag){
      $("#index-qrcode-c").hide();
      qrcodeFlag = 0;
    }
  });
 });

  // sign date
  $(function(){
  	$("#sign-date").datepicker();
  })