import React, { useCallback, useState } from 'react';
import {
	Card,
	CardBody,
	CardFooter,
	CardTitle,
	Row,
	Col,
	Badge,
	UncontrolledTooltip,
	Button,
	Modal,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Input,
} from 'reactstrap';
import lightOn from './../../assets/img/icon/lightbulb.svg';
import lightOff from './../../assets/img/icon/lightOff.svg';
import pumpOn from './../../assets/img/icon/water-pump.svg';
import pumpOff from './../../assets/img/icon/pump.svg';
import humidity from './../../assets/img/icon/humidity.svg';
import temperature from './../../assets/img/icon/temperature.svg';
import soil from './../../assets/img/icon/soil.svg';
import { useSelector } from 'react-redux';
import { FBTopicPublish, FBTopicSub, PrefixTopic } from '../../constants/MqttConstants';
import Switch from 'react-switch';
import * as mqtt from 'mqtt';
import { Field, Form, Formik } from 'formik';
import CreateNotification from '../../service/Notifications.service';
import { ConvertSecondToTime } from '../../helper/time';

const FieldTimer = ({ field, form, title, ...props }: { field: any; form: any; title: string }) => {
	return (
		<>
			<label>{title}</label>
			<Input {...props} {...field} defaultValue='0' type='time' />
		</>
	);
};

function Home(props: any) {
	const { mqttClient }: { mqttClient: mqtt.MqttClient } = props;
	const mqttData = useSelector((state: any) => state.mqttReducer);
	const [switchRL1, setswitchRL1] = useState<boolean>(false);
	const [switchRL2, setswitchRL2] = useState<boolean>(false);
	const [switchRL3, setswitchRL3] = useState<boolean>(false);
	const [switchRL4, setswitchRL4] = useState<boolean>(false);
	const [timer, setTimer] = useState<number>(1000);

	const handleChange = useCallback(
		(data, key) => {
			switch (key) {
				case FBTopicSub.rl1:
					if (timer && timer > 0 && !!mqttData[FBTopicSub.rl1]) {
						setModalConfirm(true);
						break;
					}
					setswitchRL1(data);
					mqttClient.publish(FBTopicPublish.ActionOnOff + PrefixTopic.RL1, (+data).toString());
					break;
				case FBTopicSub.rl2:
					setswitchRL2(data);
					mqttClient.publish(FBTopicPublish.ActionOnOff + PrefixTopic.RL2, (+data).toString());
					break;
				case FBTopicSub.rl3:
					setswitchRL3(data);
					mqttClient.publish(FBTopicPublish.ActionOnOff + PrefixTopic.RL3, (+data).toString());
					break;
				case FBTopicSub.rl4:
					setswitchRL4(data);
					mqttClient.publish(FBTopicPublish.ActionOnOff + PrefixTopic.RL4, (+data).toString());
					break;
				default:
					break;
			}
		},
		[mqttClient, mqttData[FBTopicSub.rl1]],
	);

	React.useEffect(() => {
		mqttData[FBTopicSub.rl1] !== undefined && setswitchRL1(mqttData[FBTopicSub.rl1]);
		mqttData[FBTopicSub.rl2] !== undefined && setswitchRL2(mqttData[FBTopicSub.rl2]);
		mqttData[FBTopicSub.rl3] !== undefined && setswitchRL3(mqttData[FBTopicSub.rl3]);
		mqttData[FBTopicSub.rl4] !== undefined && setswitchRL4(mqttData[FBTopicSub.rl4]);
	}, [mqttData[FBTopicSub.rl1], mqttData[FBTopicSub.rl2], mqttData[FBTopicSub.rl3], mqttData[FBTopicSub.rl4]]);

	React.useEffect(() => {
		const timeout = setTimeout(() => {
			timer && setTimer(timer > 0 ? timer - 1 : 0);
		}, 1000);
		return () => clearTimeout(timeout);
	}, [timer]);

	React.useEffect(() => {
		if (isNaN(mqttData[FBTopicSub.HourUpHRl1]) || isNaN(mqttData[FBTopicSub.MinuteUpHRl1])) return;
		if (isNaN(mqttData[FBTopicSub.HourDownHRl1]) || isNaN(mqttData[FBTopicSub.MinuteDownHRl1])) return;
		const time =
			+mqttData[FBTopicSub.HourDownHRl1] * 60 * 60 +
			+mqttData[FBTopicSub.MinuteDownHRl1] * 60 -
			(+mqttData[FBTopicSub.HourUpHRl1] * 60 * 60 + +mqttData[FBTopicSub.MinuteUpHRl1] * 60);
		setTimer(time > 0 ? time : 0);
	}, [
		mqttData[FBTopicSub.HourUpHRl1],
		mqttData[FBTopicSub.MinuteUpHRl1],
		mqttData[FBTopicSub.HourDownHRl1],
		mqttData[FBTopicSub.MinuteDownHRl1],
	]);

	const submitTimer = useCallback(
		({ timeStart, timeEnd }: { timeStart: string; timeEnd: string }) => {
			console.log(timeStart, timeEnd);
			const hashTimeStart = timeStart.split(':');
			const hashTimeEnd = timeEnd.split(':');
			if (isNaN(+hashTimeStart[0]) || isNaN(+hashTimeStart[1]) || isNaN(+hashTimeEnd[0]) || isNaN(+hashTimeEnd[1]))
				return CreateNotification('error')('Error input');
			if (+hashTimeStart[0] * 60 * 60 + +hashTimeStart[1] * 60 > +hashTimeEnd[0] * 60 * 60 + +hashTimeEnd[1] * 60) {
				return CreateNotification('error')('Start time must be less end time');
			}
			mqttClient.publish(FBTopicPublish.HourUp, (+hashTimeStart[0]).toString());
			mqttClient.publish(FBTopicPublish.MinuteUp, (+hashTimeStart[1]).toString());
			mqttClient.publish(FBTopicPublish.HourDown, (+hashTimeEnd[0]).toString());
			mqttClient.publish(FBTopicPublish.MinuteDown, (+hashTimeEnd[1]).toString());
			CreateNotification('success')('Timer successfully!');
			toggleModelSetTimer(true);
		},
		[mqttClient],
	);

	const [modalSetTimer, setModalSetTimer] = useState(false);
	const [modalConfirm, setModalConfirm] = useState(false);
	const [modalConfirmOpenPopTimer, setModalConfirmOpenPopTimer] = useState(false);
	const toggleModelSetTimer = useCallback(
		(isOff?: boolean) => setModalSetTimer(isOff != undefined ? false : !modalSetTimer),
		[modalSetTimer],
	);
	const toggleModelConfirmTimer = useCallback(
		(isTurnOff?: boolean) => {
			if (isTurnOff) {
				setswitchRL1(false);
				mqttClient.publish(FBTopicPublish.ActionOnOff + PrefixTopic.RL1, '0');
			}
			setModalConfirm(!modalConfirm);
		},
		[modalConfirm],
	);
	const toggleModalConfirmOpenPopTimer = useCallback(
		(isOpenPop?: boolean) => {
			isOpenPop && setModalSetTimer(true);
			setModalConfirmOpenPopTimer(!modalConfirmOpenPopTimer);
		},
		[modalConfirmOpenPopTimer],
	);
	return (
		<>
			<Modal isOpen={modalSetTimer} toggle={() => toggleModelSetTimer()}>
				<Formik initialValues={{ timeStart: '', timeEnd: '' }} onSubmit={submitTimer}>
					<Form>
						<ModalHeader toggle={() => toggleModelSetTimer()}>Timer</ModalHeader>
						<ModalBody>
							<Row>
								<Col md='6' style={{ marginBottom: 10 }}>
									<Field required title='Time start' name='timeStart' component={FieldTimer} />
								</Col>
								<Col md='6' style={{ marginBottom: 10 }}>
									<Field required title='Time end' name='timeEnd' component={FieldTimer} />
								</Col>
							</Row>
						</ModalBody>
						<ModalFooter>
							<Button type='submit' color='primary'>
								Accept
							</Button>
							&nbsp; &nbsp; &nbsp;
							<Button color='secondary' outline onClick={() => toggleModelSetTimer()}>
								Cancel
							</Button>
						</ModalFooter>
					</Form>
				</Formik>
			</Modal>
			<Modal isOpen={modalConfirm} toggle={() => toggleModelConfirmTimer()}>
				<ModalHeader toggle={() => toggleModelConfirmTimer()}>Warning</ModalHeader>
				<ModalBody>
					<div className='typography-line'>
						<h6>Pump water is running during the appointment, Do you want turn off it?</h6>
					</div>
				</ModalBody>
				<ModalFooter>
					<Button type='submit' color='primary' onClick={() => toggleModelConfirmTimer(true)}>
						Accept
					</Button>
					&nbsp; &nbsp; &nbsp;
					<Button color='secondary' outline onClick={() => toggleModelConfirmTimer()}>
						Cancel
					</Button>
				</ModalFooter>
			</Modal>
			<Modal isOpen={modalConfirmOpenPopTimer} toggle={() => toggleModalConfirmOpenPopTimer()}>
				<ModalHeader toggle={() => toggleModalConfirmOpenPopTimer()}>Warning</ModalHeader>
				<ModalBody>
					<div className='typography-line'>
						<h6>Pump water is running during the appointment, Do you want turn off it?</h6>
					</div>
				</ModalBody>
				<ModalFooter>
					<Button type='submit' color='primary' onClick={() => toggleModalConfirmOpenPopTimer(true)}>
						Accept
					</Button>
					&nbsp; &nbsp; &nbsp;
					<Button color='secondary' outline onClick={() => toggleModalConfirmOpenPopTimer()}>
						Cancel
					</Button>
				</ModalFooter>
			</Modal>
			<div className='content'>
				<div></div>
				<Row>
					<Col lg='4' md='4' sm='12'>
						<Card className={'card-stats'} id={'temperature-popover'}>
							<CardBody>
								<Row>
									<Col md='4' xs='5'>
										<div className='icon-big text-center icon-warning icon-card'>
											<img src={temperature} alt='' />
										</div>
									</Col>
									<Col md='8' xs='7'>
										<div className='numbers'>
											<p className='card-category'>{mqttData[FBTopicSub.temperature] || 0}%</p>
											<CardTitle tag='p'>Temperature</CardTitle>
										</div>
									</Col>
								</Row>
							</CardBody>
							<CardFooter></CardFooter>
						</Card>
					</Col>
					<Col lg='4' md='4' sm='12'>
						<Card className='card-stats'>
							<CardBody>
								<Row>
									<Col md='4' xs='5'>
										<div className='icon-big text-center icon-warning icon-card'>
											<img src={humidity} alt='' />
										</div>
									</Col>
									<Col md='8' xs='7'>
										<div className='numbers'>
											<p className='card-category'>{mqttData[FBTopicSub.humidity] || 0}%</p>
											<CardTitle tag='p'>Humidity</CardTitle>
										</div>
									</Col>
								</Row>
							</CardBody>
							<CardFooter></CardFooter>
						</Card>
					</Col>
					<Col lg='4' md='4' sm='12'>
						<Card className='card-stats'>
							<CardBody>
								<Row>
									<Col md='4' xs='5'>
										<div className='icon-big text-center icon-warning icon-card'>
											<img src={soil} alt='' />
										</div>
									</Col>
									<Col md='8' xs='7'>
										<div className='numbers'>
											<p className='card-category'>
												{mqttData[FBTopicSub.percentSoil] || 0}%{' '}
												{(+mqttData[FBTopicSub.percentSoil] || 0) < 20 ? (
													<>
														<Badge color='danger' id='DisabledAutoHideExample'>
															!
														</Badge>
														<UncontrolledTooltip placement='top' target='DisabledAutoHideExample'>
															{`Percent soil < 20%, please water!`}
														</UncontrolledTooltip>
													</>
												) : (
													<></>
												)}
											</p>
											<CardTitle tag='p'>Percent soil</CardTitle>
										</div>
									</Col>
								</Row>
							</CardBody>
							<CardFooter></CardFooter>
						</Card>
					</Col>
				</Row>
				<hr />
				<Row>
					<Col lg='3' md='6' sm='6'>
						<Card className='card-stats'>
							<CardBody>
								<Row>
									<Col md='4' xs='5'>
										<div className='icon-big text-center icon-warning'>
											<img alt='' className='icon-card' src={!mqttData[FBTopicSub.rl1] ? pumpOff : pumpOn} />
										</div>
									</Col>
									<Col md='8' xs='7'>
										<div className='numbers'>
											<CardTitle tag='p'>Pump water</CardTitle>
										</div>
									</Col>
								</Row>
								<Row className='text-right'>
									{timer && timer > 0 && !!mqttData[FBTopicSub.rl1] ? (
										<Col className='text-right'>
											<div className='numbers'>
												<p className='card-category'>{`Time remaining: ${ConvertSecondToTime(timer)}`}</p>
											</div>
										</Col>
									) : (
										<></>
									)}
								</Row>
							</CardBody>
							<CardFooter>
								<hr />
								<Row>
									<Col xs='6'>
										<div className='stats'>
											<Switch onChange={data => handleChange(data, FBTopicSub.rl1)} checked={switchRL1} />
										</div>
									</Col>
									<Col xs='6' className='text-right'>
										<div className='stats'>
											<Button
												color='info'
												size='sm'
												onClick={() =>
													timer && timer > 0 && !!mqttData[FBTopicSub.rl1]
														? toggleModalConfirmOpenPopTimer()
														: toggleModelSetTimer()
												}
											>
												<div style={{ display: 'inline' }}>Timer</div>
											</Button>
										</div>
									</Col>
								</Row>
							</CardFooter>
						</Card>
					</Col>
					<Col lg='3' md='6' sm='6'>
						<Card className='card-stats'>
							<CardBody>
								<Row>
									<Col md='4' xs='5'>
										<div className='icon-big text-center icon-warning'>
											{<img alt='' className='icon-card' src={!mqttData[FBTopicSub.rl2] ? lightOff : lightOn} />}
										</div>
									</Col>
									<Col md='8' xs='7'>
										<div className='numbers'>
											{/* <p className='card-category'>Revenue</p> */}
											<CardTitle tag='p'>Light 1</CardTitle>
											{/* <p /> */}
										</div>
									</Col>
								</Row>
							</CardBody>
							<CardFooter>
								<hr />
								<div className='stats'>
									<Switch onChange={data => handleChange(data, FBTopicSub.rl2)} checked={switchRL2} />
								</div>
							</CardFooter>
						</Card>
					</Col>
					<Col lg='3' md='6' sm='6'>
						<Card className='card-stats'>
							<CardBody>
								<Row>
									<Col md='4' xs='5'>
										<div className='icon-big text-center icon-warning'>
											<img alt='' className='icon-card' src={!mqttData[FBTopicSub.rl3] ? lightOff : lightOn} />
										</div>
									</Col>
									<Col md='8' xs='7'>
										<div className='numbers'>
											{/* <p className='card-category'>Errors</p> */}
											<CardTitle tag='p'>Light 2</CardTitle>
											{/* <p /> */}
										</div>
									</Col>
								</Row>
							</CardBody>
							<CardFooter>
								<hr />
								<div className='stats'>
									<Switch onChange={data => handleChange(data, FBTopicSub.rl3)} checked={switchRL3} />
								</div>
							</CardFooter>
						</Card>
					</Col>
					<Col lg='3' md='6' sm='6'>
						<Card className='card-stats'>
							<CardBody>
								<Row>
									<Col md='4' xs='5'>
										<div className='icon-big text-center icon-warning'>
											<img alt='' className='icon-card' src={!mqttData[FBTopicSub.rl4] ? lightOff : lightOn} />
										</div>
									</Col>
									<Col md='8' xs='7'>
										<div className='numbers'>
											{/* <p className='card-category'>Followers</p> */}
											<CardTitle tag='p'>Light 3</CardTitle>
											{/* <p /> */}
										</div>
									</Col>
								</Row>
							</CardBody>
							<CardFooter>
								<hr />
								<div className='stats'>
									<Switch onChange={data => handleChange(data, FBTopicSub.rl4)} checked={switchRL4} />
								</div>
							</CardFooter>
						</Card>
					</Col>
				</Row>
			</div>
		</>
	);
}

export default Home;
