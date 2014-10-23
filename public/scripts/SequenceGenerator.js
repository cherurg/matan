function SequenceGenerator (func, down, up, step, N, begin, multiplier) {
	this.func = func;
	this.down = down;
	this.up = up;
	this.step = step;
	this.accuracy = 0.0001;
	this.N = multiplier*N;
	this.n = N;
	this.begin = begin;
	this.base = (up+down)/2;
	
	this.pillars = [];
	this.plusPillarsPositions = [], this.minusPillarsPositions = [];
	this.getPillars();
	
	this.pillarsInSeq = []
	this.curves = [];
	this.places = [];
	this.get();
}

SequenceGenerator.prototype.getIByNum = function(num) {
	num -= this.down;
	num /= this.step;
	return Math.round(num);
}

SequenceGenerator.prototype.setBase = function(base) {
	this.base = base;
}

SequenceGenerator.prototype.getBase = function() {
	return this.base;
}

SequenceGenerator.prototype.getUp = function() {
	return this.up;
}

SequenceGenerator.prototype.getn = function() {
	return this.n;
}

SequenceGenerator.prototype.getDown = function() {
	return this.down;
}

SequenceGenerator.prototype.getBegin = function() {
	return this.begin;
}

SequenceGenerator.prototype.getSeq = function(goal) {
	index = this.getIByNum(goal);
	return this.pillarsInSeq[index];
}

SequenceGenerator.prototype.getCurve = function(goal) {
	index = this.getIByNum(goal);
	return this.curves[index];
}

SequenceGenerator.prototype.getPlaces = function(goal) {
	index = this.getIByNum(goal);
	return this.places[index].slice();
}

SequenceGenerator.prototype.getPillars = function() {
	var ac = Math.round(1/this.accuracy);
	for(i = this.begin; i < this.N + this.begin; ++i) {
		this.pillars.push(Math.round(this.func(i)*ac)/ac);
	}
	
	for(i = 0; i < this.pillars.length; ++i) {
		if(this.pillars[i] >= 0) {
			this.plusPillarsPositions.push(i);
		} else {
			this.minusPillarsPositions.push(i);
		}
	}
}

SequenceGenerator.prototype.get = function() {
	
	var curve = [], p = [], pseq = [];
	for(goal = this.down; goal <= this.up; goal += this.step) {
		
		curve.length = 0, p.length = 0, pseq.length = 0;
		currentSumm = 0;
		plusCounter = 0, minusCounter = 0;
		
		stopCounter = 0;
		
		var t = 0;
		if(this.func.negativeFlag) {
			index = this.plusPillarsPositions[plusCounter];
			plusCounter++;
			t = 1;
			
			p.push(index);
			
			temp = this.pillars[index];
			currentSumm += temp;
			curve.push(currentSumm);
		}
		
		for(i = this.begin + t; stopCounter < 2 && i < magic; ++i) {
			if(currentSumm < goal) {
				index = this.plusPillarsPositions[plusCounter];
				plusCounter++;
			} else {
				index = this.minusPillarsPositions[minusCounter];
				minusCounter++;
			}
			
			if(index == this.n || index == this.n - 1)
				stopCounter++;
			
			p.push(index);
			
			temp = this.pillars[index];
			currentSumm += temp;
			curve.push(currentSumm);
		}
		
		for(i = 0; i < p.length; ++i) {
			if(p[i] <= this.n)
				pseq[p[i]] = i;
		}
		
		this.pillarsInSeq.push(pseq.slice());
		this.curves.push(curve.slice());
		this.places.push(p.slice());
	}
}