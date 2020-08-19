/*
	re-add 
*/

// directory where images of Clouds are
var assetDirectory = 'img/';

var cloudData = data;

var buyClouds = {
	'targetElementId' : 'p5', // Container element id for p5 canvas (now: 'div#p5')
	'backgroundColor' : '#4467A7', // Background color
	'quantity' : 30, // The amount of Clouds to be drawn
	'radius' : 10, // fallback Radius of Clouds
	'velocityScale' : .3, // Max. initial velocity (px/frame)
	'expectedVmax' : 2, 
	'safeareaFactor' : 1.4, // How far the clouds can drift off-screen, before returning to the oppposite side (recommended values between 1.4 and 2.0)
	'hitzoneDisplay' : false, // For debugging: dipslay ellipse geometry [true | false]

	'targetElement' : function(){ return document.getElementById(this.targetElementId) },
	'targetElementDimensions' : function(){ return [this.targetElement().clientWidth, this.targetElement().clientHeight] },
	'Clouds' : [], // Cloud objects

	'date' : new Date().getTime()
};

function setup() {
	createCanvas( buyClouds.targetElementDimensions()[0], buyClouds.targetElementDimensions()[1] ).parent(buyClouds.targetElementId);

	cloudData.map( (cloud, index) => {

		var location = createVector( cloud.x0, cloud.y0 );
		var velocity = createVector( cloud.vx, cloud.vy );

		var path = assetDirectory.concat( cloud.image ); // Get the paths
		var image = loadImage(path); // Load the image

		var radius = cloud.radius ? cloud.radius : buyClouds.radius // If undefined, fallback to global default
		var t0 = cloud.t0; // already set

		var newCloud = new Cloud( location, velocity, radius, image, t0 );

		buyClouds.Clouds.push( newCloud );
	})

}

function draw() {
	background( buyClouds.backgroundColor);

	buyClouds.Clouds.map( cloud => {
		cloud.update();
		cloud.display();
	})
}

function windowResized() {
	resizeCanvas( buyClouds.targetElementDimensions()[0], buyClouds.targetElementDimensions()[1] );
}


class Cloud {
	constructor( location, velocity, radius, imageObj, t0 ) {
		// location : 2d vector
		// velocity : 2d vector
		// radius : int
		// image : imageObject
		// t0 : unicode time value ?????

		this.location = location; // x0, y0
		this.velocity = velocity;
		this.radius = radius;

		var newLocation = createVector();
		var safearea = buyClouds.safeareaFactor * radius;


		this.update = function() {
			var age = (buyClouds.date + millis()) / 100;

			// from example
			// newLocation.x = ( location.x + velocity.x * age ) % width;
			// newLocation.y = ( location.y + velocity.y * age ) % height;

			// version with safe area for images
			newLocation.x = ( -safearea + location.x + velocity.x * age ) % (width + safearea);
			newLocation.y = ( -safearea + location.y + velocity.y * age ) % (height + safearea);
			

		}

		this.display = function() {
			// load the image
			var imgWidth = imageObj.width / 300 * radius;
			var imgHeight = imageObj.height / 300 * radius;

			// show the image
			image( imageObj, newLocation.x - imgWidth/2, newLocation.y - imgHeight/2, imgWidth, imgHeight);

			// show the ellipse 'hitzone' for debugging
			if ( buyClouds.hitzoneDisplay === true ) {
				fill(128);
				ellipse(newLocation.x, newLocation.y, radius, radius)
			};
		}
	}
}
