# SubdomainBrute

## Usage

### Quick Example

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
t.iqiyi.com	123.125.111.84
a.iqiyi.com	111.206.13.61, 111.206.13.62, 111.206.13.63, 111.206.13.64, 111.206.13.65
wx.iqiyi.com	119.188.147.114
passport.iqiyi.com	60.217.248.115, 123.125.111.79
upload.iqiyi.com	123.125.84.209
mail.iqiyi.com	123.125.111.122
www.iqiyi.com	111.206.13.62, 111.206.13.63, 111.206.13.61, 111.206.13.65, 111.206.13.64
......

Running [==================================================] 163/163 100%
```