import {
  state,
  State,
  DeployArgs,
  method,
  PublicKey,
  Field,
  SmartContract,
} from 'snarkyjs';

export { SimpleZkapp_ };

// a very simple SmartContract
class SimpleZkapp_ extends SmartContract {
  @state(PublicKey) y = State<PublicKey>();

  deploy(args: DeployArgs) {
    super.deploy(args);
  }

  @method update(answer: Field, y: PublicKey) {
    // 10 / 2 + 2
    answer.assertEquals(7);
    let y_ = this.y.get();
    this.y.assertEquals(y_);
    this.y.set(y);
  }
}
