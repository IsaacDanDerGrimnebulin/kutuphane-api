async function safePromise(promise, fallback) {
  try {
    return await promise;
  } catch (err) {
    console.error("Safe promise fallback triggered:", err);
    return fallback;
  }
}

module.exports = safePromise;
