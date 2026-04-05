// Shared types between apps
// Add types here as needed when desktop and web need to share data structures

export type Platform = 'win32' | 'darwin' | 'linux'

export interface AppVersion {
  version: string
  platform: Platform
  downloadUrl: string
}
