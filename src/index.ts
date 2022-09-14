import { SimpleZkapp_ } from './zkapp.js';
import { isReady, Mina, PrivateKey, shutdown, Party, Field } from 'snarkyjs';

// setup
await isReady;
const Local = Mina.LocalBlockchain();
Mina.setActiveInstance(Local);

const account = Local.testAccounts[0].privateKey;
const zkappKey = PrivateKey.random();
let zkappAddress = zkappKey.toPublicKey();

// have to compile if using proofs?
// https://github.com/o1-labs/snarkyjs/blob/main/src/examples/zkapps/simple_and_counter_zkapp.ts
console.log('Compiling smart contract...');
let { verificationKey } = await SimpleZkapp_.compile(zkappAddress);

let zkapp = new SimpleZkapp_(zkappAddress);

console.log(`Deploying zkapp for public key ${zkappAddress.toBase58()}.`);
let tx = await Mina.transaction(account, () => {
  Party.fundNewAccount(account);
  zkapp.deploy({ zkappKey, verificationKey });
});
// zkapp.sign(zkappKey);
await tx.send().wait();

let tryInteracting = false;
if (tryInteracting) {
  // https://github.com/o1-labs/snarkyjs/blob/main/src/examples/zkapps/hello_world/run.ts
  // let initialState = await Mina.getAccount(zkappAddress);
  console.log('Initial State', zkapp.y.get().toBase58());

  console.log(`Update state`);
  let tx_ = await Mina.transaction(account, () => {
    zkapp.update(Field(7), account.toPublicKey());
  });
  // fill in the proof - this can take a while...
  console.log('Creating an execution proof...');
  await tx_.prove();

  // send the transaction to the graphql endpoint
  console.log('Sending the transaction...');
  await tx_.send().wait();

  console.log('Updated State', zkapp.y.get().toBase58());

  // okay, so lets send something that does not satisfy the update condition
  console.log(`Update state bad`);
  try {
    let tx__ = await Mina.transaction(account, () => {
      zkapp.update(Field(6), zkappKey.toPublicKey());
    });
    // fill in the proof - this can take a while...
    console.log('Creating an execution proof...');
    await tx__.prove();

    // send the transaction to the graphql endpoint
    console.log('Sending the transaction...');
    await tx__.send().wait();

    console.log('Updated State', zkapp.y.get().toBase58());
  } catch (error) {
    console.log('ERROR');
    console.error(error);
  }
}

shutdown();
