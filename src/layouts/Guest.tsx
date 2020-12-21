import { Redirect, Route, Switch } from 'react-router-dom';
import LoginComponent from './../views/login/login';
import SignupComponent from './../views/signup/signup';
import ForgotPasswordComponent from './../views/forgot-password/ForgotPassword';

function Guest() {
	return (
		<Switch>
			<Route path='/login' exact component={LoginComponent} key='login' />
			<Route path='/sign-up' component={SignupComponent} key='signup' />
			<Route
				path='/forgot-password'
				component={ForgotPasswordComponent}
				key='forgot-password'
			/>
			<Redirect from='/' to='/login' />
		</Switch>
	);
}
export default Guest;
