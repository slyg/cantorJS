	
	/*
	 *	usage sample
	 *	two modules registered in Cantor object wich is the base app
	 *	starting Cantor means starting all its registered modules
	 */
	
	(function(){
			  
		function SampleModule(name, elmId, targetName, targetColor){
			return {
				name : name,
				creator : function(sb, cantor){
					var _parentElm = $(elmId);
					console.log(name + ' registered');
					function _handleClick(event){
						var target = event.findElement().className;
						switch(target){
							case 'ask' : sb.notify('user:ask:change module color', {
											target : targetName,
											color : targetColor
										 });
										 console.log(sb);
										 break;
							case 'reset' : _parentElm.style.backgroundColor = '#ccc'; break;
						}
					}
					return {
						init : function(){
							_parentElm.observe('click', _handleClick);
							sb.listen('user:ask:change module color', function(params){
								console.log('message : ' + params);
								if(params.target == cantor.name){
									_parentElm.style.backgroundColor = params.color;
								}
							});
							console.log(name + ' started');
						},
						destroy : function(){
							_parentElm.stopObserving('click', _handleClick);
							console.log(name + ' stopped');
						}
					};
				}
			};
		}
		
		var
			mod1 = new SampleModule('module 1', 'module-01', 'module 2', 'red')
			mod2 = new SampleModule('module 2', 'module-02', 'module 1', 'green')
		;
		
		Cantor.register(mod1, mod2);
	
	}());