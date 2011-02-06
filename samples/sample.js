	
	/*
	 *	usage sample
	 */
	
	(function(){
	
		var mod1 = {
			name : 'module 1',
			creator : function(sb, cantor){
				var _parentElm = $('module-01');
				function _handleClick(event){
					var target = event.findElement().className;
					switch(target){
						case 'ask' : sb.notify('user:ask:turn color', {target : 'module 2', color: 'red'}); break;
						case 'reset' : _parentElm.style.backgroundColor = '#ccc'; break;
					}
				}
				return {
					init : function(){
						_parentElm.observe('click', _handleClick);
						sb.listen('user:ask:turn color', function(params){
							if(params.target == cantor.name){
								_parentElm.style.backgroundColor = params.color;
							}
						});
					},
					destroy : function(){
						_parentElm.stopObserving('click', _handleClick);
					}
				};
			}
		};
		
		var mod2 = {
			name : 'module 2',
			creator : function(sb, cantor){
				var _parentElm = $('module-02');
				function _handleClick(event){
					var target = event.findElement().className;
					switch(target){
						case 'ask' : sb.notify('user:ask:turn color', {target : 'module 1', color: 'green'}); break;
						case 'reset' : _parentElm.style.backgroundColor = '#ccc'; break;
					}
				}
				return {
					init : function(){
						_parentElm.observe('click', _handleClick);
						sb.listen('user:ask:turn color', function(params){
							if(params.target == cantor.name){
								_parentElm.style.backgroundColor = params.color;
							}
						});
					},
					destroy : function(){
						_parentElm.stopObserving('click', _handleClick);
					}
				};
			}
		};
		
		Cantor.register({
			name : 'my app',
			creator : function(sb, cantor){
				var _app = cantor.register(mod1, mod2);
				return {
					init : function(){_app.start();},
					destroy : function(){_app.stop();}
				};
			}
		});
	
	}());