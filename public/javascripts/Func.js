var Func={
	Decrypted : function (message) {
		if(text==''){
			this.CerrarAPP();
			return false;
		}else{
			var text='';
			try {
				var text=JSON.parse(CryptoJS.AES.decrypt(message,Config.cl).toString(CryptoJS.enc.Utf8));
			}
			catch(err) {
			    this.CerrarAPP();
				return false;
			}
			return text;
		}
		
	},
	Ecrypted: function (json){
		var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(json), Config.cl);
		return ciphertext.toString();
	}
	,
	DataLogin: function (){
		var DatosUsuario=this.Decrypted(sessionStorage.dt);
		return	DatosUsuario;
	},
	CerrarAPP: function(){
	   sessionStorage.clear();
	   window.location.assign("./");
	},
	ValidaUsuario: function(){
		if(!sessionStorage.dt){
			this.CerrarAPP();
	    }else{
	    	var data=this.DataLogin();
	    	//console.log(data);
	    	if(!data.perfil){
	        	this.CerrarAPP();	
	        }
	    }
	},
	IntevaloLogin:function(){
		var _this=this;
		_this.ValidaUsuario();
		setInterval(function(){
			//console.log('Valido');
			_this.ValidaUsuario();
		}, 1000*5);	
	},
	msjAlerta:function(msj){	//notify.close();
		var notify = $.notify({
                icon: 'glyphicon glyphicon-warning-sign',
                title: ' ',
                message: msj                
            },
            { 
            type: "danger", 
            timer : 100,
            delay: 3000,
            z_index: 2061,
            animate: {
                enter: 'animated bounceIn',
                exit: 'animated bounceOut'
            },
            placement: {
                from: "top",
                align: "center"
            }
        });
	},
	msjExito:function(msj){
		var notify = $.notify({
                icon: 'glyphicon glyphicon-warning-sign',
                title: ' ',
                message: msj                
            },
            { 
            type: "success", 
            timer : 100,
            delay: 3000,
            z_index: 2061,
            animate: {
                enter: 'animated bounceIn',
                exit: 'animated bounceOut'
            },
            placement: {
                from: "top",
                align: "center"
            }
        });
	},
	setmpId: function (id){
		var DatosUsuario=this.Decrypted(sessionStorage.dt);
		DatosUsuario.tmpId = id;
		sessionStorage.dt = Func.Ecrypted(DatosUsuario);
		return	true;
	},
	getmpId: function (){
		var DatosUsuario=this.Decrypted(sessionStorage.dt);
		return	DatosUsuario.tmpId;
	},
	setmpNom: function (nom){
		var DatosUsuario=this.Decrypted(sessionStorage.dt);
		DatosUsuario.tmpNom = nom;
		sessionStorage.dt = Func.Ecrypted(DatosUsuario);
		return	true;
	},
	getmpNom: function (){
		var DatosUsuario=this.Decrypted(sessionStorage.dt);
		return	DatosUsuario.tmpNom;
	}
};