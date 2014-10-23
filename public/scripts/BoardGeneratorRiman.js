var board, slider, curve;
var points = [], x = [];

function CreateBoard() {
	board = JXG.JSXGraph.initBoard('jxgbox', {boundingbox: [-10, secGen.getUp() + 1, 150, secGen.getDown() - 1], axis:true});
	
	createSlider();
	
	createParallel();
	
	createPillars();
	
	createLines(board);
	
	createCurve();
}

function sliderMoving() {
	var path = Math.round(slider.Value()*100)/100;
	slider.setGliderPosition(path/(topOfBox - buttomOfBox) + 0.5);
	//две строчки выше - операция округления позиции слайдера.
	//Т.е. если пользователь поставить слайдер на уровне 0.12453, то он опустится до 0.12.
	
	curve.remove();
	createCurve();
	
	begin = secGen.getBegin();
	var p = secGen.getSeq(slider.Value());
	
	for(var i = 0; i < points.length; ++i) {
		points[i].moveTo([p[i] + begin, secGen.pillars[i]], 1000);
	}
	
	makeTable(secGen.getPlaces(slider.Value()));
}

function createParallel() {
	line = board.create('line', [[0, 0], [1, 0]], {fixed: true, visible:false});
	point = board.create('point', [0, function() {return slider.Value();}], {size: 0, name: ""});
	board.create('parallel', [line, point], {dash: true});
}

function createSlider() {
	slider = board.create('slider', [[-5, secGen.getDown()], [-5, secGen.getUp()], [secGen.getDown(), secGen.getBase(), secGen.getUp()]]);
	slider.on('mouseup', sliderMoving);
}

function createPillars() {
	for(i = secGen.getBegin(); i < secGen.getn(); ++i)
		x.push(i);
		
	y = secGen.getSeq(secGen.getBase());
	
	for(i = 0; i < x.length; ++i) {
		point = board.create('point', [x[i], secGen.pillars[y[i]]], {withLabel: false, fixed:true, size:'1', face: "<>"});
		if(secGen.pillars[y[i]] > 0)
			point.setAttribute({color: "green"});
		points.push(point);
	}
	
	makeTable(secGen.getPlaces(secGen.getBase()));
}

function createCurve() {
	var y = secGen.getCurve(slider.Value());
	curve = board.create('curve', [x, y], {strokeWidth: 1});
}

function resetRow() {
	slider.setGliderPosition(secGen.getBase()/(topOfBox - buttomOfBox) + 0.5);
	sliderMoving();
	board.setBoundingBox([-10, secGen.getUp() + 1, 150, secGen.getDown() - 1]);
}

function makeTable(p){
	
	document.getElementById('page0').innerHTML = '';
  
	var o=document.createElement('div');
	
	table = '<table width="100%"><tr>';
	
	for(var i = 0; i < n; ++i) {
		if(secGen.pillars[p[i]] >= 0)
			table += '<td><table width="100%"><tr><td bgcolor="3B983B"><center>' + ++p[i] + '</center></td></tr>' + '<tr><td = bgcolor="3B983B"><center><h4>' + Math.round(secGen.pillars[p[i]-1]*100000)/100000 + '</h4></center></tr></td>' + '</table></td>';
		else
			table += '<td><table width="100%"><tr><td bgcolor="BE4A4A"><center>' + ++p[i] + '</center></td></tr>' + '<tr><td = bgcolor="BE4A4A"><center><h4>' + Math.round(secGen.pillars[p[i]-1]*100000)/100000 + '</h4></center></tr></td>' + '</table></td>';
		
		p[i]--;
		if((i+1)%20 == 0)
			table += '</tr><tr>';
	}
	
	table += '</tr></table>';
	o.innerHTML = table;
	document.getElementById('page0').appendChild(o);
}

function changeSeq(seq) {
	secGen = seq;
	sliderMoving();
}
