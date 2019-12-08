import { block } from 'bem-cn';
import * as React from 'react';
import './ClientPage.scss';
import { Avatar, Spin, Result, Tag, Divider, Table, Select, Button, Icon } from 'antd';
import {
    fetchClient,
    fetchClientBonuses,
    fetchTariffs,
    bindClientWithTariff,
} from '../../api/routes';
import { useParams } from 'react-router';
import { Client } from '../../models/client';
import Title from 'antd/lib/typography/Title';
import { upperFirst } from 'lodash';
import { Bonus } from '../../models/bonus';
import { ColumnProps } from 'antd/lib/table';
import { TariffPlan } from '../../models/tariffPlan';
import moment from 'moment';
import { StrategyType } from '../../models/strategy';
const b = block('ClientPage');

const ClientPage: React.FC = () => {
    const { id } = useParams();
    const [loading, setLoading] = React.useState(true);

    const [client, setClient] = React.useState<Client>();
    const [bonuses, setBonuses] = React.useState<Bonus[]>();

    const [tariffs, setTariffs] = React.useState<TariffPlan[]>([]);
    const [newTariff, setNewTariff] = React.useState<TariffPlan>();
    const [showSaveTariffButton, setShowSaveTariffButton] = React.useState(false);

    React.useEffect(() => void preFetchData(), [id]);
    React.useEffect(() => {
        if (newTariff) {
            setShowSaveTariffButton(true);
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
        const res = await fetchClientBonuses(id);
        setBonuses(res);
    };
    const fetchTariffsList = async () => {
        const res = await fetchTariffs();
        setTariffs(res);
    };

    const fetchBonuses = async () => {
        const res = await fetchClient(id);
        setClient(res);
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
        key: item.id,
        ...item,
    }));

    const bonusesTableColumn: ColumnProps<Bonus>[] = [
        {
            title: 'Тип',
            width: 5,
            render: (_, { strategy }) => (
                <Icon
                    style={{ width: 20, marginRight: 25 }}
                    type={
                        strategy && strategy.type === StrategyType.AGGREGATE_DATE
                            ? 'schedule'
                            : 'thunderbolt'
                    }
                />
            ),
        },
        {
            title: 'Количество бонусов',
            render: (_, { amount }) => <span style={{ color: 'green' }}>+ {amount}</span>,
        },
        {
            title: 'Сумма',
            render: (_, { transactions }) => (
                <span style={{ color: 'green' }}>+ {JSON.stringify(transactions)}</span>
            ),
        },
        {
            title: 'Дата',
            render: (_, { createTime }) => moment(createTime).calendar(),
        },
    ];

    return (
        <div className={b()}>
            <div className="container">
                <div className={b('head')}>
                    <div className={b('user-name')}>
                        <Avatar icon="user" size="large" />
                        <Title style={{ margin: 0, padding: 0, marginLeft: 10 }} level={3}>
                            {upperFirst(client.firstName)} {upperFirst(client.lastName)}
                        </Title>
                    </div>
                    <Tag style={{ fontWeight: 'bold', padding: '3px 10px', cursor: 'pointer' }}>
                        {client.tariffPlan.title}
                    </Tag>
                </div>
                <div className="">
                    <Select
                        showSearch
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
