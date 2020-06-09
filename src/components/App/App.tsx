import { Button, Result } from 'antd';
import * as React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import ClientPage from '../ClientPage/ClientPage';
import ClientsListPage from '../ClientsListPage/ClientsListPage';
import Header from '../Header/Header';
import StrategiesCreatePage from '../StrategyCreatePage/StrategiesCreatePage';
import StrategiesListPage from '../StrategiesListPage/StrategiesListPage';
import StrategyPage from '../StrategyPage/StrategyPage';
import TariffsFormPage from '../TariffsCreatePage/TariffsFormPage';
import TariffsPage from '../TariffsPage/TariffsPage';
import './App.scss';

const App: React.FC = () => {
    const renderError = () => (
        <Result
            status={'404'}
            title={'404'}
            subTitle={'Page not found'}
            extra={[
                <Button type={'primary'} href={'/'}>
                    Go to the home page
                </Button>,
            ]}
        />
    );
    // const router = useHistory();
    // const history = useHistory();

    return (
        <div className="App">
            <Router>
                <Header />
                <Switch>
                    <Route exact path="/" component={ClientsListPage} />
                    <Route exact path="/strategies" component={StrategiesListPage} />
                    <Route exact path="/strategies/:id" component={StrategyPage} />
                    <Route path="/strategies/create" component={StrategiesCreatePage} />
                    <Route exact path="/client/:id" component={ClientPage} />
                    <Route exact path="/tariffs" component={TariffsPage} />
                    <Route exact path="/tariffs/create" component={TariffsFormPage} />

                    <Route children={renderError()} />
                </Switch>
            </Router>
        </div>
    );
};

export default App;
