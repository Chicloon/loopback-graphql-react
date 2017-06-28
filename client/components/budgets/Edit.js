import React from 'react';
import { inject, observer } from 'mobx-react';

import {
	Form,
	TextInput,
	NumberInput,
	RelationInput,
} from '../ui/Form';
import t from '../../../i18n';

@inject('store') @observer
class BudgetEdit extends React.PureComponent {

	constructor (props) {
		super(props);
		this.store = props.store;
		this.props = props;
	}

	render() {
		if (!this.store.isInitialized) {
			return <div>Loading...</div>;
		}

		return (
			<Form model={this.store.Budget} className="fixed-width" {...this.props}>
				<TextInput property="name" label={t('name')}/>
				<RelationInput relation="project" property="name" label={t('project.title')}/>
				<NumberInput property="sum" label={t('sum')}/>
				<NumberInput property="paid" label={t('budget.paid')}/>
				<NumberInput property="tax" label={t('tax')}/>
				<NumberInput property="percentLeft" label={t('percentLeft')}/>
				<TextInput rows={5} property="comment" label={t('comment')}/>
			</Form>
		);
	}
}

export default BudgetEdit;
