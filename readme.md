# page-data

[![Build Status](https://travis-ci.org/kazu69/page-data.svg?branch=master)](https://travis-ci.org/kazu69/page-data)

Simple page data client tool.

## install

```sh
npm install page-data
```

## Usage

```js
const page = require('page-data');
const callback = (data, error) => {
    console.log(data);
}

page.status('example.com', callback)
/*
{ request: 'GET: http://example.com/',
  response:
   { statusCode: 200,
     httpVersion: '1.1',
     statusMessage: 'OK',
     headers:
      { 'accept-ranges': 'bytes',
        'cache-control': 'max-age=604800',
        'content-type': 'text/html',
        date: 'Sun, 28 Feb 2016 03:59:55 GMT',
        etag: '"359670651+gzip"',
        expires: 'Sun, 06 Mar 2016 03:59:55 GMT',
        'last-modified': 'Fri, 09 Aug 2013 23:54:35 GMT',
        server: 'ECS (cpm/F9D5)',
        vary: 'Accept-Encoding',
        'x-cache': 'HIT',
        'x-ec-custom-error': '1',
        'content-length': '1270',
        connection: 'close' } } }
*/
```

This module return Promise object without callback function.

```js
const page = require('page-data');

let promise = page.status('github.com', options);
promise.then(data => {
  console.log(data);
});
```

## API

### status(url, [option, callback])

Check whether the page is alive.
Simple to only the HTTP GET request.

```js
const page = require('page-data');
page.status('https://github.com', options, callback);

/*
 { request: 'GET: https://github.com/',
   response:
    { statusCode: 200,
      httpVersion: '1.1',
      statusMessage: 'OK',
      headers:
       { server: 'GitHub.com',
         date: 'Sun, 28 Feb 2016 04:04:04 GMT',
         'content-type': 'text/html; charset=utf-8',
         'transfer-encoding': 'chunked',
         connection: 'close',
         status: '200 OK',
         'cache-control': 'no-cache',
         vary: 'X-PJAX, Accept-Encoding',
         'x-ua-compatible': 'IE=Edge,chrome=1',
         'set-cookie': [Object],
         'x-request-id': 'f50cd1559dd7947b46808462684659cd',
         'x-runtime': '0.020611',
         'content-security-policy': 'default-src *; base-uri \'self\'; block-all-mixed-content; child-src ...
         'strict-transport-security': 'max-age=31536000; includeSubdomains; preload',
         'public-key-pins': 'max-age=300; pin-sha256="WoiWRyIOVNa9ihaBciRSC7XHjliYS9VwUGOIud4PB18="; pin-sha256="JbQbUG5JMJUoI6brnx0x3vZF6jilxsapbXGVfjhN8Fg="; includeSubDomains',
         'x-content-type-options': 'nosniff',
         'x-frame-options': 'deny',
         'x-xss-protection': '1; mode=block',
         'x-served-by': '926b734ea1992f8ee1f88ab967a93dac',
         'x-github-request-id': '73A329BC:1143:55012B9:56D271B3' } } }
*/
```

### tls(url, [option, callback])

GET tls information.

```js
const page = require('page-data');
page.tls('github.com', options, callback);

/*
 { subject:
    { businessCategory: 'Private Organization',
      jurisdictionC: 'US',
      jurisdictionST: 'Delaware',
      serialNumber: '5157550',
      street: '548 4th Street',
      postalCode: '94107',
      C: 'US',
      ST: 'California',
      L: 'San Francisco',
      O: 'GitHub, Inc.',
      CN: 'github.com' },
   issuer:
    { C: 'US',
      O: 'DigiCert Inc',
      OU: 'www.digicert.com',
      CN: 'DigiCert SHA2 Extended Validation Server CA' },
   valid_from: 'Apr  8 00:00:00 2014 GMT',
   valid_to: 'Apr 12 12:00:00 2016 GMT',
   infoAccess:
    { 'OCSP - URI': [ 'http://ocsp.digicert.com' ],
      'CA Issuers - URI': [ 'http://cacerts.digicert.com/DigiCertSHA2ExtendedValidationServerCA.crt' ] } }
*/
```

### meta(url, [option, callback])

GET page meta data(title, keywords, description, charset)

```js
const page = require('page-data');
page.mata('https://github.com', options, callback);

/*
 { title: 'GitHub · Where software is built',
   charset: 'utf-8',
   keywords: null,
   description: 'GitHub is where people build software. More than 12 million people use GitHub to discover, fork, and contribute to over 31 million projects.' }
;
*/
```

## Cli

[page-data-cli](https://www.npmjs.com/package/page-data-cli)

## License

MIT © kazu69
