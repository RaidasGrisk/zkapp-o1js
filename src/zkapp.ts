import {
  state,
  State,
  method,
  PublicKey,
  Field,
  SmartContract,
} from 'snarkyjs';

export { SimpleZkapp_ };

// here's the idea: we have a math question: 10 / 2 + 2
// if you give a correct answer, the state will update
// and set value var to the publicKey a caller provided

class SimpleZkapp_ extends SmartContract {
  @state(PublicKey) value = State<PublicKey>();

  @method giveAnswer(answer: Field, value: PublicKey) {
    // below a simple math question: 10 / 2 + 2
    // lets check if given answer is correct
    answer.assertEquals(Field(10).div(2).add(2));

    // whoever manages to solve this and knows the answer
    // can prove this withought actually sharing the answer
    // i.e the answer you provide, never leaves your local env

    // also, if the computation costs required to check / find
    // the answer was high - this lets us do all the compute
    // on the client side, and then simply send the proof!

    // if assertion passes, update state
    let value_ = this.value.get();
    this.value.assertEquals(value_);
    this.value.set(value);
  }
}
