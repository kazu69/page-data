'use strict';

const http = require('http'),
      https = require('https'),
      tls = require('tls'),
      url = require('url'),
      cheerio = require('cheerio');

const ports = {
  http: 80,
  https: 443
}

function getPort(protocol) {
  const index = Object.keys(ports).find(p => {
    if(p === protocol.replace(':', '')) { return p; }
  });

  return ports[index];
}

function httpRequest(opts) {
  const fn = opts.protocol;
  const options = {};
  Object.keys(opts).forEach(key => {
    if(key !== 'protocol') {
      options[key] = opts[key];
    }
  });

  return new Promise((resolve, reject) => {
    const request = fn.request(options, (response) => {
      response? resolve(response) : reject(response);
    });

    request.on('error', (error) => {
      reject(error);
    });

    request.end();
  });
}

function requestOptions(url, opts) {
  let urlInfo = getUrlInfo(url);
  const method = urlInfo.protocol === 'http' ? http : https;

  let defaults = {
    protocol: method,
    port: getPort(urlInfo.protocol),
    method: 'GET',
    hostname: urlInfo.hostname,
    path: urlInfo.pathname
  };

  return Object.assign(defaults, opts);
}

function tlsInformation(opts) {
  return new Promise((resolve, reject) => {

    const callback = () => {
      socket.end();

      const peerCertificate = socket.getPeerCertificate(true);
      if(Object.keys(peerCertificate).length !== 0) {
        resolve(peerCertificate);
        return;
      }
  
      if(!socket.authorized) {
        reject(socket.authorizationError);
        return;
      }

      throw new Error('tls socket connection error');
    }

    const _op = {};
    for(var i in opts) {
      if (i !== 'port' || i !== 'hostname') {
        _op[i] = opts[i];
      }
    }

    const socket = tls.connect(
      opts.port,
      opts.hostname,
      _op,
      callback
    );

    socket.on('error', (error) => {
      reject(error);
    });
  });
}

function geneerateStateResponse(res) {
  const protocol = res._request.protocol === http ? 'http' : 'https';
  return {
    request: `${res._request.method}: ${protocol}://${res._request.hostname}${res._request.path}`,
    response: {
      statusCode: res.statusCode,
      httpVersion: res.httpVersion,
      statusMessage: res.statusMessage,
      headers: res.headers
    }
  };
}

function generateTlsResponse(res) {
  const sans = res.subjectaltname.split(',')
                                  .map(v => v.replace(/DNS\:/, ''))
                                  .filter(v => v !== '');
  return {
    subject: res.subject,
    issuer: res.issuer,
    infoAccess: res.infoAccess,
    issuerCertificate: res.issuerCertificate,
    subjectaltname: sans,
    valid_from: res.valid_from,
    valid_to: res.valid_to,
    infoAccess: res.infoAccess,
    serialNumber: res.serialNumber
  };
}

function generateMetaResponse(body) {
  const $ = cheerio.load(body);
  const $title = $('title').text();
  const $keywords = $('meta[name=keywords]').attr('content');
  const $description = $('meta[name=description]').attr('content');
  const $charset = $('meta[charset]').attr('charset');

  return {
    title: $title || null,
    charset: $charset || null,
    keywords: $keywords || null,
    description: $description || null
  }
}

function getUrlInfo(requestUrl, type) {
  let protocol = '';
  let request = requestUrl;

  if(!type) { type = 'http'; }

  if(request.indexOf(type) < 0) {
    request = `${type}://${request}`
    protocol = type;
  } else {
    const tmp = request.split(/\b(http|https):\/\//);
    tmp.shift();
    protocol = tmp[0]? tmp[0] : type;
  }

  let urlInfo = url.parse(request , true);
  if(urlInfo.protocol === null) {
    urlInfo.protocol = protocol;
  } else {
    urlInfo.protocol = urlInfo.protocol.replace(/:/g,'');
  }

  return urlInfo;
}

module.exports.tls = (requestUrl, opts, cb) => {
  if(typeof opts === 'function') {
    cb = opts;
    opts = {};
  }

  let defaults = requestOptions(requestUrl, { protocol: 'https', port: 443, });
  delete defaults.method;

  const options = Object.assign(defaults, opts);
  const promise = tlsInformation(options);

  if(cb && typeof cb === 'function') {
    promise
      .then(res => cb(generateTlsResponse(res), null))
      .catch(error => cb(null, error.message));
  } else {
    return new Promise((resolve, reject) => {
      const func = options => {
        promise
          .then(res => {
            resolve(generateTlsResponse(res));
          })
          .catch(error => {
            reject(error.message);
          });
      }
      func.call(this, options);
    });
  }
}

module.exports.status = (requestUrl, opts, cb) => {
  if(typeof opts === 'function') {
    cb = opts;
    opts = {};
  }

  const options = requestOptions(requestUrl, opts);
  const promise = httpRequest(options);

  if(cb && typeof cb === 'function') {
    promise
      .then(res => {
        res['_request'] = options
        cb(geneerateStateResponse(res), null);
      })
      .catch(error => cb(null, error.message));
  } else {
    return new Promise((resolve, reject) => {
      const func = options => {
        promise
          .then(res => {
            res['_request'] = options
            resolve(geneerateStateResponse(res));
          })
          .catch(error => {
            reject(error.message);
          });
      }

      func.call(this, options);
    });
  }
}

module.exports.meta = (requestUrl, opts, cb) => {
  if(typeof opts === 'function') {
    cb = opts;
    opts = {};
  }

  const options = requestOptions(requestUrl, opts);
  const promise = httpRequest(options);

  const htmlBody = (res) => {
    return new Promise((resolve, reject) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        resolve(body);
      });
    });
  }

  if(cb && typeof cb === 'function') {
    promise
      .then(res => {
        const html = htmlBody(res);
        html.then((html) => {
            cb(generateMetaResponse(html));
          });
      })
      .catch(error => cb(null, error.message));
  } else {
    return new Promise((resolve, reject) => {
      promise
        .then(res => {
          const html = htmlBody(res);
          html.then((html) => {
            resolve(generateMetaResponse(html));
          });
        })
        .catch(error => reject(error.message));
    });
  }
}
