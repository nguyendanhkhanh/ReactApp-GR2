export enum PrefixTopic {
	RL1 = 'RL1',
	RL2 = 'RL2',
	RL3 = 'RL3',
	RL4 = 'RL4',
}

export enum FBTopicSub {
	temperature = 'ESP/temperature',
	humidity = 'ESP/humidity',
	percentSoil = 'ESP/percent_soil',
	rl1 = 'ESPg/RL1',
	rl2 = 'ESPg/RL2',
	rl3 = 'ESPg/RL3',
	rl4 = 'ESPg/RL4',
	HourUpHRl1 = 'ESPgH1/RL1',
	MinuteUpHRl1 = 'ESPgM1/RL1',
	HourDownHRl1 = 'ESPgH2/RL1',
	MinuteDownHRl1 = 'ESPgM2/RL1',
}

export enum FBTopicPublish {
	ActionOnOff = 'ESPn/',
	HourUp = 'APPgH1/RL1',
	MinuteUp = 'APPgM1/RL1',
	HourDown = 'APPgH2/RL1',
	MinuteDown = 'APPgm2/RL1',
}
