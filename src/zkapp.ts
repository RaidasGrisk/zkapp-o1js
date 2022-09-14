import {
  state,
  State,
  DeployArgs,
  method,
  PublicKey,
  Field,
  SmartContract,
  Poseidon,
} from 'snarkyjs';

export { SimpleZkapp_ };

// a very simple SmartContract
class SimpleZkapp_ extends SmartContract {
  @state(PublicKey) value = State<PublicKey>();

  deploy(args: DeployArgs) {
    super.deploy(args);
  }

  @method update(answer: Field, value: PublicKey) {
    // So here's a simple math question 10 / 2 + 2
    // whoever manages to solve this and knows the answer
    // can prove it withought actually sharing the answer.

    // Also, if the computation costs required to check / find
    // the answer was high - this lets us do all the compute
    // on the client side, and after simply send the proof!

    // Lets check if answer is correct.
    // I know, I know, the equation is hard to solve,
    // and I have to obfuscate the answer, so here goes:
    let hash_ = Field.fromString(
      '6578875638485601876110040807563059226527821355810144956664181662741507347263'
    );
    let hash = Poseidon.hash([answer]);
    hash.assertEquals(hash_);

    // if assertion passes, update state
    let value_ = this.value.get();
    this.value.assertEquals(value_);
    this.value.set(value);
  }
}
