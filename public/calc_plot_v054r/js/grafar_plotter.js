// v0.47
// (c) 2013 by V.Klepov

(function(global) {
	var _G = global.grafar || (global.grafar = {}),
	    syncTable = {},
		Renderer,
		renderMode;
	_G.panels = {};
	
	if (Detector.webgl) {
		renderMode = 'webgl';
		Renderer = function() {return new THREE.WebGLRenderer({ antialias: true })};
	} else if (Detector.canvas) {
		renderMode = 'canvas';
		Renderer = function() {return new THREE.CanvasRenderer()};
	} else {
		renderMode = 'none';
		Renderer = function() {throw new Error('no 3D support')};
	};

	_G.Panel = function(container, opts) {
		opts = opts || {};
		var container = container || document,
		    width = opts.w || Math.max(container.clientWidth, 600),
		    height = opts.h || Math.max(container.clientHeight, 600);

		this.camera = new THREE.PerspectiveCamera(45, width / height, .1, 500);
			//new THREE.OrthographicCamera(width / -300, width / 300, height / 300, height / -300, .00000001, 1000);
		this.camera.position.set(-4, 4, 5);
		
		this.scene = new THREE.Scene();
		this.sceneOverlay = renderMode === 'webgl'? new THREE.Scene(): this.scene;
		
		this.renderer = (new Renderer());
		this.renderer.setSize(width, height);
		this.renderer.autoClear = false;
		container.appendChild(this.renderer.domElement);
		
		this.controls = new THREE.OrbitControls(this.camera, container);
		this.controls.addEventListener('change', this.render.bind(this));
		
		if (_G.debug) {
			this.stats = new Stats();
			this.stats.domElement.style.position = 'absolute';
			this.stats.domElement.style.top = '0px';
			container.appendChild(this.stats.domElement);
		}
		
		this.axes = ['x', 'y', 'z'];

		this.animate();
	};

	_G.Panel.prototype.animate = (function() {
		if (_G.debug) 
			return function() {
				window.requestAnimationFrame(this.animate.bind(this));
				this.controls.update();
				this.render();
				this.stats.update();
			};
		else 
			return function() {
				window.requestAnimationFrame(this.animate.bind(this));
				this.controls.update();
				this.render();
			};
	}());

	_G.Panel.prototype.render = (function() {
		if (renderMode === 'webgl')
			return function() {
				this.renderer.clear();
				this.renderer.render(this.scene, this.camera);
				this.renderer.clear(false, true, false);
				this.renderer.render(this.sceneOverlay, this.camera);
			};
		else
			return function() {
				this.renderer.clear();
				this.renderer.render(this.scene, this.camera);
			};
	}());

	_G.Panel.prototype.remove = function(object) {
		this.scene.remove(object);
		this.sceneOverlay.remove(object);
	};

	// TODO graph box stuff
	_G.Panel.prototype.drawAxes = function (len, opts) {
		opts = opts || {};
		var id = '$AXES-' + this.scene.uuid,
		    color = opts.color || 'grey';
		
		var axes = [
				[[-len, 0, 0], [len, 0, 0]],
				[[0, -len, 0], [0, len, 0]],
				[[0, 0, -len], [0, 0, len]]
			];
		for (var i = Math.ceil(-len); i < len; i++)
			axes = axes.concat([[[i,0,0]], [[0,i,0]], [[0,0,i]]]);
		
		_G.get(id).setStyle({color: color, end: 'a', type: '-', radius: .08})
			.set(axes).pin(this);
		return this;
	};
	
	// TODO merge these two
	_G.Panel.prototype.setView2 = function() {
		this.controls.noRotate = true;
		this.camera.position.set(0, _G.vec.norm([this.camera.position.x, this.camera.position.y, this.camera.position.z], 0));
		this.camera.up.set(1, 0, 0);
		return this;
	};
		
	_G.Panel.prototype.setView3 = function() {
		this.controls.noRotate = false;		
		this.camera.up.set(0, 1, 0);
	};

	// TODO remove
	var style = {
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
	
	// TODO operate on Graph.instance
	_G.Panel.prototype.plot3d = function (data, opts) {
		var group = new THREE.Object3D();
		
		if (data.l.length)
			_G.linePlot(data.l, opts.color, group);		
		if (opts.end == 'a')
			_G.arrowPlot(data.l, opts.color, group, opts);
		if (data.p.length)
			_G.scatterPlot(data.p, opts.color, group, opts);
		if (data.f.length)
			_G.trianglePlot(data.f, opts.color, group, opts);
		
		(opts.overlay? this.sceneOverlay: this.scene).add(group);
		return group;
	};
		
	// TODO accept many args, add Graph.box from formatData
	adaptAxes = function(data) {
		var axes = [[0,0], [0,0], [0,0]];
		for (var i = 0; i < data.length; i++)
			for (var j = 0; j < data[i].length; j++)
				for (var dim = 0; dim < 3; dim++) {
					axes[dim][1] = Math.max(axes[dim][1], data[i][j][dim]);
					axes[dim][0] = Math.min(axes[dim][0], data[i][j][dim]);
				}
		for (var dim = 0; dim < 3; dim++) {
			axes[dim][1] = Math.max(axes[dim][1], 0);
			axes[dim][0] = Math.min(axes[dim][0], 0);
		}
		return axes.map(function(span, dim) {
				var temp = [[0,0,0], [0,0,0]];
				temp[0][dim] = span[0];
				temp[1][dim] = span[1];
				return temp;
			});
	};

	// This one is actually fairly decent
	_G.linePlot = function(points, plotClr, group) {
		var material = new THREE.LineBasicMaterial({color: plotClr}),
		    geometry = new THREE.Geometry();
		for (var i = 0; i < points.length; i++)
			for (var j = 1; j < points[i].length; j++) {
				var pt = points[i][j-1].slice();
				geometry.vertices.push(new THREE.Vector3(pt[1], pt[2], pt[0]));
				pt = points[i][j].slice();
				geometry.vertices.push(new THREE.Vector3(pt[1], pt[2], pt[0]));
			}
		group.add(new THREE.Line(geometry, material, THREE.LinePieces));
	};

	// Sprites don't seem to work here
	_G.scatterPlot = (function() {
		if (renderMode == 'webgl')
			return function (points, plotClr, group, opts) {
				var particles = new THREE.Geometry(),
					plotMaterial = new THREE.ParticleBasicMaterial({
						color: plotClr,
						size: opts.radius,
						transparent: opts.aplha !== 0,
						side: THREE.DoubleSide,
						opacity: 1 - opts.alpha
					});
				//for (var i = 0; i < points.length; i++)
					for (var j = 0; j < points.length; j++) {
						var pt = points[j].slice();
						particles.vertices.push(new THREE.Vector3(pt[1], pt[2], pt[0]));
					}
				group.add(new THREE.ParticleSystem(particles, plotMaterial));
			}
		else
			return function (points, plotClr, group, opts) {
				var plotMaterial = new THREE.SpriteMaterial({
						color: plotClr
					});
				//for (var i = 0; i < points.length; i++)
					for (var j = 0; j < points.length; j++) {
						var pt = points[j].slice(),
							particle = new THREE.Sprite(plotMaterial);
						particle.position.set(pt[1], pt[2], pt[0]);
						group.add(particle);
					}
			}
	}());

	// These two need some work on them definetly
	_G.solidPlot = function(points, plotClr, group, opts) {
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
				surface.vertices.push(new THREE.Vector3(pt[1], pt[2], pt[0]));
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
	
	_G.trianglePlot = function(points, plotClr, group, opts){
		var surface = new THREE.Geometry(),
			surfMaterial = new THREE.MeshBasicMaterial({
				color: plotClr,
				side: THREE.DoubleSide,
				transparent: opts.aplha !== 0, 
				opacity: 1 - opts.alpha
			});
		for (var i = 0; i < points.length; i++) {
			if (points[i].length != 3)
				return
			for (var j = 0; j < 3; j++) {
				var pt = points[i][j].slice();
				surface.vertices.push(new THREE.Vector3(pt[1], pt[2], pt[0]));
			}
			surface.faces.push(new THREE.Face3(i * 3, i * 3 + 1, i * 3 + 2));
		}
		group.add(new THREE.Mesh(surface, surfMaterial));
	};

	// Other types of start / end markers would be good
	_G.arrowPlot = function(points, plotClr, group, opts) {
		var h = .3, w = .05;
		for (var i = 0; i < points.length; i++) {
			var vector = points[i].slice(points[i].length - 2, points[i].length),
				arrow = new THREE.Mesh(new THREE.CylinderGeometry(0, w, h, 3, 1, false), new THREE.MeshBasicMaterial({color: plotClr})),
				dir = new THREE.Vector3(vector[1][1] - vector[0][1], vector[1][2] - vector[0][2], vector[1][0] - vector[0][0]).normalize(),
				up = new THREE.Vector3(0, 1, 0),
				rotNorm = new THREE.Vector3().crossVectors(up, dir).normalize(),
				rotAng = Math.acos(up.dot(dir));
			
			arrow.position = new THREE.Vector3(vector[1][1], vector[1][2], vector[1][0]);
			arrow.translateOnAxis(dir, -h/2);
			arrow.rotateOnAxis(rotNorm, rotAng);
			
			group.add(arrow);
		}
	}
}(this))