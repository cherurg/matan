var board, curve;
var points = [], x = [], y = [];

function CreateBoard() {
	board = JXG.JSXGraph.initBoard('jxgbox', {boundingbox: [-10, topOfBox, rightOfBox, buttomOfBox], axis:true});
	
	createParallel();
	
	createPillars();
	
	createLines(board);
}

function createParallel() {
	board.create('line', [[1, 0.6947], [0, 0.6947]], {dash: true, color: "black"});
}

function createPillars() {
	
	for(i = 1; i <= seq.length; ++i) {
		x.push(i);
	}

	for(i = 0; i < seq.length; ++i) {
		point = board.create('point', [i+1, seq[i]], {withLabel: false, fixed:true, size:'1', face: "<>"});
		if(seq[i] > 0)
			point.setAttribute({color: "green"});
		points.push(point);
	}
	
	var cu = [];
	for(i = 1; i <= seq.length; ++i) {
		cu.push(i);
	}
	makeTable(cu);
	createCurve(cu);
}

function createCurve(cu) {
	for(i = 0; i < cu.length; ++i)
		cu[i]--;
	
	var summ = 0;
	y.length = 0;
	for(i = 0; i < seq.length; ++i) {
		summ += seq[cu[i]];
		y.push(summ);
	}
	curve = board.create('curve', [x, y], {strokeWidth: 1});
}

function makeTable(cu){
	
	document.getElementById('page0').innerHTML = '';
  
	var o=document.createElement('div');
	
	table = '<table width="100%"><tr>';
	
	for(var i = 0; i < n; ++i) {
		if(seq[cu[i]-1] >= 0)
			table += '<td bgcolor="3B983B"><center>' + cu[i] + '</center></td>';
		else
			table += '<td bgcolor="BE4A4A"><center>' + cu[i] + '</center></td>';
		
		//cu[i]--;
		if((i+1)%20 == 0)
			table += '</tr><tr>';
	}
	
	table += '</tr></table>';
	o.innerHTML = table;
	document.getElementById('page0').appendChild(o);
}

function shuffle() {
	var o = [];
	for(i = 1; i < 300; ++i)
		o.push(i);
	var u = [];
	for(var i = 300; i <= seq.length; ++i)
		u.push(i);
	
	for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
	for(var j1, x1, i = u.length; i; j1 = Math.floor(Math.random() * i), x1 = u[--i], u[i] = u[j1], u[j1] = x1);
	
	i = 0;
	for(; i < u.length; ++i)
		o.push(u[i]);
	
//	o.concat(u);
	
	movePoints(o.slice());
}

function movePoints(cu) {
	for(i = 0; i < cu.length; ++i) {
		points[cu[i]-1].moveTo([i+1, seq[cu[i]-1]], 1000);
	}
	
	makeTable(cu.slice());
	
	curve.remove();
	createCurve(cu.slice());
}