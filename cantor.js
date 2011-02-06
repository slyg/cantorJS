
	
	/*
	 *	Cantor - Javascript toolkit - Provides an environnement to manage rich interfaces complexity
	 *	allowing modularity, loose-coupling and granularity (sandboxed module splitting).
	 *	@author : syl.faucherand@gmail.com
	 *	@version : 0.1
	 */
	
	var Cantor = (function(){		   
		var 
			Behaviors = function(){
				return {
					collector : {},
					add : function(listenerName, cantorName, callback){
						if(typeof this.collector[listenerName] === 'undefined') {this.collector[listenerName] = {};}
						if(typeof this.collector[listenerName][cantorName] === 'undefined') {this.collector[listenerName][cantorName] = [];}
						this.collector[listenerName][cantorName].push(callback);
					},
					remove : function(listenerName, cantorName){
						delete this.collector[listenerName][cantorName];
					},
					exec : function(listenerName, datas){
						var
							listenerKey = this.collector[listenerName],
							prop, cantorKey, methodsLen
						;
						for(prop in listenerKey) {
							if(listenerKey.hasOwnProperty(prop)){
								cantorKey = listenerKey[prop];
								if(typeof cantorKey !== 'undefined'){
									methodsLen = cantorKey.length;
									while (methodsLen--){ cantorKey[methodsLen](datas); }
								}
							}
						}
					}
				};
			},
			SandboxConstructor = function(behaviors){
				return function(cantorName){ // cantor custom events api constructor
					return {
						notify : function(listenerName, datas){ behaviors.exec(listenerName, datas); return this; },
						listen : function(listenerName, callback){ behaviors.add(listenerName, cantorName, callback); return this; },
						stoplistening : function(listenerName){ behaviors.remove(listenerName, cantorName); return this; },
						toolkit : {}
					};
				};
			},
			ApplicativeEntity = function(name, uid, scale, parent){
				var 
					_cantorData = {},
					_behaviors = new Behaviors(),
					_Sandbox = new SandboxConstructor(_behaviors)
				;
				function _getModuleListeners(cantorName){ // return array
					var listenerName, cantorsInvolved, result = [];
					for(listenerName in _behaviors.collector) {
						if(_behaviors.collector.hasOwnProperty(listenerName)){
							var cantor;
							cantorsInvolved = _behaviors.collector[listenerName];
							for(cantor in cantorsInvolved) {
								if(cantorsInvolved.hasOwnProperty(cantor) && cantor === cantorName){ result.push(listenerName); }
							}
						}
					}
					return result;
				}
				var cantor = {
					name : name,
					uid : (uid !== undefined) ? uid : -1,
					scale : (scale !== undefined) ? scale : 0, // scale of applicative entity in cantor tree
					parent : parent,
					sandbox : new _Sandbox('wrapper'), // wrapping applicative entity access to sandbox
					register : function(){
						var 
							opts = arguments,
							len = arguments.length,
							make = function(index){  
								var
									opt = opts[index],
									creator = opt.creator,
									cantorName = opt.name
								;
								_cantorData[cantorName] = {
									creator	: creator,
									instance : null,
									uid : Math.floor(Math.random()*1E5),
									scale : cantor.scale + 1,
									parent : cantor
								};
							}
						;
						while(len--){make(len);}
						Cantor.reference.add(this);
						return this;
					},
					start : function(cantorName){
						if(cantorName !== undefined){
							var data = _cantorData[cantorName];
							if(data.instance === null){ // in case cantor already started
								data.instance = data.creator(new _Sandbox(cantorName), new ApplicativeEntity(cantorName, data.uid, data.scale, data.parent));
								data.instance.init();
							}
						} else {
							var name;
							for (name in _cantorData){ if (_cantorData.hasOwnProperty(name)){ this.start(name); } }
						}
						return this;
					},
					stop : function(cantorName){
						if(cantorName !== undefined){
							var data = _cantorData[cantorName];
							if (data.instance){
								// automatic custom listeners removal
								var cantorListeners = _getModuleListeners(cantorName), cantorListenersLen = cantorListeners.length;
								if (typeof cantorListeners !== 'undefined'){
									while (cantorListenersLen--){ _behaviors.remove(cantorListeners[cantorListenersLen], cantorName); }
								}
								// instance removal
								if( (data.instance).hasOwnProperty('destroy') ) {data.instance.destroy();}
								data.instance = null;
							}
						} else {
							var name;
							for (name in _cantorData){ if (_cantorData.hasOwnProperty(name)){ this.stop(name); } }
						}
						return this;
					}
				};
				if(name === 'root'){
					cantor.reference = (function(){
						var _mess = {};
						return {
							getStructure : function(){return _mess;},
							get : function(cantorName){
								var cantor, cantorUid, results = [];
								for(cantorUid in _mess) {
									if (_mess.hasOwnProperty(cantorUid)){
										cantor = _mess[cantorUid];
										if(cantor.name === cantorName){ results.push(cantor); }
									}
								}
								return (results.length === 1) ? results[0] : (results.length === 0) ? undefined : results;
							},
							add : function(cantor){
								if (_mess[cantor.uid] === undefined) {_mess[cantor.uid] = {};}
								_mess[cantor.uid] = cantor;
							}
						};
					}());
				}
				return cantor;
			}
		;
		return (new ApplicativeEntity('root'));
	}());
	