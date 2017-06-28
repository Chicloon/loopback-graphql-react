import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';

export default class Portal extends React.Component {

	constructor(props) {
		super(props);
		this.portalElement = null;
	}

	componentDidMount() {
		let container = this.props.portalId && document.getElementById(this.props.portalId);
		if (!container) {
			container = document.createElement('div');
			container.id = this.props.portalId;
			document.body.appendChild(container);
		}
		this.portalElement = container;
		if (this.props.portalRef) {
			this.props.portalRef(this.portalElement);
		}
		this.renderContent(this.props);
	}

	componentWillUnmount() {
		React.unmountComponentAtNode(this.portalElement);
		document.body.removeChild(this.portalElement);
	}

	componentWillReceiveProps(nextProps) {
		this.renderContent(nextProps);
	}

	renderContent(props) {
		ReactDOM.render(
			<div>{props.children}</div>,
			this.portalElement
		);
	}

	render() {
		return null;
	}

}

Portal.propTypes = {
	portalId: PropTypes.string.isRequired,
	portalRef: PropTypes.func,
};
