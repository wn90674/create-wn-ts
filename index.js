#!usr/bin/env node
const path = require('path')
const fs = require('fs-extra')
// const prompts = require('prompts')
const projName = process.argv[2]
const projectDir = path.resolve(process.cwd(), projName)
if (fs.existsSync(projectDir)) {
  console.warn('exist')
} else {
  fs.mkdirSync(projectDir)
}
console.error(__dirname, projectDir)
fs.copy(path.resolve(__dirname, '../template'), projectDir, () => {
  console.error(__dirname, projectDir)
})
