#!/usr/bin/env node
// @refer https://github.com/vitejs/vite/blob/main/packages/create-vite/index.js
const path = require('path')
const fs = require('fs-extra')
const prompts = require('prompts')
const {
  // yellow,
  // green,
  cyan,
  // blue,
  // magenta,
  // lightRed,
  red,
  reset
} = require('kolorist')
let targetDir = process.argv[2]
const defaultProjectName = !targetDir ? 'ts-starter' : targetDir

function isEmpty(path) {
  return fs.readdirSync(path).length === 0
}

function emptyDir(dir) {
  if (!fs.existsSync(dir)) {
    return
  }
  for (const file of fs.readdirSync(dir)) {
    const abs = path.resolve(dir, file)
    // baseline is Node 12 so can't use rmSync :(
    if (fs.lstatSync(abs).isDirectory()) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      emptyDir(abs)
      fs.rmdirSync(abs)
    } else {
      fs.unlinkSync(abs)
    }
  }
}

function isValidPackageName(projectName) {
  return /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(
    projectName
  )
}

function toValidPackageName(projectName) {
  return projectName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/^[._]/, '')
    .replace(/[^a-z0-9-~]+/g, '-')
}

async function init() {
  const res = await prompts([
    {
      type: targetDir ? null : 'text',
      name: 'projectName',
      message: reset('Project name:'),
      initial: defaultProjectName,
      onState: state =>
        (targetDir = state.value.trim() || defaultProjectName)
    },
    {
      type: () =>
        !fs.existsSync(targetDir) || isEmpty(targetDir) ? null : 'toggle',
      name: 'overwrite',
      message: () =>
        `${targetDir === '.'
          ? 'Current directory'
          : `Target directory "${targetDir}"`
        } is not empty. Remove existing files and continue?`,
      initial: false,
      active: 'yes',
      inactive: 'no'
    },
    {
      type: (_, { overwrite } = {}) => {
        if (overwrite === false) {
          throw new Error(`${red('✖')} Operation cancelled`)
        }
        return null
      },
      name: 'overwriteChecker'
    },
    {
      type: () => (isValidPackageName(targetDir) ? null : 'text'),
      name: 'packageName',
      message: reset('Package name:'),
      initial: () => toValidPackageName(targetDir),
      validate: dir =>
        isValidPackageName(dir) || 'Invalid package.json name'
    },
    {
      onCancel: () => {
        throw new Error(`${red('✖')} Operation cancelled`)
      }
    }
  ])

  const packageName = res.packageName || targetDir

  if (res.overwrite) {
    emptyDir(path.join(process.cwd(), targetDir))
  }

  fs.copy(path.resolve(__dirname, './template'), packageName, () => {
    console.log(cyan(`project ${packageName} success created`))
  })
}

init().catch((err) => {
  console.log(red(err))
})
