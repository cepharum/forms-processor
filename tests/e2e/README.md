# E2E Testing

## How To Run Single Suite?

1. Start the server so there is an up-to-date version of application available for developing and testing.

   This will expose the running application for use in web browser under some URL like this one: http://localhost:8080 ... use this URL in the following command.

2. Open terminal/CLI and invoke the following command:

   `cross-env NODE_ENV=development vue-cli-service test:e2e --url=http://localhost:8080 tests\e2e\specs\image-upload.js`
   
   * The provided URL is the one offered by server started before.
   * By setting environment variable NODE_ENV the browser running test suite is visible.
   * The last argument is the relative path name of file in tests/e2e containing the suite to be tested individually.
