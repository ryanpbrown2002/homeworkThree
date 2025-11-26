// modules/router.js
const path = require('path');

/**
 * Custom Routing Module
 * Handles URL routing for the application
 */

class Router {
    // Initialize routes array
    constructor() {
        this.routes = [];
    }

    // Add a GET route
    get(path, handler) {
        this.routes.push({ path, method: 'GET', handler});
    }

    // Add a POST route
    post(path, handler) {
        this.routes.push({ path, method: 'POST', handler});
    }

    handle(req, res) {
        const route = this.routes.find(
            r => r.path === req.url && r.method === req.method);
        if (route) {
            route.handler(req, res);
        } else {
            res.statusCode = 404;
            res.end('Not Found');
        }
    }

    middleware() {
        return (req, res) => {
            this.handle(req, res);
        }
    }

    handle404(req, res) {
        res.status(404).send('Not Found');
    }
}

module.exports = Router;