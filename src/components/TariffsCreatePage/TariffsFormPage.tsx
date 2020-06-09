import { Form, Input, PageHeader, Select, Button } from 'antd';
import Paragraph from 'antd/lib/typography/Paragraph';
import { block } from 'bem-cn';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { fetchStrategies, createTariffPlan, bindStrategiesWithTariff } from '../../api/routes';
import { Strategy } from '../../models/strategy';
import './TariffsFormPage.scss';
import { TariffPlan } from '../../models/tariffPlan';

const b = block('TariffsCreatePage');

interface Props extends TariffPlan {}

const TariffsFormPage: React.FC = () => {
    const history = useHistory();
    const onFinish = async () => {
        const { uuid } = await createTariffPlan({ title });
        await bindStrategiesWithTariff(selectedStrategies, uuid);
        history.goBack();
    };
    const [title, setTitle] = React.useState('');
    const [strategies, setStrategies] = React.useState<Strategy[]>([]);
    const [selectedStrategies, setSelectedStrategies] = React.useState<string[]>([]);
    console.log(selectedStrategies);
    React.useEffect(() => {
        fetchStrategies().then(setStrategies);
    }, []);
    const formItemLayout = {
        labelCol: {
            xs: { span: 8 },
            sm: { span: 2 },
        },
        wrapperCol: {
            xs: { span: 16 },
            sm: { span: 12 },
        },
    };
    return (
        <div className={b()}>
            <div className="container">
                <PageHeader
                    style={{
                        border: '1px solid rgb(235, 237, 240)',
                        marginBottom: '20px',
                    }}
                    onBack={() => history.push('/tariffs')}
                    title={'Создание тарифа'}
                >
                    <Paragraph style={{ maxWidth: '90%' }}>
                        Тариф - это список стратегий (правил подсчёта бонусов) для конкретного
                        пользователя.
                    </Paragraph>
                </PageHeader>

                <div className="">
                    <Form onFinish={onFinish} style={{ marginTop: 60 }} {...formItemLayout}>
                        <Form.Item required label={'Название'}>
                            <Input
                                placeholder={'Путешественник'}
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                            />
                        </Form.Item>
                        <Form.Item required label={'Стратегии'}>
                            <Select
                                mode="multiple"
                                style={{ width: '100%' }}
                                placeholder="Please select"
                                defaultValue={[]}
                                onChange={(s: string[]) => setSelectedStrategies(s)}
                            >
                                {strategies.map(s => (
                                    <Select.Option value={s.uuid!} key={s.uuid}>
                                        {s.title}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item wrapperCol={{ offset: 2 }}>
                            <Button type={'primary'} htmlType="submit">
                                Создать
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>
        </div>
    );
};

export default TariffsFormPage;
