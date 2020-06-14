import * as React from 'react';
import { block } from 'bem-cn';
import Title from 'antd/lib/typography/Title';
import { TariffPlan } from '../../models/tariffPlan';
import { Table, Tag, Button } from 'antd';
import { ColumnProps } from 'antd/lib/table';
import { fetchTariffs } from '../../api/routes';
import { BuildOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';

const b = block('TariffsPage');

const TariffsPage: React.FC = () => {
    const [tariffsList, setTariffsList] = React.useState<TariffPlan[]>([]);
    const [loading, setLoading] = React.useState(true);
    const history = useHistory()

    React.useEffect(() => {
        setLoading(true);
        fetchTariffs()
            .then(setTariffsList)
            .finally(() => setLoading(false));
    }, []);

    const dataSource = tariffsList.map(item => ({
        key: item.uuid,
        ...item,
    }));

    const columns: ColumnProps<TariffPlan>[] = [
        {
            title: 'Название',
            dataIndex: 'title',
        },
        {
            title: 'Стратегии',
            render: (_, { strategies }) =>
                strategies && strategies.slice(0, 20).map(s => <Tag key={s.uuid} onClick={() => history.push(`/strategies/${s.uuid}`)}>{s.title}</Tag>),
        },
    ];
    return (
        <div className={b()}>
            <div className="container">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Title level={2}>Тарифы</Title>
                    <Button href={'tariffs/create'}>
                        <BuildOutlined /> Создать тариф
                    </Button>
                </div>
                <div style={{ marginTop: 30 }}>
                    <Table loading={loading} columns={columns} dataSource={dataSource}/>
                </div>
            </div>
        </div>
    );
};

export default TariffsPage;
