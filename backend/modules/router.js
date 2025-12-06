// modules/router.js
const path = require('path');

// Routing module class
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
        // Try to find a matching route
        for (const route of this.routes) {
            if (route.method !== req.method) {
                continue;
            }
            
            // Check for exact match
            if (route.path === req.url) {
                route.handler(req, res);
                return;
            }
        }
        
        // No route found
        res.statusCode = 404;
        res.end('Not Found');
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