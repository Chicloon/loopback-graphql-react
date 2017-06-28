import React from 'react';
import PropTypes from 'prop-types';
import { observable, action } from 'mobx';
import { inject, observer } from 'mobx-react';
import { Icon } from '../index';
import t from '../../../../i18n';
import { Loader } from '../index';
import Model from '../../../store/Model';

@inject('store', 'uiStore', 'recordData') @observer
class ModelInput extends React.Component {

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

		this.record = this.props.recordData.record;

		this.model = this.props.listModel;
		this.modelName = this.model.MODEL_INFO.name;
		this.idValue = this.record[this.props.property];

		this.list = this.store[this.modelName].list({
			order: 'id asc',
			limit: this.perpage,
		});

		// console.log('ModelInput:');
		// console.log('- modelName:', this.modelName);
		// console.log('- props:', props);
		// console.log('- list:', this.list.list);

		this.subscriberId = this.uiStore.subscribeToGlobalEvent('mousedown', this.onMouseDown.bind(this));
	}

	componentWillUnmount () {
		this.uiStore.unsubscribeFromGlobalEvent('mousedown', this.subscriberId);
	}

	componentWillUpdate() {
		if (!this.model.isLoading && !this.list.isLoading && !this.value && this.idValue) {
			const item = this.model.getById(this.idValue);
			if (item) {
				if (!this.props.computed) {
					this.value = item[this.props.outProperty];
				}
				else {
					this.value = this.props.computed(item);
				}
			}
		}
	}

	componentDidUpdate() {
		if (this.active && this.valueInput) {
			this.valueInput.focus();
		}
	}

	onMouseDown(e) {
		if (this.active) {
			console.log('ModelInput:', this.value, e.target);
			if (!this.node || !this.node.contains(e.target)) {
				this.active = false;
			}
		}
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
		this.filterStr = this.filterStrBak;
	}

	@action selectItem(e, item) {
		e.preventDefault();
		e.stopPropagation();
		console.log('selectItem', item);
		this.idValue = item.id;
		this.value = !this.props.computed ? item[this.props.outProperty] : this.props.computed(item);
		this.filterStr = null;
		this.filterStrBak = null;
		this.active = false;
		this.record[this.props.property] = this.idValue;
	}

	@action more(e) {
		e.preventDefault();
		this.skip += this.perpage;
		this.list.filter.limit = this.skip;
		console.log('more:', this.list.filter);
		this.list.reload();
	}

	render () {
		if (this.model && this.model.isLoading) {
			return <div>
				Loading...
			</div>;
		}

		// console.log('--- render:', this.list.isLoading);

		const input = <input type="text"
		                     className="form-control drop-down-search"
		                     ref={node => this.valueInput = node}
		                     value={this.filterStr !== null ? this.filterStr : ''}
		                     placeholder={this.value}
		                     onFocus={e => this.handleFocus(e)}
		                     onChange={e => this.handleChange(e)}
		/>;

		const items = this.list.list.map((item, i) => {
			const selected = item.id === this.idValue;
			// console.log('- item:', item.id, this.idValue, selected);
			const value = !this.props.computed ? item[this.props.outProperty] : this.props.computed(item);
			return <a key={item.id} href="#" className={'item' + (selected ? ' selected' : '')}
			          onClick={e => this.selectItem(e, item)}>{value}</a>
		});

		const icon = <Icon className="down-icon" icon="down-open" onClick={e => this.handleFocus(e)} />;
		const more = this.list.totalCount > this.perpage && this.list.totalCount > this.skip ? (
			<div className="more">
				{this.list.isLoading ?
					<Loader size={18} />
					:
					<div>
						<a href="#" onClick={e => this.more(e)}>{t('nextEllipsis')}</a>
						({t('more')}: {this.list.totalCount - this.skip})
					</div>
				}
			</div>
		) : '';

		return (
			<div className={'form-input ' + (this.props.className || '')} ref={node => this.node = node}>
				<label>{this.props.label}</label>
				<input type="hidden" value={this.idValue || ''} />
				{
					!this.active ?
						<div className="drop-down">{input}{icon}</div>
						:
						<div className="drop-down active">
							{input}{icon}
							<div className="list">{items}{more}</div>
						</div>
				}
			</div>
		);
	}
}

ModelInput.propTypes = {
	listModel: PropTypes.oneOfType([
		PropTypes.func,
		PropTypes.instanceOf(Model),
	]).isRequired,
	property: PropTypes.string,
	outProperty: PropTypes.string,
	label: PropTypes.string,
};

ModelInput.defaultProps = {};

export default ModelInput;
