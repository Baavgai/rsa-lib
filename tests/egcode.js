
const lib = require("../dist/index.js");

const testKey = (key, msg = "This is only a test") => {
    const pub = key.getPublicKey();
    const pri = key.getPrivateKey();
    const enc = key.encrypt(msg);
    const dec = key.decrypt(enc);

    console.log({ pub, pri, msg, enc, dec, success: msg === dec });
};

const key = lib.generateKey(256);

console.log(key.getPrivateKey("wrapped"));

testKey(key);

const priKey = "MIGrAgEAAiEApTGrRdAONrF4i5HquYskO3754d5elBK5Y9NOcqFnEr0CAwEAAQIhAJ3vQ8FmLgCqYgaGRjSIS+UpaHas/6Ahu5IpS02hfnqhAhEA+XLMtV6xhsMv+GDchQsqlQIRAKmIX5ebfVyrqKJfFIx+5YkCEFchzneb+A7Gpz7vNpgSanECECS7n7rBvg/uQcOsxk8Kz8ECEQCDoYWHQVXJ2/Ff8gnUSwPF";

const k2 = lib.createKey(priKey);
console.log("parsed:", priKey === k2.getPrivateKey());
testKey(k2);

const k3 = lib.createKey(`
-----BEGIN RSA PRIVATE KEY-----
MIGpAgEAAiB3q6aVXOzrf5BpJaJ39wBoUCqyoMFdRtTo9xkgYXgVJwIDAQABAiBD
iGKht6cb3wknzU06VfGsJO5BmQcVPr7grTbHHUIDQQIRAMiVwqonYQFZ2MrCo7sE
0oMCEQCYu0RqYvRP+TZMZ2bcGeGNAhEApIZKPHy+UXhbnLwXxh+HdwIQOKFXIMtI
I08YXwQIE5xVEQIQSDaf+ks8Yl5BWfQ0uYjYmw==
-----END RSA PRIVATE KEY-----`);

console.log(k3.getPublicKey());
