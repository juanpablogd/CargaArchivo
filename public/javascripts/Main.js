 var socket = io(); 
 
 var GeoCode={
 	idSkt:'',
 	InitSocket:function (){
 		_this=this;
		socket.on('connect', function () { 
		   socket.emit('usuario',{id:'usuario'}, function (data) {
		     _this.idSkt=data; 
		     //console.log(GeoCode.idSkt);
		   });
		   socket.on('terminaCarga', function (data) {
		     alert(data);
		   });
		});	
	},
	Init:function(){
		this.InitSocket();
		if(window.location.pathname=="/"){
			if (sessionStorage.dt) {
				window.location.assign(Config.NextLogin);
			} /*else{
				acceso.Init();
			}	*/		
		}
		
	}	 
 }; 
 GeoCode.Init();
