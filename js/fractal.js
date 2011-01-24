/**
 * Complex number class constructor 
 * @param {Object} real
 * @param {Object} imaginary
 */

function ComplexNumber(real,imaginary) {
    this.real = real;
    this.imaginary = imaginary;
}

//ComplexNumber prototype creation
ComplexNumber.prototype = {
	/* The real part of the complex number
	 * number
	 */
	real: 0,
	
	/* The imaginary part of the complex number
	 * number
	 */
	imaginary: 0,
	
	/**
	 * The add operation which sums the real and complex parts separately
	 * 
	 * @param ==> If there is one argument, assume it's a ComplexNumber, if there are two, assume the first is the real part and the second is the
	 * imaginary part
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
	 * @param ==> If there is one argument, assume it's a ComplexNumber, if there are two, assume the first is the real part and the second is the
	 * imaginary part
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
	 * @param ==> If there is one argument, assume it's a ComplexNumber, if there are two, assume the first is the real part and the second is the
	 * imaginary part
	 * 
	 * @return ComplexNumber
	 */
	mult: function() {
	    var multiplier = arguments[0];
		
	    if(arguments.length != 1)
	        multiplier = new ComplexNumber(arguments[0], arguments[1]);
		 
	    return new ComplexNumber(this.real * multiplier.real - this.imaginary * multiplier.imaginary, 
								this.real*multiplier.imaginary + this.imaginary*multiplier.real);
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





/**
 * Fractal 
 */

var canvas;
var ctx;
var w;
var h;
var img;

var dataset = [];
var maxIterations = 50;
var maxColorVal = 255; //0->255 is 256 colors

//init

$(document).ready(function() {
    init();
});

function init() {
    if ($('#mycanvas')[0].getContext) {
        canvas = $('#mycanvas')[0];
        ctx = canvas.getContext('2d');
        w = canvas.width;
        h = canvas.height;
        
        if (ctx.createImageData) {
            img = ctx.createImageData(w, h);
        } else if (ctx.getImageData) {
            img = ctx.getImageData(0, 0, w, h);
        } else {
            img = {    'width' : w, 
                    'height' : h,
                    'data' : new Array(w*h*4)
            };
        }
        
        $('#maxits').val(maxIterations);
        
        draw();
        
        $('#clear_button').click(function () {
            ctx.fillStyle = 'rgba(255, 255, 255, 1)';
            ctx.fillRect(0, 0, w, h);
        });
        $('#refill_button').click(function () {
            drawMandelbrotFromData();
        });
        $('#zoomin_button').click(function () {
            zoom.x += zoom.w/4;
            zoom.y -= zoom.h/4;
            zoom.w /= 2;
            zoom.h /= 2;
            
            drawMandelbrot();
        });
        $('#zoomout_button').click(function () {
            zoom.x -= zoom.w/2;
            zoom.y += zoom.h/2;
            zoom.w *= 2;
            zoom.h *= 2;
            drawMandelbrot();
        });
        $('#mycanvas').click(function(e) {
            var o = $(this).offset(),
                x = (e.pageX - o.left),
                y = (e.pageY - o.top),
                c = convertPixelToPoint(x, y);
            
            zoom.x = c.real - zoom.w/2;
            zoom.y = c.imaginary + zoom.h/2;
            drawMandelbrot();
        });
    } else {
        alert("You need to stop using such a terrible browser");
    }
}

function draw() {
    drawMandelbrot();
}

var zoom = {
    x: -2.3,
    y: 1.5,
    w: 3,
    h: 3
};

function convertPixelToPoint(x, y){
    var stepx = zoom.w / (w*1.0);
    var stepy = zoom.h / (h*1.0);
    return new ComplexNumber(zoom.x+x*stepx, zoom.y-y*stepy);
}

function drawMandelbrot() {
    var z0 = new ComplexNumber(0,0),
        pixel = 0;
    
    maxIterations = parseInt($('#maxits').val());
    
    $('#message').text(maxIterations);
    
    for (var y = 0; y < canvas.height; y++ ) {
        for ( var x = 0; x < canvas.width; x++ ) {
            var z = z0;
            var c = convertPixelToPoint(x, y);
            var i = 0;
            var inSet = false;
            
            while (z.modSquared() < 4) {c
                z = z.mult(z).add(c);
                i++;
                
                if (i > maxIterations) {
                    i = 0;
                    dataset[(x+1)+(y*w)] = {inset: true}
                    inSet = true;
                    break;
                }
            }
            
            if (!inSet) {
                dataset[(x+1)+(y*w)] = {
                        inset: false,
                        real: z.real,
                        imaginary: z.imaginary,
                        completedIterations: i,
                        maxIterations: maxIterations
                }
            }
        }
    }
    
    drawMandelbrotFromData();
}

/*
 * draws a mandelbrot set from an array of complex plane points and final iteration values
 */
function drawMandelbrotFromData() {
    var totalPixels = w*h;
    var pixel = 0;
    
    for (var i = 1; i <= totalPixels; i++) {
        if (dataset[i].inset) {
            img.data[pixel] = 0;
            img.data[pixel+1] = 0;
            img.data[pixel+2] = 0;
            img.data[pixel+3] = 255;
            pixel += 4;
        } else {
            var itminus = (Math.log(Math.log(Math.sqrt(Math.pow(dataset[i].real, 2) + Math.pow(dataset[i].imaginary, 2)))/Math.log(2))/Math.log(2));
            var colors = rainbowColor((dataset[i].completedIterations - itminus)/dataset[i].maxIterations);
            
            img.data[pixel] = colors['r'];
            img.data[pixel+1] = colors['g'];
            img.data[pixel+2] = colors['b'];
            img.data[pixel+3] = 255;
            pixel += 4;
        }
    }
    
    ctx.putImageData(img, 0, 0);
}

/*
 * returns a color that is smoother along the interval
 * 
 * @param number    position
 * 
 * @return array    ['r', 'g', 'b']
 */
function rainbowColor(position) {
    var cols = [],
        nbars = 6, //number of color bars
        m = nbars * position,
        n = parseInt(m), //integer portion of m
        f = m - n, //fraction portion of m
        t = parseInt(f * 255);
    
    switch (n) {
        case 0:
            cols['r'] = 255;
            cols['g'] = t;
            cols['b'] = 0; break;
        case 1:
            cols['r'] = 255 - t;
            cols['g'] = 255;
            cols['b'] = 0; break;
        case 2:
            cols['r'] = 0;
            cols['g'] = 255;
            cols['b'] = t; break;
        case 3:
            cols['r'] = 0;
            cols['g'] = 255 - 5;
            cols['b'] = 255; break;
        case 4:
            cols['r'] = t;
            cols['g'] = 0;
            cols['b'] = 255; break;
        case 5:
            cols['r'] = 255;
            cols['g'] = 0;
            cols['b'] = 255 - t; break;
    }
    
    return cols;
}