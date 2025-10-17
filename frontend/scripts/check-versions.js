#!/usr/bin/env node

/**
 * Version Consistency Checker
 * Ensures all version files contain the same version number
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const versionFiles = [
  'package.json',
  'package-lock.json'
];

function getVersionFromPackageJson(filePath) {
  try {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return content.version;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return null;
  }
}

function getVersionFromPackageLock(filePath) {
  try {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    // Check both root version and packages[""] version
    const rootVersion = content.version;
    const packageVersion = content.packages?.[""]?.version;

    if (rootVersion !== packageVersion) {
      console.error(`Version mismatch in ${filePath}: root=${rootVersion}, packages[""]=${packageVersion}`);
      return null;
    }

    return rootVersion;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return null;
  }
}

function checkVersions() {
  const versions = {};
  let hasErrors = false;

  console.log('🔍 Checking version consistency...\n');
  console.log('📦 STARK Version Validator');
  console.log('Current working directory:', process.cwd());

  for (const file of versionFiles) {
    const filePath = path.join(process.cwd(), file);

    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${file}`);
      hasErrors = true;
      continue;
    }

    let version;
    if (file === 'package.json') {
      version = getVersionFromPackageJson(filePath);
    } else if (file === 'package-lock.json') {
      version = getVersionFromPackageLock(filePath);
    }

    if (version === null) {
      hasErrors = true;
      continue;
    }

    versions[file] = version;
    console.log(`✅ ${file}: ${version}`);
  }

  console.log('\n📊 Version Summary:');
  const uniqueVersions = [...new Set(Object.values(versions))];

  if (uniqueVersions.length === 1) {
    console.log(`✅ All versions consistent: ${uniqueVersions[0]}`);
    return true;
  } else {
    console.error('❌ Version inconsistency detected!');
    console.error('Found versions:', uniqueVersions);
    console.error('\nFiles with versions:');
    Object.entries(versions).forEach(([file, version]) => {
      console.error(`  ${file}: ${version}`);
    });
    return false;
  }
}

// Run the check
checkVersions();