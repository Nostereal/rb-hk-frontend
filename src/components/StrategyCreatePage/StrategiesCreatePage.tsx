import { PageHeader } from 'antd';
import Paragraph from 'antd/lib/typography/Paragraph';
import { block } from 'bem-cn';
import * as React from 'react';
import { Redirect, Route, Switch, useHistory } from 'react-router-dom';
import AggregateStrategiesCreateForm from '../StrategiesCreateForm/AggregateStrategyCreateForm';
import './StrategiesCreatePage.scss';
import { INSTANT_STRATEGY_DESCRIPTION, AGGREGATE_STRATEGY_DESCRIPTION, Mode } from '../../constants/strategies-descriptions';
import InstantStrategyCreateForm from '../StrategiesCreateForm/InstantStrategyCreateForm';

const b = block('StrategiesCreatePage');

const StrategiesCreatePage: React.FC = () => {
    const history = useHistory();
    return (
        <div className={b()}>
            <div className="container">
                <PageHeader
                    style={{
                        border: '1px solid rgb(235, 237, 240)',
                        marginBottom: '20px',
                    }}
                    onBack={() => history.push('/strategies')}
                    title={'Создание стратегии'}
                >
                    <Paragraph style={{ maxWidth: '90%' }}>
                        <Switch>
                            <Route exact path={'/strategies/create/instant'}>{ INSTANT_STRATEGY_DESCRIPTION }</Route>
                            <Route exact path={'/strategies/create/schedule'}>{ AGGREGATE_STRATEGY_DESCRIPTION }</Route>
                            <Redirect to={'/'} />
                        </Switch>
                    </Paragraph>
                </PageHeader>

                <Switch>
                    <Route exact path='/strategies/create/instant'>
                        <InstantStrategyCreateForm mode={Mode.CREATE} />
                    </Route>
                    <Route exact path='/strategies/create/schedule'>
                        <AggregateStrategiesCreateForm mode={Mode.CREATE} />
                    </Route>
                    <Redirect to={'/'} />
                </Switch>
            </div>
        </div>
    );
};

export default StrategiesCreatePage;
