	
	/*
	 *	usage sample
	 *	two modules registered in Cantor object wich is the base app
	 *	starting Cantor means starting all its registered modules
	 */
	
	(function(){
			  
		function SampleModule(name, elmId, targetName){
			return {
				name : name,
				creator : function(sb, cantor){
					var _parentElm = $(elmId);
					function _handleClick(event){
						var target = event.findElement().className;
						switch(target){
							case 'ask': sb.notify('user:ask:change module color', {target : targetName}); break;
							case 'reset': _parentElm.removeClassName('green'); break;
						}
					}
					return {
						init : function(){
							_parentElm.observe('click', _handleClick);
							sb.listen('user:ask:change module color', function(params){
								if(params.target === cantor.name){
									_parentElm.addClassName('green');
								}
							});
						},
						destroy : function(){
							_parentElm.stopObserving('click', _handleClick);
						}
					};
				}
			};
		}
		
		var
			mod1 = new SampleModule('module 1', 'module-01', 'module 2'),
			mod2 = new SampleModule('module 2', 'module-02', 'module 1')
		;
		
		var remoteModule = {
			name : 'remote module',
			creator : function(sb, cantor){
				var _parentElm = $('module-remote');
				function _handleClick(event){
					var target = event.findElement().className;
					switch(target){
						case 'start': sb.notify('user:ask:start my app'); break;
						case 'stop': sb.notify('user:ask:stop my app'); break;
					}
				}
				return {
					init : function(){
						_parentElm.observe('click', _handleClick);
					},
					destroy : function(){
						_parentElm.stopObserving('click', _handleClick);
					}
				};
			}
			
		}
		
		var myApp = {
			name : 'my app',
			creator : function(sb, cantor){
				return {
					init : function(){
						cantor.register(mod1, mod2);
						sb
							.listen('user:ask:start my app', function(){cantor.start();})
							.listen('user:ask:stop my app', function(){cantor.stop();})
						;
					}
				};
			}
		};
		
		cantor.register(remoteModule, myApp).start();
	
	}());