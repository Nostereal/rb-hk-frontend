import {
    Button,
    Form,
    Input,
    Tag,
    Switch,
    InputNumber,
    Slider,
    DatePicker,
    Select,
} from 'antd';
import { block } from 'bem-cn';
import * as React from 'react';
import './AggregateStrategyCreateForm.scss';
import { AggregateStrategy, IntervalSettings, StrategyType, TimeUnit } from '../../models/strategy';
import Title from 'antd/lib/typography/Title';
import { createStrategy } from '../../api/routes';
import { useHistory } from 'react-router';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { Mode } from '../../constants/strategies-descriptions';

const b = block('AggregateStrategyCreateForm');

interface FormProps {
    mode: Mode
    strategy?: AggregateStrategy
}

interface AmountInterval extends IntervalSettings {
    key: number;
}

let id = 0;

const AggregateStrategyCreateForm: React.FC<FormProps> = ({ mode, strategy }) => {
    const history = useHistory();

    const onFinish = async (values: any) => {
        try {
            await createStrategy({
                type: StrategyType.AGGREGATE_DATE,
                title: values.title,
                settings: {
                    intervals: intervals.map(i => ({ ...i, key: undefined })),
                    mcc_list: mccList.map(i => +i), // cast string to number
                    max_bonus: values.max,
                    min_bonus: values.min,
                    aggregate_time_settings: {
                        to_time: values.toTime,
                        from_time: values.fromTime,
                        time_unit: values.timeUnit,
                        quantity: values.quantity,
                    },
                },
            });
            history.push('/strategies/create/success');
        } catch (error) {
            console.log(error);
            history.push('/strategies/create/error');
        }
    };

    const [mccList, setMccList] = React.useState<string[]>(strategy ? strategy.mcc_list.map(i => i.toString()) : []);
    const [intervals, setIntervals] = React.useState<AmountInterval[]>(
        strategy
            ? strategy.intervals.map((item, i) => ({ key: i, ...item }))
            : [{ key: 0 }]
    );
    const [areFieldsDisabled, setFieldsDisabled] = React.useState<boolean>(mode === Mode.VIEW);
    const [form] = Form.useForm();

    React.useEffect(() => setFieldsDisabled(mode === Mode.VIEW), [mode]);

    const formItemLayout = {
        labelCol: {
            xs: { span: 8 },
            sm: { span: 2 },
        },
        wrapperCol: {
            xs: { span: 24 },
            sm: { span: 16 },
        },
    };

    const handleClose = (removed: string) => {
        setMccList(prev => prev.filter(item => item !== removed));
    };

    const addMcc = () => {
        const mcc = form.getFieldValue('mсс');
        if (mccList.includes(mcc)) return

        form.resetFields(['mcc']);
        if (/\d{4}/.test(mcc)) setMccList(prev => [...prev, mcc]);
    };

    const renderMCC = () => {
        return (
            <>
                {!areFieldsDisabled &&
                <Form.Item name="mcc" rules={[{ pattern: /\d{4}/g, message: 'MCC код — это 4 цифры' }]}>
                    <Input
                        addonAfter={
                            <PlusOutlined onClick={addMcc} style={{ cursor: 'pointer' }}/>
                        }
                        placeholder={'3522'}
                        style={{ maxWidth: 100 }}
                    />
                </Form.Item>}
                {mccList.map(item => (
                    <Tag key={item} closable={!areFieldsDisabled} onClose={() => handleClose(item)}>
                        {item}
                    </Tag>
                ))}
            </>
        );
    };

    const intervalsList = intervals.map((interval, i) => {
        const prevInterval = intervals[i - 1];

        const onRemove = () => {
            if (intervals.length > 1) {
                removeInterval(interval.key);
            }
        };
        return (
            <Interval
                key={interval.key}
                areFieldsDisabled={areFieldsDisabled}
                setIntervalValues={(values: Partial<AmountInterval>) => setIntervalValues(interval.key, values)}
                settings={interval}
                minFrom={prevInterval && prevInterval.to ? prevInterval.to : 0}
                onRemove={onRemove}
                id={interval.key}
            />
        );
    });

    const setIntervalValues = (k: number, values: Partial<AmountInterval>) => {
        const thatInterval = intervals.filter(({ key }) => key === k)[0];
        const thisIndex = intervals.indexOf(thatInterval);
        setIntervals(all => [
            ...all.slice(0, thisIndex),
            { ...thatInterval, ...values },
            ...all.splice(thisIndex + 1),
        ]);
    };

    const removeInterval = (k: number) => {
        setIntervals(prev => prev.filter(({ key }) => key !== k));
    };
    const addInterval = () => {
        const prevInterval = intervals[intervals.length - 1];
        setIntervals(prev => [...prev, { from: prevInterval.to, key: ++id }]);
    };

    return (
        <div className={b()}>
            <Form {...formItemLayout} name='create_aggregate' onFinish={onFinish}>
                <Form.Item wrapperCol={{ offset: 2 }} label={'MCC'}>
                    {renderMCC()}
                </Form.Item>
                <Form.Item wrapperCol={{ offset: 1 }}>
                    <div className="inline-flex">
                        <Form.Item label={'Начать с'} required={!areFieldsDisabled}>
                            <DatePicker name='fromTime' disabled={areFieldsDisabled}/>
                        </Form.Item>
                        <Form.Item name='toTime' label={'Закончить'}>
                            <DatePicker disabled={areFieldsDisabled}/>
                        </Form.Item>
                        <Form.Item name='quantity' label={'Кол-во'}>
                            <InputNumber disabled={areFieldsDisabled}/>
                        </Form.Item>
                        <Form.Item name='timeUnit' label={'Период'}>
                            <Select disabled={areFieldsDisabled} style={{ width: 100 }}>
                                {Object.keys(TimeUnit).map(tu => (
                                    <Select.Option
                                        key={TimeUnit[tu as TimeUnit]}
                                        value={TimeUnit[tu as TimeUnit]}
                                    >
                                        {String(TimeUnit[tu as TimeUnit])}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </div>
                </Form.Item>
                {!areFieldsDisabled && <Form.Item name='title' required label="Название">
                    <Input disabled={areFieldsDisabled} placeholder={'Daily Ashan strategy'}/>
                </Form.Item>}
                <Form.Item label={'Лимит'}>
                    <div className="inline-flex">
                        <Form.Item name='from'>
                            <InputNumber disabled={areFieldsDisabled} placeholder={'Min'}/>
                        </Form.Item>
                        <Form.Item>-</Form.Item>
                        <Form.Item name='to'>
                            <InputNumber disabled={areFieldsDisabled} placeholder={'Max'}/>
                        </Form.Item>
                    </div>
                </Form.Item>
                <Form.Item wrapperCol={{ offset: 2 }}>
                    <Title level={4}>Правила начисления</Title>
                </Form.Item>
                {intervalsList}
                <Form.Item wrapperCol={{ offset: 2 }}>
                    <Button style={{ marginRight: 30 }} htmlType={'submit'} type="primary">
                        {areFieldsDisabled ? 'Редактировать' : 'Создать' /* when areFieldsDisabled is true – u r in VIEW mode, else – in EDIT mode */}
                    </Button>
                    {!areFieldsDisabled && <Button onClick={addInterval} type="dashed">
                        Добивить правило <PlusOutlined/>
                    </Button>}
                </Form.Item>
            </Form>
        </div>
    );
};

interface IntervalProps {
    id: number;
    areFieldsDisabled: boolean
    onRemove: () => void;
    minFrom: number;
    settings?: IntervalSettings
    setIntervalValues: (values: Partial<AmountInterval>) => void;
}

const Interval: React.FC<IntervalProps> = ({ id, onRemove, setIntervalValues, minFrom, areFieldsDisabled, settings }) => {
    const [ratioMode, setRatioMode] = React.useState(!!settings?.ratio);
    const [toCurrent, setToCurrent] = React.useState(minFrom + 500);


    return (
        <Form.Item key={id} className="inline-flex" wrapperCol={{ offset: 2 }}>
            <div className="inline-flex">
                <Form.Item style={{ width: '200px' }}>
                    Фиксированное
                    <Switch
                        disabled={areFieldsDisabled}
                        onChange={() => setRatioMode(!ratioMode)}
                        checked={!ratioMode}
                        style={{ marginLeft: 20 }}
                    />
                </Form.Item>

                <Form.Item>
                    <InputNumber
                        min={minFrom}
                        disabled={areFieldsDisabled}
                        defaultValue={settings?.from ? settings.from : minFrom}
                        onChange={v => {
                            setToCurrent(v as number);
                            setIntervalValues({ from: v as number });
                        }}
                        placeholder={'Min'}
                    />
                </Form.Item>
                <Form.Item>-</Form.Item>
                <Form.Item>
                    <InputNumber
                        min={toCurrent}
                        disabled={areFieldsDisabled}
                        defaultValue={settings?.to}
                        onChange={v => setIntervalValues({ to: v as number })}
                        placeholder={'Max'}
                    />
                </Form.Item>
                {(!areFieldsDisabled && id > 0) && <Form.Item>
                    <span onClick={onRemove} style={{ cursor: 'pointer' }}>
                        <DeleteOutlined/>
                    </span>
                </Form.Item>}
            </div>
            <Form.Item label={ratioMode ? 'Бонусы в процентах' : 'Фиксированное количество'}>
                {ratioMode ? (
                    <Slider
                        defaultValue={settings?.ratio && settings.ratio * 100}
                        disabled={areFieldsDisabled}
                        onChange={v => setIntervalValues({ ratio: Number(v) / 100 })}
                    />
                ) : (
                    <InputNumber
                        defaultValue={settings?.amount}
                        disabled={areFieldsDisabled}
                        onChange={v => setIntervalValues({ amount: v as number })}
                        placeholder={'42'}
                        style={{ width: '100%' }}
                        min={0}
                    />
                )}
            </Form.Item>
        </Form.Item>
    );
};

export default AggregateStrategyCreateForm;