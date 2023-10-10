// commenting all this out, beacuase as pf snarkyjs 0.5.4 > 0.6.0
// Module '"snarkyjs"' has no exported member 'Party'. Not sure
// where to find it, because the docs are not updated?

import { SimpleZkapp_ } from './zkapp.js';
import {
  isReady,
  Mina,
  PrivateKey,
  shutdown,
  AccountUpdate,
  Field,
} from 'o1js';

// setup
await isReady;

for (let i = 0; i < 5; i++) {
  let privateKey = PrivateKey.random();
  let publicKey = privateKey.toPublicKey();
  console.log(publicKey.toBase58(), privateKey.toBase58());
}

const Local = Mina.LocalBlockchain();
Mina.setActiveInstance(Local);

const account = Local.testAccounts[0].privateKey;
const zkappKey = PrivateKey.random();
let zkappAddress = zkappKey.toPublicKey();

// have to compile if using proofs?
// https://github.com/o1-labs/snarkyjs/blob/main/src/examples/zkapps/simple_and_counter_zkapp.ts
console.log('Compiling smart contract...');
let { verificationKey } = await SimpleZkapp_.compile();

let zkapp = new SimpleZkapp_(zkappAddress);

console.log(`Deploying zkapp for public key ${zkappAddress.toBase58()}.`);
let tx = await Mina.transaction(account, () => {
  AccountUpdate.fundNewAccount(account);
  zkapp.deploy({ zkappKey, verificationKey });
});
// zkapp.sign(zkappKey);
await tx.send();

let tryInteracting = true;
if (tryInteracting) {
  // https://github.com/o1-labs/snarkyjs/blob/main/src/examples/zkapps/hello_world/run.ts
  // let initialState = await Mina.getAccount(zkappAddress);
  console.log('Initial State', zkapp.value.get().toBase58());

  console.log(`Update state`);
  let tx = await Mina.transaction(account, () => {
    zkapp.giveAnswer(Field(7), account.toPublicKey());
  });
  // fill in the proof - this can take a while...
  console.log('Creating an execution proof...');
  await tx.prove();

  // send the transaction to the graphql endpoint
  console.log('Sending the transaction...');
  await tx.send();

  console.log('Updated State', zkapp.value.get().toBase58());

  // okay, so lets send something that does not satisfy the update condition
  console.log(`Update state bad`);
  try {
    let tx = await Mina.transaction(account, () => {
      zkapp.giveAnswer(Field(6), zkappKey.toPublicKey());
    });
    // fill in the proof - this can take a while...
    console.log('Creating an execution proof...');
    await tx.prove();

    // send the transaction to the graphql endpoint
    console.log('Sending the transaction...');
    await tx.send();

    console.log('Updated State', zkapp.value.get().toBase58());
  } catch (error) {
    console.log('ERROR');
    console.error(error);
  }
}

console.log('Exiting...');
await shutdown();
