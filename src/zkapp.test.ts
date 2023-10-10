import { SimpleZkapp } from './zkapp';
import { Field, Mina, PrivateKey, PublicKey, AccountUpdate } from 'o1js';

/*
 * This file specifies how to test the `SimpleZkapp` example smart contract. It is safe to delete this file and replace
 * with your own tests.
 *
 * See https://docs.minaprotocol.com/zkapps for more info.
 */

let proofsEnabled = false;

describe('SimpleZkapp_', () => {
  let deployerAccount: PublicKey,
    deployerKey: PrivateKey,
    senderAccount: PublicKey,
    senderKey: PrivateKey,
    zkAppAddress: PublicKey,
    zkAppPrivateKey: PrivateKey,
    zkApp: SimpleZkapp;

  beforeAll(async () => {
    if (proofsEnabled) await SimpleZkapp.compile();
  });

  beforeEach(() => {
    const Local = Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);
    ({ privateKey: deployerKey, publicKey: deployerAccount } =
      Local.testAccounts[0]);
    ({ privateKey: senderKey, publicKey: senderAccount } =
      Local.testAccounts[1]);
    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();
    zkApp = new SimpleZkapp(zkAppAddress);
  });

  async function localDeploy() {
    const txn = await Mina.transaction(deployerAccount, () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      zkApp.deploy();
    });
    await txn.prove();
    // this tx needs .sign(), because `deploy()` adds an account update that requires signature authorization
    await txn.sign([deployerKey, zkAppPrivateKey]).send();
  }

  it('generates and deploys the `zkApp` smart contract', async () => {
    await localDeploy();
    const value = zkApp.value.get();
  });

  it('correctly updates the state on the `zkApp` smart contract', async () => {
    await localDeploy();

    // update transaction
    const txn = await Mina.transaction(senderAccount, () => {
      zkApp.giveAnswer(Field(7), senderAccount);
    });
    await txn.prove();
    await txn.sign([senderKey]).send();

    const value = zkApp.value.get();
    expect(value).toEqual(senderAccount);
  });
});
