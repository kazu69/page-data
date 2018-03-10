'use strict';

const test = require('ava'),
      rewire = require('rewire'),
      page = require('../index');

const app = rewire('../index');

test('.status() with http page is return page status', t => {
  const url = 'http://example.com',
        promise = page.status(url);

  return promise.then(res => {
    t.is(res.request, 'GET: http://example.com/');
    t.is(res.response.statusCode, 200);
    t.is(res.response.httpVersion, '1.1');
    t.is(res.response.statusMessage, 'OK');
    t.not(res.response.headers, null);
  });
});

test.cb('.status() with callback is return page status', t => {
  const url = 'http://example.com',
        cb = res => {
          t.is(res.request, 'GET: http://example.com/');
          t.is(res.response.statusCode, 200);
          t.is(res.response.httpVersion, '1.1');
          t.is(res.response.statusMessage, 'OK');
          t.not(res.response.headers, null);
          t.end();
        }

  page.status(url, cb);
});

test('.tls() is return tls status', t => {
  const url = 'https://example.com',
        options = {
          servername: 'example.com',
          rejectUnauthorized: false
        },
        promise = page.tls(url, options);

  return promise.then(res => {
    t.not(res.subject, null);
    t.is(typeof(res.subject), 'object');
    t.not(res.issuer, null);
    t.is(typeof(res.issuer), 'object');
    t.not(res.infoAccess, null);
    t.is(typeof(res.infoAccess), 'object');
    t.not(res.issuerCertificate, null);
    t.is(typeof(res.issuerCertificate), 'object');
    t.is(typeof(res.valid_from), 'string');
    t.not(res.valid_to, null);
    t.is(typeof(res.valid_to), 'string');
    t.not(res.infoAccess, null);
    t.is(typeof(res.infoAccess), 'object');
    t.not(res.subjectaltname, null);
    t.is(typeof(res.subjectaltname), 'object');
    t.not(res.serialNumber, null);
    t.is(typeof(res.serialNumber), 'string');
  });
});

test.cb('.tls() with callback is return tls status', t => {
  const url = 'https://example.com',
        options = {
          servername: 'example.com',
          rejectUnauthorized: false,
        },
        cb = res => {
          t.not(res.subject, null);
          t.is(typeof(res.subject), 'object');
          t.not(res.issuer, null);
          t.is(typeof(res.issuer), 'object');
          t.not(res.infoAccess, null);
          t.is(typeof(res.infoAccess), 'object');
          t.not(res.issuerCertificate, null);
          t.is(typeof(res.issuerCertificate), 'object');
          t.not(res.valid_from, null);
          t.is(typeof(res.valid_from), 'string');
          t.not(res.valid_to, null);
          t.is(typeof(res.valid_to), 'string');
          t.not(res.infoAccess, null);
          t.is(typeof(res.infoAccess), 'object');
          t.not(res.subjectaltname, null);
          t.is(typeof(res.subjectaltname), 'object');
          t.not(res.serialNumber, null);
          t.is(typeof(res.serialNumber), 'string');
          t.end();
        }

  page.tls(url, options, cb);
});

test('.meta() is return meta information', t => {
  const url = 'https://example.com',
        promise = page.meta(url);

  return promise.then(res => {
    t.not(res.title, null);
    t.is(res.title, 'Example Domain');
    t.not(res.charset, null);
    t.is(res.charset, 'utf-8');
    t.is(res.keywords, null);
    t.is(res.description, null);
  });
});

test.cb('.meta() with callback is return meta information', t => {
  const url = 'https://example.com',
        cb = (res) => {
          t.not(res.title, null);
          t.is(res.title, 'Example Domain');
          t.not(res.charset, null);
          t.is(res.charset, 'utf-8');
          t.is(res.keywords, null);
          t.is(res.description, null);
          t.end();
        };

  page.meta(url, cb);
});

test.cb('.meta() with callback is return error message', t => {
  const url = 'https://93.184.216.34',
        cb = (_, error) => {
          if (process.version.match(/v9/)) {
            t.is(error, 'Hostname/IP does not match certificate\'s altnames: IP: 93.184.216.34 is not in the cert\'s list: ');
          } else {
            t.is(error, 'Hostname/IP doesn\'t match certificate\'s altnames: "IP: 93.184.216.34 is not in the cert\'s list: "');
          }
          t.end()
        };

  page.meta(url, cb);
});

test('.getPort() is return port number', t => {
  const getPort = app.__get__('getPort');

  t.is(getPort('http'), 80);
  t.is(getPort('https'), 443);
});

test('.httpRequest() is return page request result', t => {
  const httpRequest = app.__get__('httpRequest');
  const http = app.__get__('http');
  const options = {
    protocol: http,
    port: 80,
    method: 'GET',
    hostname: 'example.com',
    path: '/'
  }

  const promise = httpRequest(options);

  return promise.then(res => {
    t.is(typeof(res), 'object');
    t.is(res.req._header, 'GET / HTTP/1.1\r\nHost: example.com\r\nConnection: close\r\n\r\n');
    t.is(res.statusCode, 200);
    t.is(res.httpVersion, '1.1');
    t.is(res.statusMessage, 'OK');
  });
});

test('.requestOptions() is return option Object', t => {
  const requestOptions = app.__get__('requestOptions'),
        url = 'example.com',
        opt = { path: '/test' }

  const options = requestOptions(url, opt);

  t.true(options.hasOwnProperty('protocol'));
  t.true(options.protocol !== '');
  t.true(options.protocol !== null);
  t.is(options.port, 80);
  t.is(options.method, 'GET');
  t.is(options.hostname, 'example.com');
  t.is(options.path, '/test');
});

test('.tlsInformation() is return page tls information', t => {
  const tlsInformation = app.__get__('tlsInformation');
  const options = {
    port: 443,
    method: 'GET',
    host: 'example.com',
  }

  const promise = tlsInformation(options);

  return promise.then(res => {
    t.not(res.subject, null);
    t.is(typeof(res.subject), 'object');
    t.not(res.issuer, null);
    t.is(typeof(res.issuer), 'object');
    t.not(res.valid_from, null);
    t.is(typeof(res.valid_from), 'string');
    t.not(res.valid_to, null);
    t.is(typeof(res.valid_to), 'string');
    t.not(res.infoAccess, null);
    t.is(typeof(res.infoAccess), 'object');
  });
});

test('.getUrlInfo() is return info from request url', t => {
  const getUrlInfo = app.__get__('getUrlInfo');
  const requestUrl = 'example.com';
  const info = getUrlInfo(requestUrl);

  t.is(info.protocol, 'http');
  t.is(info.host, 'example.com');
  t.is(info.hostname, 'example.com');
  t.is(info.pathname, '/');
  t.is(info.path, '/');
});
