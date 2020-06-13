import { Button, Table } from 'antd';
import ButtonGroup from 'antd/lib/button/button-group';
import { ColumnProps } from 'antd/lib/table';
import Title from 'antd/lib/typography/Title';
import { block } from 'bem-cn';
import * as React from 'react';
import { fetchStrategies } from '../../api/routes';
import { Strategy, StrategyType } from '../../models/strategy';
import './StrategiesListPage.scss';
import { useHistory } from 'react-router-dom';
import { ScheduleOutlined, ThunderboltOutlined } from '@ant-design/icons';

const b = block('StrategiesListPage');

const StrategiesListPage: React.FC = () => {
    const [strategiesList, setStrategiesList] = React.useState<Strategy[]>([]);
    const [loading, setLoading] = React.useState(true);

    const history = useHistory();

    React.useEffect(() => {
        setLoading(true);
        fetchStrategies()
            .then(setStrategiesList)
            .finally(() => setLoading(false));
    }, []);

    const dataSource = strategiesList.map(item => ({
        key: item.title,
        ...item,
    }));

    const columns: ColumnProps<Strategy>[] = [
        {
            title: 'Название',
            render: (_, { title, type }) => {
                const style = { width: 20, marginRight: 25 }
                return (
                <>
                    {type === StrategyType.AGGREGATE_DATE ? <ScheduleOutlined style={style} /> : <ThunderboltOutlined style={style} />}
                    {title}
                </>
                );
            }
        }
    ];
    return (
        <div className={b()}>
            <div className="container">
                <div className={b('head')}>
                    <Title level={2}>Стратегии</Title>
                    <ButtonGroup>
                        <Button href="/strategies/create/instant">
                            <ThunderboltOutlined /> Создать мгновенную стратегию
                        </Button>
                        <Button href="/strategies/create/schedule">
                            <ScheduleOutlined /> Создать агрегационную стратегию
                        </Button>
                    </ButtonGroup>
                </div>

                <div className="list">
                    <Table
                        onRow={({ uuid }) => ({ onClick: () => history.push(`/strategies/${uuid}`) })}
                        loading={loading}
                        columns={columns}
                        dataSource={dataSource}
                    />
                </div>
            </div>
        </div>
    );
};

export default StrategiesListPage;
