function UIElement(form) {
	this.form = form;
	this.dom = [];
	this.inputs = [];
	this.hidden = true;
}

UIElement.prototype.tPush = function(newDom) {
	this.dom.push(newDom);
	return this;
}

UIElement.prototype.iPush = function(newDom) {
	this.dom.push(newDom);
	this.inputs.push(newDom);
	return this;
}

UIElement.prototype.hide = function() {
	if (this.hidden)
		return;
	for (var i = 0; i < this.dom.length; i++)
		this.form.removeChild(this.dom[i]);
	this.hidden = true;
}

UIElement.prototype.show = function() {
	if (!this.hidden)
		return;
	for (var i = 0; i < this.dom.length; i++)
		this.form.appendChild(this.dom[i]);
	this.hidden = false;
}

UIElement.prototype.switchState = function() {
	this.hidden? this.show(): this.hide();
}

function MathUI(form) {
	this.form = form;
}

MathUI.prototype.push = function(type, opts) {
	opts = opts || {};
	opts.ID = opts.ID || opts.id;
	if (opts.ID === undefined) {
		var i = 0;
		while (this[type + '_' + i]) 
			i++;
		opts.ID = type + '_' + i;
	}
	console.log(opts);
	
	var newElement = new UIElement(this.form);
	if (opts.pre) newElement.tPush(document.createTextNode(opts.pre));
	if (type === 'label') {
		console.log('addlabel');
		newElement.dom.push(document.createTextNode(opts.text));
		newElement.__defineSetter__('text', function(newText) {
			this.dom[opts.pre? 1: 0].nodeValue = newText;
		});
	} else if (type === 'select') {
		newElement.iPush(document.createElement('select'));
		for (var i = 0; i < opts.options.length; i++)
			newElement.inputs[0].options[i] = new Option(opts.options[i]);
		newElement.inputs[0].addEventListener('change', opts.action);
		newElement.__defineGetter__('value', function() {
			return this.inputs[0].selectedIndex;
		});
	} else if (type === 'checkbox') {
		newElement.iPush(document.createElement('input'));
		newElement.inputs[0].type = 'checkbox';
		newElement.inputs[0].checked = false;
		newElement.inputs[0].addEventListener('change', opts.action);
		newElement.__defineGetter__('value', function() {
			return this.inputs[0].checked;
		});
	} else if (type === 'range') {
		newElement.tPush(document.createTextNode('['))
			.iPush(makeNumInput()) 
			.tPush(document.createTextNode(','))
			.iPush(makeNumInput())
			.tPush(document.createTextNode(']'));
		newElement.inputs[0].addEventListener('change', function() {
			var newMin = parseFloat(newElement.inputs[0].value);
			newElement.inputs[1].min = newMin;
			newElement.inputs[1].value = Math.max(newElement.inputs[1].value, newMin);
			opts.action();
		});
		newElement.inputs[1].addEventListener('change', function() {
			var newMax = parseFloat(newElement.inputs[1].value);
			newElement.inputs[0].max = newMax;
			newElement.inputs[0].value = Math.min(newElement.inputs[0].value, newMax);
			opts.action();
		});
		newElement.__defineGetter__('value', function() {
			return [this.inputs[0].value, this.inputs[1].value].map(parseFloat);
		});
	} else if (type === 'number') {
		newElement.iPush(makeNumInput());
		newElement.inputs[0].addEventListener('change', opts.action);
		if (opts.positive) {
			newElement.inputs[0].min = opts.integer? 1: 0;
			newElement.inputs[0].value = newElement.inputs[0].min;
		}
		if (opts.integer) 
			newElement.inputs[0].step = 1;
		console.log(newElement);
		newElement.__defineGetter__('value', function() {
			return parseFloat(this.inputs[0].value);
		});
	} else if (type === 'vector') {
		opts.dims = opts.dims || 2;
		newElement.tPush(document.createTextNode('('));
		for (var i = 0; i < opts.dims; i++) {
			if (i)
				newElement.tPush(document.createTextNode(','));
			newElement.iPush(makeNumInput());
			newElement.inputs[i].addEventListener('change', opts.action);
		}
		newElement.tPush(document.createTextNode(')'));
		newElement.__defineGetter__('value', function() {
			var temp = [];
			for (var i = 0; i < newElement.inputs.length; i++)
				temp.push(parseFloat(newElement.inputs[i].value));
			return temp;
		});
	} else if (type === 'text') {
		newElement.iPush(document.createElement('input'));
		newElement.inputs[0].type = 'text';
		newElement.inputs[0].value = opts.text || '';
		newElement.inputs[0].addEventListener('change', opts.action);
		newElement.__defineGetter__('value', function() {
			return newElement.inputs[0].value;
		});
	}
	if (opts.post) newElement.tPush(document.createTextNode(opts.post));
	if (opts.br) newElement.tPush(document.createElement('br'));
	newElement.show();
	
	this[opts.ID] = newElement;
	return this;
}

function makeNumInput() {
	var field = document.createElement('input');
	field.step = .1;
	field.type = 'number';
	field.value = '0';
	return field;
}

function ST() {
	return new Date().getTime();
}

function evalScript(text) {
	var cmd = text.split(' ')[0], formula = text.split(' ')[1];
	if (cmd === 'plot') {
		var testF = str2func(formula);
		
		if (~'ep'.indexOf(testF.type)) {
			if (testF.variables.length === 1)
				data = seq(tDom[0], tDom[1], 300).map(testF.f);
			else if (testF.variables.length === 2)
				data = apply(make.grid(tDom, pDom, {len: numPoints}), testF.f);
		} else if (~'v'.indexOf(testF.type)) {
			console.log('vecField', testF.variables.length);
			var grid = rectGrid({dist: tDom[1], nDim: testF.variables.length, len: 5});
			console.log(grid);
			data = apply(grid, testF.f);
			console.log(data);
		} else {
			if (testF.is3D)
				data = implicit(function(p) {return testF.f(p) < 0}, 2);
			else
				data = levelCurve({cond:function(p) {return testF.f(p) < 0}, dist:2, val:0});			
		}
		
		if (testF.is3D) test.setView3();
		else test.setView2();
						
		if (testF.type === 'v')
			test.plotVecField3d(data, {ID: 'curve', axisLen: 2});
		else if (testF.type === 'i')
			test.plot3d(data, {type: '-', ID: 'curve', axisLen: 2});
		else
			test.plot3d(data, {ID: 'curve', axisLen: 2});
	}
}