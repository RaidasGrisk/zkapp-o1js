import {
  state,
  State,
  method,
  PublicKey,
  Field,
  SmartContract,
} from 'o1js';

// here's the idea: we have a math question: 10 / 2 + 2
// if you give a correct answer, the state will update
// and set value var to the publicKey a caller provided

class SimpleZkapp extends SmartContract {
  @state(PublicKey) value = State<PublicKey>();

  @method giveAnswer(answer: Field, value: PublicKey) {
    // below a simple math question: 10 / 2 + 2
    // lets check if given answer is correct
    answer.assertEquals(Field(10).div(2).add(2));

    // whoever manages to solve this and knows the answer
    // can prove this withought actually sharing the answer
    // i.e the answer you provide, never leaves your local env

    // imagine if the computation cost required to find / check
    // the answer was high. zkapp let us do all the compute
    // on the client side, and then send the proof over to the network!

    // if assertion passes, update state
    let value_ = this.value.get();
    this.value.assertEquals(value_);
    this.value.set(value);
  }
}

export { SimpleZkapp };
