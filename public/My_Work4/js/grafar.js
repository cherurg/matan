'use strict';

(function(global) {
	var _G = global.grafar || (global.grafar = {});
	
	_G.panels = {};
	_G.debug = true;
	
	_G.log = function(/*args*/) {
		// credit goes to Paul Irish
		_G.log.history = _G.log.history || [];   // store logs to an array for reference
		_G.log.history.push(arguments);
		//if (this.console)
		//	console.log(Array.prototype.slice.call(arguments));
	}
		
	_G.makeID = function(obj) {
		for (var temp = ''; temp = Math.random().toString(36).substr(2, 9); temp in obj);
		return temp;
	};
		
	_G.panel = function(opts) {
		opts = opts || {};
		var id = opts.id || _G.makeID(_G.panels),
		    container = opts.container || document;		
		if (typeof(container) === 'string')
			container = document.getElementById(container);
		
		_G.panels[id] = new _G.Panel(container);
		return this;
	};
	
	_G.ui = function(mockup, opts) {
		opts = opts || {};
		var container = opts.container || document;
		if (typeof(container) === 'string')
			container = document.getElementById(container);
		
		this.UI = new _G.MathUI(mockup, container);
		return this;
	};
}(this));

function ST() {
	return new Date().getTime();
}