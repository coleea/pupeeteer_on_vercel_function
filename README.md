작동환경

- vercel의 node.js 버전 22.x
- "puppeteer-core": "^24.5.0"
- "@sparticuz/chromium": "^132.0.0",
  - 버전을 137로 설정하면 아래 오류가 발생함

```
Error [ERR_REQUIRE_ESM]: require() of ES Module /var/task/node_modules/.pnpm/@sparticuz+chromium@137.0.1/node_modules/@sparticuz/chromium/build/index.js from /var/task/api/screenshot.js not supported.
Instead change the require of index.js in /var/task/api/screenshot.js to a dynamic import() which is available in all CommonJS modules.
    at /opt/rust/nodejs.js:2:12456
    at Function.Hr (/opt/rust/nodejs.js:2:12834)
    at Ae.e.<computed>.Me._load (/opt/rust/nodejs.js:2:12426)
    at TracingChannel.traceSync (node:diagnostics_channel:322:14) {
  code: 'ERR_REQUIRE_ESM'
}
Node.js process exited with exit status: 1. The logs above can help with debugging the issue.

```  



## VercelGL

VercelGL is a simple, lightweight API to use serverless chrome.
It is designed to be used with the [Vercel](https://vercel.com) platform, but can be used anywhere.

## Usage

currently there is only one route implemented

```
POST /api/screenshot
```

Body 

> Bear in mind that this app is more like template so fill free to bend for your use case (mine is looking for `<canvas>` the web)

```json
{
  "url": "https://bafybeigsw7gagsmvxxivt5kvrl6ueld7yszzef2aylxbzzafez6ybxscca.ipfs.nftstorage.link"
}
```

<img width="1608" alt="Screenshot 2024-01-22 at 11 56 56" src="https://github.com/vikiival/vercelgl/assets/22471030/58f382b1-fb09-445b-a519-abdaad1b50ff">


## FAQ

### This example does not work

Seems that many users have problem with paths etc.
Using **pnpm** as package manager seemed to make a difference.

### I am getting 504 HTTP error


Please increase `maxDuration` for the serverless functions in `vercel.json`:

```json
"functions": {
  "api/**/*": {
    "maxDuration": 60
  }
}
```


### Reference

https://gist.github.com/kettanaito/56861aff96e6debc575d522dd03e5725
