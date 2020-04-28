//basic code taken from http://tobyho.com/2012/07/27/taking-over-console-log/
(function custom_console_with_traces() {
    var console = window.console;
    if (!console) return;
    function intercept(method) {
        var original = console[method];
        console[method] = function () {
            var message = Array.prototype.slice.apply(arguments).join(' ');

            //==========================================================
            //Make sure timestamp pattern here matches timestamp pattern in e2e/testcafe/utilities/loggers/testLogger.ts file
            var timestamp = `${new Date().toISOString()} |`;
            //make sure we still call the original method
            original.call(console, `${timestamp}\t\t[BROWSER LOG]::[${method !== 'error' ? method : method.toUpperCase()}] ${message}`);
        };
    }
    //intercept all methods including trace
    var methods = ['log', 'info', 'warn', 'error', 'trace'];
    for (var i = 0; i < methods.length; i++) intercept(methods[i]);
})();
