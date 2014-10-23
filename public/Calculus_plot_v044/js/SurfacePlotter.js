// v0.47
// (c) 2013 by V.Klepov

function MultiPlotter3d(container, count) {
	this.syncArr = [];
	for (var i = 0; i < count; i++) {
		this.push(new Plotter3d(container, {parent: this}));
		this.syncArr[i] = true;
	}
	for (var i = 0; i < count; i++)
		this[i].animate();
	//console.log('init', this.length);
	this.synchronize = true;
}

(function() {
	MultiPlotter3d.prototype = new Array;

	MultiPlotter3d.prototype.sync = function(caller) {
		var clonePos = caller.camera.position;
		//if (this.synchronize && caller.sync)
			for (var i = 0; i < this.length && this.synchronize; i++)
				//if (this[i].sync) 
					this[i].setCameraPos(clonePos);
	}

	MultiPlotter3d.prototype.reset = function() {
		for (var i = 0; i < this.length; i++)
			this[i].reset();
	}

	MultiPlotter3d.prototype.drawAxes = function(len, opts) {
		//console.log(this[1]);
		for (var i = 0; i < this.length; i++)
			this[i].drawAxes(len, opts);
	}
})();

function Plotter3d(container, opts) {
	container = container || document;
	opts = opts || {};
	opts.w = opts.w || 800;
	opts.h = opts.h || 800;
	
	this.parent = opts.parent;

	this.camera = new THREE.PerspectiveCamera(45, 1, .1, 50);
	this.camera.position.set(-4, 4, 5);
	
	this.scene = new THREE.Scene();
	this.sceneOverlay = new THREE.Scene();
	
	if (Detector.webgl) {
		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.useWebGL = true;
	} else if (Detector.canvas) {
		this.renderer = new THREE.CanvasRenderer();
		this.useWebGL = false;
	} else {
		container.innerHTML = 'Your browser does not support 3D.';
		return;
	}
	this.renderer.setSize(opts.w, opts.h);
	this.renderer.autoClear = false;
	
	this.container = container;
	this.container.appendChild(this.renderer.domElement);
	
	this.controls = new THREE.OrbitControls(this.camera, this.container);
	this.controls.addEventListener('change', this.render.bind(this));
	
	this.stats = new Stats();
	this.stats.domElement.style.position = 'absolute';
	this.stats.domElement.style.top = '0px';
	this.container.appendChild(this.stats.domElement);
	
	this.objects = {};
	this.active = true;
	
	if (this.parent === undefined)		
		this.animate();
}

(function() {
	Plotter3d.prototype.setCameraPos = function(newPos) {
		this.camera.position.set(newPos.x, newPos.y, newPos.z);
		this.camera.lookAt(new THREE.Vector3(0,0,0));
	};

	Plotter3d.prototype.animate = function() {			
		window.requestAnimationFrame(this.animate.bind(this));
		this.controls.update();	
		if (this.parent !== undefined)
			this.parent.sync(this);
		this.render();
		this.stats.update();
	};

	Plotter3d.prototype.render = function() {
		// Section curve and derivative are rendered on top
		this.renderer.clear();
		this.renderer.render(this.scene, this.camera);
		if (this.useWebGL)
			this.renderer.clear(false, true, false);
		this.renderer.render(this.sceneOverlay, this.camera);
	};

	Plotter3d.prototype.remove = function(object) {
		this.scene.remove(object);
		this.sceneOverlay.remove(object);
	};

	Plotter3d.prototype.addByID = function(object, ID) {
		if (ID === undefined) {
			var count = 0;
			for (var o in this.objects) count++;
			ID = '__NONAME__';// + count + '__';
		}
		if (this.objects[ID] === undefined)
			this.objects[ID] = object;
		else
			this.objects[ID].add(object);
		//console.log(this.objects);
	};

	Plotter3d.prototype.removeByID = function(ID) {
		if (ID !== undefined) {
			this.remove(this.objects[ID]);
			delete this.objects[ID];
		}
	};

	Plotter3d.prototype.reset = function() {
		for (var id in this.objects)
			this.remove(this.objects[id]);
		this.objects = {};
	};

	Plotter3d.prototype.drawAxes = function (len, opts) {
		opts = opts || {};
		opts.col = opts.col || 'grey';
		
		var axisCoords = [
			[[-len, 0, 0], [len, 0, 0]],
			[[0, -len, 0], [0, len, 0]],
			[[0, 0, -len], [0, 0, len]]
		];
		return this.plotVecField3d(axisCoords, {col: opts.col, ID: '__AXES__'});
	};

	//
	Plotter3d.prototype.plot3d = function (points, opts) {
		opts = opts || {};
		opts.overlay = opts.overlay || false;	
		opts.type = opts.type || '|-';
		if (opts.col === undefined) opts.col = 'bblue';
		opts.radius = opts.radius || .1;
		opts.alpha = opts.alpha || 0;
		if (typeof opts.col == 'string')
			opts.col = style.getByName(opts.col);
			
		var group = new THREE.Object3D();
		
		points = fixData(points);
		
		if (opts.axisLen)
			this.drawAxes(opts.axisLen);	
			
		if (~opts.type.indexOf('-'))
			linePlot(points, opts.col, group);
		if (~opts.type.indexOf('|'))
			linePlot(transpose(points), opts.col, group);
		if (~opts.type.indexOf('s'))
			solidPlot(points, opts.col, group, opts);
		if (~opts.type.indexOf('p'))
			scatterPlot(points, opts.col, group, opts);
		
		if (!opts.add)
			this.removeByID(opts.ID);
		(opts.overlay? this.sceneOverlay: this.scene).add(group);
		this.addByID(group, opts.ID);
		return group;
	};

	Plotter3d.prototype.plotCat3d = function(pointsCat, opts) {
		opts.type = 'p';
		var colormap = style.map(pointsCat.length),
			group = new THREE.Object3D();
		for (var i = 0; i < pointsCat.length; i++) {
			opts.col = colormap[i];
			temp = this.plot3d(pointsCat[i], opts);
			opts.add = true;
			i == 0? group = temp: group.add(temp);
		}
		return group;
	};

	Plotter3d.prototype.plotVecField3d = function(vecfield, opts) {
		if (opts === undefined)
			opts = {};
		if (opts.startStyle === undefined)
			opts.startStyle = '';
		if (opts.endStyle === undefined)
			opts.endStyle = 'a';
		if (opts.ID === undefined)
			opts.ID = '__NONAME_VECFIELD__';
		opts.type = '-';
		if (typeof opts.col == 'string')
			opts.col = style.getByName(opts.col);
		
		while (typeof vecfield[0][0][0] !== 'number') {
			console.log('unflat', vecfield);
			var flat = [];
			vecfield = flat.concat.apply(flat, vecfield);
			console.log('flat', vecfield);
		}
				
		this.plot3d(vecfield, opts);
		var h = .3, w = .05;
		for (var i = 0; i < vecfield.length; i++) {
			var vector = vecfield[i].slice(vecfield[i].length - 2, vecfield[i].length),
				arrow = new THREE.Mesh(new THREE.CylinderGeometry(0, w, h, 3, 1, false), new THREE.MeshBasicMaterial({color: opts.col})),
				dir = new THREE.Vector3(vector[1][1] - vector[0][1], vector[1][2] - vector[0][2], vector[1][0] - vector[0][0]).normalize(),
				up = new THREE.Vector3(0, 1, 0),
				rotNorm = new THREE.Vector3().crossVectors(up, dir).normalize(),
				rotAng = Math.acos(up.dot(dir));

			arrow.position = new THREE.Vector3(vector[1][1], vector[1][2], vector[1][0]);
			arrow.translateOnAxis(dir, -h/2);
			arrow.rotateOnAxis(rotNorm, rotAng);
			
			this.addByID(arrow, opts.ID);
		}
		return this.objects[opts.ID];
	};
	
	Plotter3d.prototype.setView2 = function() {
		console.log('init', this.camera.up);
		this.controls.noRotate = true;
		this.camera.position.set(0, norm([this.camera.position.x, this.camera.position.y, this.camera.position.z], 0));
		this.camera.up.set(1, 0, 0);
	};
		
	Plotter3d.prototype.setView3 = function() {
		this.controls.noRotate = false;		
		this.camera.up.set(0, 1, 0);
	};

	var style = {
		colors: {
			bblue:      0x4671D5,
			borange:    0xFF6600,
			red:        0xFF0000,
			green:      0x00FF00,
			blue:       0x0000FF,
			yellow:     0xFFFF00,
			magenta:    0xFF00FF,
			cyan:       0x00FFFF,
			grey:       0x808080,
			orange:     0xFFA500,
			seagreen:   0x3CB371
		},
		
		getByPriority: function(priority) {
		},
		
		getByName: function(name) {
			if (this.colors[name] !== undefined)
				return this.colors[name];
			return this.colors.blue;
		},
		
		map: function(N) {
			var temp = [];
			for (var i = 0; i < 1; i += 1 / N) {
				var B = 255 * mid(i * 4, 1, 0),
					G = 255 * mid((i - .3) * 2, 1, 0),
					R = 255 * mid((i - .8) * 2.5, 1, 0);
				temp.push(R << 16 | G << 8 | B);
			}
			return temp;
		}
	};
	
	function fixData(data, axisLen) {
		var s = ST();
		if (!data instanceof Array || !data.length)
			return [];
		
		if (typeof data[0] == 'number')
			data = [[data]];
		else if (typeof data[0][0] == 'number')
			data = [data];	
		
		var maxAlong = [0, 0, 0];
		for (var i = 1; i < data.length - 1; i++)
			for (var j = 1; j < data[i].length - 1; j++) {
				var p = data[i][j];
				if (p[2] === undefined) 
					p[2] = 0;
			}		
		//console.log('fix time', ST() - s);
		
		return data;
	}
	
	function axisLen(data) {
		var maxAlong = [0, 0];
		for (var i = 0; i < data.length; i++)
			for (var j = 0; j < data[i].length; j++)
				for (var dim = 0; dim < 2; dim++)
					maxAlong[dim] = Math.max(maxAlong[dim], Math.abs(data[i][j][dim]));
		console.log('axis', maxAlong);
		return Math.max(Math.max(maxAlong[0], maxAlong[1]), 1);
	}
		
	function defPlotOpts (opts) {
	};

	function linePlot(points, plotClr, group) {
		var lineMaterial = new THREE.LineBasicMaterial({color: plotClr}), ptTest = 0, pt = [0,0,0];
		for (var i = 0; i < points.length; i++) {
			var line = new THREE.Geometry();
			for (var j = 0; j < points[i].length; j++) {
				ptTest = pt[2];
				pt = points[i][j].slice();
				if (!isNaN(pt[2]) && Math.abs(pt[2] - ptTest) < 1000) {
					line.vertices.push(new THREE.Vector3(pt[1], pt[2], pt[0]));
				} else if (line.vertices.length) {
					group.add(new THREE.Line(line, lineMaterial));
					line = new THREE.Geometry();
				}
			}
			if (line.vertices.length)
				group.add(new THREE.Line(line, lineMaterial));
		}
	};

	function scatterPlot(points, plotClr, group, opts) {
		var particles = new THREE.Geometry(),
			plotMaterial = new THREE.ParticleBasicMaterial({
				color: plotClr,
				size: opts.radius,
				transparent: opts.aplha !== 0,
				side: THREE.DoubleSide,
				opacity: 1 - opts.alpha
			});
		for (var i = 0; i < points.length; i++)
			for (var j = 0; j < points[i].length; j++)
				if (!isNaN(points[i][j][2])) {
					var pt = points[i][j].slice();
					particles.vertices.push(new THREE.Vector3(pt[1], pt[2], pt[0]));
				}
		group.add(new THREE.ParticleSystem(particles, plotMaterial));
	};

	function solidPlot(points, plotClr, group, opts) {
		var surface = new THREE.Geometry(),
			surfMaterial = new THREE.MeshBasicMaterial({
				color: plotClr,
				side: THREE.DoubleSide,
				transparent: opts.aplha !== 0, 
				opacity: 1 - opts.alpha
			});
		for (var i = 0; i < points.length; i++)
			for (var j = 0; j < points[i].length; j++) {
				var pt = points[i][j].slice();
				if (!isNaN(pt[2]))
					surface.vertices.push(new THREE.Vector3(pt[1], pt[2], pt[0]));
				else
					surface.vertices.push(new THREE.Vector3(pt[1], Infinity, pt[0]));
			}
		var n = points.length, 
			m = points[0].length;
		for (var i = 0; i < (n - 1) * m - 1; i++)
			if ((i + 1) % m) {
				surface.faces.push(new THREE.Face3(i, i + 1, i + m));
				surface.faces.push(new THREE.Face3(i + 1, i + m, i + m + 1));
			}
		group.add(new THREE.Mesh(surface, surfMaterial));
	};
})()