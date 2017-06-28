import React from 'react';
import PropTypes from 'prop-types';
import { observable, action } from 'mobx';
import { inject, observer } from 'mobx-react';
import { Icon } from '../index';
import t from '../../../../i18n';
import { Loader } from '../index';
import Model from '../../../store/Model';

@inject('store', 'uiStore') @observer
class ModelInput extends React.Component {

	@observable value = null;
	@observable idValue = null;
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

		this.model = this.props.listModel;
		this.modelName = this.model.MODEL_INFO.name;
		this.idValue = this.props.value;

		this.list = this.store[this.modelName].list({
			order: 'id asc',
			limit: this.perpage,
		});
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
		if (this.valueInput) {
			this.valueInput.focus();
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
		this.filterStr = this.filterStrBak;
	}

	@action selectItem(e, item) {
		e.preventDefault();
		e.stopPropagation();
		// console.log('selectItem', item);
		this.idValue = item.id;
		this.value = !this.props.computed ? item[this.props.outProperty] : this.props.computed(item);
		this.filterStr = null;
		this.filterStrBak = null;
		this.props.onSelect(item);
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
				<input type="hidden" value={this.idValue || ''} />
				<div className="drop-down active">
					{input}
					<div className="list">{items}{more}</div>
				</div>
			</div>
		);
	}
}

ModelInput.propTypes = {
	listModel: PropTypes.oneOfType([
		PropTypes.func,
		PropTypes.instanceOf(Model),
	]).isRequired,
	onSelect: PropTypes.func.isRequired,
	outProperty: PropTypes.string,
	value: PropTypes.number,
	computed: PropTypes.func,
};

ModelInput.defaultProps = {};

export default ModelInput;
