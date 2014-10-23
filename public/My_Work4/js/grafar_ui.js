(function(global) {
	var _G = global.grafar || (global.grafar = {});
	
	_G.MathUI = function(mockup, parent) {
		this.create(mockup, parent)
	}
	
	_G.MathUI.prototype.create = function(mockup, parent) {
		for (var i = 0; i < mockup.length; i++) {
			var id = mockup[i].id,// || _G.makeID(this),
			    type = mockup[i].type,
				col = mockup[i].col,
				init = mockup[i].init,
				bind = mockup[i].bind,
				temp;
			
			if (type === 'label') {
				temp = document.createTextNode(init);
				temp.__defineSetter__('val', function(newText) {
					this.nodeValue = newText;
				});
			} else if (type === 'br') {
				temp = document.createElement('br');
			} else if (type === 'select') {
				temp = document.createElement('select');
				for (var j = 0; j < init.length; j++)
					temp.options[j] = new Option(init[j]);
				temp.__defineGetter__('val', function() {
					return this.selectedIndex;
				});
			} else if (type === 'checkbox') {
				temp = document.createElement('input');
				temp.type = 'checkbox';
				temp.checked = init;
				temp.__defineGetter__('val', function() {
					return this.checked;
				});
			} else if (type === 'number') {
				temp = NumberInput(init, mockup[i].step);
				temp.__defineGetter__('val', function() {
					return parseFloat(this.value);
				});
			} else if (type === 'range') {
			} else if (type === 'vector') {
				var inputReference = [];
				temp = document.createElement('div');
				temp.style['display'] = 'inline';
				temp.appendChild(document.createTextNode('('));
				for (var j = 0; j < init.length; j++) {
					if (j)
						temp.appendChild(document.createTextNode(', '));
					var temp2 = NumberInput(init[j], .03);
					temp2.addEventListener('change', bind);
					temp.appendChild(temp2);
					inputReference.push(temp2);
				}
				temp.appendChild(document.createTextNode(')'));
				temp.__defineGetter__('val', function() {
					return inputReference.map(function(e) {return parseFloat(e.value)});
				});
				bind = null;
			} else if (type === 'text') {
				temp = document.createElement('input');
				temp.type = 'text';
				temp.value = init;
			} else if (type === 'group') {
				temp = document.createElement('div');
				temp['className'] = 'grafar_ui_subpanel';
				temp.style['background'] = col;
				this.create(init, temp);
			}
			parent.appendChild(temp);
			if (bind) temp.addEventListener('change', bind);
			if (id) this[id] = temp;
		}
		return;
	}
	
	function NumberInput(val, step) {
		step = step || .03;
		var temp = document.createElement('input');		
		temp.className = 'num';
		temp.size = '4';
		temp.type = 'number';
		temp.value = val;
		temp.step = step;
		temp.onkeypress = function(key) {
			if (key.keyCode === 40) {
				temp.value = parseFloat(temp.value) - step;
				triggerEvent('change', temp);
			} else if (key.keyCode === 38) {
				temp.value = (parseFloat(temp.value) + step).toFixed(2);
				triggerEvent('change', temp);
			}
		};
		return temp;
	};
	
	function triggerEvent(type, element) {
		if ('createEvent' in document) {
			var evt = document.createEvent("HTMLEvents");
			evt.initEvent(type, false, true);
			element.dispatchEvent(evt);
		} else {
			element.fireEvent('on' + type);
		}
	}
}(this));