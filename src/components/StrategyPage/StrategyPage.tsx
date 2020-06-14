import * as React from 'react';
import { AggregateStrategy, InstantStrategy, Strategy, StrategyType } from '../../models/strategy';
import { useParams, useHistory } from 'react-router-dom';
import { fetchStrategy } from '../../api/routes';
import { Result, PageHeader } from 'antd';
import block from 'bem-cn';
import {
    INSTANT_STRATEGY_DESCRIPTION,
    AGGREGATE_STRATEGY_DESCRIPTION,
    Mode,
} from '../../constants/strategies-descriptions';
import AggregateStrategiesCreateForm from '../StrategiesCreateForm/AggregateStrategyCreateForm';
import InstantStrategiesCreateForm from '../StrategiesCreateForm/InstantStrategyCreateForm';
import Paragraph from 'antd/lib/typography/Paragraph';

const b = block('StrategyPage');

const StrategyPage: React.FC = () => {
    const [loading, setLoading] = React.useState(true);
    const [strategy, setStrategy] = React.useState<Strategy | null>(null);
    const [mode, setMode] = React.useState<Mode>(Mode.VIEW);

    const { id } = useParams();
    const history = useHistory();

    React.useEffect(() => {
        fetchStrategy(id)
            .then(setStrategy)
            .then(() => setLoading(false));
    }, [id]);


    if (!id || typeof id !== 'string') {
        return <Result status={'500'} title={'Something goes wrong'}/>;
    }

    return (
        <div className={b()}>
            <div className="container">
                {strategy && <>
                    <div className={b('header')}>
                        <PageHeader
                            title={strategy?.title}
                            style={{
                                border: '1px solid rgb(235, 237, 240)',
                                marginBottom: '20px',
                            }}
                            onBack={() => history.push('/strategies')}
                        >
                            <Paragraph style={{ maxWidth: '90%' }}>
                                {strategy.type === StrategyType.INSTANT ? INSTANT_STRATEGY_DESCRIPTION : AGGREGATE_STRATEGY_DESCRIPTION}
                            </Paragraph>
                        </PageHeader>
                    </div>
                    <div className={b('content')}>
                        {strategy.type === StrategyType.INSTANT
                            ? <InstantStrategiesCreateForm
                                mode={mode}
                                strategy={
                                    {
                                        ...strategy.settings as InstantStrategy,
                                        uuid: strategy.uuid,
                                        title: strategy.title,
                                    }
                                }
                                onModeChanged={setMode}
                            />
                            : <AggregateStrategiesCreateForm
                                mode={mode}
                                strategy={
                                    {
                                        ...strategy.settings as AggregateStrategy,
                                        uuid: strategy.uuid,
                                        title: strategy.title,
                                    }
                                }
                                onModeChanged={setMode}
                            />}
                    </div>
                </>}
            </div>
        </div>
    );
};

export default StrategyPage;