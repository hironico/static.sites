"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.webAccessAPIRouter = exports.persistGeoIPMiddleware = exports.queryGeoIPMiddleware = void 0;
const request_1 = __importDefault(require("../utils/request"));
const sequelize_1 = require("../utils/sequelize");
const webaccess_1 = require("../models/webaccess");
const webaccess_by_country_1 = require("../models/webaccess_by_country");
const webaccess_by_platform_1 = require("../models/webaccess_by_platform");
/**
 *
 * @param ip4 Create a new GeoIP object with ip4 only given in parameter
 * @returns new GeoIP object with ip4 in the ip property
 */
const newGeoIP = (ip4) => {
    let geoIp = {
        ip: ip4,
        ipv6: null,
        country: null,
        country_code: null,
        city: null,
        continent: null,
        latitude: null,
        longitude: null,
        time_zone: null,
        postal_code: null,
        org: null,
        asn: null,
        subdivision: null,
        subdivision2: null
    };
    return geoIp;
};
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
/**
 * IP Locate request
 * You should signup for an API key.
 * See dotenv-sample file to get more informations
 */
const ipLocateRequest = (ip) => {
    // const url = 'https://www.iplocate.io/api/lookup/' + ip;
    return new Promise((resolve, reject) => {
        if ('127.0.0.1' === ip && process.env.IPLOCATE_LOCALHOST_OPTIMZE !== '0') {
            console.log('Skipping geo ip locate request for localhost. Disable with IPLOCATE_LOCALHOST_OPTIMIZE=0 in .env file.');
            resolve(newGeoIP(ip));
            return;
        }
        const apiKey = process.env.IPLOCATE_API_KEY;
        if (typeof apiKey === 'undefined' || apiKey === null) {
            reject('Please configure qan API key in the .env config file. See dotenv-sample for more info.');
            return;
        }
        (0, request_1.default)('www.iplocate.io', `/api/lookup/${ip}?apikey=${apiKey}`, 'GET', null)
            .then((result) => {
            // console.log(`Got ip stack response: ${result}`);
            const geoIp = JSON.parse(result);
            if (geoIp.error) {
                console.log(`ERROR while getting the iplocate GeoIP: ${geoIp.error}. Using ip=${ip} for logging.`);
                if (ip.indexOf(':') >= 0) {
                    geoIp.ipv6 = ip;
                }
                else {
                    geoIp.ip = ip;
                }
            }
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
        if ('0000:0000:0000:0000:0000:0000:0000:0001' === ip || '::1' === ip || null === ip || ip.endsWith('127.0.0.1')) {
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
            console.log(`ERROR: Could not request the GeoIP. ${error}`);
            req.geoip = newGeoIP(ip);
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
    const sequelize = (0, sequelize_1.getSequelize)();
    if (typeof sequelize === 'undefined' || sequelize === null) {
        const hostname = process.env.DB_HOSTNAME;
        const database = process.env.DB_DATABASE;
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
        }, { transaction: t }).then((value) => {
            t.commit();
        }).catch(reason => {
            console.log(`Cannot create WebAccess row in database: "${reason}"`);
            t.rollback();
        });
    }).catch(reason => {
        console.log(`Cannot create WebAccess row in database; Transaction error: "${reason}"`);
    });
    // invoke immediately the next middlewarewithout waiting for the
    // insert in database to be completed.
    next();
};
exports.persistGeoIPMiddleware = persistGeoIPMiddleware;
const getLastRequests = (req, res, next) => {
    // path param nbReq is recognized only if a number. So it is safe to parse here.
    let nbReq = Number.parseInt(req.params.nbReq);
    nbReq = nbReq > 1000 ? 1000 : nbReq;
    nbReq = nbReq < 0 ? 0 : nbReq;
    const sequelize = (0, sequelize_1.getSequelize)();
    if (typeof sequelize === 'undefined' || sequelize === null) {
        const hostname = process.env.DB_HOSTNAME;
        const database = process.env.DB_DATABASE;
        const msg = `Unable to connect to ${database}@${hostname}`;
        console.log(msg);
        res.status(500).send(msg).end();
        return;
    }
    webaccess_1.WebAccess.findAll({
        limit: nbReq,
        order: [['id', 'DESC']]
    })
        .then(data => res.status(200).json(data).end())
        .catch(error => {
        console.log('Error while returning last web access records: ' + error);
        res.status(500).json(error).end();
    });
};
const getWebAccessByCountry = (req, res, next) => {
    const sequelize = (0, sequelize_1.getSequelize)();
    if (typeof sequelize === 'undefined' || sequelize === null) {
        const hostname = process.env.DB_HOSTNAME;
        const database = process.env.DB_DATABASE;
        const msg = `Unable to connect to ${database}@${hostname}`;
        console.log(msg);
        res.status(500).send(msg).end();
        return;
    }
    webaccess_by_country_1.WebAccessByCountry.findAll({
        limit: 15,
        order: [['count', 'DESC']],
    })
        .then(data => res.status(200).json(data).end())
        .catch(error => {
        console.log('Error while returning web access by country: ' + error);
        res.status(500).send(error).end();
    });
};
const getWebAccessByPlatform = (req, res, next) => {
    const sequelize = (0, sequelize_1.getSequelize)();
    if (typeof sequelize === 'undefined' || sequelize === null) {
        const hostname = process.env.DB_HOSTNAME;
        const database = process.env.DB_DATABASE;
        const msg = `Unable to connect to ${database}@${hostname}`;
        console.log(msg);
        res.status(500).send(msg).end();
        return;
    }
    webaccess_by_platform_1.WebAccessByPlatform.findOne()
        .then(data => res.status(200).json(data).end())
        .catch(error => {
        console.log('Error while returning web access by platform: ' + error);
        res.status(500).send(error).end();
    });
};
const webAccessAPIRouter = (router) => {
    router.get('/api/ping', (req, res) => {
        res.status(200).send('pong').end();
    });
    router.get('/api/geoip', (req, res, next) => {
        // the geoip is populated by the geoipmiddleware and should be present in the request object
        const result = req.geoip === null ? 'not found' : req.geoip;
        res.status(200).json(result);
    });
    router.get('/api/webaccess/last/:nbReq(\\d+)', getLastRequests);
    router.get('/api/webaccess/by/country', getWebAccessByCountry);
    router.get('/api/webaccess/by/platform', getWebAccessByPlatform);
};
exports.webAccessAPIRouter = webAccessAPIRouter;
//# sourceMappingURL=stats.js.map