(function(global) {	
	var _G = global.grafar || (global.grafar = {});
	
	_G.graphs = {};
	
	_G.Graph = function(opts) {
		this.id = opts.id || _G.makeID(_G.graphs);
		
		this.parent = opts.parent || _G.graphs['$'] || null;
		_G.graphs[this.id] = this;
		if (this.parent) 
			this.parent.children.push(this);
		this.children = [];
		
		this.f = null;
		this.resolveTable = {};
		this.panel = null;
		this.style = this.parent? new _G.Style(this.parent.style): new _G.Style();		
		this.domain = null;
		this.codomain = null;
		this.instance = null;		
		this.samples = 41;
		
		return this;
	}
		
	_G.Graph.prototype.pin = function(panel) {
		if (this.panel)
			this.panel.remove(this.instance);
		
		if (!panel)
			this.panel = null;
		else if (typeof panel === 'string' && panel && _G.panels.hasOwnProperty(panel))
			this.panel = _G.panels[panel];
		else if (panel instanceof _G.Panel)
			this.panel = panel;
				
		this.update();
		return this;
	}
	
	_G.Graph.prototype.setSamples = function(samples) {
		if (typeof(samples) === 'number') {
			this.samples = samples;		
			this.update();
		}
		return this;
	}
	
	_G.Graph.prototype.setStyle = function(changes) {
		this.style.update(changes);
		
		this.update();
		return this;
	}
	
	_G.Graph.prototype.setPost = function(pf) {
		if (pf instanceof Function) {
			this.post = pf;
			this.update();
		}
		return this;
	}
	
	_G.Graph.prototype.pipe = function(parent) {
		if (this.parent)
			this.parent.children.splice(this.parent.children.indexOf(this), 1);
		this.parent = parent;
		this.update();
	}
	
	_G.Graph.prototype.set = function(init) {
		if (typeof(init) == 'string')
			this.f = _G.parse(init);
		else if (init instanceof Array)
			this.codomain = init;
		else if (init instanceof Function)
			this.f = init;
		
		this.update();
		return this;
	}
	
	_G.Graph.prototype.addChild = function(child) {
		if (child instanceof _G.Graph)
			this.children.push(child);
		else if (child instanceof Object)
			this.children.push(new _G.Graph({id: child.id, parent: this}));
		return this;
	}
		
	_G.Graph.prototype.resolve = function(newDomain) {
		if (newDomain instanceof Array)
			this.domain = newDomain;
		else if (newDomain instanceof Object)
			for (var i in newDomain)
				if (newDomain.hasOwnProperty(i))
					this.resolveTable[i] = newDomain[i];
		
		this.update();
		return this;
	}
	
	_G.Graph.prototype.mesh = function(resolveTable) {
		var f = this.query('f'),
			variables = {},
			parameters = {},
			varnames = ['x', 'y', 'z']; // what to do with axis changes, parameters and stuff?
			// Most importantly, now we need to deal with R2/R3 implicit equations here!
			
		f.input.forEach(function(name) {
			if (~varnames.indexOf(name)) 
				variables[name] = _G.seq(resolveTable[name], {length: this.samples}); // would a fixed variable vary?
			else 
				parameters[name] = resolveTable[name]; // and yet, we could clearly use some sampling here
		}.bind(this));
		
		var generators = _G.allCombinations(parameters, f.input);
		//if (!this.domain)
			this.domain = _G.grid_fixable(variables, f.input);
			
		this.codomain = [];
		for (var i = 0; i < generators.length; i++) {
			if (!~'i'.indexOf(f.type)) {
				var grid = _G.fix(this.domain, generators[i], f.input), temp = _G.apply(grid, f);
				this.codomain = this.codomain.concat(temp, _G.vec.t(temp)); // leave this to aggreagators!
			} else {
				var temp = f.str + '<0';
				f.input.forEach(function(name, j) {
					if (parameters.hasOwnProperty(name)) temp = temp.replace(new RegExp(name, 'g'), generators[i][j])
				});
				var g = _G.parse(temp);
				console.log(f,g);
				this.codomain = this.codomain.concat(_G.implicit(g, {x: resolveTable.x, y: resolveTable.y, z: resolveTable.z}, {length: this.samples}));
			}
			// aggregation, aggregation!
		}
		return this;
	};
		
	_G.Graph.prototype.update = function() {
		if (this.query('f')) {
			try {
				this.mesh(this.constructResolveTable());
			} catch(err) {
				return this;
			}
			//if (!~'i'.indexOf(this.query('f').type))
			//	this.codomain = _G.pivot(this.codomain, {order: ['x', 'y']});
		}
		
		if (this.post && this.codomain)
			this.codomain = _G.apply(this.codomain, this.post);
		
		if (this.codomain) {
			this.codomain = _G.formatData(this.codomain, this.style.type);
			var panel = this.query('panel');
			if (panel) {
				panel.remove(this.instance);
				this.instance = panel.plot3d(this.codomain, this.style);
			}
		}
		
		this.children.forEach(function(child) {child.update()});	
		return this;
	}
	
	_G.Graph.prototype.constructResolveTable = function() {
		var resolutions = {},
			f = this.query('f');
		for (var i = 0; i < f.input.length; i++) {
			var temp = this.query(['resolveTable', f.input[i]].join('.'));
			if (temp !== null)
				resolutions[f.input[i]] = temp;
			else
				throw new Error('Unresolved arguments');
		} if (~'i'.indexOf(f.type)) {
			for (var i = 0; i < f.output.length; i++) {
				var temp = this.query(['resolveTable', f.output[i]].join('.'));
				if (temp !== null)
					resolutions[f.output[i]] = temp;
				else
					throw new Error('Unresolved arguments');
			}
		}
		return resolutions;
	}
	
	_G.Graph.prototype.query = function(key) {
		var path = key.split('.'), temp = this;
		for (var i = 0; i < path.length; i++)
			if (temp[path[i]] !== null && temp[path[i]] !== undefined)
				temp = temp[path[i]];
			else if (this.parent) {
				return this.parent.query(key);
			} else {
				return null;
			}
		return temp;
	}
	
	_G.get = function(id) {
		if (!_G.graphs.hasOwnProperty(id))
			new _G.Graph({id: id});
		return _G.graphs[id];
	}
	
	var fixImplicit = function(eq) {
		var temp = eq.replace(/=/g, '<').split(/[><=]/);
		if (temp.length == 1)
			return temp;
		else if (temp.length == 2)
			if (~eq.search('<'))
				return '(' + temp[0] + ')-(' + temp[1] + ')';
			else 
				return '(' + temp[1] + ')-(' + temp[0] + ')';
		else 
			throw new Error('parsing error');
	};
	
	_G.parse = function(str) {
		var isImplicit = ~str.search(/[><=]/),
			isSystem = ~str.search('&'),
			isVector = ~str.search(',');
		if (isImplicit) str = str.split('&').map(fixImplicit).join('&');
		//var varNames = Parser.parse(str).variables(),
		//	nDimIn = varNames.length,
		//	nDimOut = str.split(',').length;
				
		var res;
		if (!isImplicit) {
			var expr = Parser.parse(str),
			    f = expr.toJSFunction(expr.variables());
			var res = function(p) {
				return [p[0], p[1], f.apply(this, p)];
			};
			res.input = expr.variables();
			res.output = ['x', 'y', 'z'];
			res.type = 'p';
		} else if (!isSystem) {
			var expr = Parser.parse(str),
			    f = expr.toJSFunction(expr.variables());
			var res = function(p) {
				return f.apply(this, p);
			};
			res.input = expr.variables();
			res.output = ['x', 'y', 'z'];
			res.type = 'i';		
		} else {
			// 'max(' + xxx.slice(0, -1).join(', max(') + ', ' + xxx.slice(-1) + Array(xxx.length).join(')');
			var input = Parser.parse(str.split('&').join('+')).variables();
			var lines = str.split('&')
				.map(Parser.parse)
				.map(function(expr) {return expr.toJSFunction(input)});
			var res = function(v) {
				return lines
					.map(function(f) {return f.apply(this, v)})
					.reduce(function(p, c) {return Math.max(p, c)});
			};
			res.input = input;
			res.output = ['x', 'y', 'z'];
			res.type = 'i';
		}
		res.str = str;
		
		return res;
	}
	
	_G.formatData = function (data, type) {
		if (!(data instanceof Array))
			return data;
		if (!data || !data.length)
			return {l: [], p:[], f: []};
			
		if (typeof data[0] == 'number')
			data = [[data]];
		else if (typeof data[0][0] == 'number')
			data = [data];
		else while (typeof data[0][0][0] !== 'number') {
			var flat = [];
			data = flat.concat.apply(flat, data);
		}
		
		for (var i = 0; i < data.length; )
			if (!data[i] instanceof Array) {
				data.splice(i, 1);
			} else {
				for (var j = 0; j < data[i].length; j++)
					if ((data[i][j]).filter(isNaN).length) {
						data[i].splice(j, 1);
						data.splice(i+1, 0, data[i].splice(j, data[i].length - j));
						break;
					}
				i++;
			}
			
		var flat = [];
		return {
			l: data.filter(function(a) {return a.length > 1}),
			p: flat.concat.apply(flat, data.filter(function(a) {return a.length == 1})),
			f: []
		};
	}
	
	chroma.colors['grafarblue'] = '#4671d5';
	chroma.colors['grafarorange'] = '#0xff6600';
	
	_G.Style = function(init) {
		init = init || {};
		
		this.overlay = init.overlay || false;
		
		this.color = (init.color !== undefined)? init.color: 'royalblue';//chroma('royalblue').css();
		this.alpha = init.alpha || 0;
		
		this.type = init.type || '|-';
		this.radius = init.radius || .1;
		this.start = init.start || '';
		this.end = init.end || '';
	}
	
	_G.Style.prototype.update = function(styleChanges) {
		for (var i in styleChanges)
			if (styleChanges.hasOwnProperty(i) && this.hasOwnProperty(i))
				if (i == 'color')
					this[i] = chroma(styleChanges[i]).css();
				else
					this[i] = styleChanges[i];
	}
	
	_G.root = new _G.Graph({id: '$'});
}(this));