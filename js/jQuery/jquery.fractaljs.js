/** jQuery FractalJS plugin
 * 
 * This is a jQuery plugin that takes a canvas and turns it into a fractal drawer
 * 
 * @author Jan Hartigan
 * @version 0.1.0 (2011-02-13)
 */
(function($) {
	
	//First we set up the ComplexNumber class
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
		 * The square of the modulus of a complex number
		 * 
		 * @return number
		 */
		modSquared: function() {
		    return this.real * this.real + this.imaginary * this.imaginary;
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
	
	
	/* An array in which we will store all instances of our fractal object
	 * 
	 * @type Array
	 */
	var fractals = [];
	
	
	/**
	 * the fractal object is a function whose constructor accepts a canvas element and an options array
	 * 
	 * @param domElement	canvas
	 */
	function fractal(canvas, options) {
		return this.init(canvas, options);
	}
	
	//now create the fractal prototype
	fractal.prototype = {
		
		//
		// Properties of the fractal object
		//
		
		/* The canvas element for this fractal
		 * 
		 * @type domElement
		 */
		canvas: null,
		
		/* The canvas element's 2d drawing context for this fractal
		 * 
		 * @type context
		 */
		ctx: null,
		
		/* The width of the canvas element
		 * 
		 * @type Int
		 */
		width: 0,
		
		/* The height of the canvas element
		 * 
		 * @type Int
		 */
		height: 0,
		
		/* The current zoom object containing x, y, width, and height properties
		 * 
		 * @type Object
		 */
		zoom: {
			x: -2.3,
			y: 1.5,
			w: 3,
			h: 3
		},
		
		/* The pixel-for-pixel image data in the current rendering of the canvas
		 * 
		 * @type ImageData
		 */
		image: null,
		
		/* The options object holds all the customizable properties of the fractal
		 * 
		 * @type Object
		 */
		options: {
			
			/* Determines whether or not to draw the control bar below the fractal's canvas.
			 * If you choose not to use this, you could use the afterDraw callback to display the fractal data to your users, and you should also
			 * make use of the zoom buttons options to let your users perform actions on the fractal.
			 * 
			 * @type Bool
			 */
			useControlBar: true,
			
			/* The maximum number of iterations to perform the operation before assuming a point to be in the set
			 * In an ideal world, we'd set this as high as possible, but since we have limited resources, we have to choose some limit
			 * 
			 * @type Int
			 */
			maxIterations: 50,
			
			/**
			 * This callback fires after the fractal has been drawn
			 * 
			 * @param Object	zoom ==> {x, y, width, height}
			 * @param Int		duration
			 */
			afterDraw: function(zoom) {}
		}
		
		
		//
		// Methods of the fractal object
		//
		
		/**
		 * The init function where we set the scene
		 * 
		 * @param domElement	canvas
		 * @param Object		options
		 * 
		 * @return Bool
		 */
		function init(canvas, options) {
			var self = this;
			
			if (!canvas.getContext)
				return false;
			
			//if options were supplied, overwrite the default options
			if (options)
				$.extend(this.options, options);
			
			this.canvas = canvas;
			this.ctx = canvas.getContext('2d');
			this.width = canvas.width;
			this.height = canvas.height;
			
			//set up the image data for the canvas
			if (this.ctx.createImageData)
				this.image = this.ctx.createImageData(this.width, this.height);
			else if (this.ctx.getImageData)
				this.image = this.ctx.getImageData(0, 0, this.width, this.height);
			else {
				this.image = {
					'width' : this.width,
					'height' : this.height,
					'data' : new Array(this.width * this.height * 4)
				};
			}
			
			this.drawFractal();
			
			return true;
		},
		
		/**
		 * Calculates the ImageData for the canvas as it iterates over each pixel to determine if it is inside or outside of the set,
		 * and if it is outside the set, how quickly we determined if it ran off to infinity 
		 */
		drawFractal: function() {
			var z0 = new ComplexNumber(0,0),
				z = z0,
				c,
				i,
				pixel = 0,
				y,
				x,
				itminus,
				colors,
				overIterated = false;
			
			//for each vertical row in the canvas
			for (y = 0; y < this.height; y++) {
				//for each horizontal pixel in the row
				for (x = 0; x < this.width; x++) {
					z = z0;
					c = this.convertPixelToPoint(x, y);
					i = 0;
					overIterated = false;
					
					while (z.modSquared() < 4 && !overIterated) {
						z = z.mult(z).add(c);
						i++;
						
						if (i > this.options.maxIterations) {
							//if z.modSquared() is still less than 4 and we're past our maxIterations counter, assume the point is in the set
							//and color the pixel black
							i = 0;
							this.image.data[pixel] = 0;
							this.image.data[pixel+1] = 0;
							this.image.data[pixel+2] = 0;
							this.image.data[pixel+3] = 255;
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
						colors = this.rainbowColor((i - itminus) / this.options.maxIterations);
						
						this.image.data[pixel] = colors.r;
						this.image.data[pixel+1] = 0;
						this.image.data[pixel+2] = 0;
						this.image.data[pixel+3] = 255;
						pixel += 4;
					}
				}
			}
			
			//put the image data into the canvas (i.e. render it)
			this.ctx.putImageData(this.image, 0, 0);
			
			//call the afterDraw callback
			this.options.afterDraw.call(this.$canvas, this.zoom);
		},
		
		/**
		 * Converts a pixel on the screen to a complex number point that it represents on the complex plane
		 * 
		 * @param Int	x
		 * @param Int	y
		 */
		convertPixelToPoint: function(x, y) {
			var stepx = this.zoom.width / (this.width * 1.0),
				stepy = this.zoom.height / (this.height * 1.0);
				
			return new ComplexNumber(this.zoom.x + x * stepx, this.zoom.y - y * stepy);
		},
		
		/**
		 * Takes a number and assigns an r, g, and b value to it
		 * 
		 * @param Number	position
		 * 
		 * @return Object	{r, g, b}
		 */
		rainbowColor: function(position) {
			var cols = [],
				nbars = 6, //number of color bars
				m = nbars * position,
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
					cols.b = 255 - 5; break;
			}
			
			return cols;
		}
	};
	
	//extend the jQuery object 
	$.fn.fractaljs = function(options) {
		return this.each(function() {
			var newFract = new fractal(this, options);
			
			if (newFract)
				fractals.push(newFract);
		});
	};
})();