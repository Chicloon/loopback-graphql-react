import React from 'react';
import PropTypes from 'prop-types';

export default class Switch extends React.Component {

	constructor(props) {
		super(props);
		this.props = props;
	}

	handleOnClick() {
		this.active = !this.active;
		if (this.props.onChange) {
			this.props.onChange(this.active);
		}
	}

	render() {
		this.active = this.props.active !== undefined ? this.props.active : false;

		return (
			<label className={'switch' + (this.props.right ? ' right' : ' left')} style={{...this.props.style}}>
				{this.props.right && this.props.label}
				<input type="checkbox"
				       checked={this.active ? ' checked' : ''}
				       onChange={e => this.handleOnClick()}
				/>
				<div className={'switch-field' + (this.active ? ' active' : '')}>
					<div className="switch-handle" />
				</div>
				{this.props.right ? '' : this.props.label}
			</label>
		);
	}

}

Switch.propTypes = {
	active: PropTypes.bool,
	label: PropTypes.string,
	onChange: PropTypes.func,
};
