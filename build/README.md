# Forms Processor

a complex forms processor build for running in browsers

## License

MIT

## Installation

```bash
npm install forms-processor-browser
```

## Usage

The package contains universally defined modules (UMD) e.g. to be imported using WebPack in your application.

```javascript
import FormsProcessor from "forms-processor-browser";

FormsProcessor.create( someDOMElement, {
	describe: "./url/of/forms/configuration.json",
} );
```

As an alternative you may inject the file **node_modules/forms-processor-browser/FormsProcessor.umd.min.js** into an HTML document using referencing `<script>` tag:

```html
<!DOCTYPE html>
<html>
	<head>...</head>
	<body>
		<div id=form></div>
		<script src="vue/vue.min.js" type="text/javascript"></script>
		<script src="node_modules/forms-processor-browser/FormsProcessor.umd.min.js" type="text/javascript"></script>
	</body>
</html>
```

In either situation VueJS must be included as well. In the latter case VueJS is injected prior to injecting FormsProcessor. In case of WebPack you need to add vue as a devDependency to your project as it gets imported by FormsProcessor internally.
