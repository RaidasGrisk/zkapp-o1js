import { SimpleZkapp_ } from './zkapp.js';
import {
  Field,
  PrivateKey,
  PublicKey,
  Mina,
  isReady,
  shutdown,
  fetchAccount,
  setGraphqlEndpoint,
  // Poseidon,
} from 'snarkyjs';

await isReady;

const graphqlEndpoint = 'https://proxy.berkeley.minaexplorer.com/graphql';
setGraphqlEndpoint(graphqlEndpoint);

// you can use this with any spec-compliant graphql endpoint
console.log('connect to mina berkeley');
let Berkeley = Mina.BerkeleyQANet(graphqlEndpoint);
Mina.setActiveInstance(Berkeley);

// a random account
const private_key = 'EKEGgnxvJZCAdoWWVpP2xdXpEMnYcbiWs7Z3sma3xSfnyY2tzt4C';
// const public_key = "B62qir1gS3RFMWqtassVaw8DZm5fM9Gp5dLP5mFGapT8xj6qjVRmaJ3"

// zk app account
const zkappAddress = PublicKey.fromBase58(
  'B62qoD7GZfMURQSpEF98HBTCuuchzgiw43dNsZXanMg8w6AYKLCuVfc'
);

// to use this test, change this private key to an account which has enough MINA to pay fees
console.log('try fetching an account');
let feePayerKey = PrivateKey.fromBase58(private_key);
// let response = await fetchAccount({ publicKey: feePayerKey.toPublicKey() });
// if (response.error) throw Error(response.error.statusText);
// let { nonce, balance } = response.account;
// console.log(`Using fee payer account with nonce ${nonce}, balance ${balance}`);

// compile the SmartContract to get the verification key (if deploying) or cache the provers (if updating)
// this can take a while...
console.log('Compiling smart contract...');
await SimpleZkapp_.compile();

// check if the zkapp is already deployed, based on whether the account exists and its first zkapp state is != 0
console.log('try fetch zkapp account');
let { account, error } = await fetchAccount({ publicKey: zkappAddress });
console.log('account', JSON.stringify(account, null, 2));
console.log('error', JSON.stringify(error, null, 2));
let zkapp = new SimpleZkapp_(zkappAddress);

let value = zkapp.value.get();
console.log(`Found deployed zkapp, with state ${value.toBase58()}`);
let transaction = await Mina.transaction(
  { feePayerKey, fee: 100_000_000 },
  () => {
    zkapp.giveAnswer(
      Field(7),
      PublicKey.fromBase58(
        'B62qqBAUo5smz1whfdRjniFUnPv1V4Z1Y2VFPv16Zp1Z4497wmXmBgR'
      )
    );
  }
);

// fill in the proof - this can take a while...
console.log('Creating an execution proof...');
await transaction.prove();

// if you want to inspect the transaction, you can print it out:
// console.log(transaction.toGraphqlQuery());

// send the transaction to the graphql endpoint
console.log('Sending the transaction...');
await transaction.send().wait();

await shutdown();
