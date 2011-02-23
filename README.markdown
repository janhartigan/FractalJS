# FractalJS

FractalJS is a jQuery plugin that lets you convert any canvas element into a navigable fractal rendering. 

<hr />

## example

Starting with a simple canvas that has a width and height declared:

<pre>
&gt;canvas id="mycanvas" width="300" height="300"&lt;&gt;/canvas&lt;
</pre>

To initialize the plugin, you run this code:

<pre>
$('#mycanvas').fractaljs();
</pre>

<em>For a full list of options and callback methods, see below</em>.

This simple code will create a rendering of the Mandelbrot set and add "zoom in" and "zoom out" buttons. If you supply width and height values into the options, the canvas's width and height will be overridden by them. The rendered canvas will look something like this:

<img src="https://github.com/janhartigan/FractalJS/raw/master/example/mandelbrot300x300_50maxit_minzoom.png" />

If you want to do something after the fractal is rendered, you have access to an afterDraw() method that is fired on completion of the drawing. The zoom object (which contains width, height, x, and y information for the rendered set) is passed as a parameter to this function.

## options

These are the settings and callback functions available for the plugin:

<pre>
{	
	/* Determines whether or not to draw the control bar below the fractal's canvas.
	 * If you choose not to use this, you could use the afterDraw callback to display 
	 * the fractal data to your users, and you should also make use of the zoomButton 
	 * options to let your users perform actions on the fractal.
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
}
</pre>