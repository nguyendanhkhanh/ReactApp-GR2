import { Card } from '@material-ui/core';
import { Field, Form, Formik } from 'formik';
import React from 'react';
import { Button, CardBody, CardFooter, Col, Row } from 'reactstrap';
import CreateNotification from '../../service/Notifications.service';
import FieldTextInput from './../../components/common/TextInput';

function ChangePassword() {
	const submit = React.useCallback(({ password, confirmPassword }: { password: string; confirmPassword: string }) => {
		if (password !== confirmPassword) return CreateNotification('error')('Confirm password must be the same password');
	}, []);
	return (
		<Card className='card-stats'>
			<CardBody>
				<Formik initialValues={{ password: '', confirmPassword: '' }} onSubmit={submit}>
					<Form>
						<Row>
							<Col md='6' style={{ marginBottom: 10 }}>
								<Field
									variant='outlined'
									margin='normal'
									required
									fullWidth
									id='password'
									label='Password'
									name='password'
									type='password'
									autoFocus
									component={FieldTextInput}
								/>
							</Col>
							<Col md='6' style={{ marginBottom: 10 }}>
								<Field
									variant='outlined'
									margin='normal'
									required
									fullWidth
									id='confirmPassword'
									label='Confirm password'
									name='confirmPassword'
									type='password'
									component={FieldTextInput}
								/>
							</Col>
						</Row>
						<Row>
							<Col className='text-center'>
								<Button className='btn-round' color='primary' type='submit'>
									Submit
								</Button>
							</Col>
						</Row>
					</Form>
				</Formik>
			</CardBody>
		</Card>
	);
}
export default ChangePassword;
