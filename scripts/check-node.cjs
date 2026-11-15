var parts = process.versions.node.split('.')
var major = parseInt(parts[0], 10)
var minor = parseInt(parts[1], 10)

if (major < 20 || (major === 20 && minor < 19)) {
  console.error('')
  console.error('LOI: ISS can Node.js >= 20.19 (khuyen nghi 22), may ban dang dung v' + process.versions.node + '.')
  console.error('Hay chuyen phien ban Node, vi du: nvm use 22.13.0  (xem README.md, muc "Yeu cau moi truong").')
  console.error('')
  process.exit(1)
}
