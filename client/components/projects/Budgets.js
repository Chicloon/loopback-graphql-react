import React from 'react';
import { inject, observer } from 'mobx-react';

import {
	List,
	TextField,
	NumberField,
} from '../ui/List';

import t from '../../../i18n';

@inject('store') @observer
class BudgetList extends React.PureComponent {

	constructor(props) {
		super(props);
		this.props = props;
		this.store = this.props.store;
	}

	percentLeft(budget) {
		const sum = budget.sum * budget.percentLeft;
		const percent = Math.round(budget.percentLeft * 100);
		return `${sum} (${percent}%)`;
	}

	render () {
		return <List model={this.store.Budget}
		             where={{ projectId: this.props.project.id }}
		             defaultSort={{ field: 'id', order: -1 }}
		             {...this.props}>
			<TextField property='name' label={t('name')} />
			<TextField relation='project' property='name' label={t('project.title')} />
			<NumberField property='sum' type='currency' label={t('sum')} />
			<NumberField property='paid' type='currency' label={t('budget.paid')} />
			<NumberField property='tax' type='percent' width='80px' label={t('tax')} />
			<NumberField computed={this.percentLeft} property='percentLeft' label={t('percentLeft')} />
			{/*<TextField property='comment' label={t('comment')} />*/}
		</List>;
	}
}

export default BudgetList;
