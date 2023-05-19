async function run(nodeName, networkInfo, args) {
  console.log('Waiting for ', args, 'ms');
  const timeout = parseInt(args[0]);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(1);
    }, timeout);
  });
}

module.exports = { run };