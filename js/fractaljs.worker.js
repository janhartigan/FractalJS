self.onmessage = function(e) {
	var data = e.data,
		z0 = new ComplexNumber(0,0),
		z = z0,
		x,
		y = data.row,
		pixel = 0,
		itminus,
		colors,
		overIterated = false,
		iterationDivider = data.maxIterations / data.colorRangeRepeats,
		imageData = [];
	
	//start iterating over the pixels in the row
	for (x = 0; x < data.width; x++) {
		z = z0;
		c = convertPixelToPoint(x, y, data.zoom, data.width, data.height);
		i = 0;
		overIterated = false;
		
		while (z.mod() < data.escapeValue && !overIterated) {
			z = z.mult(z).add(c);
			i++;
			
			if (i > data.maxIterations) {
				//if z.mod() is still less than escapeValue and we're past our maxIterations counter, assume the point is in the set
				//and color the pixel black
				i = 0;
				imageData[pixel] = 0;
				imageData[pixel+1] = 0;
				imageData[pixel+2] = 0;
				imageData[pixel+3] = 255;
				pixel += 4;
				
				overIterated = true;
			}
		}
		
		if (!overIterated) {
			//if the point is outside of the set, color it
			itminus = (Math.log(
							Math.log(
								Math.sqrt(
									Math.pow(z.real, 2) + Math.pow(z.imaginary, 2)
								)
							) / Math.log(2)
						) / Math.log(2)
					);
			colors = rainbowColor((i - itminus) / iterationDivider);
			
			imageData[pixel] = colors.r;
			imageData[pixel+1] = colors.g;
			imageData[pixel+2] = colors.b;
			imageData[pixel+3] = 255;
			pixel += 4;
		}
	}
	
	data.imageData = imageData;
	
	self.postMessage(data);
}


/**
 * The complex number class allows us to do complex math. It accepts a real and imaginary part
 * 
 * @param Object	real
 * @param Object	imaginary
 */
function ComplexNumber(real,imaginary) {
	this.real = real;
	this.imaginary = imaginary;
}

//Then we make the prototype object for the class so we can perform actions on complex numbers (like multiplication, addition, etc.)
ComplexNumber.prototype = {
	/* The real part of the complex number
	 * 
	 * @type Number
	 */
	real: 0,
	
	/* The imaginary part of the complex number
	 * 
	 * @type Number
	 */
	imaginary: 0,
	
	/**
	 * The add operation which sums the real and complex parts separately
	 * 
	 * @param ==> 	If there is one argument, assume it's a ComplexNumber
	 * 				If there are two arguments, assume the first is the real part and the second is the imaginary part
	 * 
	 * @return ComplexNumber
	 */
	add: function() {
	    if(arguments.length == 1)
	        return new ComplexNumber(this.real + arguments[0].real, this.imaginary + arguments[0].imaginary);
	    else
	        return new ComplexNumber(this.real + arguments[0], this.imaginary + arguments[1]);
	},
	
	/**
	 * The subtract operation which subtracts the real and complex parts from one another separately
	 * 
	 * @param ==> 	If there is one argument, assume it's a ComplexNumber
	 * 				If there are two arguments, assume the first is the real part and the second is the imaginary part
	 * 
	 * @return ComplexNumber
	 */
	sub: function() {
	    if(arguments.length == 1)
	        return new ComplexNumber(this.real - arguments[0].real, this.imaginary - arguments[0].imaginary);
	    else
	        return new ComplexNumber(this.real - arguments[0], this.imaginary - arguments[1]);
	},
	
	/**
	 * The multiplication operation which multiplies two complex numbers
	 * 
	 * @param ==> 	If there is one argument, assume it's a ComplexNumber
	 * 				If there are two, assume the first is the real part and the second is the imaginary part
	 * 
	 * @return ComplexNumber
	 */
	mult: function() {
	    var multiplier = arguments[0];
		
	    if(arguments.length != 1)
	        multiplier = new ComplexNumber(arguments[0], arguments[1]);
		 
	    return new ComplexNumber(this.real * multiplier.real - this.imaginary * multiplier.imaginary, 
								this.real * multiplier.imaginary + this.imaginary * multiplier.real);
	},
	
	/**
	 * The modulus of a complex number
	 * 
	 * @return number
	 */
	mod: function() {
	    return Math.sqrt(this.real * this.real + this.imaginary * this.imaginary);
	},
	
	/**
	 * The string representation of a complex number (i.e. 4 + 3i)
	 * 
	 * @return String
	 */
	toString: function() {
	    return this.real + "+" + this.imaginary + "i";
	}
};


/**
 * Converts a pixel on the screen to a complex number point that it represents on the complex plane
 * 
 * @param Int	x
 * @param Int	y
 */
function convertPixelToPoint(x, y, zoom, width, height) {
	var stepx = zoom.width / (width * 1.0),
		stepy = zoom.height / (height * 1.0);
		
	return new ComplexNumber(zoom.x + x * stepx, zoom.y - y * stepy);
}

/**
 * Takes a number and assigns an r, g, and b value to it
 * 
 * @param Number	position
 * 
 * @return Object	{r, g, b}
 */
function rainbowColor(position) {
	var cols = [],
		nbars = 6, //number of color bars
		positionInt = parseInt(position);
		positionFrac = position-positionInt;
		m = nbars * positionFrac,
		n = parseInt(m), //integer portion of m
		f = m - n, //fraction portion of m
		t = parseInt(f * 255);
	
	switch(n) {
		case 0:
			cols.r = 255;
			cols.g = t;
			cols.b = 0; break;
		case 1:
			cols.r = 255 - t;
			cols.g = 255;
			cols.b = 0; break
		case 2:
			cols.r = 0;
			cols.g = 255;
			cols.b = t; break;
		case 3:
			cols.r = 0;
			cols.g = 255 - t;
			cols.b = 255; break;
		case 4:
			cols.r = t;
			cols.g = 0;
			cols.b = 255; break;
		case 5:
			cols.r = 255;
			cols.g = 0;
			cols.b = 255 - t; break;
	}
	
	return cols;
}