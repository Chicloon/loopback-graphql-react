import React from 'react';
import { inject, observer } from 'mobx-react';

import {
	List,
	TextField,
	DateField,
	NumberField,
} from '../../ui/List';

import t from '../../../../i18n';

@inject('store') @observer
class PaymentList extends React.PureComponent {

	constructor(props) {
		super(props);
		this.props = props;
		this.store = this.props.store;
	}

	fullName(person) {
		return (person.lastName || '') + ' ' +
			(person.firstName ? person.firstName.charAt(0) + '.' : '') +
			(person.middleName ? person.middleName.charAt(0) + '.' : '');
	}

	render () {
		if (!this.store.isInitialized) {
			return <div>Loading...</div>;
		}

		return <List model={this.store.Payment}
		             admin={true}
		             defaultSort={{ field: 'id', order: -1 }}
		             title={t('payments')}
		             {...this.props}>
			<NumberField property='id' label={t('ID')} className='id' headerClass='id' />
			<TextField relation='person' computed={this.fullName} label={t('person.title')} />
			<TextField relation='role' property="name" label={t('projectRole.title')} />
			<TextField relation='budget' property="name" label={t('budget.title')} />
			<NumberField property='sum' label={t('sum')} />
			<DateField property='date' label={t('payment.date')} />
			<TextField property="comment" label={t('comment')} />
		</List>;
	}
}

export default PaymentList;
