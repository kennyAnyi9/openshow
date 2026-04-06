import { protocol, net } from 'electron'
import { pathToFileURL } from 'url'

export function registerMediaProtocolScheme(): void {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: 'media',
      privileges: {
        standard: true,
        secure: true,
        stream: true,
        supportFetchAPI: true
      }
    }
  ])
}

export function registerMediaProtocol(): void {
  protocol.handle('media', (request) => {
    const url = new URL(request.url)
    const encodedPath = url.pathname.replace(/^\//, '')
    const filePath = decodeURIComponent(Buffer.from(encodedPath, 'base64').toString('utf-8'))
    return net.fetch(pathToFileURL(filePath).href)
  })
}
