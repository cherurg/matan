var launchPlotter = function(__ACTIONS__) {
	$LAB
		.script('js/three.min.js')
		.script('js/stats.min.js')
		.script('js/Detector.js')
		.script('js/controls/OrbitControls.js')
		.script('js/parser.js').wait()
		.script('js/UI.js')
		.script('js/Functions.js')
		.script('js/FunctionCalculator.js')
		.script('js/SurfacePlotter.js')
		//.script('http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML')
		.wait(__ACTIONS__);
}