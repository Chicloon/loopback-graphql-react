import React from 'react';
import PropTypes from 'prop-types';
import { observable, action } from 'mobx';
import { inject, observer, Provider } from 'mobx-react';
import './style.scss';
import { Icon, IconLink } from '../index';
import Model from '../../../store/Model';
import t from '../../../../i18n';
import { Loader, MultiFilter } from '../index';

@inject('store', 'uiStore') @observer
class List extends React.Component {

	@observable filterString = '';
	@observable sharedLists = {};
	@observable addingRecord = false;

	constructor (props) {
		super(props);
		this.props = props;
		this.store = props.store;
		this.uiStore = props.uiStore;
		this.sort = props.inline ? { field: 'id', order: -1 } : props.defaultSort;
		this.perpage = 15;
		this.skip = 0;
		this.list = this.props.model.list({
			limit: this.perpage,
			order: this.sortString,
			where: this.props.where,
		});
		this.relationFilters = {};
		// console.log('list.createTitle:', props.createTitle);
		if (this.props.listRef) this.props.listRef(this.list);
		
		if (props.title && props.setTitle !== false) props.uiStore.setBar(<h1>{this.props.title}</h1>);		
		console.log(this.props, this.list);
	}

	componentDidMount() {
		if (this.uiStore.currentFilter[this.props.model.API_PATH]) {
			const { filter, filterString, sort } = this.uiStore.currentFilter[this.props.model.API_PATH];
			this.list.filter = filter;
			this.filterString = filterString;
			this.uiStore.currentFilter = {};
			this.sort = sort;
		}		
	}

	handleItemClick (item) {
		if (!item.id) {
			return;
		}
		this.uiStore.currentFilter = {
			[this.props.model.API_PATH]: {
				filter: this.list.filter,
				filterString: this.filterString,
				sort: this.sort,
			}
		};
		// console.log('handleItemClick: ', item);
		this.props.history.push((this.props.admin ? '/admin' : '') + '/' + this.props.model.API_PATH + '/' + item.id);
	}

	get sortString () {
		return this.sort.field + ' ' + (this.sort.order > 0 ? 'asc' : 'desc');
	}

	@action getRecords () {
		// console.log('getRecords: ', this.uiStore.currentFilter);
		if (this.uiStore.currentFilter[this.props.model.API_PATH]) {
			const { filter, filterString, sort } = this.uiStore.currentFilter[this.props.model.API_PATH];
			this.list.filter = filter;
			this.filterString = filterString;
			this.uiStore.currentFilter = {};
			this.sort = sort;
		}
		else {
			this.list.filter = {
				limit: this.perpage + this.skip,
				order: this.sortString,
			};

			let and = [];
			if (this.props.where) and.push(this.props.where);
			console.log('this.relationFilters', JSON.stringify(this.relationFilters));
			if (this.relationFilters.length > 0) and = [...and, ...this.relationFilters];
			const str = this.filterString.trim();
			if (str.length > 0) {
				this.list.filter.where = { _search: str };
			}
			if (and.length > 0) {
				this.list.filter.where = {
					...this.list.filter.where,
					and
				};
			}

		}
		console.log('filter:', JSON.stringify(this.list.filter));
		this.list.reload();
	}

	sortList (e, sortField) {
		e.preventDefault();
		this.skip = 0;
		this.nomore = false;
		if (this.sort.field === sortField) {
			this.sort.order = -this.sort.order;
		}
		else {
			this.sort.field = sortField;
			this.sort.order = 1;
		}
		// console.log('sortList by ', this.sort.field, this.sort.order);
		this.getRecords();
	}

	loadMore (e) {
		e.preventDefault();
		this.skip += this.perpage;
		this.getRecords();
	}

	@action handleFilterChange (e) {
		this.skip = 0;
		this.nomore = false;
		this.filterString = e.target.value;
		console.log('handleFilterChange:', this.filterString);
		this.getRecords();
	}

	handleMultiFilterChange (filter) {
		this.filterString = filter.filterText;
		const relationFilters = [];
		Object.keys(filter)
			.filter(key => key !== 'filterText')
			.forEach(relationName => {
				const relation = filter[relationName];
				relationFilters.push({[relation.foreignKey]: relation.id});
			});
		this.relationFilters = relationFilters;
		console.log('handleMultiFilterChange:', this.filterString, this.relationFilters);
		this.getRecords();
	}

	@action reload (e) {
		// console.log('reloading list:', this.props.model.MODEL_INFO.name);
		if (e) e.preventDefault();
		this.list.reload();
	}

	@action onSave(record) {
		// console.log('List: onSave:', this.props.onSave, ', record: ', record);
		if (this.props.onSave) this.props.onSave(record);
		this.addingRecord = false;
		this.reload();
	}

	getSharedList(relation) {
		// console.log('-- getSharedList:', relation, this.sharedLists[relation]);
		return this.sharedLists[relation];
	}

	shareList(relation, list) {
		// console.log('-- shareList:', relation, list);
		this.sharedLists[relation] = list;
	}

	addRecord(e) {
		e.preventDefault();
		this.addingRecord = true;
		console.log('addRecord:', this.props.model.MODEL_INFO.name);
	}

	confirmDelete(e, record) {
		e.stopPropagation();
		if (confirm('Delete?')) {
			this.deleteRecord(record)
		}
	}

	@action deleteRecord(record) {
		console.log('deleteRecord', record);
		record.delete().then(result => {
			if (result.ok) {
				this.list.reload();
			}
			else {
				console.error('deleteRecord:', result.statusText);
			}
		});
	}

	render () {
		{console.log('----- ui list component', this.props)}
		const headers = React.Children.map(this.props.children, (field, i) => {
			const { property, relation, label, width, sortable } = field.props;
			let className = field.props.headerClass || (field.type.defaultProps ? field.type.defaultProps.headerClass : {});
			let orderIcon = '';

			const sortField = relation ? this.props.model.RELATIONS[relation].foreignKey : property;

			if (sortField === this.sort.field) {
				orderIcon = this.sort.order > 0 ? <Icon icon="down-open"/> : <Icon icon="up-open"/>;
			}
			return (
				<th key={i}
				    style={width ? { width } : {}}
				    className={'field-header col-' + i + ' ' + (className || '')}>
					{label && (sortable === false ? label : <a href="#" onClick={e => this.sortList(e, sortField)}>{label}</a>)}
					{orderIcon}
				</th>
			);
		});

		if (!this.uiStore.isMobile() && this.props.inline) headers.push(<th key="actions" />);

		// console.log('-------------------------------------------');
		// console.log('list render');

		if (this.list.list && !this.list.isLoading) {
			const count = this.list.list.length;
			// console.log('count:', count, ', skip:', this.skip);
			if (count >= this.list.totalCount || this.list.totalCount === 0) {
				this.nomore = true;
			}
		}

		const title = this.props.inline ? <div className="list-title"><h2>{this.props.title || this.props.model.MODEL_INFO.name}</h2>
			{(this.props.inline && !this.props.noCreate) && <div className="list-menu">
				<IconLink icon="plus" label={t('add')} onClick={e => this.addRecord(e)}/></div>
			}
		</div> : '';

		const related = {
			getSharedList: relation => this.getSharedList(relation),
			shareList: (relation, list) => this.shareList(relation, list),
		};
		if (this.props.inline) related.editable = true;

		const recordsList = [...this.list.list];
		
		if (this.addingRecord) {
			const modelName = this.props.model.MODEL_INFO.name;
			const newRecord = new this.store[modelName];
			Object.assign(newRecord, this.props.defaultProperties);
			console.log('newRecord:', newRecord);
			recordsList.splice(0, 0, newRecord);
		}
		console.log('recordsList', recordsList);
		const list = recordsList.map((record, i) => {
			const key = record.id || 'new';
			const recordData = {
				model: this.props.model,
				record,
				admin: this.props.admin,
				emptyField: this.props.emptyField,
				falseField: this.props.falseField,
				onSave: record => this.onSave(record),
				clickTarget: this.clickTarget,
				form: false,
				history: this.props.history,
				onRelationOver: e => {
					document.getElementById("data-row-"+key).classList.add('relation-hover');
				},
				onRelationOut: e => {
					document.getElementById("data-row-"+key).classList.remove('relation-hover');
				},
				...related
			};
			if (!record.id) {
				recordData.editable = true;
			}
			// console.log('editable:', record.id, recordData.editable);
			return <Provider key={'provider'+key} recordData={recordData} suppressChangedStoreWarning={true}>
				<tr className="data-row" id={"data-row-"+key} key={key} onClick={e => this.handleItemClick(record)}>
					{this.props.children}
					{(!this.uiStore.isMobile() && this.props.inline) &&
						<td>
							{record.id && <Icon icon="right-open"/>}
							{record.id && <IconLink icon="trash" onClick={e => this.confirmDelete(e, record)}/>}
						</td>
					}
				</tr>
			</Provider>
		});

		const menu = <div className='data-menu'>
			{!this.props.noCreate && <IconLink icon='plus' className="btn btn-default" href={(this.props.admin ? '/admin' : '') + '/' + this.props.model.API_PATH + '/create'} label={this.props.createTitle}/>}
			<Icon icon='arrows-cw' className="btn btn-default" onClick={e => this.reload(e)}/>
			{
				this.props.relationFilters ?
					<MultiFilter relationsFilters={this.props.relationFilters} model={this.props.model} onChange={this.handleMultiFilterChange.bind(this)} value={this.filterString}/>
					:
					<input type="text" onChange={e => this.handleFilterChange(e)} value={this.filterString}/>
			}
			{this.list.isLoading && <Loader size={24} />}
		</div>;

		return <div className={'data-list ' + (this.props.className || '')}>
			
			{title}
			{!this.props.inline && menu}
			<table className={'data-list-table' + (this.skip === 0 && this.list.isLoading ? ' loading' : '') + (this.props.inline ? ' inline-list' : '')}>
				<thead>
				<tr>{headers}</tr>
				</thead>
				<tbody>
				{list}
				</tbody>
			</table>
			{!this.nomore &&
				<div className="list-more">
					{this.list.isLoading ?
						<Loader size={18}/>
						:
						<div>
							{this.list.totalCount > 0 && <span>
							<a href="#" onClick={e => this.loadMore(e)}>{t('nextEllipsis')}</a>
							({t('more')}: {this.list.totalCount - this.skip - this.perpage})
							</span>}
						</div>
					}
				</div>
			}
		</div>;
	}

}

List.propTypes = {
	model: PropTypes.oneOfType([
		PropTypes.func,
		PropTypes.instanceOf(Model),
	]).isRequired,
	inline: PropTypes.bool,
	noCreate: PropTypes.bool,
	title: PropTypes.any,
	setTitle: PropTypes.bool,
	listRef: PropTypes.func,
	admin: PropTypes.bool,
	defaultSort: PropTypes.object,
	defaultProperties: PropTypes.object,
	where: PropTypes.object,
	emptyField: PropTypes.string,
	className: PropTypes.string,
	trueField: PropTypes.any,
	falseField: PropTypes.string,
	createTitle: PropTypes.string,
	relationFilters: PropTypes.array,
};

List.defaultProps = {
	defaultSort: { field: 'id', order: -1 },
	emptyField: '-',
	trueField: <Icon icon="ok"/>,
	falseField: '',
	createTitle: t('create'),
};

export default List;
