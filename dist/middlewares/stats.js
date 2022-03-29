"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRouteGeoIP = exports.persistGeoIPMiddleware = exports.queryGeoIPMiddleware = void 0;
const request_1 = __importDefault(require("../utils/request"));
const sequelize_1 = require("../utils/sequelize");
const webaccess_1 = require("../models/webaccess");
/*
 * IP Stack Request
*/
const ipStackRequest = (ip, accessKey) => {
    // const url = `https://api.ipstack.com/${ip}?access_key=${accessKey}`;
    const queryData = {
        access_key: accessKey
    };
    return new Promise((resolve, reject) => {
        (0, request_1.default)('api.ipstack.com', `/${ip}`, 'GET', queryData)
            .then((result) => {
            // console.log(`Got ip stack GeoIP: ${result}`);
            const geoIp = JSON.parse(result);
            resolve(geoIp);
        }).catch((reason) => {
            console.log(`Cannot perform IP stack request: ${reason}`);
            reject(reason);
        });
    });
};
/*
 * IP Locate Request
*/
const ipLocateRequest = (ip) => {
    // const url = 'https://www.iplocate.io/api/lookup/' + ip;
    return new Promise((resolve, reject) => {
        (0, request_1.default)('www.iplocate.io', `/api/lookup/${ip}`, 'GET', null)
            .then((result) => {
            // console.log(`Got ip stack response: ${result}`);
            const geoIp = JSON.parse(result);
            resolve(geoIp);
        }).catch((reason) => {
            console.log(`Could not perform ip locate request: ${reason}`);
            reject(reason);
        });
    });
};
/**
 * This middleware will enrich the request with GEOIP information if available.
 * @param req The HTTP Request
 * @param res The HTTP Response
 * @param next the next middleware in the ExpressJS chain
 */
const queryGeoIPMiddleware = (req, res, next) => {
    try {
        const forwardIp = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'] : null;
        let forwardIpStr = '';
        if (typeof forwardIp === 'string') {
            forwardIpStr = '' + forwardIp;
        }
        else {
            forwardIpStr = forwardIp !== null ? forwardIp[0] : null;
        }
        let ip = forwardIp === null ? req.socket.remoteAddress : forwardIpStr;
        if ('0000:0000:0000:0000:0000:0000:0000:0001' === ip || '::1' === ip || null === ip) {
            ip = '127.0.0.1';
        }
        //const serviceLimits = await db.getGeoLimitExpiry();
        const serviceLimits = {
            ipstack_limit_expiry: 1543035611,
            iplocate_limit_expiry: 0
        };
        // console.log(`Requesting IP location for: ${ip}`);
        // now query the ip location services
        ipLocateRequest(ip)
            .then((value) => {
            req.geoip = value;
            next();
        }).catch((error) => {
            // do not interrupt the processing chain of middlewares in casewedo not get geoip
            console.log(`ERROR: Could not assign the GeoIP object to request. ${error}`);
            req.geoip = null;
            next();
        });
    }
    catch (reason) {
        // global catch to ensure we do not interrupt middleware chain
        console.log(`PROBLEM: ${reason}`);
        req.geoip = null;
        next();
    }
};
exports.queryGeoIPMiddleware = queryGeoIPMiddleware;
/**
 * This middleware with persist the GeoIP
 * @param req the request augmented with geoip property by the query geo ip middleware
 * @param res the response object
 * @param next the next function middleware.
 */
const persistGeoIPMiddleware = (req, res, next) => {
    //if no geoip is populated then do nothing
    if (typeof req.geoip === 'undefined' || req.geoip === null) {
        next();
        return;
    }
    const hostname = process.env.DB_HOSTNAME;
    const database = process.env.DB_DATABASE;
    const sequelize = (0, sequelize_1.getSequelize)();
    if (typeof sequelize === 'undefined' || sequelize === null) {
        console.log(`Unable to connect to ${database}@${hostname}`);
        next();
        return;
    }
    const requestedUrl = req.protocol + '://' + req.get('host') + req.url;
    const geoip = req.geoip;
    sequelize.transaction().then((t) => {
        webaccess_1.WebAccess.create({
            ip4: geoip.ip,
            ip6: geoip.ipv6,
            country: geoip.country,
            country_code: geoip.country_code,
            city: geoip.city,
            continent: geoip.continent,
            latitude: geoip.latitude,
            longitude: geoip.longitude,
            time_zone: geoip.time_zone,
            postal_code: geoip.postal_code,
            isp: geoip.org,
            user_agent: req.get('user-agent'),
            visit_datetime: new Date(),
            visit_url: requestedUrl
        }).then((value) => {
            t.commit();
        }).catch(reason => {
            console.log(`Cannot create WebAccess row in database: "${reason}"`);
            t.rollback();
        });
    });
    // invoke immediately the next middlewarewithout waiting for the
    // insert in database to be completed.
    next();
};
exports.persistGeoIPMiddleware = persistGeoIPMiddleware;
const handleRouteGeoIP = (router) => {
    router.get('/api/ping', (req, res) => {
        res.status(200).send('pong').end();
    });
    router.get('/api/geoip', (req, res, next) => {
        // the geoip is populated by the geoipmiddleware and should be present in the request object
        const result = req.geoip === null ? 'not found' : req.geoip;
        res.status(200).json(result);
    });
};
exports.handleRouteGeoIP = handleRouteGeoIP;
//# sourceMappingURL=stats.js.map