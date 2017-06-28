import React from 'react';
import { inject, observer } from 'mobx-react';

import {
	Form,
	TextInput,
	NumberInput,
	DateInput,
	RelationInput,
} from '../ui/Form';
import t from '../../../i18n';

@inject('store') @observer
class PaymentEdit extends React.PureComponent {

	constructor (props) {
		super(props);
		this.store = props.store;
		this.props = props;
	}

	fullName(person) {
		return (person.lastName || '') + ' ' + (person.firstName || '') + ' ' + (person.middleName || '');
	}

	render() {
		if (!this.store.isInitialized) {
			return <div>Loading...</div>;
		}

		return (
			<Form model={this.store.Payment} className="fixed-width" title={t('payment.title')} {...this.props}>
				<RelationInput relation="person" computed={this.fullName} property="lastName" label={t('person.title')}/>
				<RelationInput relation="role" property="name" label={t('projectRole.title')}/>
				<RelationInput relation="budget" property="name" label={t('budget.title')}/>
				<NumberInput property="sum" label={t('sum')}/>
				<DateInput property="date" label={t('payment.date')}/>
				<TextInput rows={5} property="comment" label={t('comment')}/>
			</Form>
		);
	}
}

export default PaymentEdit;
