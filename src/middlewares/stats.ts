import { NextFunction, Request, Response, Router } from "express";
import performRequest from "../utils/request";
import { getSequelize } from "../utils/sequelize";
import { Sequelize, Transaction } from "sequelize";
import { WebAccess } from "../models/webaccess";

export interface GeoIP {
    ip: string,
    ipv6: string,
    country: string, 
    country_code: string,
    city: string,
    continent: string,
    latitude: number,
    longitude: number,
    time_zone: string,
    postal_code: string,
    org: string,
    asn: string,
    subdivision: string,
    subdivision2: string,
    error?: string
}

export interface RequestWithGeoIP extends Request {
    geoip?: GeoIP
}

/**
 * 
 * @param ip4 Create a new GeoIP object with ip4 only given in parameter
 * @returns new GeoIP object with ip4 in the ip property
 */
const newGeoIP = ( ip4: string ): GeoIP => {
    let geoIp: GeoIP = {
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
    }
    return geoIp;
}

/* 
 * IP Stack Request 
*/
const ipStackRequest = (ip: string, accessKey: string): Promise<GeoIP> => {
    // const url = `https://api.ipstack.com/${ip}?access_key=${accessKey}`;

    const queryData ={
        access_key : accessKey
    }
    
    return new Promise<GeoIP> ((resolve, reject) => {
        performRequest('api.ipstack.com', `/${ip}`, 'GET', queryData)
        .then((result: string) => {
            // console.log(`Got ip stack GeoIP: ${result}`);
            const geoIp:GeoIP = JSON.parse(result);
            resolve(geoIp);
        }).catch((reason) => {
            console.log(`Cannot perform IP stack request: ${reason}`);
            reject(reason);
        });
    });
}

/**
 * IP Locate request
 * You should signup for an API key.
 * See dotenv-sample file to get more informations
 */
const ipLocateRequest = (ip: string): Promise<GeoIP> => {
    // const url = 'https://www.iplocate.io/api/lookup/' + ip;

    return new Promise<GeoIP> ((resolve, reject) => {
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

        performRequest('www.iplocate.io', `/api/lookup/${ip}?apikey=${apiKey}`, 'GET', null)
        .then((result: string) => {
            // console.log(`Got ip stack response: ${result}`);
            const geoIp:GeoIP = <GeoIP>JSON.parse(result);

            if (geoIp.error) {
                console.log(`ERROR while getting the iplocate GeoIP: ${geoIp.error}. Using ip=${ip} for logging.`);
                if (ip.indexOf(':') >= 0) {
                    geoIp.ipv6 = ip;
                } else {
                    geoIp.ip = ip;
                }
            }

            resolve(geoIp);
        }).catch((reason) => {
            console.log(`Could not perform ip locate request: ${reason}`);
            reject(reason);
        });
    });
}

/**
 * This middleware will enrich the request with GEOIP information if available.
 * @param req The HTTP Request
 * @param res The HTTP Response
 * @param next the next middleware in the ExpressJS chain
 */
export const queryGeoIPMiddleware = (req: RequestWithGeoIP, res: Response, next: NextFunction) => {
    try {
        const forwardIp = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'] : null;

        let forwardIpStr: string = '';
        if (typeof forwardIp === 'string') {
            forwardIpStr = '' + forwardIp;
        } else {
            forwardIpStr = forwardIp !== null ? forwardIp[0] : null;
        }

        let ip:string = forwardIp === null ? req.socket.remoteAddress : forwardIpStr;
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
        .then((value:GeoIP) => {
            req.geoip = value;
            next();
        }).catch((error) => {
            // do not interrupt the processing chain of middlewares in casewedo not get geoip
            console.log(`ERROR: Could not request the GeoIP. ${error}`);
            req.geoip = newGeoIP(ip); 
            next();
        });
    } catch (reason) {
        // global catch to ensure we do not interrupt middleware chain
        console.log(`PROBLEM: ${reason}`);
        req.geoip = null;
        next();
    }
}

/**
 * This middleware with persist the GeoIP 
 * @param req the request augmented with geoip property by the query geo ip middleware
 * @param res the response object
 * @param next the next function middleware.
 */
export const persistGeoIPMiddleware = (req: RequestWithGeoIP, res:Response, next: NextFunction) => {
    //if no geoip is populated then do nothing
    if (typeof req.geoip === 'undefined' || req.geoip === null) {
        next();
        return;
    }

    const hostname = process.env.DB_HOSTNAME;
    const database = process.env.DB_DATABASE;
    const sequelize:Sequelize = getSequelize();

    if (typeof sequelize === 'undefined' || sequelize === null) {
        console.log(`Unable to connect to ${database}@${hostname}`);
        next();
        return;
    }

    const requestedUrl = req.protocol + '://' + req.get('host') + req.url;
    const geoip = req.geoip;
    sequelize.transaction().then((t:Transaction) => {
        WebAccess.create({
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
        }, { transaction: t }).then((value: WebAccess) => {
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
}

export const handleRouteGeoIP = (router: Router): void => {
    router.get('/api/ping', (req:Request, res: Response) => {
        res.status(200).send('pong').end();
    })

    router.get('/api/geoip', (req:RequestWithGeoIP, res: Response, next: NextFunction)=> {
        // the geoip is populated by the geoipmiddleware and should be present in the request object
        const result = req.geoip === null ? 'not found' : req.geoip;
        res.status(200).json(result);
    });

    
}