// v0.41
// (c) 2013 by V.Klepov

// *** Native Math overrides ***

Math.pow_old = Math.pow;
Math.pow = function(x, p) {
	var temp = Math.pow_old(x, p);
	if (!isNaN(temp))
		return temp;
		
	temp = -Math.pow_old(-x, p);
	if (Math.abs(Math.pow_old(temp, 1 / p) - x) < .00001)
		return temp;
	
	return NaN;
};

(function(global) {
	var _G = global.grafar || (global.grafar = {});
	
	function mid(a, b, c) {
		return Math.min(Math.min(Math.max(a,b), Math.max(b,c)), Math.max(a,c));
	}

	function grad(f, p, opts) {
		opts = opts || {};
		var d = .0001,
			gradXM = (f([p[0] + d / 2, p[1], p[2]]) - f([p[0] - d / 2, p[1], p[2]])) / d,
			gradYM = (f([p[0], p[1] + d / 2, p[2]]) - f([p[0], p[1] - d / 2, p[2]])) / d,
			gradZM = (f([p[0], p[1], p[2] + d / 2]) - f([p[0], p[1], p[2] - d / 2])) / d;
		var res = [gradXM, gradYM, gradZM];
		if (opts.ignore !== undefined)
			res[opts.ignore] = 0;
		return res;
	}

	function dDir(f, p, dir) {
		var d = .0001;
		return (f([p[0] + d * Math.cos(dir), p[1] + d * Math.sin(dir)])[2] - f(p)[2]) / d;
	}

	// *** Set generators / misc transforms ***

	function seq(range, opts) {
		opts = opts || {};
		var type = opts.type || 'e',
		    length = opts.length || 41;
		if (range[0] instanceof Object && range[1] instanceof Object) {
			var components = {}, res = [];
			for (var i in range[0])
				if (range[0].hasOwnProperty(i))
					components[i] = seq([range[0][i], range[1][i]], {length: length});
			for (var j = 0; j < length; j++) {
				res.push({});
				for (var i in range[0])
					if (range[0].hasOwnProperty(i))
						res[j][i] = components[i][j];
			}
			return res;
		} else {
			var start = range[0], end = range[1];		
			var values = [], i = 0, by;
			if (type === 'e') {
				by = (end - start) / (length - 1);
				for (i = 0; i < length; i++)
					values.push(start + i * by);
			} else if (type === 'c') {
				for (i = 0; i < length; i++)
					values.push((end + start) / 2 + (end - start) / 2 * Math.cos(Math.PI * (2 * i + 1) / (2 * length)));
			}
			return values;
		}
	}	

	var make = {
		ellipse: function(c, r, opts) {
			opts = opts || {};
			opts.nPoints = opts.nPoints||  41;
			
			return seq([0, 2 * Math.PI], {length: opts.nPoints}).map(function(phi) {
					return [c[0] + r[0] * Math.cos(phi), c[1] + r[1] * Math.sin(phi), 0];
				});
		},

		ellipsoid: function(c, r, opts) {
			opts = opts || {};
			opts.nPoints = opts.nPoints ||  41;
			
			var tp = combine(seq([0, Math.PI], {length: opts.nPoints}), seq([0, 2 * Math.PI], {length: opts.nPoints}));
			return apply(tp, function(p2) {
					return [c[0] + r[0] * Math.sin(p2[0]) * Math.cos(p2[1]), 
							c[1] + r[1] * Math.sin(p2[0]) * Math.sin(p2[1]), 
							c[2] + r[2] * Math.cos(p2[0])];
				});
		},

		line: function(domain, p0, dir) {
			return tracePat(function(p) {return (p[0] - p0[0]) * Math.tan(dir) - (p[1] - p0[1])}, [[-2,-2,-2], [2,2,2]], 2, 0, true)[0];
		},
		
		grid: function(bindings, opts) {
			opts = opts || {};
			var names = Object.getOwnPropertyNames(bindings),
				length = opts.length || 41,
			    values = {}, pivots = [], res = [];
			for (var v = 0; v < names.length; v++)
				if (bindings[names[v]] instanceof Array) {
					values[names[v]] = seq(bindings[names[v]], {length: length});
					pivots.push(names[v]);
				}
			// choose pivot
			for (var p = pivots.length - 1; p >= 0; p--) {
				// put the pivot into the end
				var temp = values[p];
				values[p] = values[values.length - 1];
				values[values.length - 1] = temp;
				
				var temp = pivots[p];
				pivots[p] = pivots[pivots.length - 1];
				pivots[pivots.length - 1] = temp;	
				
				//console.log(pivots, pivots[pivots.length - 1]);
				
				// for each combination of non-pivots
				for (var c = 0; c < Math.pow(length, pivots.length - 1); c++) {
					// make a new line
					res.push([]);
					// push a point for each pivot value
					for (var ipivot = 0; ipivot < length; ipivot++) {
						res[res.length - 1].push({});
						for (var a = 0; a < pivots.length - 1; a++)
							res[res.length - 1][ipivot][pivots[a]] = values[pivots[a]][Math.floor(c / Math.pow(length, a)) % length];
						res[res.length - 1][ipivot][pivots[pivots.length - 1]] = values[pivots[pivots.length - 1]][ipivot];
					}
				}
			}
			//console.log('combined', res);
			return res;
		}
	};
	//make.grid({x: [0, 2], y: [0, 2], z:[0, 2], t: [0, 2]}, {length: 3});

	var project = {
		along: [
			function(p3) {return [p3[1], p3[2], -.001]},
			function(p3) {return [p3[0], p3[2], -.001]},
			function(p3) {return [p3[0], p3[1], -.001]}			
		],
		
		reverse: function(dim, val) {
			return function(p2) {
				var temp = [];
				temp[dim] = val;
				temp[(dim + 1) % 3] = p2[0];
				temp[(dim + 2) % 3] = p2[1];
				return temp;
			}
		}
	};

	function zInvariant(curve, zVals) {
		return zVals.map(function (zVal) {return apply(curve, function(p) {return [p[0], p[1], zVal]})});
	};

	function extrude(curve, along) {
		var result = [];
		for (var i = 0; i < along.length; i++)
			result.push(apply(curve, function(p) {return [p[0] + along[0], p[1] + along[1], p[2] + along[i][2]]}));
		return result;
	};

	function apply(arr, callback) {
		var result = [], n = arr.length;
		for (var i = 0; i < n; i++)
			if (!Array.isArray(arr[i]))
				result[i] = callback(arr[i]);
			else
				result[i] = apply(arr[i], callback);
		return result;
	};

	function filter(arr, cond) {
		var result = [], n = arr.length;
		for (var i = 0; i < grid.length; i++)
			if (!Array.isArray(arr[i][0]))
				if (cond(arr[i])) result.push(arr[i].slice());
			else
				result = result.concat(filter(grid[i], cond));
		return result;
	};

	function levelPlane(dom, zVal) {
		var corners = [
			[dom[0], [dom[0][0], dom[1][1]]], 
			[[dom[1][0], dom[0][1]], dom[1]]
		];
		return apply(corners, project.reverse(2, zVal));
	};

	// *** Matrix / vector utils ***

	var vec = {
		VEC_ERROR: new Error('Error: incompatible vector dimensions'),

		norm: function(vec, fast) {
			return fast?
				(vec.map(Math.abs)).reduce(function(p, c) {return Math.max(p, c)}):
				Math.sqrt(vec.reduce(function(p, c) {return p + c * c}, 0));
		},

		dist: function(p1, p2, fast) {
			if (p1.length != p2.length)
				throw VEC_ERROR;
			return vec.norm(p1.map(function(c, i) {return p1[i] - p2[i]}), fast);
		},

		mid: function(p1, p2) {
			if (p1.length != p2.length)
				throw VEC_ERROR;
			return p1.map(function(c, i) {return (p1[i] + p2[i]) / 2});
		},
		
		triMid: function(p1, p2, p3) {
			if (p1.length != p2.length || p2.length != p3.length)
				throw VEC_ERROR;
			return p1.map(function(c, i) {return (p1[i] + p2[i] + p3[i]) / 3});
		},
		
		t: function(mat) {
			var n = mat.length, m = mat[0].length;
			var result = [];
			for (var i = 0; i < m; i++) {
				result[i] = [];
				for (var j = 0; j < n; j++)
					result[i][j] = mat[j][i].slice();
			}
			return result;
		}
	}

	function combine(A, B, C) {
		B = B || A;
		
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

	function zip(/*args*/) {
		var temp = [];
		for (var i = 0; ; i++) {
			for (var j = 0; j < arguments.length; j++)
				if (arguments[j].length >= i)
					return temp;
			temp.push([]);
			for (var j = 0; j < argument.length; j++)
				temp[i][j] = arguments[j][i] instanceof Array? arguments[j][i].slice(): arguments[j][i];
		}
		return temp;
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
				catMins = (nCat > 1)? seq([min, max], {length: nCat + 1}): [min];
			catMins[nCat] = max;
			
			for (var c = 0; c < nCat; c++)
				catPoints[c] = filter(points, function(p) {return (p[2] >= catMins[c] && p[2] <= catMins[c+1])});
		}
		return catPoints;
	}

	function curve2mesh(curve) {	
		var curve2 = [];
		
		for (var i = 0; i < curve.length; i++)
			curve2[i] = curve[0];
		return [curve, curve2];
	}

	// *** Numeric utils ***

	function implicit(cond, dom, params) {
		var rough = 21, 
			zVals = seq([dom[0][2], dom[1][2]], {length: rough}),
			levels = [];
		for (var dim = 0; dim < 3; dim++)
			for (var i = 0; i < zVals.length; i++) {
				levels = levels.concat(tracePat(cond, dom, dim, zVals[i]));
			}
		return levels;
	}

	function tracePat(f, dom, dim, val, planar) {
		console.log(arguments);
		var nVert = 5, 
			tol = .005, 
			iters = 3, 
			nCell = nVert - 1, 
			fBool = function(p) {return f(p) <= 0},
			h = Object.getOwnPropertyNames(dom).map(function(i) {return (dom[i][1] - dom[i][0]) / nCell}),
			nonclosed = 0, 
			inner = 0, 
			sqr = [], 
			curves = [],
			verts,
			vals,
			i, j;
		
		// make an empty array
		for (sqr = []; sqr.length < 2 * nCell + 1; sqr.push([]));
		
		// vertex values
		verts = apply(make.grid(dom, {length: nVert}), project.reverse(dim, val));
		vals = apply(verts, fBool);
		
		console.log('tracing', verts, vals);
		
		// find intersections
		for (i = 0; i < nVert; i++) {
			for(j = 0; j < nVert; j++) {
				if (j !== nCell && vals[i][j] !== vals[i][j+1]) {
					sqr[2*i][2*j+1] = bisect(verts[i][j], verts[i][j+1], f, tol);
					(i !== 0 && i !== nCell)? inner++: nonclosed++;
				}
				if (i !== nCell && vals[i][j] !== vals[i+1][j]) {
					sqr[2*i+1][2*j] = bisect(verts[i][j], verts[i+1][j], f, tol);
					(j !== 0 && j !== nCell)? inner++: nonclosed++;
				}
			}
		}
		
		// connect
		function improve(c, prevIndex) {
			var mid = vec.mid(c[prevIndex], c[prevIndex+1]),
				nabla = (planar? grad(f, mid, {ignore: dim}): grad(f, mid)).map(function(c) {return 2*c}),
				nablaNorm = vec.norm(nabla), err = -1 * f(mid);
				
			nabla = nabla.map(function(p, i) {return err * p / nablaNorm});
			//if (vec.norm(nabla, true) > nCell * vec.norm(h)) 
			//	return;
				
			var newPt = bisect(mid, [nabla[0] + mid[0], nabla[1] + mid[1], nabla[2] + mid[2]], f, tol);
			//var newPt = [nabla[0] + mid[0], nabla[1] + mid[1], nabla[2] + mid[2]];
			
			var midErr = vec.dist(mid, newPt);
			
			// && midErr < vec.norm(h) 
			//if (midErr > tol && Math.abs(f(newPt)) < tol)
				c.splice(prevIndex + 1, 0, newPt);
		};
		while (nonclosed || inner) {
			(function() {
				if (nonclosed) {
					for (i = 1; i < 2 * nCell; i += 2, j = i)
						if (sqr[0][j]) {
							i = 0;
							return;
						} else if (sqr[i][0]) {
							j = 0;
							return;
						} else if (sqr[2*nCell][j]) {
							i = 2 * nCell;
							return;
						} else if (sqr[i][2*nCell]) {
							j = 2 * nCell;
							return;
						}
				} else {
					for (i = 0; i <= 2 * nCell; i += 2)
						for (j = 0; j <= 2 * nCell; j += 2)
							if (sqr[i][j+1]) {
								j++;
								return;
							} else if (sqr[i+1][j]) {
								i++;
								return;
							}
				}
			}());
				
			var newCurve = [];
			
			if (nonclosed) {
				newCurve.push(sqr[i][j]);
				sqr[i][j] = false;
				nonclosed--;
			}
			
			(i != 2 * nCell)? i += !(i%2): i--;
			(j != 2 * nCell)? j += !(j%2): j--;
			var start = [i,j];
			
			while (true) {
				if (sqr[i+1][j]) {
					newCurve.push(sqr[i+1][j]);
					sqr[i+1][j] = false;
					i += 2;
				} else if (sqr[i][j+1]) {
					newCurve.push(sqr[i][j+1]);
					sqr[i][j+1] = false;
					j += 2;
				} else if (sqr[i][j-1]) {
					newCurve.push(sqr[i][j-1]);
					sqr[i][j-1] = false;
					j -= 2;
				} else if (sqr[i-1][j]) {
					newCurve.push(sqr[i-1][j]);
					sqr[i-1][j] = false;
					i -= 2;
				} else {
					throw new Error('fatal tracking error!');
				}
				
				if (nonclosed && (i >= 2 * nCell || i <= 0 || j >= 2 * nCell || j <= 0)) {
					nonclosed--;
					break;
				}
				inner--;
				if (!nonclosed && i == start[0] && j == start[1]) {
					newCurve.push(newCurve[0]);
					break;
				}
			}
			
			// Improving
			for (var iter = 0; iter < 5; iter++)
				for (var k = newCurve.length - 2; k >= 0; k--)
					improve(newCurve, k);
			
			curves.push(newCurve);		
		}
		
		return curves;
	}

	function solveInterp(l, r, f) {
		var d = [0, 1, 2].map(function(dim) {return r[dim] - l[dim]}),
			k = - f(l) / (f(r) - f(l));
		return [l[0] + k * d[0], l[1] + k * d[1], l[2] + k * d[2]];
	}

	function bisect(l, r, cond, tol) {
		tol = tol || .01;
		var c = vec.mid(l, r);
		return vec.dist(l, r) > tol?
			bisect(c, (cond(c) <= 0) == (cond(l) <= 0)? r: l, cond, tol):
			c;
	}

	function localExtrema(curve, type) {
		type = type || 'min max';
		var extrema = [], i = 1, N = curve.length - 1;
		if (dist(curve[0], curve[N]) < .001) N += 1;
		while (i < N) {
			if ((curve[(i-1)%N][2] <= curve[i%N][2] && curve[i%N][2] >= curve[(i+1)%N][2] && ~type.indexOf('max')) ||
				(curve[(i-1)%N][2] >= curve[i%N][2] && curve[i%N][2] <= curve[(i+1)%N][2] && ~type.indexOf('min'))) {
				extrema.push(curve[i%N]);
				i += 2;
			} else {
				i++;
			}
		}
		return extrema;
	}

	function optim(f, domain, opts) {
		opts = opts || {};
		opts.mode = opts.mode || 'grad';
		opts.type = opts.type || 'min';
		
		var extrema = [];
		
		if (opts.mode === 'grad') {
			var xc, xn, lambda = .5, nabla, eps = .01;
			for (var i = 0; i < 200; i++) {
				xn = NaN;
				xc = [domain[0][0] + Math.random() * (domain[1][0] - domain[0][0]),
					  domain[0][1] + Math.random() * (domain[1][1] - domain[0][1])];
				for (var j = 1; j < 80; j++, xc = xn) {
					nabla = grad(f, xc);
					xn = [xc[0] - lambda * nabla[0], xc[1] - lambda * nabla[1]];
					//extrema.push(xc);
					if (dist(xn, xc) < eps) {
						extrema.push(xn);
						break;
					}
				}
			}	
		}
		
		return apply(extrema, f);
	}
	
	_G.grad = grad;
	_G.curve2mesh = curve2mesh;
	_G.dDir = dDir;
	_G.seq = seq;
	_G.make = make;
	_G.project = project;
	_G.apply = apply;
	_G.levelPlane = levelPlane;
	_G.vec = vec;
	_G.zip = zip;
	_G.zInvariant = zInvariant;
	_G.categorize = categorize;
	_G.tracePat = tracePat;
	_G.implicit = implicit;
}(this));