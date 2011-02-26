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
		
		/* The jQuery object representing the canvas element for this fractal
		 * 
		 * @type jQuery Object
		 */
		$canvas: null,
		
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
			width: 3,
			height: 3
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
			 * make use of the zoomButton options to let your users perform actions on the fractal.
			 * 
			 * @type Bool
			 */
			useControlBar: true,
			
			/* The maximum number of iterations to perform the operation before assuming a point to be in the set
			 * In an ideal world, we'd set this as high as possible, but since we have limited resources, we have to choose some limit
			 * 
			 * @type Int
			 */
			maxIterations: 300,
			
			/* The color range multiplier. This number represents the number of times the color spectrum repeats itself.
			 * 
			 * @type Int
			 */
			colorRangeRepeats: 7,
			
			/* If this is not 0 (i.e. if it has been set as an option), it will be the new width of the canvas
			 * 
			 * @type Int
			 */
			width: 0,
			
			/* If this is not 0 (i.e. if it has been set as an option), it will be the new height of the canvas
			 * 
			 * @type Int
			 */
			height: 0,
			
			/**
			 * This callback fires after the fractal has been drawn
			 * 
			 * @param Object	zoom ==> {x, y, width, height}
			 */
			afterDraw: function(zoom) {}
		},
		
		
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
		init: function (canvas, options) {
			var self = this;
			
			if (!canvas.getContext)
				return false;
			
			//if options were supplied, overwrite the default options
			if (options)
				$.extend(this.options, options);
			
			this.canvas = canvas;
			this.$canvas = $(canvas);
			this.ctx = canvas.getContext('2d');
			
			//check if the width and height options have been set
			if (this.options.width)
				this.$canvas.attr('width', this.options.width);
			if (this.options.height)
				this.$canvas.attr('height', this.options.height);
			
			this.width = canvas.width;
			this.height = canvas.height;
			
			//draw the fractal
			this.drawFractal();
			
			//set up the control bar if the option useControlBar is set to true
			if (this.options.useControlBar)
				this.buildControlBar();
			
			//set up the callback for when the canvas is clicked (to center the image on the click)
			this.$canvas.click(function(e) {
				var o = $(this).offset(),
					x = e.pageX - o.left,
					y = e.pageY - o.top,
					c = self.convertPixelToPoint(x, y);
				
				self.zoom.x = c.real - (self.zoom.width / 2);
				self.zoom.y = c.imaginary + (self.zoom.height / 2);
				self.drawFractal();
			});
			
			return true;
		},
		
		/**
		 * Sets up the image data object to match the current width and height of the canvas
		 */
		establishImageData: function() {
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
				overIterated = false,
				iterationDivider = this.options.maxIterations / this.options.colorRangeRepeats,
				origZoomHeight = this.zoom.height;
			
			this.width = this.canvas.width;
			this.height = this.canvas.height;
			this.establishImageData();
			
			//adjust the zoom settings to accommodate non-square canvases
			this.zoom.height = this.zoom.width * (this.height/this.width);
			this.zoom.y = this.zoom.y - (origZoomHeight - this.zoom.height)/2;
			
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
						colors = this.rainbowColor((i - itminus) / iterationDivider);
						
						this.image.data[pixel] = colors.r;
						this.image.data[pixel+1] = colors.g;
						this.image.data[pixel+2] = colors.b;
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
					cols.b = 255 - 5; break;
			}
			
			return cols;
		},
		
		/**
		 * Builds the control bar below the canvas
		 */
		buildControlBar: function() {
			var html = 	'<div class="fractaljs-control-bar" style="width:' + this.width + 'px">' +
							'<input type="button" name="zoomin" value="zoom in" />' +
							'<input type="button" name="zoomout" value="zoom out" />' +
						'</div>',
				$bar,
				self = this;
			
			this.$canvas.after(html);
			$bar = this.$canvas.next('.fractaljs-control-bar');
			
			//set up event handlers
			$bar.find('input[name=zoomin]').click(function() {
				self.zoom.x += self.zoom.width / 4;
				self.zoom.y -= self.zoom.height / 4;
				self.zoom.width /= 2;
				self.zoom.height /= 2;
				
				self.drawFractal();
			});
			
			$bar.find('input[name=zoomout]').click(function() {
				self.zoom.x -= self.zoom.width / 2;
				self.zoom.y += self.zoom.height / 2;
				self.zoom.width *= 2;
				self.zoom.height *= 2;
				
				self.drawFractal();
			});
		},
		
		/**
		 * Destroys all traces of the fractal object
		 */
		destroy: function() {
			this.ctx.clearRect(0, 0, this.width, this.height);
		}
	};
	
	/**
	 * This private function takes a canvas and checks if there are any existing fractal objects associated with it
	 * 
	 * @param DOMElement	canvas
	 * 
	 * @return mixed		false / fractal object
	 */
	function fractalExists(canvas) {
		var result = false;
		
		$.each(fractals, function(ind, el) {
			if (canvas == this.canvas) {
				result = this;
				return false;
			}
		});
		
		return result;
	}
	
	//extend the jQuery object 
	$.fn.fractaljs = function(options) {
		return this.each(function() {
			var canvas = this,
				existingFractal = false;
			
			if (this.nodeName != "CANVAS")
				return true;
			
			existingFractal = fractalExists(canvas);
			
			if (existingFractal) {
				existingFractal.drawFractal();
				return true;
			}
			
			var newFract = new fractal(this, options);
			
			if (newFract)
				fractals.push(newFract);
		});
	};
	
	/**
	 * this function gets the fractal object associated with the canvas item
	 */
	$.fn.fractaljsObject = function() {
		var obj = false;
		
		this.each(function() {
			var canv = this;
			
			$.each(fractals, function() {
				if (canv == this.canvas) {
					obj = this;
					return false;
				}
			});
		});
		
		return obj;
	};
	
	/**
	 * this function destroys the fractal object related to the supplied canvas
	 */
	$.fn.destroyFractalJS = function() {
		return this.each(function() {
			var canv = this;
			
			$.each(fractals, function(ind, el) {
				if (canv == this.canvas) {
					this.destroy();
					fractals.splice(ind, 1);
					return false;
				}
			});
		}); 
	};
})(jQuery);