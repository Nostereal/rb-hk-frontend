import { Avatar, Button, Divider, Result, Select, Spin, Table, Tag } from 'antd';
import { ColumnProps } from 'antd/lib/table';
import Title from 'antd/lib/typography/Title';
import { block } from 'bem-cn';
import { upperFirst } from 'lodash';
import moment from 'moment';
import * as React from 'react';
import { useParams, useHistory } from 'react-router';
import {
    bindClientWithTariff,
    fetchClient,
    fetchClientBonuses,
    fetchTariffs,
} from '../../api/routes';
import { Bonus } from '../../models/bonus';
import { Client } from '../../models/client';
import { StrategyType } from '../../models/strategy';
import { TariffPlan } from '../../models/tariffPlan';
import './ClientPage.scss';
import { ScheduleOutlined, ThunderboltOutlined, UserOutlined } from '@ant-design/icons';
const b = block('ClientPage');

const ClientPage: React.FC = () => {
    const { id } = useParams();
    const [loading, setLoading] = React.useState(true);

    const history = useHistory();

    const [client, setClient] = React.useState<Client>();
    const [bonuses, setBonuses] = React.useState<Bonus[]>();

    const [tariffs, setTariffs] = React.useState<TariffPlan[]>([]);
    const [newTariff, setNewTariff] = React.useState<TariffPlan>();
    const [showSaveTariffButton, setShowSaveTariffButton] = React.useState(false);

    React.useEffect(() => void preFetchData(), [id]);
    React.useEffect(() => {
        if (newTariff?.uuid !== client?.tariffPlan.uuid) {
            setShowSaveTariffButton(true);
        } else {
            setShowSaveTariffButton(false);
        }
    }, [newTariff]);

    if (!id || typeof id !== 'string') {
        return <Result status={'500'} title={'Something goes wrong'} />;
    }

    const saveNewTariff = async () => {
        const confirmed = window.confirm('Вы уверены? ');
        if (newTariff && client && confirmed) {
            await bindClientWithTariff(client.uuid, newTariff.uuid);
            window.location.reload();
        }
    };
    const fetchClientInfo = async () => {
        const res = await fetchClient(id);
        setClient(res);
    };
    const fetchTariffsList = async () => {
        const res = await fetchTariffs();
        setTariffs(res);
    };

    const fetchBonuses = async () => {
        const res = await fetchClientBonuses(id);
        setBonuses(res);
    };

    const preFetchData = async () => {
        setLoading(true);
        await Promise.all([fetchClientInfo(), fetchBonuses(), fetchTariffsList()]);
        setLoading(false);
    };

    if (loading || !client || !bonuses || !tariffs) {
        return (
            <div className={b('loading')}>
                <Spin />
            </div>
        );
    }

    const bonusesDataSource = bonuses.map(item => ({
        key: item.uuid,
        ...item,
    }));

    const bonusesTableColumn: ColumnProps<Bonus>[] = [
        {
            title: 'Тип',
            width: 70,
            render: (_, { strategy }) => {
                const style = { width: 20, marginRight: 25 };
                return strategy && strategy.type === StrategyType.AGGREGATE_DATE
                    ? <ScheduleOutlined style={style} /> 
                    : <ThunderboltOutlined style={style} />;
            }
        },
        {
            title: 'Количество бонусов',
            render: (_, { amount }) => <span style={{ color: 'green' }}>+ {amount}</span>,
        },
        {
            title: 'Сумма транзакции',
            render: (_, { transactions }) => transactions.reduce((acc, cur) => cur.amount + acc, 0),
        },
        {
            title: 'Валюта',
            render: (_, { transactions }) => transactions[0].currency,
        },
        {
            title: 'Стратегия вычисления',
            render: (_, { strategy }) => strategy.title,
        },
        {
            title: 'Дата начисления',
            render: (_, { createTime }) => moment(createTime).calendar(),
        },
        {
            title: 'Дата тразакции',
            render: (_, { transactions }) => moment(new Date(transactions[0].time)).calendar(),
        },
    ];

    return (
        <div className={b()}>
            <div className="container">
                <div className={b('head')}>
                    <div className={b('user-name')}>
                        <Avatar icon={<UserOutlined />} size="large" />
                        <Title style={{ margin: 0, padding: 0, marginLeft: 10 }} level={3}>
                            {upperFirst(client.firstName)} {upperFirst(client.lastName)}
                        </Title>
                    </div>
                    <Tag
                        onClick={() => history.push('/tariffs')}
                        style={{ fontWeight: 'bold', padding: '3px 10px', cursor: 'pointer' }}
                    >
                        {client.tariffPlan.title}
                    </Tag>
                </div>
                <div className="">
                    <Select
                        showSearch
                        defaultValue={client.tariffPlan.title}
                        style={{ minWidth: 320, marginTop: 50, marginRight: 40 }}
                        placeholder="Выбрать тариф"
                        optionFilterProp="children"
                        onChange={(id: string) =>
                            setNewTariff(tariffs.filter(x => x.uuid === id)[0])
                        }
                        filterOption={(input, option) =>
                            String(option!.props!.children!)
                                .toLowerCase()
                                .indexOf(input.toLowerCase()) >= 0
                        }
                    >
                        {tariffs.map(tariff => (
                            <Select.Option value={tariff.uuid} key={tariff.uuid}>
                                {tariff.title}
                            </Select.Option>
                        ))}
                    </Select>
                    {showSaveTariffButton && (
                        <Button type={'dashed'} onClick={saveNewTariff}>
                            Сохранить изменения
                        </Button>
                    )}
                </div>
                <Divider />
                <br />
                <div className={b('bonuses')}>
                    <Title level={3}>Начисление бонусов</Title>
                    <br />
                    <Table dataSource={bonusesDataSource} columns={bonusesTableColumn} />
                </div>
            </div>
        </div>
    );
};

export default ClientPage;
