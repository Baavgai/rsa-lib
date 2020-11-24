
import { createKey, generateKey, isPrivate } from "../dist";

const key = generateKey(256);

console.log(key.getPublicKey());
