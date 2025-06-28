```

Error: Failed to launch the browser process!
/tmp/chromium: error while loading shared libraries: libnss3.so: cannot open shared object file: No such file or directory


TROUBLESHOOTING: https://pptr.dev/troubleshooting

    at Interface.onClose (/var/task/node_modules/.pnpm/@puppeteer+browsers@1.9.0/node_modules/@puppeteer/browsers/lib/cjs/launch.js:277:24)
    at Interface.emit (node:events:529:35)
    at Interface.close (node:internal/readline/interface:534:10)
    at Socket.onend (node:internal/readline/interface:260:10)
    at Socket.emit (node:events:529:35)
    at endReadableNT (node:internal/streams/readable:1400:12)
    at process.processTicksAndRejections (node:internal/process/task_queues:82:21)

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
