const fetch = require("node-fetch");

module.exports = {
    /**
     * 
     * @param {String} url URL to fetch
     * @param {Object} opt Object [headers, method etc..]
     */


    handle: function(url, opt) {
        if (opt) {
            return fetch(url, opt)
                .then(res => res.json())
        } else {
            return fetch(url)
                .then(res => res.json())
        }
    }
};