import React from 'react';
import { inject, observer } from 'mobx-react';

import {
	Form,
	TextInput,
	NumberInput,
	DateInput,
	RelationInput,
	BooleanInput,
} from '../../ui/Form';
import t from '../../../../i18n';

@inject('store') @observer
class BudgetRoleEdit extends React.PureComponent {

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
			<Form model={this.store.BudgetRole}
			      title={t('budgetRole.title')}
			      className="fixed-width"
			      {...this.props}>
				<RelationInput relation='person' computed={this.fullName} property='lastName' label={t('person.title')}/>
				<RelationInput relation='role' property='name' label={t('budgetRole.role')}/>
				<RelationInput relation='budget' property='name' label={t('budget.title')}/>
				<NumberInput property='sum' label={t('sum')}/>
				<NumberInput type='percent' property='percent' label={t('percent')}/>
				<NumberInput property='paid' label={t('budgetRole.paid')}/>
				<BooleanInput property='agent' label={t('agent')}/>
				<TextInput rows={5} property='comment' label={t('comment')}/>
			</Form>
		);
	}
}

export default BudgetRoleEdit;
