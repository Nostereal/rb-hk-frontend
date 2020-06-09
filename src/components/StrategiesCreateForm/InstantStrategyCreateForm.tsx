import { Button, Form, Input, Tag, Switch, InputNumber, Slider } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { block } from 'bem-cn';
import * as React from 'react';
import './InstantStrategyCreateForm.scss';
import { InstantStrategy, IntervalSettings, Strategy, StrategyType } from '../../models/strategy';
import Title from 'antd/lib/typography/Title';
import { createStrategy } from '../../api/routes';
import { useHistory } from 'react-router';
import { Mode } from '../../constants/strategies-descriptions';

const b = block('InstantStrategyCreateForm');

interface FormProps {
    mode: Mode
    strategy?: InstantStrategy
}

interface AmountInterval extends IntervalSettings {
    key: number;
}

let id = 0;

const InstantStrategyCreateForm: React.FC<FormProps> = ({ mode, strategy }) => {
    const history = useHistory();
    const [form] = Form.useForm();

    const onFinish = async (values: any) => {
        if (mode === Mode.VIEW) return;
        try {
            await createStrategy({
                type: StrategyType.INSTANT,
                title: values.title,
                settings: {
                    intervals: intervals.map(i => ({ ...i, key: undefined })),
                    mcc_list: mccList.map(i => +i), // cast string to number
                    max_bonus: values.max,
                    min_bonus: values.min,
                },
            });
            history.push('/strategies/create/success');
        } catch (error) {
            history.push('/strategies/create/error');
        }
    };

    const [mccList, setMccList] = React.useState<string[]>(strategy?.mcc_list ? strategy.mcc_list.map(i => i.toString()) : []);
    const [intervals, setIntervals] = React.useState<AmountInterval[]>(
        strategy
            ? strategy.intervals.map((item, ind) => ({ key: ind, ...item }))
            : [{ key: 0 }],
    );
    const [areFieldsDisabled, setFieldsDisabled] = React.useState(mode === Mode.VIEW);

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
        const mcc = form.getFieldValue('mcc');
        form.resetFields(['mcc']);
        if (/\d{4}/.test(mcc)) setMccList(prev => [...prev, mcc]);
    };

    const renderMCC = () => {
        return (
            <>
                {!areFieldsDisabled && <Form.Item name="mcc" rules={[{ pattern: /\d{4}/, message: 'MCC код — это 4 цифры' }]}>
                    <Input
                        addonAfter={
                            <PlusOutlined onClick={addMcc} style={{ cursor: 'pointer' }}/>
                        }
                        placeholder={'3522'}
                        style={{ maxWidth: 100 }}
                    />
                </Form.Item>}
                {mccList.map(item => (
                    <Tag
                        key={item}
                        style={{ fontSize: 14, paddingTop: 2, paddingBottom: 2 }}
                        closable={!areFieldsDisabled}
                        onClose={() => handleClose(item)}
                    >
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
                id={interval.key}
                settings={strategy?.intervals[i]}
                minFrom={prevInterval && prevInterval.to ? prevInterval.to : 0}
                setIntervalValues={(values: Partial<AmountInterval>) => setIntervalValues(interval.key, values)}
                onRemove={onRemove}
                areFieldsDisabled={areFieldsDisabled}
            />
        );
    });

    const setIntervalValues = (k: number, values: Partial<AmountInterval>) => {
        const thatInterval = intervals.filter(({ key }) => key === k)[0];
        const thisIndex = intervals.indexOf(thatInterval);
        console.log('setIntVal')
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
            <Form name="instant-form" {...formItemLayout} onFinish={onFinish} form={form}>
                {(!areFieldsDisabled || mccList.length !== 0) && <Form.Item label='MCC'>
                    {renderMCC()}
                </Form.Item>}
                {!areFieldsDisabled && <Form.Item name="title" required label="Название">
                    <Input placeholder={'Daily Ashan strategy'}/>
                </Form.Item>}
                {(!areFieldsDisabled ||(strategy?.min_bonus && strategy.max_bonus)) && <Form.Item label='Лимит'>
                    <div className="inline-flex">
                        <Form.Item name="from">
                            <InputNumber
                                placeholder={'Min'}
                                value={strategy?.min_bonus ? strategy.min_bonus : 0}
                                disabled={areFieldsDisabled}
                            />
                        </Form.Item>
                        <Form.Item>-</Form.Item>
                        <Form.Item name="to">
                            <InputNumber
                                placeholder={'Max'}
                                value={strategy?.max_bonus ? strategy.max_bonus : 0}
                                disabled={areFieldsDisabled}
                            />
                        </Form.Item>
                    </div>
                </Form.Item>}
                <Form.Item wrapperCol={{ offset: 2 }}>
                    <Title level={4}>Правила начисления</Title>
                </Form.Item>
                {intervalsList}
                <Form.Item wrapperCol={{ offset: 2 }}>
                    <Button style={{ marginRight: 30 }} htmlType='submit' type="primary"
                            onClick={areFieldsDisabled ? () => setFieldsDisabled(false) : undefined}>
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
    settings?: IntervalSettings;
    onRemove: () => void;
    minFrom: number;
    setIntervalValues: (values: Partial<AmountInterval>) => void;
    areFieldsDisabled: boolean
}

const Interval: React.FC<IntervalProps> = ({ id, settings, onRemove, setIntervalValues, minFrom, areFieldsDisabled }) => {
    const [ratioMode, setRatioMode] = React.useState(!!settings?.ratio);
    const [toCurrent, setToCurrent] = React.useState(minFrom + 1000);

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
                        value={settings?.from}
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
                        value={settings?.to}
                        onChange={v => setIntervalValues({ to: v as number })}
                        placeholder={'Max'}
                    />
                </Form.Item>
                {!areFieldsDisabled && <Form.Item>
                    <span onClick={onRemove} style={{ cursor: 'pointer' }}>
                        <DeleteOutlined/>
                    </span>
                </Form.Item>}
            </div>
            <Form.Item label={ratioMode ? 'Бонусы в процентах' : 'Фиксированное количество'}>
                {ratioMode ? (
                    <Slider
                        value={settings?.ratio && settings.ratio * 100}
                        disabled={areFieldsDisabled}
                        onChange={v => setIntervalValues({ ratio: Number(v) / 100 })}
                    />
                ) : (
                    <InputNumber
                        value={settings?.amount}
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

export default InstantStrategyCreateForm;