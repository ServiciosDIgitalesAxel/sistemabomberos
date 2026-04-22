const https = require('https')
const fs    = require('fs')
const path  = require('path')

const url = 'https://i.imgur.com/OXrrXXt.png'

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    https.get(url, res => {
      res.pipe(file)
      file.on('finish', () => { file.close(); resolve() })
    }).on('error', reject)
  })
}

async function main() {
  const dir = path.join(__dirname, '../public/icons')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  console.log('Descargando logo...')
  await download(url, path.join(dir, 'icon-512x512.png'))
  await download(url, path.join(dir, 'icon-192x192.png'))
  await download(url, path.join(dir, 'icon-180x180.png'))
  console.log('✅ Íconos descargados')
}

main()