import React from 'react';
import { inject, observer } from 'mobx-react';
import { observable, action } from 'mobx';

import {
	Form,
	Row,
	TextInput,
	NumberInput,
	RelationInput,
} from '../ui/Form';

import {
	List,
	Field,
	TextField,
	BooleanField,
	NumberField,
	DateField,
} from '../ui/List';

import t from '../../../i18n';
import './style.scss';

@inject('store', 'uiStore') @observer
class BudgetBoard extends React.PureComponent {

	/*@observable*/
	budget;
	@observable lastUpdated = (new Date()).getTime();

	constructor (props) {
		super(props);
		this.store = props.store;
		this.id = this.props.match.params.id;
		this.include = [
			{
				relation: 'budgetRoles',
				scope: {
					order: 'id DESC',
				},
			},
			{
				relation: 'payments',
				scope: {
					order: 'id DESC',
				},
			},
		];
		this.budget = this.store.Budget.getById(this.id, null, this.include);
		console.log(this.budget.name);
		props.uiStore.setBar(<h1>{t('budget.title')}: <em>{this.budget.name}</em></h1>);
	}

	paid (budget) {
		if (budget.paid) {
			const paid = (budget.paid).toLocaleString(undefined, {
				style: 'currency',
				currency: 'RUB',
				minimumFractionDigits: 0,
				maximumFractionDigits: 2,
			});
			const percent = budget.sum > 0 ? '(' + Math.round(budget.paid / budget.sum * 100) + '%)' : '';
			return `${paid} ${percent}`;
		}
	}

	percentLeft (budget) {
		const sum = (budget.sum * budget.percentLeft).toLocaleString(undefined, {
			style: 'currency',
			currency: 'RUB',
			minimumFractionDigits: 0,
			maximumFractionDigits: 2,
		});
		const percent = Math.round(budget.percentLeft * 100);
		return `${sum} (${percent}%)`;
	}

	fullName (person) {
		return (person.lastName || '') + ' ' +
			(person.firstName ? person.firstName.charAt(0) + '.' : '') +
			(person.middleName ? person.middleName.charAt(0) + '.' : '');
	}

	onSave (record) {
		console.log('BudgetBoard: onSave:', record);
		this.budget.reload(this.include);
		this.incomingPaymentsList.reload();
		this.outgoingPaymentsList.reload();
		this.budgetRolesList.reload();
	}

	render () {
		// console.log('BudgetBoard: render', this.lastUpdated, this.budget);

		const incomingPayments = <List model={this.store.Payment}
		                               inline={true}
		                               where={{
			                               personId: null,
			                               budgetId: this.id,
		                               }}
		                               defaultProperties={{
			                               budgetId: this.id,
			                               date: new Date(),
		                               }}
		                               listRef={list => this.incomingPaymentsList = list}
		                               onSave={this.onSave.bind(this)}
		                               title={t('payment.incoming')}
		                               setTitle={false}
		                               className='incoming-payments'
		                               {...this.props}>
			<NumberField editable={true} type='currency' property='sum' className='left' headerClass='left' label={t('sum')}/>
			<DateField editable={true} property='date' label={t('payment.date')}/>
		</List>;

		const outgoingPayments = <List model={this.store.Payment}
		                               inline={true}
		                               where={{
			                               personId: { neq: null },
			                               budgetId: this.id,
		                               }}
		                               defaultProperties={{
			                               budgetId: this.id,
			                               date: new Date(),
		                               }}
		                               listRef={list => this.outgoingPaymentsList = list}
		                               onSave={this.onSave.bind(this)}
		                               title={t('payment.outgoing')}
		                               setTitle={false}
		                               className='outgoing-payments'
		                               {...this.props}>
			<Field editable={true} relation='person' computed={this.fullName} label={t('person.title')}/>
			<Field editable={true} relation='role' property="name" label={t('projectRole.short')}/>
			<NumberField editable={true} type='currency' property='sum' label={t('sum')}/>
			<DateField property='date' label={t('payment.date')}/>
		</List>;

		const budgetRoles = <List model={this.store.BudgetRole}
		                          where={{
			                          budgetId: this.id,
		                          }}
		                          defaultProperties={{
			                          budgetId: this.id,
		                          }}
		                          listRef={list => this.budgetRolesList = list}
		                          inline={true}
		                          title={t('budgetRoles')}
		                          setTitle={false}
		                          className='budget-roles'
		                          onSave={this.onSave.bind(this)}
		                          {...this.props}>
			<Field relation='person' computed={this.fullName} label={t('person.title')}/>
			<Field relation='role' property="name" label={t('projectRole.short')}/>
			<NumberField editable={true} property='sum' type='currency' label={t('sum')}/>
			<NumberField editable={true} property='percent' type='percent' label={t('percent')}/>
			<NumberField editable={false} property='paid' type='currency' label={t('budgetRole.paid')}/>
			<BooleanField property='agent' label={t('agent')}/>
		</List>;

		return (
			<div className="fixed-width">
				<Form model={this.store.Budget}
				      record={this.budget}
				      lastUpdated={this.lastUpdated}
				      {...this.props}>
					<Row>
						<TextInput property="name" label={t('name')}/>
						<RelationInput editable={true} relation="project" property="name" label={t('project.title')}/>
						{/*<Field editable={true} relation="project" property="name" label={t('project.title')}/>*/}
					</Row>
					<Row className='clearfix'>
						<NumberInput property="sum" label={t('sum')}/>
						<NumberInput type="percent" property="tax" label={t('tax')}/>
						<NumberField computed={this.paid} label={t('budget.paid')}/>
						<NumberField computed={this.percentLeft} label={t('percentLeft')}/>
					</Row>
					{/*<TextInput rows={5} property="comment" label={t('comment')}/>*/}
				</Form>

				<Row>
					<div className="col-xs-12 col-sm-6 col-md-6 col-lg-6">
						{incomingPayments}
					</div>
					<div className="col-xs-12 col-sm-6 col-md-6 col-lg-6">
						{outgoingPayments}
					</div>
				</Row>

				{budgetRoles}

			</div>
		);


	}
}

export default BudgetBoard;
