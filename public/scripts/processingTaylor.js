var func, errorOfPoli, eop, poli, s, x0, brd, axx, axy, funcN;

function init() {
	left = sizes[3][0];
	up = sizes[3][1];
	right = sizes[3][2];
	down = sizes[3][3];
	brd = JXG.JSXGraph.initBoard('jxgbox', {boundingbox:[left, up, right, down]});
	axx = brd.create('axis',[[0,0],[1,0]]);
	axy = brd.create('axis',[[0,0],[0,1]]);
}

function create(funcNumber) {
	funcN = funcNumber;
	left = sizes[funcNumber][0];
	up = sizes[funcNumber][1];
	right = sizes[funcNumber][2];
	down = sizes[funcNumber][3];
	
	brd.setBoundingBox([left, up, right, down]);
 
	brd.suspendUpdate();
	func = brd.create('functiongraph', [f[funcNumber][0] ,sizes[funcNumber][4], sizes[funcNumber][5]],{strokeColor: "#110000"});
	x = left + (right - left)/10;
	y1 = down + (up - down)/5;
	y2 = up - (up - down)/5;
	s = brd.create('slider', [[-25, y1],[-25, y2],[0,0,max]], {name:'S',snapWidth:1, label:false});
	s.baseline.setAttribute({visible:false});
	s.highline.setAttribute({visible:false});
	s.setAttribute({visible : false});
	x0 = brd.create('glider', [0,0,axx], {name:'x_0'});
	x0.on('mouseup', showRadius);
	var a = [];
	
	poli = brd.create('functiongraph', [polop,sizes[funcN][4], sizes[funcN][5]], {strokeColor: "#bb0000"});
	
	eop = function(t) {
			/*b = getDerivates(funcNumber, x0.X());
			var val = 0, i, sv = s.Value()+1;
			for(i = 0; i < sv; i++) {
				val = val + b[i]*Math.pow(t-x0.X(), i) / JXG.Math.factorial(i);
			}*/
			return Math.abs(polop(t) - f[funcN][0](t));
		}
	
	errorOfPoli = brd.create('functiongraph', [eop ,sizes[funcN][4], sizes[funcN][5]], {strokeColor: "#000000", visible: false});
	
	brd.unsuspendUpdate();
}

function getDerivates(funcNumber, z) {
	var temp; var a = [];
	for(var i = 0; i <= max; ++i) {
		a.push(f[funcNumber][i](z));
	}

	return a;
}

function showGraph() {
	func.setAttribute({visible: true});
	poli.setAttribute({visible: true});
	errorOfPoli.setAttribute({visible: false});
}

function showErrorOfGraph() {
	func.setAttribute({visible: false});
	poli.setAttribute({visible: false});
	errorOfPoli.setAttribute({visible: true});
}

function clearGraph() {
	func.remove();
	errorOfPoli.remove();
	poli.remove();
	s.baseline.remove();
	s.remove();
	x0.remove();
}

function showRadius() {
	var delta = 0.1;
	while(eop(x0.X() - delta) < eps && eop(x0.X() + delta) < eps) 
		delta += 0.1;
	while(eop(x0.X() - delta) > eps || eop(x0.X() + delta) > eps)
		delta -= 0.01;
		
		
	document.getElementById('rad').innerHTML = '';
  
	var o=document.createElement('div');
	
	table = "Radius: ";
	table += delta.toFixed(2);
	o.innerHTML = table;
	document.getElementById('rad').appendChild(o);
	
	
	
	return delta;
}


	polop = function(t) {
			b = getDerivates(funcN, x0.X());
			var val = 0, i = 0, sv = s.Value()+1;
			for(i = 0; i < sv; i++) {
				val = val + b[i]*Math.pow(t-x0.X(), i) / JXG.Math.factorial(i);
			}
			return val;
		}