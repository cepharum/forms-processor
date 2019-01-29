const path = require( "path" );
module.exports = {
	"Standard Image Upload": function( browser ) {
		browser
			.url( process.env.VUE_DEV_SERVER_URL + "#image-upload/example.json" )
			.pause( 1000 )
			.assert.elementPresent( ".nname-field1 span.upload input[type=file]", "input field1 is present" )
			.assert.elementNotPresent( ".nname-field1 span.upload .dropContainer", "dropContainer field1 is not present" )
			.setValue( ".nname-field1 span.upload input[type=file]", path.resolve( __dirname + "/../../../src/media/favicon.png" ) )
			.assert.elementPresent( ".nname-field1 span.upload .preview", "preview is shown" )
			.assert.cssClassPresent( ".nname-field1 span.upload .preview", "foreground", "previewMode is foreground" )
			.assert.elementPresent( ".nname-field1 span.upload .preview img", "image is in foreground" )
			.pause( 1000 )
			.assert.elementPresent( ".nname-field2 span.upload input[type=file]", "input field2 is present" )
			.assert.elementNotPresent( ".nname-field2 span.upload .dropContainer", "dropContainer field2 is not present" )
			.setValue( ".nname-field2 span.upload input[type=file]", path.resolve( __dirname + "/image-upload.js" ) )
			.assert.elementPresent( ".nname-field2 span.error", "error is shown" )
			.assert.elementPresent( ".nname-field3 span.upload input[type=file]", "input field3 is present" )
			.assert.elementNotPresent( ".nname-field3 span.upload .dropContainer", "dropContainer field3 is not present" )
			.setValue( ".nname-field3 span.upload input[type=file]", path.resolve( __dirname + "/../../../src/media/favicon.png" ) )
			.assert.cssClassPresent( ".nname-field3 span.upload .preview", "background", "previewMode is background" )
			.assert.elementPresent( ".nname-field1 span.upload .preview img", "image is not in foreground" )
			.click( ".nname-field3 span.upload div.files span.preview span.button" )
			.assert.elementNotPresent( ".nname-field3 span.upload div.files span.preview", "deleting a file" )
			.assert.elementNotPresent( ".nname-field4 span.upload input[type=file]", "input field4 is not present" )
			.assert.elementPresent( ".nname-field4 span.upload .dropContainer", "dropContainer field4 is present" )
			.end();
	}
};