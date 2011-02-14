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
			afterDraw: function(zoom, duration) {}
		}
		
		
		//
		// Methods of the fractal object
		//
		
		/**
		 * The init function where we set the scene
		 * 
		 * @param domElement	canvas
		 * @param Object		options
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
			
		}
	};
	
	//extend the jQuery object 
	$.fn.fractaljs = function(options) {
		return this.each(function() {
			fractals.push(new filePicker(this, options));
		});
	};
})();