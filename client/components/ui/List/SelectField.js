import React from 'react';
import PropTypes from 'prop-types';
import { observable, action } from 'mobx';
import { inject, observer } from 'mobx-react';
import { Icon } from '../index';
import t from '../../../../i18n';

@inject('store', 'uiStore', 'recordData') @observer
class SelectField extends React.Component {

	@observable value = null;
	@observable label = null;
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
		this.loaded = this.perpage;

		this.record = this.props.recordData.record;
		this.value = this.record[this.props.property];
		const selectedItem = this.props.items.filter(item => item.value === this.value);
		this.label = selectedItem[0] ? selectedItem[0].label : '-';
		this.list = this.props.items.slice(0, this.loaded);

		this.subscriberId = this.uiStore.subscribeToGlobalEvent('mousedown', this.onMouseDown.bind(this));
	}

	componentWillUnmount () {
		this.uiStore.unsubscribeFromGlobalEvent('mousedown', this.subscriberId);
	}

	componentDidUpdate () {
		if (this.active && this.valueInput) {
			this.valueInput.focus();
		}
	}

	onMouseDown (e) {
		if (this.active) {
			console.log('SelectField:', this.value, e.target);
			if (!this.node || !this.node.contains(e.target)) {
				this.active = false;
			}
		}
	}

	@action handleChange (e) {
		this.filterStr = e.target.value;
		// console.log('handleChange', this.filterStr);
		this.skip = this.perpage;
		this.list = this.props.items.filter(item => {
			const r = new RegExp('(^|\s)' + this.filterStr, 'img');
			return !!item.match(r);
		});
	}

	@action handleFocus (e) {
		this.active = true;
		this.filterStr = this.filterStrBak;
	}

	@action handleBlur (e) {
		this.active = false;
		this.filterStrBak = this.filterStr;
		this.filterStr = null;
	}

	@action selectItem (e, item) {
		e.preventDefault();
		e.stopPropagation();
		console.log('selectItem', item);
		this.value = item.value;
		this.label = item.label;
		this.filterStr = null;
		this.filterStrBak = null;
		this.active = false;
		this.record[this.props.property] = this.value;
		this.record.save().then(result => {
			if (result.ok) {
				if (this.props.recordData.onSave) this.props.recordData.onSave(this.outerRecord);
			}
			else {
				console.error(result.statusText);
			}
		});
	}

	@action more (e) {
		e.preventDefault();
		this.loaded += this.perpage;
		this.list = this.props.items.slice(0, this.loaded);
	}

	render () {
		const input = <input type="text"
		                     className="drop-down-search"
		                     ref={node => this.valueInput = node}
		                     value={this.filterStr !== null ? this.filterStr : ''}
		                     placeholder={this.label || '-'}
		                     onFocus={e => this.handleFocus(e)}
		                     onChange={e => this.handleChange(e)}
		/>;

		const items = this.list.map(item => {
			const selected = item.value === this.value;
			return <a key={item.value} href="#" className={'item' + (selected ? ' selected' : '')}
			          onClick={e => this.selectItem(e, item)}>{item.label}</a>
		});

		const icon = <Icon className="down-icon" icon="down-open" onClick={e => this.handleFocus(e)}/>;
		const more = this.props.items.length > this.list.length && this.props.items.length > this.loaded ? (
			<div className="more">
				<a href="#" onClick={e => this.more(e)}>{t('nextEllipsis')}</a>
				({t('more')}: {this.props.items.length - this.loaded})
			</div>
		) : '';

		return !this.uiStore.isMobile() ? (
			<td className={'select-field ' + (this.props.className || '')}
			    onClick={e => e.stopPropagation()}
			    ref={node => this.node = node}>
				<div className="inline">
					<input type="hidden" value={this.value || ''}/>
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
			</td>
		)
		:
		<td>{this.value}</td>

	}
}

SelectField.propTypes = {
	items: PropTypes.array,
	property: PropTypes.string,
	label: PropTypes.string,
};

SelectField.defaultProps = {};

export default SelectField;
