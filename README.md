# SubdomainBrute

## Usage

### Command line

**Installation**

```bash
$ npm install -g subdomain-brute
# or
$ yarn add global subdomain-brute
```

**Usage information**

```bash
$ subdomain --help

  Usage: subdomain [options] DOMAIN

  Subdomain brute


  Options:

    -V, --version           output the version number
    --target <domain>       target domain name
    -o --out-put <file>     Output filename
    -c --concurrency <num>  Start specified NUMBER of concurrency
    --server <server>       Comma separated list of server to query
    --file-path <file>      Dictionary file path
    -h, --help              output usage information
```

**Brute "iqiyi.com"**

``` 
$ subdomain --target iqiyi.com --concurrency 50 --out-put qq.txt
```

### Quick Start

```javascript
// Import package
import SubdomainBrute from 'subdomain-brute'

// Options
const opts = {
  server: ['223.5.5.5','223.6.6.6','119.29.29.29','182.254.116.116'], // DNS Server list
  target: 'iqiyi.com', // Target domain
  filePath: './dict/small.txt', // Dictionary file path
  concurrency: 50, // Concurrent number
}

const brute = new SubdomainBrute(opts)
brute.run().catch(_ => console.log('Has error', _.message))
```

**Result**

```
mail.iqiyi.com - 123.125.111.122 [HTTP 302] - 55ms
passport.iqiyi.com - 123.125.111.79, 60.217.248.115 [Tengine] - 50ms
a.iqiyi.com - 111.206.13.63, 111.206.13.62, 111.206.13.64, 111.206.13.61, 111.206.13.65 [QWS] - 90ms
t.iqiyi.com - 123.125.111.84 [openresty] - 95ms
upload.iqiyi.com - 123.125.84.209 [Tengine/2.1.2] - 95ms
www.iqiyi.com - 111.206.13.65, 111.206.13.61, 111.206.13.62, 111.206.13.63, 111.206.13.64 [Apache 1.3.29] - 48ms
wx.iqiyi.com - 119.188.147.114 [Tengine] - 93ms
i.iqiyi.com - 123.125.111.84 [openresty] - 54ms
static.iqiyi.com - 111.206.13.65, 111.206.13.62, 111.206.13.61, 111.206.13.64, 111.206.13.63 [QWS] - 52ms
help.iqiyi.com - 111.206.13.61, 111.206.13.63, 111.206.13.64, 111.206.13.62, 111.206.13.65 [Tengine] - 50ms
so.iqiyi.com - 123.125.84.232 [Tengine] - 49ms
vpn.iqiyi.com - 123.125.118.239 - 94ms
......

Running [==================================================] 163/163 100% 0.0s
subdomain-brute: 14159.444ms
```