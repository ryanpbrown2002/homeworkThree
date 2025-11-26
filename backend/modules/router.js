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
        // Try to find a matching route
        for (const route of this.routes) {
            if (route.method !== req.method) {
                continue;
            }
            
            // Check for exact match first
            if (route.path === req.url) {
                route.handler(req, res);
                return;
            }
            
            // Check for parameterized routes (e.g., /pdf/:filename)
            const match = this.matchRoute(route.path, req.url);
            if (match) {
                // Add params to request object
                req.params = match.params;
                route.handler(req, res);
                return;
            }
        }
        
        // No route found
        res.statusCode = 404;
        res.end('Not Found');
    }
    
    /**
     * Matches a route pattern with a URL and extracts parameters
     * @param {string} pattern - Route pattern (e.g., '/pdf/:filename')
     * @param {string} url - Request URL (e.g., '/pdf/Assignment2.pdf')
     * @returns {object|null} - Match object with params, or null if no match
     */
    matchRoute(pattern, url) {
        // Split pattern and URL into segments
        const patternParts = pattern.split('/');
        const urlParts = url.split('?')[0].split('/'); // Remove query string
        
        // Must have same number of parts
        if (patternParts.length !== urlParts.length) {
            return null;
        }
        
        const params = {};
        
        // Check each segment
        for (let i = 0; i < patternParts.length; i++) {
            const patternPart = patternParts[i];
            const urlPart = urlParts[i];
            
            // If it's a parameter (starts with :)
            if (patternPart.startsWith(':')) {
                const paramName = patternPart.slice(1); // Remove the :
                params[paramName] = urlPart;
            } else if (patternPart !== urlPart) {
                // If it's not a parameter and doesn't match, no match
                return null;
            }
        }
        
        return { params };
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