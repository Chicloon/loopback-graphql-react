import React from 'react';
import _ from 'lodash';
import { inject, observer } from 'mobx-react';
import { graphql } from 'react-apollo';
import t from '../../../i18n';
import moment from 'moment'

import { Table } from 'antd';

import { PersonAvatar } from '../ui';

import query from './queries/tasks';

// const names = _.uniqBy(data, "name").map(el => { return { text: el.name, value: el.name } });

@inject('tasksStore') @observer
class TaskList extends React.PureComponent {
    componentWillUpdate() {
        this.props.data.refetch();
    }

    linkRender = (text, id, link, ) => {
        return (
            <span onClick={() => this.props.history.push(`${link}/${id}`)} className="value">
                <a>  {text} </a>
            </span>
        );
    }

    timeRender(text) {
        return (
            <span>
                {text ? moment(text).format('L') : '-'}
            </span>
        );
    }

    boolRender(text) {
        return (
            <span>
                {text ? <i className="icon-ok "></i> : '-'}
            </span>
        )
    }  
    
    columns = [{
        title: 'ID',
        dataIndex: 'id',
        onFilter: (value, record) => record.name.indexOf(value) === 0,
        sorter: (a, b) => a.id.localeCompare(b.id),
    }, {
        title: 'Name',
        dataIndex: 'name',
        // filters: names,
        sorter: (a, b) => a.name.localeCompare(b.name),
        render: (text, record) => this.linkRender(text, record.id, 'tasks'),
    }, {
        title: 'Project',
        dataIndex: 'project.name',
        sorter: (a, b) => a.project.name.localeCompare(b.project.name),
        render: (text, record) => this.linkRender(text, record.project.id, 'projects'),
    }, {
        title: 'Tasks list',
        dataIndex: 'boardList.name',
        sorter: (a, b) => a.boardList.name.localeCompare(b.boardList.name),
        render: (text, record) => this.linkRender(text, record.id, 'tasks'),
    }, {
        title: 'Person',
        dataIndex: 'person.name',
        sorter: (a, b) => a.person.name.localeCompare(b.person.name),
        render: (text, record) => this.linkRender(text, record.person.id, 'persons'),
    }, {
        title: 'Private',
        dataIndex: 'private',
        sorter: (a, b) => a.private || b.private,
        render: (text) => this.boolRender(text),
    }, {
        title: 'Start',
        dataIndex: 'startDate',
        sorter: (a, b) => (''+a.startDate).localeCompare(''+b.startDate),
        render: (text) => this.timeRender(text),
    }, {
        title: 'End',
        dataIndex: 'dueDate',
        sorter: (a, b) => (''+ a.dueDate).localeCompare(''+b.dueDate),
        render: (text) => this.timeRender(text),
    }];

    render() {
      
        if (this.props.data.loading) {
            return <div>Loading...</div>;
        }

        const data = this.props.data.tasks;
        const columns = this.columns;
     
        return (
            <div>            
                <Table columns={columns} dataSource={data} rowKey={(record) => record.id} />
            </div>

        );
    }
}

export default graphql(query)(TaskList);
