import React from 'react';
import PropTypes from 'prop-types';
import { observable, action } from 'mobx';
import { inject, observer } from 'mobx-react';
import { Icon, IconLink } from '../index';
import { Link } from 'react-router-dom';
import InlineRelationInput from './InlineRelationField';

const LOADING = "LOADING";
const ERROR = "ERROR";
const SUCCESS = "SUCCESS";

/**
 * Field - базовый компонент, который используется следующими копомнентами:
 *
 * - TextField
 * - NumberField
 * - DateField
 * - BooleanField
 *
 * которые в свою очередь можно вставить и в List и в Form и которые получат от них пропы:
 *
 * - record - запись
 * - model - модель записи
 *
 * Сам компонент принимает следующие (главные) пропы:
 *
 * - property - свойство записи
 * - relation
 * - computed
 *
 */

@inject(
	'store',
	'uiStore',
	'recordData',
)
@observer
class Field extends React.PureComponent {

	@observable isEditing = false;

	constructor (props) {
		super(props);
		this.props = props;
		this.store = props.store;
		this.uiStore = props.uiStore;
		this.oldValue = undefined;

		const { relation, property, computed } = props;

		this.outerRecord = props.recordData.record;
		this.model = props.recordData.model;
		this.emptyField = props.emptyField || props.recordData.emptyField;
		this.clickTarget = props.recordData.clickTarget;

		if (this.outerRecord === undefined) {
			throw ReferenceError('Field.js: "record" prop is undefined, props:', this.props);
		}

		if (!property && !computed) {
			throw ReferenceError('Field.js: provide "property" or "computed" props');
		}

		this.errorIcon = <Icon icon="attention" className="error" title={(relation ? relation + '.' : '') + property + ' not found'}/>;

		if (relation) {
			this.foreignKey = this.model.RELATIONS[relation].foreignKey;
			this.relationModelName = this.model.RELATIONS[relation].model;
		}

		this.result = LOADING;
		this.lastValue = null;

		// console.log('- Field:');
		// console.log('-- props:', props);
		// console.log('-- props.record:', props.record);
		// console.log('-- this.record:', this.record);
	}

	componentDidUpdate () {
		if (!this.isEditing) {
			setTimeout(() => {
				if (this.refs.input) this.refs.input.blur()
			}, 0);
		}
		else {
			setTimeout(() => {
				if (this.refs.input) this.refs.input.focus()
			}, 0);
		}
	}

	get editable () {
		if (this.uiStore.isMobile()) return false;
		if (this.props.editable === false) return false;
		if (this.props.recordData.editable === false) return false;
		if (this.props.recordData.editable) return true;
		return this.props.editable;
	}

	get idValue () {
		// return this.outerRecord.isLoading ? null : this.outerRecord[this.foreignKey];
		return this.outerRecord[this.foreignKey];
	}

	set idValue (newValue) {
		this.outerRecord[this.foreignKey] = newValue;
	}

	get record () {
		let record = !this.props.relation ? this.outerRecord : this.outerRecord[this.props.relation];
		if (typeof record === 'function') record = record.call(this.outerRecord);
		return record;
	}

	get value () {
		let { property, computed } = this.props;
		this.result = SUCCESS;
		if (!this.record) return null;

		if (this.record.isLoading) {
			this.result = LOADING;
			return null;
		}

		const value = !computed ? this.record[property] : computed(this.record);
		if (value === undefined) {
			// console.warn('Field.js:', property, ', value is undefined, record: ', this.record);
			return null;
		}

		return value;
	}

	set value (newValue) {
		if (!this.props.relation) {
			this.record[this.props.property] = newValue;
		}
	}


	handleChange (e) {
		let newValue = e.target.value;
		console.log('Field: handleChange:', newValue);
		if (this.props.handleChange) {
			newValue = this.props.handleChange(this.value, newValue);
		}
		if (this.props.dataClass === 'data-boolean') {
			newValue = !this.value;
		}
		this.value = this.props.saveValue ? this.props.saveValue(newValue) : newValue;
	}

	handleRelationChange (res) {
		this.idValue = res.id;
		this.value = res.value;
		this.isEditing = false;
		this.save();
	}

	handleClick (e) {
		e.preventDefault();
		e.stopPropagation();
		this.isEditing = true;
		this.oldValue = this.props.relation ? this.idValue : this.value;
	}

	handleBooleanClick (e) {
		this.value = !this.value;
		// console.log('handleBooleanClick', this.value);
		e.preventDefault();
		e.stopPropagation();
		this.save();
	}

	handleFocus (e) {
		this.isEditing = true;
		this.oldValue = this.props.relation ? this.idValue : this.value;
	}

	handleRelationOver (e) {
		if (this.props.recordData.onRelationOver) {
			this.props.recordData.onRelationOver(e);
		}
	}

	handleRelationOout (e) {
		if (this.props.recordData.onRelationOut) {
			this.props.recordData.onRelationOut(e);
		}
	}

	handleOk (e) {
		// console.log('handleOk');
		e.stopPropagation();
		this.isEditing = false;
		this.save();
	}

	handleBlur (e) {
		if (this.isEditing) {
			// console.log('handleBlur');
			this.isEditing = false;
			this.save();
		}
	}

	handleCellClick (e) {
		if (this.editable) {
			e.stopPropagation();
		}
	}

	save () {
		const newValue = this.props.relation ? this.idValue : this.value;
		// console.log('save: oldValue:', this.oldValue, ', newValue:', newValue);
		if (this.oldValue !== newValue) {
			this.oldValue = newValue;
			this.outerRecord.save().then(result => {
				if (result.ok) {
					if (this.props.recordData.onSave) this.props.recordData.onSave(this.outerRecord);
				}
				else {
					console.error(result.statusText);
				}
			});
		}
		else {
			console.log('value was not changed');
		}
	}

	inputField (value) {
		if (this.props.dataClass === 'data-boolean') {
			return <Icon icon={value ? 'ok' : 'minus'} onClick={e => this.handleBooleanClick(e)}/>
		}
		let outValue = value;
		if (value === null) {
			outValue = this.isEditing ? '' : (this.props.emptyField || '');
		}
		return <input size={5} ref='input'
		              type='text'
		              value={outValue}
		              onBlur={e => this.handleBlur(e)}
		              onFocus={e => this.handleFocus(e)}
		              onClick={e => this.handleClick(e)}
		              onChange={e => this.handleChange(e)}/>;
	}

	edit (value) {
		if (this.props.relation) {
			return <InlineRelationInput value={value} {...this.props}
			                            record={this.outerRecord}
			                            model={this.model}
			                            emptyField={this.emptyField}
			                            onChange={res => this.handleRelationChange(res)}/>;
		}
		return this.isEditing ?
			<div className={this.props.dataClass !== 'data-date' ? 'inline' : ''}>
				<div className="edit-block">
					{this.inputField(this.props.processValue ? this.props.processValue(this.value) : this.value)}
					<Icon className="ok" icon="ok" onClick={e => this.handleOk(e)}/>
				</div>
			</div>
			:
			<div className="inline">
				{this.inputField(this.props.printValue ? this.props.printValue(value) : value)}
			</div>;
	}

	print (value) {
		let printValue = this.props.printValue ? this.props.printValue(value) : value;
		if (this.record && this.props.relation && !this.props.editable && !this.props.nolink) {
			const type = this.model.RELATIONS[this.props.relation].type;
			if (type === 'belongsTo') {
				printValue = <a className="relation-link" href="#"
				                onMouseOver={this.handleRelationOver.bind(this)}
				                onMouseOut={this.handleRelationOout.bind(this)}
				                onClick={e => this.gotoRelation(e)}>{printValue}</a>;
			}
		}
		return <span className="value" ref={node => {if (this.props.getRef) this.props.getRef(node)}}>
					{printValue || this.emptyField}
		 		</span>;
	}

	gotoRelation (e) {
		e.preventDefault();
		e.stopPropagation();
		const path = (this.props.recordData.admin ? '/admin' : '') + '/' + this.store[this.relationModelName].API_PATH + '/' + this.record.id;
		console.log('path:', path, this.props.recordData);
		this.props.recordData.history.push(path);
	}

	joinClass () {
		let name = 'field field';
		if (this.props.relation) {
			name += '-' + this.props.relation;
		}
		else if (this.props.property) {
			name += '-' + this.props.property;
		}
		return [...arguments, name].filter(v => !!v).join(' ');
	}

	wrapper (value, className, fn) {
		const content = fn ? fn(value) : value;
		return this.props.recordData.form ?
			(
				<div className={this.joinClass('form-input', this.props.className, className)}>
					{(value || this.emptyField) && <label>{this.props.label}</label>}
					{content}
				</div>
			) : (
				<td className={this.joinClass(this.props.dataClass, this.props.className, className, this.editable && 'editable-cell')}
				    style={{ ...this.props.style }}
				    onClick={e => this.handleCellClick(e)}
				    title={typeof value !== 'object' ? value : ''}>
					{content}
				</td>
			)
	}

	render () {
		const value = this.value;
		// console.log('Field render:', value, typeof value, this.emptyField);

		// if (this.result === LOADING) return this.wrapper('...');
		if (this.result === LOADING) {
			return this.lastValue ? this.wrapper(this.lastValue,
				this.props.addClassName ? this.props.addClassName(value) : '',
				v => this.editable ? this.edit(v) : this.print(v)
			) : this.wrapper('...');
		}
		if (this.result === ERROR) return this.wrapper(this.errorIcon);
		if (value === null && !this.editable) return this.wrapper(this.print(null), 'empty');
		if (this.props.relation && this.idValue === null && !this.editable) return this.wrapper(this.emptyField, 'empty');

		this.lastValue = value;

		return this.wrapper(value,
			this.props.addClassName ? this.props.addClassName(value) : '',
			v => this.editable ? this.edit(v) : this.print(v)
		);

	}
}

Field.propTypes = {
	property: PropTypes.string,
	processValue: PropTypes.func,
	printValue: PropTypes.func,
	saveValue: PropTypes.func,
	addClassName: PropTypes.func,
	handleChange: PropTypes.func,
	relation: PropTypes.string,
	editable: PropTypes.bool,
	nolink: PropTypes.bool,
	computed: PropTypes.func,
	getRef: PropTypes.func,
	className: PropTypes.string,
	headerClass: PropTypes.string,
	emptyField: PropTypes.string,
};

Field.defaultProps = {
	dataClass: 'data-text',
	className: 'left',
	headerClass: 'left',
	emptyField: '-',
};

export default Field;
