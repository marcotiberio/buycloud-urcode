/*
	re-add 
*/

// directory where images of Clouds are
var assetDirectory = '/buycloud-urcode/';

var cloudData = data;

var buyClouds = {
	'targetElementId' : 'p5', // Container element id for p5 canvas (now: 'div#p5')
	'backgroundColor' : '#4467A7', // Background color
	'quantity' : 30, // The amount of Clouds to be drawn
	'radius' : 10, // fallback Radius of Clouds
	'velocityScale' : .01, // factor for velocity | default : .01
	'expectedVmax' : 2, 
	'safeareaFactor' : 1.4, // How far the clouds can drift off-screen, before returning to the oppposite side (recommended values between 1.4 and 2.0)
	'hitzoneDisplay' : false, // For debugging: dipslay ellipse geometry [true | false]

	'targetElement' : function(){ return document.getElementById(this.targetElementId) },
	'targetElementDimensions' : function(){ return [this.targetElement().clientWidth, this.targetElement().clientHeight] },
	'Clouds' : [], // Cloud objects
	'newClouds' : [], // temporary array, this is where new Clouds are born

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


	var i = 0;
	while ( i < buyClouds.Clouds.length ) {
		var wolkje_1 = buyClouds.Clouds[i];

		var j = i + 1;
		while ( j < buyClouds.Clouds.length ) {
			var wolkje_2 = buyClouds.Clouds[j];
			var deltaVector = createVector(wolkje_1.location.x - wolkje_2.location.x, wolkje_1.location.y - wolkje_2.location.y );	
			var distance = deltaVector.mag();

			function returnLargest(array) {
				var values = [ array[0].radius, array[1].radius ];
				var value = max(values);
				
				return array[ values.indexOf(value) ];
			}

			if ( distance < (wolkje_1.radius + wolkje_2.radius ) && distance !== 0){

				var newLocation = createVector( (wolkje_1.location.x + wolkje_2.location.x)*0.5, (wolkje_1.location.y + wolkje_2.location.y)*0.5 );
				var newVelocity = createVector( (wolkje_1.velocity.x + wolkje_2.velocity.x)*1, (wolkje_1.velocity.y + wolkje_2.velocity.y)*1 );
				var newRadius = wolkje_1.radius + wolkje_2.radius;

				var largestCloud = returnLargest([ wolkje_1, wolkje_2]);	
				console.log( largestCloud )

				// var location = createVector( largestCloud.x0, largestCloud.y0 );
				var location = newLocation;
				// var velocity = createVector( largestCloud.vx, largestCloud.vy );
				var velocity = newVelocity;

				var image = largestCloud.image; // Load the image (object!)

				// var radius = cloud.radius ? cloud.radius : largestCloud.radius // If undefined, fallback to global default
				var radius = newRadius;
				var t0 = largestCloud.t0; // already set

				var newCloud = new Cloud( location, velocity, radius, image, t0 );
				buyClouds.newClouds.push( newCloud );

				buyClouds.Clouds.splice(j, 1);
				buyClouds.Clouds.splice(i, 1);
			}

			j++;
		}
		
		i++;
	}

	buyClouds.newClouds.map( newCloud => {
		buyClouds.Clouds.push(newCloud);
	})
	buyClouds.newClouds = [];

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
		this.image = imageObj;
		this.t0 = t0;

		var newLocation = createVector();
		var safearea = buyClouds.safeareaFactor * radius;


		this.update = function() {
			var age = (buyClouds.date + millis()) * buyClouds.velocityScale;

			// from example
			// newLocation.x = ( location.x + velocity.x * age ) % width;
			// newLocation.y = ( location.y + velocity.y * age ) % height;

			// version with safe area for images
			newLocation.x = ( -safearea + location.x + velocity.x * age ) % (width + safearea);
			newLocation.y = ( -safearea + location.y + velocity.y * age ) % (height + safearea);
			
			this.location = newLocation;
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
