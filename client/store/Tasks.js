import { computed, observable, extendObservable, action, autorun } from 'mobx';


class Tasks {
  @observable itemList = ' item list';
	

  @action fillData(items) {
    this.itemList = items;


    const data = [{
      key: '1',
      name: 'John Brown',
      age: 32,
      address: 'New York No. 1 Lake Park',
    }, {
      key: '2',
      name: 'Jim Green',
      age: 42,
      address: 'London No. 1 Lake Park',
    }, {
      key: '3',
      name: 'Joe Black',
      age: 32,
      address: 'Sidney No. 1 Lake Park',
    }, {
      key: '4',
      name: 'Jim Red',
      age: 32,
      address: 'London No. 2 Lake Park',
    }];
  }

  @action test() {
    console.log('test from store');
  }
}


export default new Tasks();
