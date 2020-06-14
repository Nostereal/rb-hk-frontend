import { Button, Form, Input, Tag, Switch, InputNumber, Slider, Space, notification } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { block } from 'bem-cn';
import * as React from 'react';
import './InstantStrategyCreateForm.scss';
import { InstantStrategy, IntervalSettings, Strategy, StrategyType } from '../../models/strategy';
import Title from 'antd/lib/typography/Title';
import { createStrategy, deleteStrategy, updateStrategy } from '../../api/routes';
import { useHistory } from 'react-router';
import { Mode } from '../../constants/strategies-descriptions';

const b = block('InstantStrategyCreateForm');

interface InstantStrategyWithMeta extends InstantStrategy {
    uuid?: string
    title?: string
}

interface FormProps {
    mode: Mode
    strategy?: InstantStrategyWithMeta
    onModeChanged?: React.Dispatch<React.SetStateAction<Mode>>
}

interface AmountInterval extends IntervalSettings {
    key: number;
}

let id = 0;
let deleteClicks = 0;

const InstantStrategyCreateForm: React.FC<FormProps> = ({ mode, strategy, onModeChanged }) => {
    const history = useHistory();
    const [form] = Form.useForm();

    const onFinish = async (values: any) => {
        if (mode === Mode.VIEW) {
            onModeChanged!!(Mode.EDIT);
            return;
        } else if (mode === Mode.EDIT) {
            try {
                await updateStrategy({
                    uuid: strategy!!.uuid,
                    type: StrategyType.INSTANT,
                    title: values.title,
                    settings: {
                        intervals: intervals.map(i => ({ ...i, key: undefined })),
                        mcc_list: mccList.map(i => +i), // cast string to number
                        min_bonus: values.min,
                        max_bonus: values.max,
                    },
                });
                notification.success({
                    message: 'Бездельник!',
                    description: 'Стратегию-то я создал, но этот сервис никому не нужен, займись уже чем-нибудь полезным...',
                    duration: 7,
                })
                history.push('/strategies');
            } catch (error) {
                notification.error({
                    message: 'Говно, а не сервис!',
                    description: 'Мы не смогли сохранить изменения, попробуйте ещё разок',
                    duration: 6,
                })
            }
        } else if (mode === Mode.CREATE) {
            try {
                await createStrategy({
                    type: StrategyType.INSTANT,
                    title: values.title,
                    settings: {
                        intervals: intervals.map(i => ({ ...i, key: undefined })),
                        mcc_list: mccList.map(i => +i), // cast string to number
                        min_bonus: values.min,
                        max_bonus: values.max,
                    },
                });
                notification.success({
                    message: 'Бездельник!',
                    description: 'Стратегию-то я создал, но этот сервис никому не нужен, займись уже чем-нибудь полезным...',
                    duration: 7,
                })
                history.push('/strategies');
            } catch (error) {
                notification.error({
                    message: 'Говно, а не сервис!',
                    description: 'Мы не смогли создать стратегию, попробуйте ещё разок',
                    duration: 6,
                })
            }
        }
    };

    const [mccList, setMccList] = React.useState<string[]>(strategy?.mcc_list ? strategy.mcc_list.map(i => i.toString()) : []);
    const [intervals, setIntervals] = React.useState<AmountInterval[]>(
        strategy
            ? strategy.intervals.map((item, ind) => ({ key: ind, ...item }))
            : [{ key: 0 }],
    );
    const [deleteLoading, setDeleteLoading] = React.useState<boolean>(false)
    const areFieldsDisabled = mode === Mode.VIEW

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
        if (mccList.includes(mcc)) return

        form.resetFields(['mcc']);
        if (/^\d{4}$/.test(mcc)) setMccList(prev => [...prev, mcc]);
    };

    const renderMCC = () => {
        return (
            <>
                {!areFieldsDisabled && <Form.Item name="mcc" rules={[{ pattern: /^\d{4}$/, message: 'MCC код — это 4 цифры' }]}>
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
                key={interval.key}
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

    const onDeleteStrategy = () => {
        deleteClicks++
        setDeleteLoading(true)
        if (deleteClicks === 1) {
            setTimeout(() => {
                notification.error({
                    message: 'Что-то пошло не так',
                    description: React.createElement('img', {
                        src: 'https://memepedia.ru/wp-content/uploads/2017/04/%D0%B5%D0%B1%D0%B0%D1%82%D1%8C-%D1%82%D1%8B-%D0%BB%D0%BE%D1%85-%D0%BE%D1%80%D0%B8%D0%B3%D0%B8%D0%BD%D0%B0%D0%BB.jpg',
                        alt: 'Ты даже удалить не можешь, ничтожество',
                        width: 280,
                        height: 170,
                    })
                })
                setDeleteLoading(false)
            }, 700)
        } else {
            deleteStrategy(strategy!!.uuid!!)
                .then(() => {
                    notification.success({
                        message: 'Ну и правильно',
                        description: 'Такая себе стратегия была, если честно...',
                        duration: 7,
                    })
                    history.push('/strategies')
                })
                .catch(() => {
                    notification.error({
                        message: 'Упсс...',
                        description: 'Ты даже удалить не можешь, ничтожество',
                        duration: 4,
                    })
                })
                .finally(() => setDeleteLoading(false))
        }
    }

    return (
        <div className={b()}>
            <Form
                form={form}
                name="instant-form"
                {...formItemLayout}
                onFinish={onFinish}
                initialValues={
                    { from: strategy?.min_bonus,
                        to: strategy?.max_bonus,
                        title: strategy?.title
                    }
                }
            >
                {(!areFieldsDisabled || mccList.length !== 0) && <Form.Item label='MCC'>
                    {renderMCC()}
                </Form.Item>}
                {!areFieldsDisabled && <Form.Item name="title" required label="Название">
                    <Input placeholder={'Daily Ashan strategy'}/>
                </Form.Item>}
                {(!areFieldsDisabled || (strategy?.min_bonus && strategy.max_bonus)) && <Form.Item label='Лимит'>
                    <div className="inline-flex">
                        <Form.Item name="from">
                            <InputNumber
                                placeholder={'Min'}
                                disabled={areFieldsDisabled}
                            />
                        </Form.Item>
                        <Form.Item>-</Form.Item>
                        <Form.Item name="to">
                            <InputNumber
                                placeholder={'Max'}
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
                    <Space size={'large'}>
                        <Space size={'small'}>
                            <Button htmlType='submit' type="primary">
                                {mode === Mode.VIEW && 'Редактировать'}
                                {mode === Mode.EDIT && 'Сохранить'}
                                {mode === Mode.CREATE && 'Создать'}
                            </Button>
                            {!areFieldsDisabled && <Button onClick={addInterval} type="dashed">
                                Добивить правило <PlusOutlined/>
                            </Button>}
                        </Space>
                        <Button
                            danger
                            loading={deleteLoading}
                            onClick={onDeleteStrategy}
                        >Удалить</Button>
                    </Space>
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
    areFieldsDisabled: boolean
    setIntervalValues: (values: Partial<AmountInterval>) => void
}

const Interval: React.FC<IntervalProps> = ({ id, settings, onRemove, minFrom, setIntervalValues, areFieldsDisabled }) => {
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

export default InstantStrategyCreateForm;