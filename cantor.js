
	
	/*
	 *	Cantor - Javascript toolkit - Provides an environnement to manage rich interfaces complexity
	 *	allowing modularity, loose-coupling and granularity (sandboxed module splitting).
	 *	inspired from NCZ Javascript application
	 *	dependencies : Prototype.js
	 *	@author : syl.faucherand@gmail.com
	 *	@version : 0.1
	 */
	
	var cantor = (function(){		   
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
				return function(cantorName, cantorType){ // cantor custom events api constructor
					var sandbox = {
						notify : function(listenerName, datas){ behaviors.exec(listenerName, datas); return this; },
						listen : function(listenerName, callback){ behaviors.add(listenerName, cantorName, callback); return this; },
						stoplistening : function(listenerName){ behaviors.remove(listenerName, cantorName); return this; }
					};
					
					if(cantorType !== undefined){
						
						// lets add a specific toolkit
						var toolkit = {};
						
						if (cantorType !== "module"){
							
							toolkit["addCustomEvents"] = function(events){
								var 
									eventsName = Object.keys(events) || []
								;
								for (var i = 0, len = eventsName.length; i < len; i++){
									var eventName = eventsName[i];
									methods.listen(eventName, events[eventName]);
								}
							};
						}
							
						if (cantorType === "interface"){
							
							toolkit["delegateEvents"] = function(e, handleEvent){
									
								var event = e || window.event;
								
								// Get Arrays Intersection to find an action 
								// associated to one of targetElm className
								var 
									keys = Object.keys(handleEvent || {}),
									elm = event.target,
									classNames = elm.className.split(" ")
								;
		
								// Get Actions associated to domElement
								classNames = classNames.intersect(keys) || [];
								if (!classNames.length) {
									for (var i=0, max=3; (i < max && !classNames.length); i++) {
										elm = elm.up();
										classNames = elm.className.split(" ");
										classNames = classNames.intersect(keys) || [];
									}
								}
								
								if (!classNames.length){
									return false;
								}
								
								for (var i=0, len=classNames.length; i<len; i++){
									var
										className = classNames[i],
										callback = handleEvent[className.toString()] || null
									;
									if (typeof callback != "function"){
										return false;
									}
									callback(event, elm);
								}
							};
						
							// Listen User Interface Events
							toolkit["addUIListeners"] = function(elm, handleEvent){
								if (typeof elm == "undefined" || !elm){
									return false;
								}
								
								var callback = methods.toolkit["delegateEvents"];
								for (var event in handleEvent){
									var UIEvents = handleEvent[event] || null;
									if (!UIEvents || typeof UIEvents != "object"){
										continue;
									}
									
									if (event.toLowerCase() == "submit"){
										var forms = elm.getElementsByTagName("form");
										for (var i=0, len=forms.length; i<len; i++){
											forms[i].observe(event, function(e){
												e.preventDefault();
												callback(e, handleEvent[e.type]);
											});
										}
										return false;
									}
									
									elm.observe(event, function(e){
										callback(e, handleEvent[e.type]);
									});
								}
							};
									
							// Stop Listenning User Interface Events
							// Remove only methods used in this module
							toolkit["removeUIListeners"] = function(elm, handleEvent){
								if (typeof elm == "undefined" || !elm){
									return false;
								}
								var callback = methods.toolkit["delegateEvents"];
								for (var event in handleEvent){
									var UIEvents = handleEvent[event] || null;
									if (!UIEvents || typeof UIEvents != "object"){
										continue;
									}
									elm.stopObserving(event, function(e){callback(e, UIEvents);});
								}
							};
							
						}
						
						sandbox.toolkit = toolkit;
					}
						
					return sandbox;
				};
			},
			CantorEntity = function(name, uid, scale, parent){
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
				return {
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
									cantorName = opt.name,
									cantorType = opt.type || undefined
								;
								_cantorData[cantorName] = {
									creator	: creator,
									type : cantorType,
									instance : null,
									uid : Math.floor(Math.random()*1E5),
									scale : cantor.scale + 1,
									parent : cantor
								};
							}
						;
						while(len--){make(len);}
						cantor.reference.add(this);
						return this;
					},
					start : function(cantorName){
						if(cantorName !== undefined){
							var data = _cantorData[cantorName];
							if(data.instance === null){ // in case cantor already started
								data.instance = data.creator(new _Sandbox(cantorName, data.type), new CantorEntity(cantorName, data.uid, data.scale, data.parent));
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
					},
					reference : (function(){
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
					}())
				};
			}
		;
		return (new CantorEntity('root'));
	}());
	