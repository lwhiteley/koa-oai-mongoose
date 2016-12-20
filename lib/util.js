import path from 'path';

function prefixFilePath(filePath, prefix) {
  const pathObj = path.parse(filePath);
  return path.join(pathObj.dir, prefix + pathObj.base);
}

export {
  prefixFilePath
}
