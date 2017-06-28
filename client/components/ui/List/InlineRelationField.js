import React from 'react';
import PropTypes from 'prop-types';
import { observable, action } from 'mobx';
import { inject, observer } from 'mobx-react';
import { Icon } from '../index';
import t from '../../../../i18n';
import { Loader } from '../index';
import Model from '../../../store/Model';

// do not inject recordData! it's already sent from Field

@inject('store', 'uiStore') @observer
class InlineRelationInput extends React.Component {

	@observable value = null;
	@observable idValue = null;
	@observable active = false;
	@observable list = false;
	@observable filterStr = null;
	@observable filterStrBak = null;

	constructor (props) {
		super(props);
		this.props = props;
		this.store = props.store;
		this.uiStore = props.uiStore;
		this.perpage = 10;
		this.skip = this.perpage;

		// console.log('InlineRelationInput:', this.relatedRecord);
		this.foreignKey = this.props.recordData.model.RELATIONS[this.props.relation].foreignKey;
		this.relationModel = this.props.recordData.model.RELATIONS[this.props.relation].model;
		this.value = this.props.value;
		this.idValue = this.props.recordData.record[this.foreignKey];
		this.oldValue = this.idValue;

		if (this.props.recordData.getSharedList) {
			this.list = this.props.recordData.getSharedList(this.props.relation);
		}
		if (!this.list) {
			this.list = this.store[this.relationModel].list({
				order: (this.props.property || 'id') + ' asc',
				limit: this.perpage,
			});
			if (this.props.recordData.shareList) this.props.recordData.shareList(this.props.relation, this.list);
		}

		this.subscriberId = this.uiStore.subscribeToGlobalEvent('mousedown', this.onMouseDown.bind(this));
	}

	componentWillUnmount () {
		this.uiStore.unsubscribeFromGlobalEvent('mousedown', this.subscriberId);
	}

	onMouseDown(e) {
		if (this.active) {
			// console.log('InlineRelationInput:', this.value, e.target);
			if (!this.node || !this.node.contains(e.target)) {
				this.active = false;
			}
		}
	}

	componentWillUpdate () {
		if (this.relatedRecord && !this.relatedRecord.isLoading && !this.value) {
			if (!this.props.computed) {
				this.value = this.relatedRecord[this.props.property];
			}
			else {
				this.value = this.props.computed(this.relatedRecord);
			}
		}
	}

	componentDidUpdate () {
		// console.log('componentDidUpdate');
		if (this.active && this.valueInput) {
			this.valueInput.focus();
		}
	}

	get relatedRecord () {
		return this.props.recordData.record[this.props.relation];
	}

	@action handleChange (e) {
		this.filterStr = e.target.value;
		// console.log('handleChange', this.filterStr);
		this.skip = this.perpage;
		this.list.filter.limit = this.perpage;
		this.list.filter.where = {
			_search: this.filterStr.trim(),
		};
		this.list.reload();
	}

	@action handleFocus (e) {
		this.active = true;
		//this.filterStr = this.filterStrBak;
	}

	@action handleBlur (e) {
		if (e.keyCode !== 9) return;
		console.log('handleBlur', e.keyCode);
		if (e.shiftKey) {
			console.log('must implenent back tab');
		}
		this.resetList();
	}

	handleCoverClick (e) {
		console.log('handleCoverClick');
		this.resetList();
	}

	@action resetList () {
		console.log('resetList', this.props.relation);
		this.active = false;
		this.filterStr = null;
		if (this.list.filter.where && this.list.filter.where._search) {
			this.list.filter.where = {};
			this.list.reload();
		}
	}

	@action selectItem (e, item) {
		e.preventDefault();
		e.stopPropagation();
		if (item !== null) {
			this.idValue = item.id;
			this.value = !this.props.computed ? item[this.props.property] : this.props.computed(item);
		}
		else {
			this.idValue = null;
			this.value = this.props.emptyField;
		}
		console.log('+ selectItem', this.idValue, this.value);
		this.filterStr = null;
		this.filterStrBak = null;
		this.active = false;
		if (this.idValue !== this.oldValue) {
			this.props.recordData.record[this.foreignKey] = this.idValue;
			this.oldValue = this.idValue;
			if (this.props.onChange) this.props.onChange({ id: this.idValue, value: this.value });
		}
	}

	@action more (e) {
		e.preventDefault();
		this.skip += this.perpage;
		this.list.filter.limit = this.skip;
		console.log('more:', this.list.filter);
		this.list.reload();
	}

	render () {
		if (this.relatedRecord && this.relatedRecord.isLoading) {
			return <div>
				Loading...
			</div>;
		}

		const printValue = this.props.computed ? (this.relatedRecord ? this.props.computed(this.relatedRecord) : null) : this.value;
		// console.log('--- InlineRelationInput render:', this.relatedRecord, printValue);
		const input = this.active? <input type="text"
		                     className="form-control drop-down-search"
		                     ref={node => this.valueInput = node}
		                     value={this.filterStr !== null ? this.filterStr : ''}
		                     // placeholder={printValue || this.props.emptyField}
		                     onFocus={e => this.handleFocus(e)}
		                     onKeyDown={e => this.handleBlur(e)}
		                     onChange={e => this.handleChange(e)}/>
			:
			<div className="placeholder" onClick={e => this.handleFocus(e)}>
				{this.value || this.props.emptyField}
			</div>;

		const items = this.list.list.map((item, i) => {
			const selected = item.id === this.idValue;
			const value = !this.props.computed ? item[this.props.property] : this.props.computed(item);
			return <a key={item.id} tabIndex={-1} href="#" className={'item' + (selected ? ' selected' : '')}
			          onClick={e => this.selectItem(e, item)}>{value}</a>
		});

		const icon = <Icon className="down-icon" icon="down-open" onClick={e => this.handleFocus(e)}/>;
		// const more = this.list.totalCount > this.perpage && this.list.totalCount > this.skip ? (
		const more = this.list.list.length < this.list.totalCount ? (
			<div className="more">
				{this.list.isLoading ?
					<Loader size={18}/>
					:
					<div>
						<a tabIndex={-1} href="#" onClick={e => this.more(e)}>{t('nextEllipsis')}</a>
						({t('more')}: {this.list.totalCount - this.skip})
					</div>
				}
			</div>
		) : '';

		return this.active ? (
			<div className="form-input inline" ref={node => this.node = node}>
				<input type="hidden" value={this.idValue || ''}/>
				<div className="drop-down active">
					{input}{icon}
					{this.list.list.length > 0 ?
						<div className="list">
							<a key='item-null' tabIndex={-1} href="#" className={'item' + (this.idValue === null ? ' selected' : '')}
							   onClick={e => this.selectItem(e, null)}>{this.props.emptyField}</a>
							{items}
							{more}
						</div>
						:
						<div className="loading">Loading...</div>
					}
				</div>
			</div>
		) :
			<div className="form-input inline">
				<div className="drop-down">{input}{icon}</div>
			</div>;
	}
}

InlineRelationInput.propTypes = {
	model: PropTypes.oneOfType([
		PropTypes.func,
		PropTypes.instanceOf(Model),
	]).isRequired,
	relation: PropTypes.string.isRequired,
	property: PropTypes.string,
	onChange: PropTypes.func,
};

InlineRelationInput.defaultProps = {};

export default InlineRelationInput;
