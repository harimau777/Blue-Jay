import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import * as Actions from '../actions/index.jsx';

class Login extends Component {

	signInHandler() {
		this.props.signInUser();
	}

	render() {
		return (
			<div className='container'>
				<form onSubmit={ (e) => { e.preventDefault(); this.signInHandler(); } } className='col s6 offset-s6'>
					<div className='row'>
						<div className='input-field col s6 offset-s3' >
							<input id='username' type='text' name='username' />
							<label htmlFor="username">Username</label>
						</div>
					</div>
					<div className='row'>
						<div className='input-field col s6 offset-s3' >
							<input id='password' type='password' name='password'/>
							<label htmlFor="password">Password</label>
						</div>
					</div>
					<div className='row'>
						<div className='input-field col s6 offset-s3' >
							<input className='btn' type='submit' value='Login' />
						</div>
					</div>
				</form>
				<div className='center-align'>
					<Link to='signup'>Signup</Link> for an account.
				</div>
			</div>
		)
	}
}

const mapStateToProps = (state) => {
  return {
    authenticated: state.auth.authenticated
  }
}

export default connect(mapStateToProps, Actions)(Login);