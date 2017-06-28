import React from 'react';
import { inject, observer } from 'mobx-react';

import {
	List,
	TextField,
	BooleanField,
	NumberField,
} from '../../ui/List';

import t from '../../../../i18n';

@inject('store') @observer
class BudgetRoleList extends React.PureComponent {

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

		return <List model={this.store.BudgetRole}
		             admin={true}
		             defaultSort={{ field: 'id', order: -1 }}
		             title={t('budgetRoles')}
		             {...this.props}>
			<NumberField property='id' label={t('ID')} className='id' headerClass='id' />
			<TextField relation='person' computed={this.fullName} label={t('person.title')} />
			<TextField relation='role' property="name" label={t('projectRole.title')} />
			<TextField relation='budget' property="name" label={t('budget.title')} />
			<NumberField property='sum' type='currency' label={t('sum')} />
			<NumberField property='percent' type='percent' label={t('percent')} />
			<NumberField property='paid' type='currency' label={t('budgetRole.paid')} />
			<BooleanField property='agent' label={t('agent')} />
			<TextField property="comment" label={t('comment')} />
		</List>;
	}
}

export default BudgetRoleList;
