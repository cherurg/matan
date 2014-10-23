// v0.41
// (c) 2013 by V.Klepov

// *** Class desctiptions ***

Point = function() {}
Point.prototype = Array;

// Type conversion: Point -> THREE.Vector3.
Point.prototype.asTHREE = function() {
	return new THREE.Vector3(this[1], this[2], this[0]);
}

// *** Math utils ***

function nthroot(x, n) {
	if (x >= 0)
		return Math.pow(x, 1/n);
	else if (n % 2)
		return -Math.pow(-x, 1/n);
	else 
		return NaN;
}

Math.pow_old = Math.pow;
Math.pow = function(x, p) {
	var temp = Math.pow_old(x, p);
	if (!isNaN(temp))
		return temp;
		
	temp = -Math.pow_old(-x, p);
	if (Math.abs(Math.pow_old(temp, 1 / p) - x) < .00001)
		return temp;
	
	return NaN;
}

// Finds the middle value of 3.
// number, number, number -> number
function mid(a, b, c) {
	return Math.min(Math.min(Math.max(a,b), Math.max(b,c)), Math.max(a,c));
}

function grad(f, p) {
	//var s = ST();
	var d = .0001, fp = f(p)[2];
	var C2 = function(d0, d1) {
		return Math.abs(d0 - d1) < .01;
	};
	var gradXR = (f([p[0] + d, p[1], p[2]])[2] - fp) / d,
		gradXM = (f([p[0] + d / 2, p[1], p[2]])[2] - f([p[0] - d / 2, p[1], p[2]])[2]) / d,
		gradYR = (f([p[0], p[1] + d, p[2]])[2] - fp) / d,
		gradYM = (f([p[0], p[1] + d / 2, p[2]])[2] - f([p[0], p[1] - d / 2, p[2]])[2]) / d;
		//gradZR = (f([p[0], p[1], p[2] + d]) - fp) / d,
		//gradZM = (f([p[0], p[1], p[2] + d / 2]) - f([p[0], p[1], p[2] - d / 2])) / d;
	//console.log(f([p[0] + d, p[1], p[2]]), fp, d, gradXR);
	//console.log('gradTime', ST() - s, 'grad', gradYM, gradYR);
	return [
		C2(gradXR, gradXM)? gradXM: NaN,
		C2(gradYR, gradYM)? gradYM: NaN
		//C2(gradZR, gradZM)? gradZM: NaN,
	];
}

function dDir(f, p, dir) {
	var C2 = function(d0, d1) {
		return Math.abs(d0 - d1) < .01;
	};
	var d = .0001;
	var dR = (f([p[0] + d * Math.cos(dir), p[1] + d * Math.sin(dir)])[2] - f(p)[2]) / d,
		dL = (-f([p[0] - d * Math.cos(dir), p[1] - d * Math.sin(dir)])[2] + f(p)[2]) / d;
	return C2(dR, dL)? dR: NaN;
}

// *** Set generators / misc transforms ***

// Generates a sequence of given length.
// Elements are equally spaced between start and end.
// Input:
//   start, end: double,
//   length:     non-negative int.
// Output:
//   [x_0 == start, ..., x_length == end].
function seq(start, end, length) {
	var values = [];
	var by = (end - start) / (length - 1);
	for (var i = 0; i < length; i++)
		values[i] = start + i * by;
	return values;
}

// Input:
//   params:
//     dist: -dist <= x_i <= dist,
//     nDim: 2D / 3D grid,
//     len: number of points along any dimension.
// Output:
//   nDim-dimensional cube in an nDim-dimensional array.
function rectGrid(params) {
	params = params || {};
	params.dist = params.dist || Math.PI;
	params.len = params.len || 100;
	params.nDim = params.nDim || 2;
	params.polar = params.polar || false;
		
	var pts = seq(-params.dist, params.dist, params.len);		
	return params.nDim == 2? combine(pts, pts): combine(pts, pts, pts);
}

var make = (function() {
	var ellipse = function(c, r, opts) {
		opts = opts || {};
		opts.nPoints = opts.nPoints||  41;
		
		return seq(0, 2 * Math.PI, opts.nPoints).map(function(phi) {
				return [c[0] + r[0] * Math.cos(phi), c[1] + r[1] * Math.sin(phi), 0];
			});
	}

	var ellipsoid = function(c, r, opts) {
		opts = opts || {};
		opts.nPoints = opts.nPoints ||  41;
		
		var tp = combine(seq(0, Math.PI, opts.nPoints), seq(0, 2 * Math.PI, opts.nPoints));
		return apply(tp, function(p2) {
				return [c[0] + r[0] * Math.sin(p2[0]) * Math.cos(p2[1]), 
						c[1] + r[1] * Math.sin(p2[0]) * Math.sin(p2[1]), 
						c[2] + r[2] * Math.cos(p2[0])];
			});
	}

	var line = function(domain, p0, dir) {
		return levelCurve({cond: function(p) {return (p[0] - p0[0]) * Math.tan(dir) > p[1] - p0[1]}, 
					dist: domain, levelDim: 2, val: 0, rough: 21})[0];
	}
	
	var grid = function(xdom, ydom, opts) {
		opts = opts || {};
		opts.len = opts.len || 100;
			
		var xvals = seq(xdom[0], xdom[1], opts.len),
		    yvals = seq(ydom[0], ydom[1], opts.len);
		return combine(xvals, yvals);
	}
	
	return {
		grid: grid,
		ellipse: ellipse,
		ellipsoid: ellipsoid,
		line: line
	};
})();

var project = (function() {
	var along = [
		function(p3) {return [p3[1], p3[2], -.001]},
		function(p3) {return [p3[0], p3[2], -.001]},
		function(p3) {return [p3[0], p3[1], -.001]}			
	];
	return {
		along: along
	};
})();

function zInvariant(curve, zVals) {
	var result = [];
	for (var i = 0; i < zVals.length; i++)
		result.push(apply(curve, function(p) {return [p[0], p[1], zVals[i]]}));
	return result;
}

function extrude(curve, along) {
	var result = [];
	for (var i = 0; i < along.length; i++)
		result.push(apply(curve, function(p) {return [p[0] + along[0], p[1] + along[1], p[2] + along[i][2]]}));
	return result;
}

function apply(to, callback) {
    var result = [];
	for (var i = 0; i < to.length; i++)
		if (typeof to[i][0] == 'number')
			result[i] = callback(to[i]);
		else
			result[i] = apply(to[i], callback);
	return result;
}

//Array.prototype.mapPt = function(callback) {
//	return apply(this, callback);
//}

function filter(grid, cond) {
	var result = [];
	for (var i = 0; i < grid.length; i++)
		if (typeof grid[i][0] == 'number') {
			if (cond(grid[i])) result.push(grid[i].slice());
		} else {
			result = result.concat(filter(grid[i], cond));
		}
	return result;
}

function levelPlane(domain, zVal) {
	var angles = outer(domain[0], domain[1])
	return apply(angles, function(p) {return [p[0], p[1], zVal]});
}


// *** Matrix / vector utils ***

// Array vec -> number ||vec||.
function norm(vec, params) {
	var temp = 0;
	for (var i = 0; i < vec.length; i++)
		temp += Math.pow(vec[i], 2);
	return Math.sqrt(temp);
}

// Array v1, Array v2 -> number = ||v1 - v2||.
function dist(v1, v2, params) {
	var diff = [];
	for (var i = 0; i < v1.length; i++)
		diff[i] = v1[i] - v2[i];
	return norm(diff);
}

// Array p1, Array p2 -> Array 1/2 * (p1 + p2).
function midpoint(p1, p2, params) {
	var mid = [];
	for (var i = 0; i < p1.length; i++)
		mid[i] = (p1[i] + p2[i]) / 2;
	return mid;
}

function combine(A, B, C) {
	if (B === undefined) 
		B = A;
	var product = [];
	for (var i = 0; i < B.length; i++) {
		product[i] = [];		
		for (var j = 0; j < A.length; j++)
			if (C === undefined) {
				product[i][j] = [A[j], B[i]];
			} else {
				product[i][j] = [];
				for (var k = 0; k < C.length; k++)
				product[i][j][k] = [A[j], B[i], C[k]];
			}
	}
	return product;
}

// Input:
//   a: [a_0, .., a_n], 
//   b: [b_0, .., b_n].
// Output:
//   [[a_0, b_0], .., [a_n, b_n]].
// Errors:
//   a.length != b.length.
function zip(a, b) {
	if (b === undefined)
		b = a;
	if (a.length != b.length)
		throw "vectors of unequal length in zip!"
	result = [];
	for (var i = 0; i < a.length; i++)
		result[i] = [a[i], b[i]];
	return result;
}

// 2-dimensional array A -> A^T
function transpose(arr) {
	var result = [];
	for (var i = 0; i < arr[0].length; i++) {
		result[i] = [];
		for (var j = 0; j < arr.length; j++)
			result[i][j] = arr[j][i].slice();
	}
	return result;
}


// *** Point set conversions ***

// Classifies a point set into nCat bins by z-value.
function categorize(points, nCat) {
	var catPoints = [];
	if (points.length && points[0].length) {
		if (typeof points[0] == 'number') 
			points = [[points]];
		else if (typeof points[0][0] == 'number') 
			points = [points];
			
		var min = Infinity, max = -Infinity;
		
		for (var i = 0; i < points.length; i++)
			for (var j = 0; j < points[i].length; j++) {
				var val = points[i][j][2];
				if (!isNaN(val) && Math.abs(val) !== Infinity)
					if (val < min) min = val;
					else if (val > max) max = val;
			}
		var catSpan = (max - min) / nCat, 
		    catMins = (nCat > 1)? seq(min, max, nCat + 1): [min];
		catMins[nCat] = max;
		
		for (var c = 0; c < nCat; c++)
			catPoints[c] = filter(points, function(p) {return (p[2] >= catMins[c] && p[2] <= catMins[c+1])});
	}
	return catPoints;
}

function points2curves(points, params) {
	if (points.length < 2)
		return [points];
	if (params === undefined)
		params = {};
	if (params.tol === undefined)
		params.tol = .1;
		
	var curves = [];
	while (points.length) {
		var pt, temp = [], minD, j = 0;
		while (true) {
			minD = 2 * params.tol;
			pt = points[j];
			temp.push(pt);
			points.splice(j, 1);
			for (var i = 0; i < points.length; i++)
				if (dist(pt, points[i]) < minD) {
					minD = dist(pt, points[i]);
					j = i;
				}
			if (minD > params.tol || !points.length)
				break;
		}
		if (dist(temp[0], temp[temp.length - 1]) < params.tol)
			temp.push(temp[0]);
		curves.push(temp);
	}
	return curves;
}

function curve2mesh(curve, params) {
	if (params === undefined)
		params = [];
	var curve2 = [];
	for (var i = 0; i < curve.length; i++)
		curve2[i] = curve[0];
	return [curve, curve2];
}


// *** Numeric utils ***

function implicit(cond, dist, params) {
	var rough = 21, 
	    zVals = seq(-dist, dist, rough),
		levels = [];
	for (var i = 0; i < zVals.length; i++)
		for (var dim = 0; dim < 3; dim++)
			levels = levels.concat(levelCurve({
				cond: cond, 
				dist: dist, 
				levelDim: dim, 
				val: zVals[i],
				rough: 21
			}));
	return levels;
}

function EMC(params) {
	if (params.levelDim === undefined)
		params.levelDim = 2;
	var precise = levelCurve(params)[0],
	    tangent = [], 
		move = .000001,
		add = [],
		dim = params.levelDim;
	var start = new Date().getTime();
	//console.log(precise);
	for (var i = 0; i < precise.length; i++) {
		var isTan = function(dir) {
			var pt = precise[i].slice();
			pt[(dim+1)%3] += move;
			pt[(dim+2)%3] += move * Math.tan(dir);
			return cond(pt);
		}
		var deg = bisect(-Math.PI, Math.PI, isTan, .05);
		tangent[i] = deg;
		//console.log(tangent[i]);
	}
	for (var i = 1; i < precise.length; i++) {
		if (!isNaN(tangent[i - 1]) && !isNaN(tangent[i - 1]) && Math.abs(tangent[i - 1] - tangent[i]) < Math.PI / 2) {
			var p1 = precise[i - 1].slice(), p2 = precise[i].slice(), t1 = Math.tan(tangent[i - 1]), t2 = Math.tan(tangent[i]),
			    dx = (p1[(dim+2)%3] - p2[(dim+2)%3] + t2 * (-p1[(dim+1)%3] + p2[(dim+1)%3])) / (t2 - t1),
				dy = t1 * dx,
				newPt = p1.slice();
			newPt[(dim+1)%3] += dx;
			newPt[(dim+2)%3] += dy;
			if (norm(newPt) != Infinity)
				add.push({index: i + add.length, p: newPt});
		}
	}
	//console.log(precise);
	for (var i = 0; i < add.length; i++) {
		//console.log(add[i].p);
		precise.splice(add[i].index, 0, add[i].p);
	}
	//console.log(new Date().getTime() - start);
	return precise;
}

// Finds a level curve of a given function.
// Input:
//   f:    z(x, y),
//   zVal: search for points where z(x, y) == zVal,
//   grid: [[[x_0, y_0].. [x_0, y_m]], .., [[x_n, y_0].. [x_n, y_m]]]. 
//         Checking these points only.
// Output:
//   [[x_0, y_0, z_0], .., [x_k, y_k, z_k]] (no particular order).
function levelCurve(params) {
	if (params === undefined)
		params = {};
	if (params.f === undefined && params.cond === undefined)
		return;
	if (params.val === undefined)
		return;
		
	if (params.connect === undefined)
		params.connect = true;
	if (params.tol === undefined)
		params.tol = .005;
	if (params.dist === undefined)
		params.dist = Math.PI;
	if (params.levelDim === undefined)
		params.levelDim = 2;
	if (params.cond === undefined)
		params.cond = function(p) {return params.f(p) - params.val > 0};
	if (params.rough === undefined)
		params.rough = 41;
		
	var inter = [], rough = params.rough, bErr = params.cond,
		project = function(p2) {
			temp = [];
			temp[params.levelDim] = params.val;
			temp[(params.levelDim + 1) % 3] = p2[0];
			temp[(params.levelDim + 2) % 3] = p2[1];
			return temp;
		};
	
	var grid = apply(rectGrid({dist: params.dist, len: rough}), project),
		above = apply(grid, bErr);
	for (var i = 1; i < grid.length; i++) {
		if (above[0][i-1] !== above[0][i])
			inter.push(bisect(grid[0][i-1], grid[0][i], bErr, params.tol));
		if (above[i-1][0] !== above[i][0])
			inter.push(bisect(grid[i-1][0], grid[i][0], bErr, params.tol));
		for (var j = 1; j < grid[0].length; j++) {
			if (above[i-1][j] !== above[i][j])
				inter.push(bisect(grid[i-1][j], grid[i][j], bErr, params.tol));
			if (above[i][j-1] !== above[i][j])
				inter.push(bisect(grid[i][j-1], grid[i][j], bErr, params.tol));
		}
	}
	
	return params.connect? points2curves(inter, {tol: 4 * params.dist / rough}) :inter;
}

function bisect(l, r, cond, tol) {
	var c = midpoint(l, r);
	return dist(l, r) < tol? c: bisect(c, cond(c) == cond(l)? r: l, cond, tol);
}

function extremaOnGrid(grid) {
	var extrema = [];
	//console.log(grid);
	for (var i = 1; i < grid.length - 1; i++)
		for (var j = 1; j < grid[i].length - 1; j++)
			if ((grid[i][j][2] != mid(grid[i-1][j][2], grid[i][j][2], grid[i+1][j][2])) &&
				(grid[i][j][2] != mid(grid[i][j-1][2], grid[i][j][2], grid[i][j+1][2])))
					extrema.push(grid[i][j]);
	return extrema;
}

function localExtrema(curve) {
	var extrema = [], i = 1, N = curve.length - 1;
	if (curve[0][0] == curve[N][0]) N += 1;
	while (i < N) {
		if ((curve[(i-1)%N][2] <= curve[i%N][2] && curve[i%N][2] >= curve[(i+1)%N][2]) ||
		    (curve[(i-1)%N][2] >= curve[i%N][2] && curve[i%N][2] <= curve[(i+1)%N][2])) {
			extrema.push(curve[i%N]);
			i += 2;
		} else {
			i++;
		}
	}
	return extrema;
}

function paramCurve3(explicit, parametrization) {
	if (parametrization === undefined)
		return function(t) {return [t, explicit(t)]}
	else {	
		var composition = function(t) {
			var pt2 = parametrization(t);
			return [pt2[0], pt2[1], explicit(pt2)];
		}
		return function(t) {return composition(t);}
	}
}




////////////////////
//                //
// !!!!!!!!!!!!!! //
// *** Legacy *** //
// !!!!!!!!!!!!!! //
//                //
////////////////////

// Discouraged. Use combine instead.
function outer(A, B) {
	if (B === undefined) B = A;
	var product = [];
	for (var row = 0; row < B.length; row++) {
		product[row] = [];
		for (var col = 0; col < A.length; col++)
			product[row][col] = [A[col], B[row]];
	}
	return product;
}

function compoundArea(conds, dist, numPoints) {
	var grid = eqGrid3(dist, numPoints);
	for (var i = 0; i < conds.length; i++)
		grid = grid.filter(conds[i]);
	return grid;
}

// Discouraged. To be replaced with rectGrid + polar transform.
function eqGrid(dist, numPoints, polar) {
	var grid;
	if (polar) {
		var temp = outer(seq(0, 2*Math.PI, numPoints), seq(0, dist, numPoints));
		grid = apply(temp, function(p) {
			return [p[1] * Math.cos(p[0]), p[1] * Math.sin(p[0])]
		}, 2);
	} else {
		grid = outer(seq(-dist, dist, numPoints));
	}
	return grid;
}

// Discouraged, use rectGrid!
function eqGrid3(dist, numPoints) {
	var grid = [], dim = seq(-dist, dist, numPoints);
	for (var i = 0; i < numPoints; i++)
		for (var j = 0; j < numPoints; j++)
			for (var k = 0; k < numPoints; k++)
				grid.push([dim[i], dim[j], dim[k]])
	return grid;
}

////////////////////////////////////////////
//                                        //
// OMG ITS THE FAMOUS QUADTREE ALGORITHM! //
//                                        //
////////////////////////////////////////////
function adaptiveGrid(cell, bErr, tol, fErr, split) {
	if (split === undefined)
		split = 3;
	var result = [], step = dist(cell[0][0], cell[1][1]);
	if (split !== 3) {
		cell = combine(seq(cell[0][0][0], cell[1][1][0], split),
		               seq(cell[0][0][1], cell[1][1][1], split));
	} else {
		cell[2] = [];
		cell[0][2] = cell[0][1];
		cell[2][0] = cell[1][0];
		cell[2][2] = cell[1][1];
		cell[0][1] = midpoint(cell[0][0], cell[0][2]);
		cell[1][0] = midpoint(cell[0][0], cell[2][0]);
		cell[1][2] = midpoint(cell[0][2], cell[2][2]);
		cell[2][1] = midpoint(cell[2][0], cell[2][2]);
		cell[1][1] = midpoint(cell[0][1], cell[2][1]);
	}
	var above = apply(cell, bErr);
	if (step > tol)
		for (var i = 1; i < cell.length; i++)
			for (var j = 1; j < cell[0].length; j++) {
				var angleVals = above[i-1][j] + above[i][j] + 
							    above[i][j-1] + above[i-1][j-1];
				if (angleVals != 0 && angleVals != 4) {
					var nextCell = [[cell[i-1][j], cell[i][j]], 
								    [cell[i][j-1], cell[i-1][j-1]]],
					result = result.concat(adaptiveGrid(nextCell, bErr, tol, fErr))
				}
			}
	else if (fErr(cell[1][1]) < tol)
		result = [cell[1][1]];
	return result;
}


function filterSplit(grid, cond) {
	var result = [], bad = [];
	for (var i = 0; i < grid.length; i++)
		if (typeof grid[i][0] == 'number') {
			if (cond(grid[i])) 
				result.push(grid[i].slice());
			else
				bad.push(grid[i].slice());
		} else {
			result = result.concat(filterSplit(grid[i], cond));
		}
	grid = bad;
	return result;
}

// Similar to filter, but only works with 3D arrays.
// Returns the border of the area given by filter(grid, cond).
// IsRoot is used for recursion and is not to be passed.
function filterBorder3(grid, cond, isRoot) {
	if (isRoot === undefined)
		isRoot = true;
	
	var result = [];
	for (var i = 0; i < grid.length; i++)
		if (typeof grid[i][0] == 'number')
			result[i] = cond(grid[i]);
		else
			result[i] = filterBorder3(grid[i], cond, false);
	
	if (isRoot) {
		border = []
		for (var i = 1; i < result.length - 1; i++)
			for (var j = 1; j < result[i].length - 1; j++)
				for (var k = 1; k < result[i][j].length - 1; k++) {
					var temp = 
					result[i-1][j][k] +
					result[i+1][j][k] +
					result[i][j-1][k] +
					result[i][j+1][k] +
					result[i][j][k-1] +
					result[i][j][k+1];
					if (temp != 6 && temp && result[i][j][k]) 
						border.push(grid[i][j][k].slice())
				}		
		result = border;
	}
	return result;
}

function extendDirectionOld(domain, pt, dir) {
	var start = new Date().getTime();
	for (var i = 0; i < 1; i++) {
	var yLine = function(xl) {
		return (xl - pt[0]) * Math.tan(dir) + pt[1];
	}
	var xLine = function(yl) {
		return (yl - pt[1]) / Math.tan(dir) + pt[0];
	}
	
	var x = [], y = [];
	x[0] = mid(xLine(domain[0][0]), domain[0][0], domain[0][1]);
	x[1] = mid(xLine(domain[0][1]), domain[0][0], domain[0][1]);
	y[0] = mid(yLine(domain[1][0]), domain[1][0], domain[1][1]);
	y[1] = mid(yLine(domain[1][1]), domain[1][0], domain[1][1]);
	if (dir < 0) y.reverse();
	}
	for (var i = 0; i < 1000; i++) {
		return zip(seq(x[0], x[1], 100), seq(y[0], y[1], 100))
	} 
	console.log('MKLINE', new Date().getTime() - start);
	return [[x[0], y[0]], [x[1], y[1]]];
}