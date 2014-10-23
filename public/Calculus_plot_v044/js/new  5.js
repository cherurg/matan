fixP = function(p) {
	return function(x) {return Math.sin(x) / Math.pow(x, p);}
}
func = fixP(.3);
intValue = function(A) {return trapz(func, 1, A);}