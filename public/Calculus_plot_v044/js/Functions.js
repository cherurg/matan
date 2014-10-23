// A two-variable function.
function fLibEntry(z, TeX, range, params) {
	if (params === undefined)
		params = {};
	if (params.zDom === undefined)
		params.zDom = [-3, 3];
	if (params.polar === undefined)
		params.polar = true;
	
	// the function
	this.f = z;
	// displayed formula
	this.TeX = TeX;
	// range for plotting
	this.range = range;
	// section boundaries
	this.zSpan = params.zDom;
	// plot in polar grid
	this.usePolar = params.polar;
	
	// for numerical differentiation
	this.domain = [[-range, range], [-range, range]];
}

function str2func(funcs, mode){
	var st_t = ST();
	// implicit function deduction
	var eql = funcs.split('='),
	    isImplicit = false;
	if (eql.length > 1) {
		funcs = '(' + eql[0] + ')-(' + eql[1] + ')';
		isImplicit = true;
	}
	
	// function type deduction
	//console.log(eql[0], Parser.parse(eql[0]).variables());
	var commonVars = Parser.parse(funcs).variables(),
		nDimIn = commonVars.length;
	funcs = funcs.split(',');	
	var nDimOut = funcs.length;
	try {
		if (nDimIn === 1 && nDimOut === 1)
			mode = 'e1';
		else if (nDimIn === 1 && nDimOut === 2)
			mode = 'p12';
		else if (nDimIn === 1 && nDimOut === 3)
			mode = 'p13';
		else if (nDimIn === 2 && nDimOut === 1)
			mode = isImplicit? 'i2': 'e2';
		else if (nDimIn === 2 && nDimOut === 2)
			mode = 'v2';
		else if (nDimIn === 2 && nDimOut === 3)
			mode = 'p2'; 
		else if (nDimIn === 3 && nDimOut === 1)
			isImplicit? mode = 'i3': function(){throw ''}();
		else if (nDimIn === 3 && nDimOut === 3)
			mode = 'v3';
		else 
			throw '';
	} catch(err) {
		throw '[error] unable to deduce function type.'+nDimIn+nDimOut;
	}
	console.log('deduced mode', mode);

	var jsFuncs = [];
	for (var i = 0; i < funcs.length; i++) {
		var expr = Parser.parse(funcs[i]);
		jsFuncs[i] = expr.toJSFunction(commonVars);
	}
	
	var res;
	if (mode === 'e1')
		res = function(x) {
			return [x, jsFuncs[0](x), 0];
		}
	else if (mode === 'e2')
		res = function(p) {
			return [p[0], p[1], jsFuncs[0](p[0], p[1])];
		}
	else if (mode === 'p12')
		res = function(t) {
			return [jsFuncs[0](t), jsFuncs[1](t), 0];
		}
	else if (mode === 'p13')
		res = function(t) {
			return [jsFuncs[0](t), jsFuncs[1](t), jsFuncs[2](t)];
		}
	else if (mode === 'p2')
		res = function(t) {
			return [jsFuncs[0](t[0], t[1]), jsFuncs[1](t[0], t[1]), jsFuncs[2](t[0], t[1])];
		}
	else if (mode === 'i2')
		res = function(p) {
			return jsFuncs[0](p[0], p[1]);
		}
	else if (mode === 'i3')
		res = function(p) {
			return jsFuncs[0](p[0], p[1], p[2]);
		}
	else if (mode === 'v2')
		res = function(p) {
			return [[p[0], p[1], 0], [jsFuncs[0](p[0], p[1]), jsFuncs[1](p[0], p[1]), 0]];
		}
	else if (mode === 'v3')
		res = function(p) {
			console.log(p, [p.slice(), [jsFuncs[0](p[0], p[1], p[2]), jsFuncs[1](p[0], p[1], p[2]), jsFuncs[2](p[0], p[1], p[2])]]);
			return [p.slice(), [jsFuncs[0](p[0], p[1], p[2]), jsFuncs[1](p[0], p[1], p[2]), jsFuncs[2](p[0], p[1], p[2])]];
		}
	
	var type;
	if (~mode.indexOf('i'))
		type = 'i';
	else if (~mode.indexOf('p'))
		type = 'p';
	else if (~mode.indexOf('e'))
		type = 'e';
	else
		type = 'v';
		
	var is3D = ~'e2p2p13i3v3'.indexOf(mode);
	console.log('parsing takes', ST() - st_t);
	return {
		f: res,
		variables: commonVars,
		is3D: is3D,
		type: type
	}
}

function getNames(fLibArray) {
	return fLibArray.map(function(funcEntry) {return funcEntry.TeX});
}

var DemoFunctions = (function() {
	function add(newFunc) {
		this.push(new fLibEntry(str2func(newFunc).f, newFunc, 2));
		return this;
	};
	
	var explicit = [];
	explicit.add = add;
	explicit
		.add('sqrt(x^2+y^2)')
		.add('exp(x*y)')
		.add('cos(exp(x*y))')
		.add('exp(-1/(x^2+y^2))')
		.add('(x^3+y^4)^(1/3)')
		.add('sin(exp(x+y)+(x^3+y^3)^(1/3))')
		.add('cos((x*y)^(1/3))')
		.add('x*sqrt(.3+(y^2)^(1/3))')
		.add('x*abs(y)+y*abs(x)')
		.add('(2*y/(x^2+y^2-1))/5')
		.add('(x^2*y^2)/(x^2*y^2+(x-y)^2)')
		.add('(x*y*(x-y)^2)/(x+y)^2')
		.add('(x^2+y^2)^(x^2*y^2)')
		.add('x^2*y/(y^2+x^4)')
		.add('x^2+y^2-x*y')
		.add('x^2-(y-1)^2')
		.add('x*y*log(x^2+y^2)')
		.add('(x*y)^(1/3)')
		.add('(x+y)/3*sin(5/x)*sin(5/y)')
		.add('sin(x*y)/x')
		.add('x^y');
	delete explicit.add;
	
	var implicit = [];
	implicit.add = add;
	delete implicit.add;
	
	var paramCurves = [];
	paramCurves.add = add;
	delete paramCurves.add;
	
	var paramSurfs = [];
	paramSurfs.add = add;
	delete paramSurfs.add;
	
	return {
		explicit: explicit,
		implicit: implicit,
		paramSurfs: paramSurfs,
		paramCurves: paramCurves
	};
})()