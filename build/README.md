# Forms Processor

a complex forms processor build for running in browsers

## License

MIT

## Installation

```bash
npm install forms-processor-build
```

## Usage

The package contains universally defined modules (UMD) e.g. to be imported using WebPack in your application.

```javascript
import FormsProcessor from "forms-processor-build";

FormsProcessor.create( someDOMElement, {
	describe: "./url/of/forms/configuration.json",
} );
```

As an alternative you may inject the file **node_modules/forms-processor-build/FormsProcessor.umd.min.js** into an HTML document using referencing `<script>` tag:

```html
<!DOCTYPE html>
<html>
	<head>...</head>
	<body>
		<div id=form></div>
		<script src="vue/vue.min.js" type="text/javascript"></script>
		<script src="node_modules/forms-processor-build/FormsProcessor.umd.min.js" type="text/javascript"></script>
	</body>
</html>
```

This files requires you to 
